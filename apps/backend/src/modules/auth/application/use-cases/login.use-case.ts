import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/user.repository.interface';
import type { IUserRepository } from '../../../users/domain/interfaces/user.repository.interface';
import { AUTH_REPOSITORY } from '../../domain/interfaces/auth.repository.interface';
import type { IAuthRepository } from '../../domain/interfaces/auth.repository.interface';
import { TOKEN_SERVICE } from '../../domain/interfaces/token.service.interface';
import type { ITokenService } from '../../domain/interfaces/token.service.interface';
import {
  USER_LOGGED_IN_EVENT,
  UserLoggedInEvent,
} from '../../domain/events/user-logged-in.event';
import { LoginDto } from '../dtos/login.dto';
import type { AuthResponseDto } from '../dtos/auth-response.dto';
// [Use Case Login]: valida credenciales + emite tokens + crea sesión | [Patrón]: Command + Use Case | [Principio]: SRP + DIP | [Paradigma]: POO

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(AUTH_REPOSITORY) private readonly authRepo: IAuthRepository,
    @Inject(TOKEN_SERVICE) private readonly tokens: ITokenService,
    private readonly events: EventEmitter2,
  ) {}

  // [execute]: flujo principal del login | [Principio]: SRP
  async execute(
    dto: LoginDto,
    context?: { ipAddress?: string; userAgent?: string },
  ): Promise<AuthResponseDto> {
    const user = await this.users.findByEmail(dto.email);

    // [Mensaje genérico]: no revelar si email o password fueron incorrectos (anti enumeration)
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // [Compare bcrypt]: timing-safe internamente
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // [Emisión tokens]
    const pair = await this.tokens.issuePair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // [Persistir sesión refresh]: para poder revocar
    const refreshHash = this.tokens.hashRefresh(pair.refreshToken);
    const decoded = await this.tokens.verifyRefresh(pair.refreshToken);
    const session = await this.authRepo.createSession({
      userId: user.id,
      refreshTokenHash: refreshHash,
      expiresAt: new Date(decoded.exp * 1000),
      userAgent: context?.userAgent,
      ipAddress: context?.ipAddress,
    });

    // [Evento]: listeners para audit log / last-login | [Patrón]: Observer
    this.events.emit(
      USER_LOGGED_IN_EVENT,
      new UserLoggedInEvent(
        user.id,
        user.email,
        session.id,
        context?.ipAddress,
        context?.userAgent,
      ),
    );

    this.logger.log(`User logged in: ${user.email}`);

    return {
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
      accessExpiresIn: pair.accessExpiresIn,
      tokenType: pair.tokenType,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }
}
