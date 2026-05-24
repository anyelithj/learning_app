import { apiFetch } from "./api-client";
import { getCurrentAccessToken } from "./auth";
import type {
  CreateQuizInput,
  PaginatedQuizzes,
  Quiz,
  QuizSession,
  SubmitAnswerInput,
  LeaderboardEntry,
  ScoreEntry,
} from "@/types/quiz";
// [Wrappers API Quiz/Score]: facade server-side hacia NestJS | [Patron]: Facade + Adapter | [Principio]: SRP + DRY | [Paradigma]: Funcional

// [Helper bearer]: lee cookie httpOnly y la pasa al backend | [Principio]: SSOT
async function withBearer() {
  const token = await getCurrentAccessToken();
  return token ?? undefined;
}

// ===== Quiz =====
export async function listQuizzes(params: {
  page?: number;
  limit?: number;
  category?: string;
  difficulty?: string;
} = {}): Promise<PaginatedQuizzes> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.category) qs.set("category", params.category);
  if (params.difficulty) qs.set("difficulty", params.difficulty);
  const q = qs.toString();
  return apiFetch<PaginatedQuizzes>(`/quiz${q ? `?${q}` : ""}`, {
    bearer: await withBearer(),
  });
}

export async function getQuiz(id: string): Promise<Quiz> {
  return apiFetch<Quiz>(`/quiz/${id}`, { bearer: await withBearer() });
}

// [Crear quiz]: POST /quiz | [Patrón]: Facade | [Principio]: SRP
export async function createQuiz(input: CreateQuizInput): Promise<Quiz> {
  return apiFetch<Quiz>(`/quiz`, {
    method: "POST",
    body: input,
    bearer: await withBearer(),
  });
}

export async function patchQuiz(id: string, partial: Partial<{ title: string; description: string; isPublished: boolean; timePerQuestionSeconds: number }>): Promise<Quiz> {
  return apiFetch<Quiz>(`/quiz/${id}`, {
    method: "PATCH",
    body: partial,
    bearer: await withBearer(),
  });
}

export async function deleteQuiz(id: string): Promise<void> {
  await apiFetch<void>(`/quiz/${id}`, {
    method: "DELETE",
    bearer: await withBearer(),
  });
}

export async function reactivateUser(userId: string): Promise<void> {
  await apiFetch<void>(`/users/${userId}/activate`, {
    method: "POST",
    body: {},
    bearer: await withBearer(),
  });
}

export async function startSession(quizId: string): Promise<QuizSession> {
  return apiFetch<QuizSession>(`/quiz/${quizId}/session`, {
    method: "POST",
    body: {},
    bearer: await withBearer(),
  });
}

export async function submitAnswer(
  sessionId: string,
  input: SubmitAnswerInput,
): Promise<{ session: QuizSession; isCorrect: boolean; score: number }> {
  return apiFetch(`/quiz/session/${sessionId}/answer`, {
    method: "POST",
    body: input,
    bearer: await withBearer(),
  });
}

export async function endSession(
  sessionId: string,
  abandon = false,
): Promise<QuizSession> {
  return apiFetch<QuizSession>(
    `/quiz/session/${sessionId}/end${abandon ? "?abandon=true" : ""}`,
    {
      method: "POST",
      body: {},
      bearer: await withBearer(),
    },
  );
}

// ===== Score =====
export async function getLeaderboard(limit = 10): Promise<{ entries: LeaderboardEntry[] }> {
  return apiFetch<{ entries: LeaderboardEntry[] }>(
    `/score/leaderboard?limit=${limit}`,
    { bearer: await withBearer() },
  );
}

export async function getMyHistory(limit = 20): Promise<ScoreEntry[]> {
  return apiFetch<ScoreEntry[]>(`/score/history?limit=${limit}`, {
    bearer: await withBearer(),
  });
}

// ===== Admin Users =====
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "USER" | "TEACHER" | "ADMIN";
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface PaginatedUsers {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export async function listUsers(params: { page?: number; limit?: number; role?: string; search?: string } = {}): Promise<PaginatedUsers> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.role) qs.set("role", params.role);
  if (params.search) qs.set("search", params.search);
  const q = qs.toString();
  return apiFetch<PaginatedUsers>(`/users${q ? `?${q}` : ""}`, { bearer: await withBearer() });
}

export async function getUserStats(): Promise<{ total: number; byRole: Record<string, number> }> {
  return apiFetch(`/users/stats`, { bearer: await withBearer() });
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "USER" | "TEACHER" | "ADMIN";
}

export async function createUser(input: CreateUserInput): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/users`, {
    method: "POST",
    body: input,
    bearer: await withBearer(),
  });
}

export async function deactivateUser(userId: string): Promise<void> {
  await apiFetch<void>(`/users/${userId}`, {
    method: "DELETE",
    bearer: await withBearer(),
  });
}

export async function getUser(userId: string): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/users/${userId}`, { bearer: await withBearer() });
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  role?: "USER" | "TEACHER" | "ADMIN";
}

export async function updateUser(userId: string, input: UpdateUserInput): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/users/${userId}`, {
    method: "PATCH",
    body: input,
    bearer: await withBearer(),
  });
}
