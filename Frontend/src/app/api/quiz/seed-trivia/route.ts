import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api-client";
import { getCurrentAccessToken, getCurrentUserRole } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { Role } from "@/lib/constants";
import { listQuizzes } from "@/lib/quiz-api";

// [Idiomas soportados]: SSOT con backend Language VO | [Principio]: SSOT
type Language = "en" | "es";
const DEFAULT_SEED_LANGUAGE: Language = "es";

interface TriviaQuestion {
  text: string;
  type: "multiple_choice" | "true_false" | "open_answer";
  options: string[];
  correctAnswer: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

type Preset = { title: string; description: string; category: string; difficulty: "easy" | "medium"; amount: number };

// [Presets bilingües]: backend traduce vía Ollama cuando language=es | [Patrón]: Default Policy
const PRESETS_BY_LANG: Record<Language, Preset[]> = {
  es: [
    { title: "Conocimiento General", description: "Quiz auto-generado desde Open Trivia DB (traducido)", category: "general", difficulty: "easy", amount: 10 },
    { title: "Ciencia", description: "Quiz auto-generado desde Open Trivia DB (traducido)", category: "science", difficulty: "easy", amount: 10 },
    { title: "Tecnología", description: "Quiz auto-generado desde Open Trivia DB (traducido)", category: "technology", difficulty: "easy", amount: 10 },
    { title: "Historia", description: "Quiz auto-generado desde Open Trivia DB (traducido)", category: "history", difficulty: "easy", amount: 10 },
    { title: "Geografía", description: "Quiz auto-generado desde Open Trivia DB (traducido)", category: "geography", difficulty: "easy", amount: 10 },
    { title: "Deportes", description: "Quiz auto-generado desde Open Trivia DB (traducido)", category: "sports", difficulty: "easy", amount: 10 },
    { title: "Entretenimiento", description: "Quiz auto-generado desde Open Trivia DB (traducido)", category: "entertainment", difficulty: "easy", amount: 10 },
    { title: "Arte", description: "Quiz auto-generado desde Open Trivia DB (traducido)", category: "art", difficulty: "easy", amount: 10 },
    { title: "Ciencia (Media)", description: "Quiz auto-generado desde Open Trivia DB (traducido)", category: "science", difficulty: "medium", amount: 10 },
    { title: "Historia (Media)", description: "Quiz auto-generado desde Open Trivia DB (traducido)", category: "history", difficulty: "medium", amount: 10 },
    { title: "Geografía (Media)", description: "Quiz auto-generado desde Open Trivia DB (traducido)", category: "geography", difficulty: "medium", amount: 10 },
    { title: "Conocimiento General (Media)", description: "Quiz auto-generado desde Open Trivia DB (traducido)", category: "general", difficulty: "medium", amount: 10 },
  ],
  en: [
    { title: "General Knowledge Pack", description: "Quiz auto-generated from Open Trivia DB", category: "general", difficulty: "easy", amount: 10 },
    { title: "Science Quiz", description: "Quiz auto-generated from Open Trivia DB", category: "science", difficulty: "easy", amount: 10 },
    { title: "Technology Trivia", description: "Quiz auto-generated from Open Trivia DB", category: "technology", difficulty: "easy", amount: 10 },
    { title: "History Challenge", description: "Quiz auto-generated from Open Trivia DB", category: "history", difficulty: "easy", amount: 10 },
    { title: "Geography Pack", description: "Quiz auto-generated from Open Trivia DB", category: "geography", difficulty: "easy", amount: 10 },
    { title: "Sports Quiz", description: "Quiz auto-generated from Open Trivia DB", category: "sports", difficulty: "easy", amount: 10 },
    { title: "Entertainment Trivia", description: "Quiz auto-generated from Open Trivia DB", category: "entertainment", difficulty: "easy", amount: 10 },
    { title: "Art Challenge", description: "Quiz auto-generated from Open Trivia DB", category: "art", difficulty: "easy", amount: 10 },
    { title: "Science (Medium)", description: "Quiz auto-generated from Open Trivia DB", category: "science", difficulty: "medium", amount: 10 },
    { title: "History (Medium)", description: "Quiz auto-generated from Open Trivia DB", category: "history", difficulty: "medium", amount: 10 },
    { title: "Geography (Medium)", description: "Quiz auto-generated from Open Trivia DB", category: "geography", difficulty: "medium", amount: 10 },
    { title: "General Knowledge (Medium)", description: "Quiz auto-generated from Open Trivia DB", category: "general", difficulty: "medium", amount: 10 },
  ],
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  attempts = 2,
  delayMs = 1500,
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < attempts - 1) await sleep(delayMs);
    }
  }
  throw lastErr;
}

export async function POST(req: NextRequest) {
  const role = await getCurrentUserRole();
  if (!role || (role !== Role.TEACHER && role !== Role.ADMIN)) {
    return NextResponse.json(
      { message: "Solo docentes o administradores pueden sembrar quizzes" },
      { status: 403 },
    );
  }
  const bearer = (await getCurrentAccessToken()) ?? undefined;

  // [Idioma seleccionado]: ?language=es|en o body { language } | [Patrón]: Parameter Object
  const urlLang = req.nextUrl.searchParams.get("language");
  let bodyLang: string | undefined;
  try {
    const body = (await req.json()) as { language?: string } | null;
    bodyLang = body?.language;
  } catch {
    bodyLang = undefined;
  }
  const requested = (bodyLang ?? urlLang ?? DEFAULT_SEED_LANGUAGE) as Language;
  const language: Language = requested === "en" ? "en" : "es";

  const presets = PRESETS_BY_LANG[language];
  const created: { id: string; title: string }[] = [];
  const errors: string[] = [];
  const skipped: string[] = [];

  // [Idempotencia]: lista quizzes existentes para evitar duplicados por título | [Patrón]: Guard Clause | [Principio]: Robustez
  let existingTitles = new Set<string>();
  try {
    const existing = await listQuizzes({ limit: 100 });
    existingTitles = new Set(existing.data.map((q) => q.title));
  } catch {
    // [Fallback]: si listing falla, seguimos sin guard.
  }

  // [Selecciona UN preset por click]: el primero que no exista. Si todos existen, devuelve mensaje. | [Patrón]: Strategy Pick-First
  const preset = presets.find((p) => !existingTitles.has(p.title));
  if (!preset) {
    return NextResponse.json({
      created: [],
      errors: [],
      skipped: presets.map((p) => p.title),
      language,
      message: "Todos los temas Trivia DB ya fueron generados. Crea quizzes manuales para más variedad.",
    });
  }

  try {
    const questions = await fetchWithRetry(() =>
      apiFetch<TriviaQuestion[]>("/quiz/trivia/fetch", {
        method: "POST",
        body: {
          amount: preset.amount,
          category: preset.category,
          difficulty: preset.difficulty,
          language,
        },
        bearer,
      }),
    );
    if (!questions.length) {
      errors.push(`${preset.title}: OpenTrivia devolvió 0 preguntas (rate-limit o pool agotado)`);
      return NextResponse.json({ created, errors, skipped, language });
    }
    // [Filtra preguntas inválidas]: si traducción Ollama falló, descarta vacíos | [Patrón]: Guard Clause
    const valid = questions.filter(
      (q) =>
        q.text?.trim().length > 0 &&
        q.correctAnswer?.trim().length > 0 &&
        Array.isArray(q.options) &&
        q.options.every((o) => o?.trim().length > 0),
    );
    if (valid.length === 0) {
      errors.push(
        `${preset.title}: todas las preguntas vinieron vacías. Ollama no respondió (modelo no instalado o servicio caído). Ejecuta: ollama pull llama3.2:1b`,
      );
      return NextResponse.json({ created, errors, skipped, language });
    }
    if (valid.length < questions.length) {
      errors.push(
        `${preset.title}: ${questions.length - valid.length} de ${questions.length} preguntas descartadas por traducción incompleta.`,
      );
    }
    const quiz = await apiFetch<{ id: string; title: string }>("/quiz", {
      method: "POST",
      body: {
        title: preset.title,
        description: `${preset.description} (${preset.category}/${preset.difficulty})`,
        category: preset.category,
        difficulty: preset.difficulty,
        language,
        timePerQuestionSeconds: 30,
        isPublished: true,
        questions: valid.map((q) => ({
          text: q.text,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
        })),
      },
      bearer,
    });
    created.push({ id: quiz.id, title: quiz.title });
  } catch (err) {
    const msg =
      err instanceof ApiError
        ? `${err.status} ${err.message}`
        : err instanceof Error
          ? err.message
          : "unknown";
    errors.push(`${preset.title}: ${msg}`);
  }

  return NextResponse.json({ created, errors, skipped, language });
}
