import type { Category, Difficulty } from "@/types/quiz";

const CATEGORY_LABEL: Record<Category, string> = {
  general: "General",
  science: "Ciencias",
  history: "Historia",
  geography: "Geografía",
  sports: "Deportes",
  entertainment: "Entretenimiento",
  technology: "Tecnología",
  math: "Matemáticas",
  art: "Arte",
  custom: "Personalizado",
};

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
};

export function categoryLabel(c: Category): string {
  return CATEGORY_LABEL[c] ?? c;
}

export function difficultyLabel(d: Difficulty): string {
  return DIFFICULTY_LABEL[d] ?? d;
}

export function totalMinutes(timePerQuestionSeconds: number, questions: number): number {
  return Math.max(1, Math.round((timePerQuestionSeconds * questions) / 60));
}
