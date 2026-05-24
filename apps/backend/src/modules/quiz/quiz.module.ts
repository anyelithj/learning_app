import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './domain/entities/quiz.entity';
import { Question } from './domain/entities/question.entity';
import { QuizSession } from './domain/entities/quiz-session.entity';
import { QUIZ_REPOSITORY } from './domain/interfaces/quiz.repository.interface';
import { TRIVIA_CLIENT } from './domain/interfaces/trivia-client.interface';
import { TRANSLATOR } from './domain/interfaces/translator.interface';
import { QuizRepository } from './infrastructure/repositories/quiz.repository';
import { OpenTriviaClient } from './infrastructure/clients/open-trivia.client';
import { OllamaTranslator } from './infrastructure/clients/ollama-translator.client';
import { CreateQuizUseCase } from './application/use-cases/create-quiz.use-case';
import { GetQuizUseCase } from './application/use-cases/get-quiz.use-case';
import { ListQuizzesUseCase } from './application/use-cases/list-quizzes.use-case';
import { FetchTriviaQuestionsUseCase } from './application/use-cases/fetch-trivia-questions.use-case';
import { StartSessionUseCase } from './application/use-cases/start-session.use-case';
import { SubmitAnswerUseCase } from './application/use-cases/submit-answer.use-case';
import { EndSessionUseCase } from './application/use-cases/end-session.use-case';
import { QuizController } from './presentation/quiz.controller';
// [Modulo Quiz]: Bounded Context | [Patron]: Module + DI Container | [Principio]: ISP + DIP | [Paradigma]: POO

// [Wire-up Ports → Adapters]: el resto del módulo depende solo del Symbol token | [Patrón]: Service Locator (Nest DI) | [Principio]: DIP
const quizRepoProvider = { provide: QUIZ_REPOSITORY, useClass: QuizRepository };
const triviaClientProvider = { provide: TRIVIA_CLIENT, useClass: OpenTriviaClient };
const translatorProvider = { provide: TRANSLATOR, useClass: OllamaTranslator };

@Module({
  imports: [
    // [Config disponible para OllamaTranslator]: lee OLLAMA_BASE_URL + OLLAMA_TRANSLATION_MODEL | [Principio]: DRY
    ConfigModule,
    TypeOrmModule.forFeature([Quiz, Question, QuizSession]),
    HttpModule.register({ timeout: 30_000, maxRedirects: 3 }),
    // [Cache in-memory por default]: Redis se conecta en Sprint 4 via factory
    CacheModule.register({ ttl: 60_000 }),
  ],
  controllers: [QuizController],
  providers: [
    quizRepoProvider,
    triviaClientProvider,
    translatorProvider,
    CreateQuizUseCase,
    GetQuizUseCase,
    ListQuizzesUseCase,
    FetchTriviaQuestionsUseCase,
    StartSessionUseCase,
    SubmitAnswerUseCase,
    EndSessionUseCase,
  ],
  exports: [quizRepoProvider],
})
export class QuizModule {}
