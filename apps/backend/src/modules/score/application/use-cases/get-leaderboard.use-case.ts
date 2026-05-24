import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { SCORE_REPOSITORY } from '../../domain/interfaces/score.repository.interface';
import type {
  IScoreRepository,
  LeaderboardEntry,
} from '../../domain/interfaces/score.repository.interface';
// [Use Case GetLeaderboard]: top N con cache 60s | [Patron]: Query + Cache-Aside | [Principio]: SRP + DIP

@Injectable()
export class GetLeaderboardUseCase {
  private readonly CACHE_TTL_MS = 60_000;
  private readonly CACHE_KEY = (limit: number) => `leaderboard:top:${limit}`;

  constructor(
    @Inject(SCORE_REPOSITORY) private readonly repo: IScoreRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async execute(limit = 10): Promise<LeaderboardEntry[]> {
    const key = this.CACHE_KEY(limit);
    const cached = await this.cache.get<LeaderboardEntry[]>(key);
    if (cached) return cached;

    const data = await this.repo.getLeaderboard(limit);
    await this.cache.set(key, data, this.CACHE_TTL_MS);
    return data;
  }
}
