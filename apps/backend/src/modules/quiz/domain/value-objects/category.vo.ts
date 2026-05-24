// [Value Object Category]: catálogo cerrado de categorías | [Patrón]: Value Object | [Principio]: SRP + ISP | [Paradigma]: POO

// [Categorías]: mapean a IDs de OpenTrivia DB (https://opentdb.com/api_category.php)
export enum Category {
  GENERAL = 'general',
  SCIENCE = 'science',
  HISTORY = 'history',
  GEOGRAPHY = 'geography',
  SPORTS = 'sports',
  ENTERTAINMENT = 'entertainment',
  TECHNOLOGY = 'technology',
  MATH = 'math',
  ART = 'art',
  CUSTOM = 'custom',
}

// [Mapping a OpenTrivia API category id]: para enviar a https://opentdb.com/api.php?category=X | [Patrón]: Adapter
export const OPEN_TRIVIA_CATEGORY_ID: Readonly<Record<Category, number | null>> =
  Object.freeze({
    [Category.GENERAL]: 9,
    [Category.SCIENCE]: 17,
    [Category.HISTORY]: 23,
    [Category.GEOGRAPHY]: 22,
    [Category.SPORTS]: 21,
    [Category.ENTERTAINMENT]: 11,
    [Category.TECHNOLOGY]: 18,
    [Category.MATH]: 19,
    [Category.ART]: 25,
    // [Custom]: preguntas propias (no API externa)
    [Category.CUSTOM]: null,
  });

export function isCategory(value: string): value is Category {
  return Object.values(Category).includes(value as Category);
}
