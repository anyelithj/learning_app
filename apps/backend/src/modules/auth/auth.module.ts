import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import jwtConfig from '../../shared/config/jwt.config';
import oauthConfig from '../../shared/config/oauth.config';
import { UsersModule } from '../users/users.module';
import { EmailVerificationToken } from './domain/entities/email-verification-token.entity';
import { PasswordResetToken } from './domain/entities/password-reset-token.entity';
import { Session } from './domain/entities/session.entity';
import { AUTH_REPOSITORY } from './domain/interfaces/auth.repository.interface';
import { OAUTH_VERIFIER_REGISTRY } from './domain/interfaces/oauth-verifier.interface';
import { PASSWORD_RESET_TOKEN_REPOSITORY } from './domain/interfaces/password-reset-token.repository.interface';
import { TOKEN_SERVICE } from './domain/interfaces/token.service.interface';
import { AuthRepository } from './infrastructure/repositories/auth.repository';
import { PasswordResetTokenRepository } from './infrastructure/repositories/password-reset-token.repository';
import { GoogleOAuthVerifier } from './infrastructure/services/google-oauth.verifier';
import { JwtTokenService } from './infrastructure/services/jwt-token.service';
import { MicrosoftOAuthVerifier } from './infrastructure/services/microsoft-oauth.verifier';
import { OAuthVerifierRegistry } from './infrastructure/services/oauth-verifier.registry';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { OAuthLoginUseCase } from './application/use-cases/oauth-login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { RequestPasswordResetUseCase } from './application/use-cases/request-password-reset.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.use-case';
import { AuthController } from './presentation/auth.controller';
// [Módulo Auth]: Bounded Context de autenticación | [Patrón]: Module + DI Container | [Principio]: ISP + DIP | [Paradigma]: POO

// [Providers Ports]: Application depende de tokens simbólicos, no de clases concretas | [Patrón]: DI Token
const authRepoProvider = { provide: AUTH_REPOSITORY, useClass: AuthRepository };
const tokenServiceProvider = {
  provide: TOKEN_SERVICE,
  useClass: JwtTokenService,
};
// [Provider OAuth registry]: expone IOAuthVerifierRegistry vía DI token | [Patrón]: DI Token + Registry
const oauthRegistryProvider = {
  provide: OAUTH_VERIFIER_REGISTRY,
  useClass: OAuthVerifierRegistry,
};
// [Provider PasswordResetTokenRepository]: expone IPasswordResetTokenRepository via DI
const passwordResetRepoProvider = {
  provide: PASSWORD_RESET_TOKEN_REPOSITORY,
  useClass: PasswordResetTokenRepository,
};

@Module({
  imports: [
    // [UsersModule]: re-exporta USER_REPOSITORY que necesitan UseCases y JwtStrategy
    UsersModule,
    // [Entities Auth]: registra repos TypeORM (Session + tokens efímeros)
    TypeOrmModule.forFeature([Session, EmailVerificationToken, PasswordResetToken]),
    // [Passport bootstrap]: requerido por strategies | [Patrón]: Strategy
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // [JwtModule]: registro vacío — JwtTokenService pasa secret y expiresIn en cada signAsync
    JwtModule.register({}),
    // [Config feature]: hace jwtConfig.KEY + oauthConfig.KEY inyectables en este módulo
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(oauthConfig),
  ],
  controllers: [AuthController],
  providers: [
    // [Strategies passport]: registran 'jwt' y 'local'
    JwtStrategy,
    LocalStrategy,
    // [Adapters]: implementan los Ports
    authRepoProvider,
    tokenServiceProvider,
    passwordResetRepoProvider,
    // [Verifiers OAuth]: adapters Google/Microsoft + registry
    GoogleOAuthVerifier,
    MicrosoftOAuthVerifier,
    oauthRegistryProvider,
    // [Use cases]: orquestadores de dominio
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    VerifyEmailUseCase,
    OAuthLoginUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
  ],
  exports: [tokenServiceProvider, authRepoProvider],
})
export class AuthModule {}
