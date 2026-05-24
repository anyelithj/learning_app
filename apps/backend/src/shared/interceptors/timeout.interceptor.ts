import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
// [Interceptor de timeout]: aborta requests que exceden N ms | [Patrón]: Interceptor | [Principio]: SRP | [Paradigma]: AOP + Reactivo

// [Default 30s]: cubre operaciones lentas pero evita conexiones colgadas
const DEFAULT_TIMEOUT_MS = 30_000;
// [Timeout extendido para rutas IA]: traducción Ollama puede tardar 60-90s en cold start | [Patrón]: Per-Route Policy
const AI_LONG_TIMEOUT_MS = 150_000;
const LONG_TIMEOUT_PATTERNS: RegExp[] = [
  /\/quiz\/trivia\/fetch$/,
  /\/quiz$/i,
  /\/ai\/feedback\//,
];

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  // [intercept]: aplica operador timeout al stream | [Paradigma]: Reactivo
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // [Selecciona timeout por path]: rutas IA requieren más tiempo | [Patrón]: Strategy
    const req = context.switchToHttp().getRequest<{ url?: string; method?: string }>();
    const url = req?.url ?? '';
    const isLong = LONG_TIMEOUT_PATTERNS.some((re) => re.test(url));
    const ttl = isLong ? AI_LONG_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;

    return next.handle().pipe(
      timeout(ttl),
      catchError((err) => {
        // [Mapeo a HTTP 408]: convierte timeout RxJS en excepción HTTP estándar
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err as Error);
      }),
    );
  }
}
