import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BaseOllamaAIProvider } from './base-ollama-ai.provider';
import {
  AIProvider,
  AI_PROVIDER_MODEL,
} from '../../domain/value-objects/ai-provider.vo';
// [Adapter Mistral Nemo]: motor fallback / validación de generación de preguntas vía Ollama local | [Patrón]: Adapter (Hexagonal) + Concrete Strategy | [Principio]: SRP + LSP | [Paradigma]: POO

@Injectable()
export class MistralProvider extends BaseOllamaAIProvider {
  readonly id = AIProvider.MISTRAL;
  protected readonly model: string;

  constructor(http: HttpService, config: ConfigService) {
    super(http, config);
    // [Override por env]: permite cambiar tag (ej mistral-nemo:12b-instruct) sin recompilar | [Principio]: OCP
    this.model =
      this.config.get<string>('OLLAMA_MISTRAL_MODEL') ??
      AI_PROVIDER_MODEL[AIProvider.MISTRAL];
  }
}
