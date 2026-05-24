import { Category } from '../value-objects/category.vo';
import { Difficulty } from '../value-objects/difficulty.vo';
import { Language } from '../value-objects/language.vo';
import { QuestionType } from '../entities/question.entity';
// [Port cliente trivia externo]: contrato Domain → Infrastructure (OpenTriviaClient) | [Patrón]: Port (Hexagonal) | [Principio]: DIP + ISP | [Paradigma]: POO

export const TRIVIA_CLIENT = Symbol('TRIVIA_CLIENT');

// [Pregunta normalizada]: forma agnóstica del proveedor (no campos crudos OpenTrivia)
export interface TriviaQuestion {
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  difficulty: Difficulty;
  category: Category;
  // [Idioma final]: tras traducción si aplica. Permite trazabilidad por pregunta | [Principio]: SRP
  language: Language;
}

// [Opciones del fetch]: parametrizables | [Principio]: ISP
export interface FetchTriviaOptions {
  amount: number;
  category?: Category;
  difficulty?: Difficulty;
  type?: QuestionType;
  // [Idioma destino]: si != EN el adapter dispara traducción post-fetch | [Patrón]: Strategy hint
  language?: Language;
}

// [Contrato]: usado por FetchTriviaQuestionsUseCase | [Principio]: SRP
export interface ITriviaClient {
  fetchQuestions(options: FetchTriviaOptions): Promise<TriviaQuestion[]>;
}
