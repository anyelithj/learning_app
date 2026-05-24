import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './domain/entities/notification.entity';
// [Módulo Notifications]: Bounded Context para notificaciones persistentes + WS realtime | [Patrón]: Module + DI Container

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [],
  providers: [],
  exports: [],
})
export class NotificationsModule {}
