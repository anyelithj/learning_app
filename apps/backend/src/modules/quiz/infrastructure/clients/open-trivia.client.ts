import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type {
  FetchTriviaOptions,
  ITriviaClient,
  TriviaQuestion,
} from '../../domain/interfaces/trivia-client.interface';
import {
  Category,
  OPEN_TRIVIA_CATEGORY_ID,
} from '../../domain/value-objects/category.vo';
import { Difficulty } from '../../domain/value-objects/difficulty.vo';
import { QuestionType } from '../../domain/entities/question.entity';
import {
  DEFAULT_LANGUAGE,
  Language,
  requiresTranslationFromEnglish,
} from '../../domain/value-objects/language.vo';
import { TRANSLATOR } from '../../domain/interfaces/translator.interface';
import type { ITranslator } from '../../domain/interfaces/translator.interface';
// [Adapter OpenTriviaDB]: implementa ITriviaClient | [Patron]: Adapter (Hexagonal) | [Principio]: DIP | [Paradigma]: POO

// [Forma cruda OpenTrivia]: solo para parseo interno (no se exporta)
interface RawOpenTriviaResponse {
  response_code: number;
  results: Array<{
    category: string;
    type: 'multiple' | 'boolean';
    difficulty: Difficulty;
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
  }>;
}

@Injectable()
export class OpenTriviaClient implements ITriviaClient {
  private readonly logger = new Logger(OpenTriviaClient.name);
  private readonly BASE_URL = 'https://opentdb.com/api.php';

  constructor(
    private readonly http: HttpService,
    // [Inyección Port traductor]: depende de abstracción, no de impl concreta | [Patrón]: DI + Strategy | [Principio]: DIP
    @Inject(TRANSLATOR) private readonly translator: ITranslator,
  ) {}

  async fetchQuestions(options: FetchTriviaOptions): Promise<TriviaQuestion[]> {
    const params: Record<string, string> = {
      amount: String(options.amount),
      encode: 'url3986',
    };
    if (options.category) {
      const id = OPEN_TRIVIA_CATEGORY_ID[options.category];
      if (id !== null) params.category = String(id);
    }
    if (options.difficulty) params.difficulty = options.difficulty;
    if (options.type === QuestionType.MULTIPLE_CHOICE) params.type = 'multiple';
    if (options.type === QuestionType.TRUE_FALSE) params.type = 'boolean';

    let res;
    try {
      res = await firstValueFrom(
        this.http.get<RawOpenTriviaResponse>(this.BASE_URL, { params, timeout: 10000 }),
      );
    } catch (err) {
      this.logger.error(`OpenTrivia request failed: ${(err as Error).message}`);
      throw new ServiceUnavailableException(
        'OpenTrivia DB no respondió (red o rate-limit)',
      );
    }

    const code = res.data.response_code;
    if (code === 5) {
      throw new ServiceUnavailableException(
        'OpenTrivia rate-limit (response_code=5). Espera ~5s y reintenta.',
      );
    }
    if (code === 1) {
      this.logger.warn(
        `OpenTrivia sin resultados para category=${options.category} difficulty=${options.difficulty}`,
      );
      return [];
    }
    if (code !== 0) {
      this.logger.warn(`OpenTrivia response_code=${code}`);
      return [];
    }

    // [Mapeo raw → dominio]: decode URL + normaliza tipos | [Patron]: Adapter
    const normalized = res.data.results.map((r) =>
      this.normalize(r, options.category ?? Category.GENERAL),
    );

    // [Traducción post-fetch]: OpenTrivia solo devuelve EN; si el cliente pide otro idioma → traducir | [Patrón]: Strategy via Port | [Principio]: OCP
    const targetLanguage = options.language ?? DEFAULT_LANGUAGE;
    this.logger.log(
      `OpenTrivia: ${normalized.length} preguntas obtenidas. Target language=${targetLanguage}`,
    );
    if (!requiresTranslationFromEnglish(targetLanguage)) {
      return normalized;
    }

    return this.translateBatch(normalized, Language.EN, targetLanguage);
  }

  // [Traduce un lote de preguntas en paralelo]: limita concurrencia implícita por el HttpService | [Patrón]: Bulk | [Principio]: DRY
  private async translateBatch(
    questions: TriviaQuestion[],
    from: Language,
    to: Language,
  ): Promise<TriviaQuestion[]> {
    this.logger.log(
      `Translating ${questions.length} questions from ${from} to ${to} via Ollama`,
    );
    return Promise.all(
      questions.map(async (q): Promise<TriviaQuestion> => {
        const translated = await this.translator.translateQuestion(
          { text: q.text, options: q.options, correctAnswer: q.correctAnswer },
          from,
          to,
        );
        return {
          ...q,
          text: translated.text,
          options: translated.options,
          correctAnswer: translated.correctAnswer,
          language: to,
        };
      }),
    );
  }

  private normalize(
    raw: RawOpenTriviaResponse['results'][number],
    fallbackCategory: Category,
  ): TriviaQuestion {
    const text = decodeURIComponent(raw.question);
    const correct = decodeURIComponent(raw.correct_answer);
    const incorrect = raw.incorrect_answers.map(decodeURIComponent);
    const type =
      raw.type === 'boolean'
        ? QuestionType.TRUE_FALSE
        : QuestionType.MULTIPLE_CHOICE;
    // [Shuffle Fisher-Yates]: mezcla correctas + incorrectas para evitar bias posicional
    const options = this.shuffle([correct, ...incorrect]);
    return {
      text,
      type,
      options,
      correctAnswer: correct,
      difficulty: raw.difficulty,
      category: fallbackCategory,
      // [Idioma fuente]: OpenTrivia siempre devuelve inglés
      language: Language.EN,
    };
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
