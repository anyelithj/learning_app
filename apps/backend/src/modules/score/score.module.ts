import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Score } from './domain/entities/score.entity';
import { Achievement } from './domain/entities/achievement.entity';
import { SCORE_REPOSITORY } from './domain/interfaces/score.repository.interface';
import { ACHIEVEMENT_REPOSITORY } from './domain/interfaces/achievement.repository.interface';
import { ScoreRepository } from './infrastructure/repositories/score.repository';
import { AchievementRepository } from './infrastructure/repositories/achievement.repository';
import { CalculateScoreUseCase } from './application/use-cases/calculate-score.use-case';
import { SaveScoreUseCase } from './application/use-cases/save-score.use-case';
import { GetLeaderboardUseCase } from './application/use-cases/get-leaderboard.use-case';
import { GetUserHistoryUseCase } from './application/use-cases/get-user-history.use-case';
import { CheckAchievementsUseCase } from './application/use-cases/check-achievements.use-case';
import { QuizCompletedListener } from './application/listeners/quiz-completed.listener';
import { ScoreController } from './presentation/score.controller';
// [Modulo Score]: Bounded Context | [Patron]: Module + DI Container | [Principio]: ISP + DIP

const scoreRepoProvider = { provide: SCORE_REPOSITORY, useClass: ScoreRepository };
const achievementRepoProvider = {
  provide: ACHIEVEMENT_REPOSITORY,
  useClass: AchievementRepository,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([Score, Achievement]),
    CacheModule.register({ ttl: 60_000 }),
  ],
  controllers: [ScoreController],
  providers: [
    scoreRepoProvider,
    achievementRepoProvider,
    CalculateScoreUseCase,
    SaveScoreUseCase,
    GetLeaderboardUseCase,
    GetUserHistoryUseCase,
    CheckAchievementsUseCase,
    QuizCompletedListener,
  ],
  exports: [scoreRepoProvider, achievementRepoProvider],
})
export class ScoreModule {}
