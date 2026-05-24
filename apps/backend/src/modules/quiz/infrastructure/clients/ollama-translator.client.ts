import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Language, LANGUAGE_LABEL } from '../../domain/value-objects/language.vo';
import type {
  ITranslator,
  TranslateQuestionInput,
  TranslateQuestionOutput,
} from '../../domain/interfaces/translator.interface';
// [Adapter Ollama Translator]: implementa ITranslator usando LLM local | [Patrón]: Adapter (Hexagonal) + Strategy | [Principio]: DIP | [Paradigma]: POO

// [Forma respuesta /api/generate]: solo los campos que consumimos | [Principio]: ISP
interface OllamaGenerateResponse {
  response: string;
  done: boolean;
}

@Injectable()
export class OllamaTranslator implements ITranslator {
  private readonly logger = new Logger(OllamaTranslator.name);
  private readonly baseUrl: string;
  private readonly model: string;
  // [Timeout muy largo]: modelo pequeño (1b) tarda 60-90s en cold start, ~5-10s caliente | [Patrón]: Generous Timeout
  private readonly TIMEOUT_MS = 120_000;
  // [Flags anti-spam logs]: solo un warning por batch si Ollama caído | [Patrón]: Circuit Breaker simple
  private downSince: number | null = null;
  private static readonly DOWN_LOG_INTERVAL_MS = 60_000;
  private lastDownLog = 0;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    // [Config con fallback]: env-vars opcionales | [Principio]: DRY
    this.baseUrl = this.config.get<string>('OLLAMA_BASE_URL', 'http://localhost:11434');
    this.model = this.config.get<string>('OLLAMA_TRANSLATION_MODEL', 'llama3.2:1b');
  }

  // [Traducción texto plano]: prompt minimalista, output crudo | [Principio]: SRP
  async translateText(text: string, from: Language, to: Language): Promise<string> {
    if (from === to) return text;
    const prompt = this.buildTextPrompt(text, from, to);
    const raw = await this.callOllama(prompt);
    const cleaned = this.stripWrappingQuotes(raw.trim());
    // [Fallback silencioso al original]: callOllama ya hizo log con throttle | [Patrón]: Graceful Degradation
    if (!cleaned) return text;
    return cleaned;
  }

  // [Traducción pregunta completa]: pide JSON estructurado a la LLM en una sola llamada | [Patrón]: Batch | [Principio]: DRY
  async translateQuestion(
    input: TranslateQuestionInput,
    from: Language,
    to: Language,
  ): Promise<TranslateQuestionOutput> {
    if (from === to) return { ...input };

    // [Estrategia batched per-field paralelo]: modelos pequeños fallan en JSON; per-field es robusto. Paralelizamos para velocidad | [Patrón]: Bulk + Parallel | [Principio]: Performance over Elegance
    const [translatedText, translatedCorrect, ...translatedOptions] = await Promise.all([
      this.translateText(input.text, from, to),
      this.translateText(input.correctAnswer, from, to),
      ...input.options.map((o) => this.translateText(o, from, to)),
    ]);

    return {
      text: translatedText,
      options: translatedOptions,
      correctAnswer: translatedCorrect,
    };
  }

  // [Cliente HTTP único]: encapsula POST /api/generate | [Patrón]: Facade interno | [Principio]: SRP
  private async callOllama(prompt: string): Promise<string> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/api/generate`;
    try {
      const res = await firstValueFrom(
        this.http.post<OllamaGenerateResponse>(
          url,
          { model: this.model, prompt, stream: false },
          { timeout: this.TIMEOUT_MS },
        ),
      );
      // [Reset flag]: Ollama respondió, salimos del estado caído | [Patrón]: Circuit Breaker close
      this.downSince = null;
      return res.data.response ?? '';
    } catch (err) {
      // [Log throttle]: imprimir una vez por minuto si Ollama persistentemente caído | [Patrón]: Rate-limit log
      const now = Date.now();
      if (this.downSince === null) this.downSince = now;
      if (now - this.lastDownLog > OllamaTranslator.DOWN_LOG_INTERVAL_MS || now === this.downSince) {
        this.lastDownLog = now;
        this.logger.error(
          `Ollama no responde (modelo "${this.model}" en ${this.baseUrl}): ${(err as Error).message}. Ejecuta: ollama pull ${this.model}`,
        );
      }
      return '';
    }
  }

  // [Prompt texto plano]: instrucción directa, sin formato JSON | [Patrón]: Template Method
  private buildTextPrompt(text: string, from: Language, to: Language): string {
    return [
      `Translate the following text from ${LANGUAGE_LABEL[from]} to ${LANGUAGE_LABEL[to]}.`,
      `Return ONLY the translated text. No explanations, no quotes, no prefixes.`,
      '',
      `Text: ${text}`,
    ].join('\n');
  }

  // [Limpia comillas envolventes]: la LLM a veces envuelve la respuesta en "..." pese a la instrucción
  private stripWrappingQuotes(text: string): string {
    if (text.length >= 2 && text.startsWith('"') && text.endsWith('"')) {
      return text.slice(1, -1);
    }
    return text;
  }
}
