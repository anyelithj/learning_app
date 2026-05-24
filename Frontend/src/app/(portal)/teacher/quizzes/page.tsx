import type { Metadata } from "next";
import Link from "next/link";
import { listQuizzes } from "@/lib/quiz-api";
import type { PaginatedQuizzes } from "@/types/quiz";
import { QuizAdminTable } from "@/components/quiz/QuizAdminTable";
import { QuizSeedButton } from "@/components/quiz/QuizSeedButton";

export const metadata: Metadata = {
  title: "Gestión · NeuroEdu IA",
  description: "Panel de gestión de exámenes (Docente).",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface SearchParams {
  page?: string;
  category?: string;
  difficulty?: string;
}

function buildQuery(sp: SearchParams, overrides: Record<string, string>): string {
  const merged: Record<string, string> = { ...overrides };
  for (const [k, v] of Object.entries(sp)) {
    if (v !== undefined && !(k in overrides)) merged[k] = v;
  }
  return new URLSearchParams(merged).toString();
}

export default async function TeacherQuizzesPage(props: { searchParams: Promise<SearchParams> }) {
  const sp = await props.searchParams;

  let data: PaginatedQuizzes;
  let error: string | null = null;
  try {
    data = await listQuizzes({
      page: sp.page ? parseInt(sp.page, 10) : 1,
      category: sp.category,
      difficulty: sp.difficulty,
    });
  } catch (err) {
    error = err instanceof Error ? err.message : "Error cargando exámenes";
    data = { data: [], total: 0, page: 1, limit: 12 };
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Gestión</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administra los exámenes que publicas.
        </p>
      </header>

      <section className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <p className="text-sm text-muted-foreground">
            {data.total} examen{data.total === 1 ? "" : "es"} en la plataforma.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/quiz/create"
              className="inline-flex items-center h-10 px-4 rounded-lg bg-gradient-brand text-white font-semibold text-sm hover:opacity-90"
            >
              + Crear examen
            </Link>
            <QuizSeedButton label="🌐 Generar examen" />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <QuizAdminTable quizzes={data.data} />

        {data.total > data.limit && (
          <nav className="flex items-center justify-center gap-2" aria-label="Paginación">
            {Array.from({ length: Math.ceil(data.total / data.limit) }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`/teacher/quizzes?${buildQuery(sp, { page: String(p) })}`}
                className={
                  p === data.page
                    ? "px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
                    : "px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted"
                }
              >
                {p}
              </a>
            ))}
          </nav>
        )}
      </section>
    </main>
  );
}
