// [Value Object Language]: enum cerrado de idiomas soportados | [Patrón]: Value Object | [Principio]: SRP + LSP | [Paradigma]: POO

// [Enum]: códigos ISO 639-1 — limitamos a los soportados por la UI y el traductor
export enum Language {
  EN = 'en',
  ES = 'es',
}

// [Idioma por defecto]: usado cuando no se especifica explícitamente en DTOs/UseCases | [Principio]: DRY
export const DEFAULT_LANGUAGE: Language = Language.EN;

// [Nombre legible]: mapeo para etiquetas UI / Swagger | [Patrón]: Lookup Table
export const LANGUAGE_LABEL: Readonly<Record<Language, string>> = Object.freeze({
  [Language.EN]: 'English',
  [Language.ES]: 'Español',
});

// [Guard de validez]: usado al validar entrada cruda externa (querystring, JSON) | [Principio]: DRY + ISP
export function isLanguage(value: string): value is Language {
  return Object.values(Language).includes(value as Language);
}

// [Requiere traducción post-fetch]: OpenTriviaDB solo devuelve EN; si el cliente pide otro → traducir | [Patrón]: Policy
export function requiresTranslationFromEnglish(target: Language): boolean {
  return target !== Language.EN;
}
