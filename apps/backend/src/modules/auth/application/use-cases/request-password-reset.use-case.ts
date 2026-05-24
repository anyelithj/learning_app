import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { Email } from '../../../users/domain/value-objects/email.vo';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/user.repository.interface';
import type { IUserRepository } from '../../../users/domain/interfaces/user.repository.interface';
import { PASSWORD_RESET_TOKEN_REPOSITORY } from '../../domain/interfaces/password-reset-token.repository.interface';
import type { IPasswordResetTokenRepository } from '../../domain/interfaces/password-reset-token.repository.interface';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
// [Use Case RequestPasswordReset]: emite token single-use + log de link | [Patrón]: Command | [Principio]: SRP
// [Seguridad]: respuesta siempre 200/genérica para no filtrar existencia de emails

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1h

@Injectable()
export class RequestPasswordResetUseCase {
  private readonly logger = new Logger(RequestPasswordResetUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly tokens: IPasswordResetTokenRepository,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<{ success: true }> {
    const email = Email.create(dto.email);
    const user = await this.users.findByEmail(email.value);

    // [Genérico]: si no existe, no se filtra; salir 200 igualmente
    if (!user || !user.isActive) {
      this.logger.debug(`Password reset requested for unknown/inactive email: ${email.value}`);
      return { success: true };
    }

    // [Invalida activos previos]: un solo token vigente por usuario
    await this.tokens.invalidateAllForUser(user.id);

    // [Token aleatorio]: 32 bytes hex (256-bit entropy)
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await this.tokens.create({ userId: user.id, tokenHash, expiresAt });

    // [Envío email]: integración real (nodemailer/SES) pendiente — por ahora log estructurado
    const appUrl = process.env.FRONTEND_URL ?? 'http://localhost:7000';
    const link = `${appUrl}/reset-password?token=${token}`;
    this.logger.log(
      `[PASSWORD_RESET_LINK] user=${user.email} link=${link} expires=${expiresAt.toISOString()}`,
    );

    return { success: true };
  }
}
