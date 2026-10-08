import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CURRICULUM_REVIEWED_EVENT, CurriculumReviewedEvent } from '../../../curriculum/domain/events/curriculum-reviewed.event';
import { Notification, NotificationType } from '../../domain/entities/notification.entity';
// [Listener CurriculumReviewed]: crea la notificación para el autor cuando su recurso se publica o se devuelve | [Patrón]: Observer (Async Subscriber) | [Principio]: SRP + OCP | [Paradigma]: Event-Driven

@Injectable()
export class CurriculumReviewedListener {
  private readonly logger = new Logger(CurriculumReviewedListener.name);

  constructor(@InjectRepository(Notification) private readonly repo: Repository<Notification>) {}

  // `@OnEvent(..., { async: true })` (NestJS): no bloquea al productor; los errores se registran y no rompen la revisión
  @OnEvent(CURRICULUM_REVIEWED_EVENT, { async: true })
  async handle(e: CurriculumReviewedEvent): Promise<void> {
    try {
      await this.repo.save(
        this.repo.create({
          userId: e.authorId,
          type: NotificationType.SYSTEM,
          title: e.approved ? `Recurso publicado: ${e.topic}` : `Recurso devuelto: ${e.topic}`,
          body: e.approved
            ? `Tu recurso ya es visible para los estudiantes.${e.note ? ` Comentario: ${e.note}` : ''}`
            : `Un administrador pidió cambios: ${e.note ?? 'revisa el recurso'}.`,
          payload: { href: `/admin/curriculum/${e.itemId}` }, // La campana enlaza al recurso
        }),
      );
    } catch (err) {
      this.logger.error(`No se pudo notificar la revisión de ${e.itemId}`, err instanceof Error ? err.stack : String(err));
    }
  }
}
