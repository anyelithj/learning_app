import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AIModule } from './modules/ai/ai.module';
import { AuthModule } from './modules/auth/auth.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { ScoreModule } from './modules/score/score.module';
import { UsersModule } from './modules/users/users.module';
import databaseConfig from './shared/config/database.config';
import jwtConfig from './shared/config/jwt.config';
import redisConfig from './shared/config/redis.config';
import throttlerConfig from './shared/config/throttler.config';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { CustomThrottlerGuard } from './shared/guards/throttler.guard';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './shared/interceptors/timeout.interceptor';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
// [App Module]: composición raíz del backend | [Patrón]: Module + DI Container | [Principio]: ISP + DIP | [Paradigma]: POO

@Module({
  imports: [
    // [ConfigModule global]: carga .env y registra namespaces
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, redisConfig, throttlerConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    // [EventEmitter global]: bus interno para Domain Events | [Patrón]: Observer
    EventEmitterModule.forRoot({
      wildcard: true,
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),
    // [TypeOrm async]: conexión PostgreSQL via factory | [Patrón]: Factory
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      inject: [databaseConfig.KEY],
      useFactory: (cfg: ConfigType<typeof databaseConfig>) => ({
        type: 'postgres',
        host: cfg.host,
        port: cfg.port,
        username: cfg.username,
        password: cfg.password,
        database: cfg.database,
        // [autoLoadEntities]: registra entities declaradas con TypeOrmModule.forFeature
        autoLoadEntities: true,
        synchronize: cfg.synchronize,
        logging: cfg.logging,
      }),
    }),
    // [Throttler async]: límite global de requests | [Patrón]: Chain of Responsibility
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule.forFeature(throttlerConfig)],
      inject: [throttlerConfig.KEY],
      useFactory: (cfg: ConfigType<typeof throttlerConfig>) => [
        { ttl: cfg.ttl, limit: cfg.limit },
      ],
    }),
    // [Bounded Contexts]: cada feature en su propio módulo
    UsersModule,
    AuthModule,
    AIModule,
    QuizModule,
    ScoreModule,
    NotificationsModule,
    FeedbackModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // [Global filter]: forma uniforme de errores | [Patrón]: Exception Filter
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    // [Global guards]: orden de ejecución asegurado por Nest (rate limit → JWT)
    { provide: APP_GUARD, useClass: CustomThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // [Global interceptors]: orden top-down: logging → timeout → transform
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
