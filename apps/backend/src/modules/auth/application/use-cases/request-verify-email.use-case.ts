import { Inject, Injectable, Logger } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { Email } from '../../../users/domain/value-objects/email.vo';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/user.repository.interface';
import type { IUserRepository } from '../../../users/domain/interfaces/user.repository.interface';
import { EMAIL_VERIFICATION_TOKEN_REPOSITORY } from '../../domain/interfaces/email-verification-token.repository.interface';
import type { IEmailVerificationTokenRepository } from '../../domain/interfaces/email-verification-token.repository.interface';
import { RequestVerifyEmailDto } from '../dtos/request-verify-email.dto';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

@Injectable()
export class RequestVerifyEmailUseCase {
  private readonly logger = new Logger(RequestVerifyEmailUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(EMAIL_VERIFICATION_TOKEN_REPOSITORY)
    private readonly tokens: IEmailVerificationTokenRepository,
  ) {}

  async execute(dto: RequestVerifyEmailDto): Promise<{ success: true }> {
    const email = Email.create(dto.email);
    const user = await this.users.findByEmail(email.value);

    if (!user || !user.isActive) {
      this.logger.debug(`Verify email requested for unknown/inactive email: ${email.value}`);
      return { success: true };
    }

    if (user.isEmailVerified) {
      this.logger.debug(`Email already verified for user: ${user.id}`);
      return { success: true };
    }

    await this.tokens.invalidateAllForUser(user.id);

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await this.tokens.create({ userId: user.id, tokenHash, expiresAt });

    const appUrl = process.env.FRONTEND_URL ?? 'http://localhost:7000';
    const link = `${appUrl}/verify-email?token=${token}`;
    this.logger.log(
      `[EMAIL_VERIFICATION_LINK] user=${user.email} link=${link} expires=${expiresAt.toISOString()}`,
    );

    return { success: true };
  }
}
