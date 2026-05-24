import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { QUIZ_REPOSITORY } from '../../domain/interfaces/quiz.repository.interface';
import type { IQuizRepository } from '../../domain/interfaces/quiz.repository.interface';
import { SessionStatus } from '../../domain/entities/quiz-session.entity';
import { DIFFICULTY_MULTIPLIER } from '../../domain/value-objects/difficulty.vo';
import { SubmitAnswerDto } from '../dtos/submit-answer.dto';
import { QuestionType } from '../../domain/entities/question.entity';
import { AIClientService } from '../../../ai/ai-client.service';
// [Use Case SubmitAnswer]: scoring + IA grade + feedback | [Patron]: Command + Facade | [Principio]: SRP + DIP | [Paradigma]: POO

const BASE_SCORE = 100;
const SPEED_BONUS_MAX = 50;

// [Resultado exportado]: incluye feedback IA opcional cuando respuesta incorrecta | [Principio]: ISP
export interface SubmitAnswerResult {
  session: Awaited<ReturnType<IQuizRepository['appendSessionAnswer']>>;
  isCorrect: boolean;
  score: number;
  feedback: string | null;
  strategy: string;
}

@Injectable()
export class SubmitAnswerUseCase {
  private readonly logger = new Logger(SubmitAnswerUseCase.name);

  constructor(
    @Inject(QUIZ_REPOSITORY) private readonly repo: IQuizRepository,
    // [Inyección AI Service]: AIModule es @Global, AIClientService disponible | [Patrón]: DI | [Principio]: DIP
    private readonly ai: AIClientService,
  ) {}

  // [execute]: ahora acepta accessToken para propagar JWT a FastAPI | [Principio]: SRP
  async execute(
    sessionId: string,
    userId: string,
    dto: SubmitAnswerDto,
    accessToken: string,
  ): Promise<SubmitAnswerResult> {
    const session = await this.repo.findSessionById(sessionId);
    if (!session) throw new BadRequestException(`Session ${sessionId} not found`);
    if (session.userId !== userId) {
      throw new ForbiddenException('Session does not belong to current user');
    }
    if (session.status !== SessionStatus.IN_PROGRESS) {
      throw new BadRequestException('Session is not in progress');
    }

    const quiz = await this.repo.findQuizById(session.quizId, true);
    if (!quiz) throw new BadRequestException(`Quiz ${session.quizId} no longer exists`);

    const question = quiz.questions?.find((q) => q.id === dto.questionId);
    if (!question) {
      throw new BadRequestException(`Question ${dto.questionId} not part of this quiz`);
    }

    // [Idempotencia]: rechaza segunda respuesta a la misma pregunta
    const already = session.answers.find((a) => a.questionId === dto.questionId);
    if (already) throw new BadRequestException('Question already answered');

    // [Strategy de evaluación]: OPEN_ANSWER → IA semántica; MC/TF → exact match local | [Patrón]: Strategy
    let isCorrect: boolean;
    let strategyUsed: string;
    if (question.type === QuestionType.OPEN_ANSWER) {
      const graded = await this.ai.grade(
        {
          questionId: question.id,
          questionType: question.type,
          questionText: question.text,
          correctAnswer: question.correctAnswer,
          userAnswer: dto.userAnswer,
          language: (quiz.language ?? question.language ?? 'es') as 'es' | 'en',
        },
        accessToken,
      );
      isCorrect = graded.is_correct;
      strategyUsed = graded.strategy_used;
    } else {
      isCorrect = this.evaluateLocal(question.correctAnswer, dto.userAnswer);
      strategyUsed = 'exact_match_local';
    }

    const limitMs =
      (question.timeLimitSeconds ?? quiz.timePerQuestionSeconds) * 1000;
    const speedBonus = this.calcSpeedBonus(dto.timeTakenMs, limitMs);
    const score = isCorrect
      ? BASE_SCORE * DIFFICULTY_MULTIPLIER[question.difficulty] + speedBonus
      : 0;

    const updated = await this.repo.appendSessionAnswer(sessionId, {
      questionId: question.id,
      userAnswer: dto.userAnswer,
      isCorrect,
      score,
      timeTakenMs: dto.timeTakenMs ?? 0,
      answeredAt: new Date().toISOString(),
    });

    // [Feedback pedagógico]: solo si respuesta incorrecta. Bloquea hasta 30s; si falla, null | [Patrón]: Fail-soft
    let feedback: string | null = null;
    if (!isCorrect) {
      const fb = await this.ai.generateFeedback(
        {
          questionId: question.id,
          questionText: question.text,
          correctAnswer: question.correctAnswer,
          userAnswer: dto.userAnswer,
          topic: quiz.category,
          language: (quiz.language ?? question.language ?? 'es') as 'es' | 'en',
        },
        accessToken,
      );
      feedback = fb?.message ?? null;
    }

    return { session: updated, isCorrect, score, feedback, strategy: strategyUsed };
  }

  // [evaluateLocal]: exact match — usado solo para MC/TF | [Principio]: SRP
  private evaluateLocal(correct: string, user: string): boolean {
    const normalize = (s: string) => s.trim().toLowerCase();
    return normalize(correct) === normalize(user);
  }

  private calcSpeedBonus(timeTakenMs: number | undefined, limitMs: number): number {
    if (!timeTakenMs || limitMs <= 0) return 0;
    const remaining = Math.max(0, limitMs - timeTakenMs);
    return Math.round((remaining / limitMs) * SPEED_BONUS_MAX);
  }
}
