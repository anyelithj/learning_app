import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BaseOllamaAIProvider } from './base-ollama-ai.provider';
import {
  AIProvider,
  AI_PROVIDER_MODEL,
} from '../../domain/value-objects/ai-provider.vo';
// [Adapter Qwen]: motor principal de generación de preguntas vía Ollama local | [Patrón]: Adapter (Hexagonal) + Concrete Strategy | [Principio]: SRP + LSP | [Paradigma]: POO

@Injectable()
export class QwenProvider extends BaseOllamaAIProvider {
  readonly id = AIProvider.QWEN;
  protected readonly model: string;

  constructor(http: HttpService, config: ConfigService) {
    super(http, config);
    // [Override por env]: permite usar tag distinto (ej qwen3:14b) sin recompilar | [Principio]: OCP
    this.model =
      this.config.get<string>('OLLAMA_QWEN_MODEL') ??
      AI_PROVIDER_MODEL[AIProvider.QWEN];
  }

  // [think:false]: desactiva el bloque <think> de Qwen3 → menos tokens generados y menor latencia; el razonamiento no se muestra al usuario | [Patrón]: Template Method (override del hook)
  // [Solo Qwen3]: `think` es exclusivo de modelos con razonamiento; con qwen2.5 (más ligero, apto para poca RAM) se omite para no provocar error en Ollama
  protected override requestExtras(): Record<string, unknown> {
    return this.model.startsWith('qwen3') ? { think: false } : {};
  }
}
