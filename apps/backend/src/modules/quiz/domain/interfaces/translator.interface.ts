import { Language } from '../value-objects/language.vo';
// [Port traductor]: contrato Domain → Infrastructure para traducción de contenido | [Patrón]: Port (Hexagonal) + Strategy | [Principio]: DIP + ISP + OCP | [Paradigma]: POO

// [Token DI]: usado con @Inject(TRANSLATOR) para resolver implementación concreta | [Patrón]: Service Locator (Nest DI)
export const TRANSLATOR = Symbol('TRANSLATOR');

// [Petición de traducción de pregunta]: agrupa todos los textos a traducir en un único lote | [Patrón]: Aggregate Request | [Principio]: SRP
export interface TranslateQuestionInput {
  text: string;
  options: string[];
  correctAnswer: string;
}

// [Resultado de traducción]: misma forma que input, ya traducido | [Principio]: ISP
export interface TranslateQuestionOutput {
  text: string;
  options: string[];
  correctAnswer: string;
}

// [Contrato traductor]: implementado por adapters (Ollama, DeepL, LibreTranslate) | [Patrón]: Strategy (Port) | [Principio]: OCP — abierto a nuevos adapters
export interface ITranslator {
  // [Traduce texto plano]: usado por fallback y por casos genéricos | [Principio]: SRP
  translateText(text: string, from: Language, to: Language): Promise<string>;

  // [Traduce una pregunta completa en una sola llamada]: minimiza latencia LLM | [Patrón]: Batch | [Principio]: DRY
  translateQuestion(
    input: TranslateQuestionInput,
    from: Language,
    to: Language,
  ): Promise<TranslateQuestionOutput>;
}
