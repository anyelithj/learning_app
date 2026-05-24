import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../../../../shared/config/jwt.config';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/user.repository.interface';
import type { IUserRepository } from '../../../users/domain/interfaces/user.repository.interface';
import { AUTH_REPOSITORY } from '../../domain/interfaces/auth.repository.interface';
import type { IAuthRepository } from '../../domain/interfaces/auth.repository.interface';
import { PASSWORD_RESET_TOKEN_REPOSITORY } from '../../domain/interfaces/password-reset-token.repository.interface';
import type { IPasswordResetTokenRepository } from '../../domain/interfaces/password-reset-token.repository.interface';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
// [Use Case ResetPassword]: valida token + rehash password + revoca sesiones | [Patrón]: Command | [Principio]: SRP

@Injectable()
export class ResetPasswordUseCase {
  private readonly logger = new Logger(ResetPasswordUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(AUTH_REPOSITORY) private readonly authRepo: IAuthRepository,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly tokens: IPasswordResetTokenRepository,
    @Inject(jwtConfig.KEY) private readonly jwtCfg: ConfigType<typeof jwtConfig>,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<{ success: true }> {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    const record = await this.tokens.findActiveByHash(tokenHash);

    if (!record || record.isExpired() || record.isUsed()) {
      throw new BadRequestException('Reset token inválido o expirado');
    }

    const user = await this.users.findById(record.userId);
    if (!user || !user.isActive) {
      throw new BadRequestException('Usuario no disponible');
    }

    const passwordHash = await bcrypt.hash(
      dto.newPassword,
      this.jwtCfg.bcryptSaltRounds,
    );

    await this.users.update(user.id, { passwordHash });
    await this.tokens.markUsed(record.id);
    // [Revoca sesiones]: forza re-login en otros dispositivos
    await this.authRepo.revokeAllForUser(user.id);

    this.logger.log(`Password reset successful: ${user.email}`);
    return { success: true };
  }
}
