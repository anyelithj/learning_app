import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  QUIZ_REPOSITORY,
  type IQuizRepository,
} from '../domain/interfaces/quiz.repository.interface';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { JwtPayload } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../users/domain/value-objects/role.vo';
import { CreateQuizUseCase } from '../application/use-cases/create-quiz.use-case';
import { GetQuizUseCase } from '../application/use-cases/get-quiz.use-case';
import { ListQuizzesUseCase } from '../application/use-cases/list-quizzes.use-case';
import { FetchTriviaQuestionsUseCase } from '../application/use-cases/fetch-trivia-questions.use-case';
import { StartSessionUseCase } from '../application/use-cases/start-session.use-case';
import { SubmitAnswerUseCase } from '../application/use-cases/submit-answer.use-case';
import { EndSessionUseCase } from '../application/use-cases/end-session.use-case';
import { CreateQuizDto } from '../application/dtos/create-quiz.dto';
import { FetchQuestionsDto } from '../application/dtos/fetch-questions.dto';
import { SubmitAnswerDto } from '../application/dtos/submit-answer.dto';
import { Category } from '../domain/value-objects/category.vo';
import { Difficulty } from '../domain/value-objects/difficulty.vo';
// [Controller Quiz]: traduce HTTP a Use Case | [Patron]: Controller (MVC) + Facade | [Principio]: SRP | [Paradigma]: POO

@ApiTags('quiz')
@ApiBearerAuth()
@Controller('quiz')
export class QuizController {
  constructor(
    private readonly createUC: CreateQuizUseCase,
    private readonly getUC: GetQuizUseCase,
    private readonly listUC: ListQuizzesUseCase,
    private readonly fetchTriviaUC: FetchTriviaQuestionsUseCase,
    private readonly startUC: StartSessionUseCase,
    private readonly submitUC: SubmitAnswerUseCase,
    private readonly endUC: EndSessionUseCase,
    @Inject(QUIZ_REPOSITORY) private readonly quizRepo: IQuizRepository,
  ) {}

  // [GET /quiz]: listar publicados con filtros + paginacion
  @Get()
  @ApiOperation({ summary: 'List published quizzes' })
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: Category,
    @Query('difficulty') difficulty?: Difficulty,
  ) {
    return this.listUC.execute({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      category,
      difficulty,
      publishedOnly: true,
    });
  }

  // [GET /quiz/:id]: detalle con preguntas
  @Get(':id')
  @ApiOperation({ summary: 'Get quiz by id (with questions)' })
  async getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getUC.execute(id, true);
  }

  // [POST /quiz]: solo TEACHER+ pueden crear
  @Post()
  @Roles(Role.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new quiz (TEACHER+)' })
  async create(@Body() dto: CreateQuizDto, @CurrentUser() user: JwtPayload) {
    return this.createUC.execute(dto, user.sub);
  }

  // [DELETE /quiz/:id]: borra quiz + cascade preguntas | [Patrón]: Command
  @Delete(':id')
  @Roles(Role.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete quiz (TEACHER+)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const quiz = await this.quizRepo.findQuizById(id, false);
    if (!quiz) throw new NotFoundException(`Quiz ${id} not found`);
    await this.quizRepo.deleteQuiz(id);
  }

  // [PATCH /quiz/:id]: actualización parcial — top-level fields + questions[] opcional | [Patrón]: Command
  @Patch(':id')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Update quiz partial — questions[] reemplaza todo (TEACHER+)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: Partial<{
      title: string;
      description: string;
      isPublished: boolean;
      timePerQuestionSeconds: number;
      category: string;
      difficulty: string;
      questions: Array<{
        text: string;
        type: string;
        options?: string[];
        correctAnswer: string;
        difficulty: string;
        timeLimitSeconds?: number;
      }>;
    }>,
  ) {
    const existing = await this.quizRepo.findQuizById(id, false);
    if (!existing) throw new NotFoundException(`Quiz ${id} not found`);

    // [Separa questions del resto]: reemplaza preguntas si vienen | [Patrón]: Split Update
    const { questions, ...topLevel } = body;
    if (Object.keys(topLevel).length > 0) {
      await this.quizRepo.updateQuiz(id, topLevel as never);
    }
    if (questions && Array.isArray(questions)) {
      return this.quizRepo.replaceQuestions(id, questions as never);
    }
    return this.quizRepo.findQuizById(id, true);
  }

  // [POST /quiz/trivia/fetch]: helper para front al crear quiz
  @Post('trivia/fetch')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Fetch trivia questions from OpenTrivia DB (cached)' })
  async fetchTrivia(@Body() dto: FetchQuestionsDto) {
    return this.fetchTriviaUC.execute(dto);
  }

  // ===== Sessions =====
  @Post(':id/session')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start a new quiz session' })
  async startSession(
    @Param('id', ParseUUIDPipe) quizId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.startUC.execute(user.sub, quizId);
  }

  @Post('session/:sessionId/answer')
  @ApiOperation({ summary: 'Submit an answer to a session question' })
  async submit(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() dto: SubmitAnswerDto,
    @CurrentUser() user: JwtPayload,
    // [Header Authorization]: token crudo para reenviar a FastAPI (server-to-server con JWT del usuario) | [Patrón]: Token Propagation
    @Headers('authorization') auth: string,
  ) {
    const accessToken = (auth ?? '').replace(/^Bearer\s+/i, '');
    return this.submitUC.execute(sessionId, user.sub, dto, accessToken);
  }

  @Post('session/:sessionId/end')
  @ApiOperation({ summary: 'Finalize a session (complete or abandon)' })
  async endSession(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @CurrentUser() user: JwtPayload,
    @Query('abandon') abandon?: string,
  ) {
    return this.endUC.execute(sessionId, user.sub, abandon === 'true');
  }
}
