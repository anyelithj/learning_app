import type { Metadata } from "next";
import Link from "next/link";
import { listQuizzes } from "@/lib/quiz-api";
import { QuizGrid } from "@/components/quiz/QuizGrid";

export const metadata: Metadata = {
  title: "Quizzes",
  description: "Explora todos los quizzes publicados.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface SearchParams {
  page?: string;
  category?: string;
  difficulty?: string;
}

export default async function QuizListPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await props.searchParams;

  let data;
  try {
    data = await listQuizzes({
      page: sp.page ? parseInt(sp.page, 10) : 1,
      category: sp.category,
      difficulty: sp.difficulty,
    });
  } catch (err) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6">
        <p className="text-destructive">
          No se pudo cargar la lista de quizzes — {err instanceof Error ? err.message : "error"}.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Verifica que el backend esté disponible en /api/v1/quiz.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Exámenes</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          {data.total} examen{data.total === 1 ? "" : "es"} disponibles
        </p>
      </header>

      {data.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-5">
          <div className="grid place-items-center size-16 rounded-2xl bg-gradient-soft mx-auto text-3xl">
            📚
          </div>
          <div>
            <h2 className="text-xl font-bold">Aún no hay exámenes publicados</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Pídele al docente que publique exámenes.
            </p>
          </div>
        </div>
      ) : (
        <QuizGrid quizzes={data.data} />
      )}

      {data.total > data.limit && (
        <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Paginación">
          {Array.from({ length: Math.ceil(data.total / data.limit) }, (_, i) => i + 1).map(
            (p) => (
              <Link
                key={p}
                href={{ pathname: "/quiz", query: { ...sp, page: String(p) } }}
                className={
                  p === data.page
                    ? "px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
                    : "px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted"
                }
              >
                {p}
              </Link>
            ),
          )}
        </nav>
      )}
    </div>
  );
}
