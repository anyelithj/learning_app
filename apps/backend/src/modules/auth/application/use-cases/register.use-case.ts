import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import jwtConfig from '../../../../shared/config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/user.repository.interface';
import type { IUserRepository } from '../../../users/domain/interfaces/user.repository.interface';
import { Role } from '../../../users/domain/value-objects/role.vo';
import { Email } from '../../../users/domain/value-objects/email.vo';
import { TOKEN_SERVICE } from '../../domain/interfaces/token.service.interface';
import type { ITokenService } from '../../domain/interfaces/token.service.interface';
import { AUTH_REPOSITORY } from '../../domain/interfaces/auth.repository.interface';
import type { IAuthRepository } from '../../domain/interfaces/auth.repository.interface';
import {
  USER_REGISTERED_EVENT,
  UserRegisteredEvent,
} from '../../domain/events/user-registered.event';
import { RegisterDto } from '../dtos/register.dto';
import type { AuthResponseDto } from '../dtos/auth-response.dto';
// [Use Case Register]: orquesta validación + hash + persistencia + emisión tokens | [Patrón]: Command + Use Case | [Principio]: SRP + DIP | [Paradigma]: POO

@Injectable()
export class RegisterUseCase {
  // [Logger ámbito]: namespace propio para grep
  private readonly logger = new Logger(RegisterUseCase.name);

  // [Inyección dependencias]: todas via interface (Port) | [Patrón]: DI + Repository
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(AUTH_REPOSITORY) private readonly authRepo: IAuthRepository,
    @Inject(TOKEN_SERVICE) private readonly tokens: ITokenService,
    @Inject(jwtConfig.KEY) private readonly jwtCfg: ConfigType<typeof jwtConfig>,
    // [EventEmitter2]: bus in-memory para Domain Events | [Patrón]: Observer
    private readonly events: EventEmitter2,
  ) {}

  // [execute]: punto único de entrada del Use Case | [Principio]: SRP
  async execute(
    dto: RegisterDto,
    context?: { ipAddress?: string; userAgent?: string },
  ): Promise<AuthResponseDto> {
    // [Normalización de email via VO]: aplica regex + lowercase
    const email = Email.create(dto.email);

    // [Unicidad]: lookup antes de hashear para no gastar CPU si ya existe
    const existing = await this.users.findByEmail(email.value);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    // [Hash bcrypt]: factor configurable (12 default)
    const passwordHash = await bcrypt.hash(
      dto.password,
      this.jwtCfg.bcryptSaltRounds,
    );

    // [Persistencia]: rol fuerza USER si el cliente no es admin (RBAC seguro)
    // Nota: aceptar dto.role solo en endpoints admin; aquí siempre USER por seguridad.
    const user = await this.users.create({
      email: email.value,
      passwordHash,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      role: Role.USER,
    });

    // [Emisión tokens]: par access + refresh
    const pair = await this.tokens.issuePair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // [Persistir sesión]: refresh token hasheado en DB para poder revocar
    const refreshHash = this.tokens.hashRefresh(pair.refreshToken);
    const decoded = await this.tokens.verifyRefresh(pair.refreshToken);
    await this.authRepo.createSession({
      userId: user.id,
      refreshTokenHash: refreshHash,
      expiresAt: new Date(decoded.exp * 1000),
      userAgent: context?.userAgent,
      ipAddress: context?.ipAddress,
    });

    // [Evento dominio]: listeners (analytics, email welcome) reaccionan async | [Patrón]: Observer
    this.events.emit(
      USER_REGISTERED_EVENT,
      new UserRegisteredEvent(user.id, user.email, user.role),
    );

    this.logger.log(`User registered: ${user.email} (${user.id})`);

    // [Respuesta]: tokens + perfil mínimo (sin passwordHash)
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
