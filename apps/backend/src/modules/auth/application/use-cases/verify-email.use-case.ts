import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/user.repository.interface';
import type { IUserRepository } from '../../../users/domain/interfaces/user.repository.interface';
// [Use Case VerifyEmail]: marca el email como verificado (stub Sprint 1) | [Patrón]: Command + Use Case | [Principio]: SRP | [Paradigma]: POO

// [Nota]: implementación completa requiere envío de email con token único.
// En Sprint 1 dejamos endpoint funcional con token = userId (placeholder).
// Sprint 4: integrar nodemailer + tabla email_verification_tokens.

@Injectable()
export class VerifyEmailUseCase {
  private readonly logger = new Logger(VerifyEmailUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
  ) {}

  // [execute]: actualiza isEmailVerified | [Principio]: SRP
  async execute(token: string): Promise<{ verified: true }> {
    // [Token = userId placeholder]: cambiar a token firmado en iteración posterior
    const user = await this.users.findById(token);
    if (!user) throw new BadRequestException('Invalid verification token');

    if (user.isEmailVerified) {
      // [Idempotente]: no re-procesar verificaciones repetidas
      return { verified: true };
    }

    await this.users.update(user.id, { isEmailVerified: true });
    this.logger.log(`Email verified: ${user.email}`);
    return { verified: true };
  }
}
