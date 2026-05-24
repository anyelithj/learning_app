import { Score } from '../entities/score.entity';
// [Port score repo] | [Patron]: Repository + Port (Hexagonal) | [Principio]: DIP + ISP

export const SCORE_REPOSITORY = Symbol('SCORE_REPOSITORY');

export interface CreateScoreInput {
  userId: string;
  quizId: string;
  sessionId: string;
  points: number;
  correctCount: number;
  totalQuestions: number;
}

export interface LeaderboardEntry {
  userId: string;
  totalPoints: number;
  quizzesCompleted: number;
  avgAccuracy: number;
}

export interface IScoreRepository {
  create(input: CreateScoreInput): Promise<Score>;
  findByUser(userId: string, limit?: number): Promise<Score[]>;
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  countByUser(userId: string): Promise<number>;
  sumPointsByUser(userId: string): Promise<number>;
}
