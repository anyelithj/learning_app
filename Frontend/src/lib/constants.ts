// [Constantes globales]: rutas, cookies, tokens | [Patrón]: Constants Module | [Principio]: SSOT | [Paradigma]: Funcional

// [Rutas del portal]: las protegidas por proxy
export const PORTAL_ROUTES = {
  dashboard: "/dashboard",
  quiz: "/quiz",
  leaderboard: "/leaderboard",
  profile: "/profile",
  assistant: "/assistant",
} as const;

// [Rutas auth]: públicas
export const AUTH_ROUTES = {
  login: "/login",
  register: "/register",
  terms: "/terms",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
} as const;

// [Cookies httpOnly]: nombres centralizados | [Principio]: DRY
export const COOKIE_NAMES = {
  access: process.env.ACCESS_TOKEN_COOKIE ?? "neuroedu_access",
  refresh: process.env.REFRESH_TOKEN_COOKIE ?? "neuroedu_refresh",
} as const;

// [Backend URLs]: server-side only (sin NEXT_PUBLIC_)
export const BACKEND = {
  url: process.env.BACKEND_URL ?? "http://localhost:4000",
  prefix: process.env.API_PREFIX ?? "api/v1",
};

// [Helper URL]: arma endpoint absoluto | [Principio]: DRY
export const apiUrl = (path: string): string =>
  `${BACKEND.url}/${BACKEND.prefix}${path.startsWith("/") ? path : `/${path}`}`;

// [Roles]: deben coincidir con backend (Role enum NestJS)
export enum Role {
  USER = "USER",
  TEACHER = "TEACHER",
  ADMIN = "ADMIN",
}

// [Etiquetas español]: SSOT para mostrar dificultad/categoría en UI | [Principio]: SSOT + DRY
export const DIFFICULTY_LABEL_ES: Readonly<Record<string, string>> = Object.freeze({
  easy: "Fácil",
  medium: "Media",
  hard: "Difícil",
});

export const CATEGORY_LABEL_ES: Readonly<Record<string, string>> = Object.freeze({
  general: "General",
  science: "Ciencia",
  history: "Historia",
  geography: "Geografía",
  sports: "Deportes",
  entertainment: "Entretenimiento",
  technology: "Tecnología",
  math: "Matemáticas",
  art: "Arte",
  custom: "Personalizada",
});

// [Helpers]: lookup con fallback al valor crudo | [Principio]: DRY
export const labelDifficulty = (k?: string): string =>
  k ? (DIFFICULTY_LABEL_ES[k] ?? k) : "—";

export const labelCategory = (k?: string): string =>
  k ? (CATEGORY_LABEL_ES[k] ?? k) : "—";
