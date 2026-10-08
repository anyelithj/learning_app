import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './domain/entities/notification.entity';
import { NotificationsController } from './presentation/notifications.controller';
import { CurriculumReviewedListener } from './application/listeners/curriculum-reviewed.listener';
import { ListMyNotificationsUseCase, MarkNotificationsReadUseCase } from './application/use-cases/my-notifications.use-case';
// [Módulo Notifications]: Bounded Context para notificaciones persistentes + WS realtime | [Patrón]: Module + DI Container

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController], // [Campana del topbar]: GET /notifications/me y marcar leídas
  providers: [ListMyNotificationsUseCase, MarkNotificationsReadUseCase, CurriculumReviewedListener], // + suscriptor de eventos de curriculum
  exports: [],
})
export class NotificationsModule {}
