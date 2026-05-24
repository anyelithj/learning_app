import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackIA } from './domain/entities/feedback-ia.entity';
// [Módulo Feedback]: Bounded Context para persistencia de feedback IA (revisión docente + analytics + cache) | [Patrón]: Module + DI Container

@Module({
  imports: [TypeOrmModule.forFeature([FeedbackIA])],
  controllers: [],
  providers: [],
  exports: [],
})
export class FeedbackModule {}
