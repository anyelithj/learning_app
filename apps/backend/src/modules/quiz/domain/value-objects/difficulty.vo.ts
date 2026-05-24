// [Value Object Difficulty]: enum cerrado + helpers de scoring | [Patrón]: Value Object | [Principio]: SRP + LSP | [Paradigma]: POO

// [Enum]: niveles soportados — alineados con OpenTrivia DB ("easy"|"medium"|"hard")
export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

// [Multiplicador de score]: usado por CalculateScoreUseCase | [Patrón]: Policy
export const DIFFICULTY_MULTIPLIER: Readonly<Record<Difficulty, number>> =
  Object.freeze({
    [Difficulty.EASY]: 1.0,
    [Difficulty.MEDIUM]: 1.5,
    [Difficulty.HARD]: 2.0,
  });

// [Guard de validez]: usado al normalizar respuestas externas (OpenTrivia) | [Principio]: DRY
export function isDifficulty(value: string): value is Difficulty {
  return Object.values(Difficulty).includes(value as Difficulty);
}
