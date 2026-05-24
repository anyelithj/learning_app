import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Score } from '../../domain/entities/score.entity';
import type {
  CreateScoreInput,
  IScoreRepository,
  LeaderboardEntry,
} from '../../domain/interfaces/score.repository.interface';
// [Adapter TypeORM]: implementa IScoreRepository | [Patron]: Repository + Adapter | [Principio]: DIP | [Paradigma]: POO

@Injectable()
export class ScoreRepository implements IScoreRepository {
  constructor(
    @InjectRepository(Score)
    private readonly repo: Repository<Score>,
  ) {}

  async create(input: CreateScoreInput): Promise<Score> {
    const accuracy =
      input.totalQuestions > 0 ? input.correctCount / input.totalQuestions : 0;
    const entity = this.repo.create({ ...input, accuracy });
    return this.repo.save(entity);
  }

  async findByUser(userId: string, limit = 20): Promise<Score[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // [Leaderboard]: GROUP BY userId + agregaciones | [Patron]: Query
  async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const raw = await this.repo
      .createQueryBuilder('s')
      .select('s.user_id', 'userId')
      .addSelect('SUM(s.points)', 'totalPoints')
      .addSelect('COUNT(s.id)', 'quizzesCompleted')
      .addSelect('AVG(s.accuracy)', 'avgAccuracy')
      .groupBy('s.user_id')
      .orderBy('"totalPoints"', 'DESC')
      .limit(limit)
      .getRawMany<{
        userId: string;
        totalPoints: string;
        quizzesCompleted: string;
        avgAccuracy: string;
      }>();

    return raw.map((r) => ({
      userId: r.userId,
      totalPoints: Number(r.totalPoints),
      quizzesCompleted: Number(r.quizzesCompleted),
      avgAccuracy: Number(r.avgAccuracy),
    }));
  }

  async countByUser(userId: string): Promise<number> {
    return this.repo.count({ where: { userId } });
  }

  async sumPointsByUser(userId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('s')
      .select('COALESCE(SUM(s.points), 0)', 'total')
      .where('s.user_id = :uid', { uid: userId })
      .getRawOne<{ total: string }>();
    return Number(result?.total ?? 0);
  }
}
