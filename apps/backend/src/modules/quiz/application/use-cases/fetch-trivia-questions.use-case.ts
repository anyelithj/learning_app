import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { TRIVIA_CLIENT } from '../../domain/interfaces/trivia-client.interface';
import type {
  FetchTriviaOptions,
  ITriviaClient,
  TriviaQuestion,
} from '../../domain/interfaces/trivia-client.interface';
import { DEFAULT_LANGUAGE } from '../../domain/value-objects/language.vo';
import { FetchQuestionsDto } from '../dtos/fetch-questions.dto';
// [Use Case FetchTrivia]: orquesta cliente externo + caché Redis 1h | [Patrón]: Command + Proxy (cache) | [Principio]: SRP + DIP | [Paradigma]: POO

@Injectable()
export class FetchTriviaQuestionsUseCase {
  private readonly logger = new Logger(FetchTriviaQuestionsUseCase.name);
  // [TTL caché]: 1 hora — preguntas externas cambian poco
  private readonly CACHE_TTL_MS = 60 * 60 * 1000;

  constructor(
    @Inject(TRIVIA_CLIENT) private readonly client: ITriviaClient,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  // [execute]: cache-aside pattern | [Patrón]: Cache-Aside
  async execute(dto: FetchQuestionsDto): Promise<TriviaQuestion[]> {
    // [Resolución idioma]: usar default cuando el cliente no especifica | [Principio]: DRY
    const language = dto.language ?? DEFAULT_LANGUAGE;
    const key = this.cacheKey(dto, language);
    const cached = await this.cache.get<TriviaQuestion[]>(key);
    if (cached) {
      this.logger.debug(`Cache hit: ${key}`);
      return cached;
    }

    const options: FetchTriviaOptions = {
      amount: dto.amount,
      category: dto.category,
      difficulty: dto.difficulty,
      type: dto.type,
      // [Propagación idioma]: el adapter decide si necesita traducir post-fetch | [Patrón]: Strategy
      language,
    };
    const questions = await this.client.fetchQuestions(options);
    await this.cache.set(key, questions, this.CACHE_TTL_MS);
    this.logger.log(
      `Fetched ${questions.length} trivia questions (lang=${language}, cached)`,
    );
    return questions;
  }

  // [Cache key]: derivado de opciones + idioma para hit/miss correcto | [Principio]: DRY
  private cacheKey(dto: FetchQuestionsDto, language: string): string {
    return `trivia:${dto.amount}:${dto.category ?? 'any'}:${dto.difficulty ?? 'any'}:${dto.type ?? 'any'}:${language}`;
  }
}
