// [Tipos compartidos Quiz]: SSOT entre frontend y backend | [Patron]: Type Module | [Principio]: SSOT | [Paradigma]: TS estructural

export type Difficulty = "easy" | "medium" | "hard";

export type Category =
  | "general"
  | "science"
  | "history"
  | "geography"
  | "sports"
  | "entertainment"
  | "technology"
  | "math"
  | "art"
  | "custom";

export type QuestionType = "multiple_choice" | "true_false" | "open_answer";

export type Language = "en" | "es";

export type SessionStatus = "in_progress" | "completed" | "abandoned";

export interface QuestionPublic {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  difficulty: Difficulty;
  position: number;
  timeLimitSeconds?: number;
}

export interface QuestionWithAnswer extends QuestionPublic {
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  category: Category;
  difficulty: Difficulty;
  authorId: string;
  source: string;
  timePerQuestionSeconds: number;
  isPublished: boolean;
  createdAt: string;
  questions?: QuestionPublic[];
}

export interface QuizListItem {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  questionsCount: number;
  timePerQuestionSeconds: number;
}

export interface PaginatedQuizzes {
  data: QuizListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface SessionAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  score: number;
  timeTakenMs: number;
  answeredAt: string;
}

// [Feedback IA por respuesta]: lo emite SubmitAnswerUseCase, no se persiste en BD | [Principio]: SSOT
export interface AnswerFeedback {
  questionId: string;
  feedback: string | null;
  strategy: string;
}

export interface QuizSession {
  id: string;
  userId: string;
  quizId: string;
  status: SessionStatus;
  answers: SessionAnswer[];
  totalScore: number;
  correctCount: number;
  startedAt: string;
  completedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  totalPoints: number;
  quizzesCompleted: number;
  avgAccuracy: number;
}

export interface SubmitAnswerInput {
  questionId: string;
  userAnswer: string;
  timeTakenMs?: number;
}

// [Input creación quiz]: SSOT entre form RHF/Zod y backend NestJS CreateQuizDto | [Principio]: SSOT
export interface CreateQuizQuestionInput {
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  difficulty: Difficulty;
  language?: Language;
  timeLimitSeconds?: number;
}

export interface CreateQuizInput {
  title: string;
  description?: string;
  category: Category;
  difficulty: Difficulty;
  language?: Language;
  timePerQuestionSeconds?: number;
  isPublished?: boolean;
  questions: CreateQuizQuestionInput[];
}

export interface ScoreEntry {
  id: string;
  userId: string;
  quizId: string;
  sessionId: string;
  points: number;
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  createdAt: string;
}
