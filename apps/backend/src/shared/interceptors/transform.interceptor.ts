import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// [Interceptor de envelope]: envuelve toda respuesta en { statusCode, data, meta } | [Patrón]: Interceptor (Chain of Responsibility) | [Principio]: SSOT | [Paradigma]: AOP + Reactivo

// [Envelope de respuesta]: forma estable expuesta al frontend | [Patrón]: DTO
export interface ResponseEnvelope<T> {
  statusCode: number;
  data: T;
  meta: {
    timestamp: string;
    path: string;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseEnvelope<T>>
{
  // [intercept]: contrato Nest, recibe handler observable y devuelve transformado | [Paradigma]: Reactivo (RxJS)
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseEnvelope<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<{ statusCode: number }>();

    // [Pipe map]: envuelve cada emisión del handler | [Paradigma]: Funcional
    return next.handle().pipe(
      map((data) => ({
        statusCode: response.statusCode,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          path: request.url,
        },
      })),
    );
  }
}
