import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuiz } from "@/lib/quiz-api";
import { EditQuizForm } from "./EditQuizForm";
// [Página editar quiz]: SSR + Client form completo (preguntas incluidas) | [Patrón]: Container + Presentational

export const dynamic = "force-dynamic";

export default async function EditQuizPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  let quiz;
  try {
    quiz = await getQuiz(id);
  } catch {
    notFound();
  }

  // [Mapeo preguntas con correctAnswer]: el backend lo devuelve para manager | [Principio]: SSOT
  const questions = (quiz.questions ?? []).map((q) => {
    const withAnswer = q as typeof q & { correctAnswer?: string };
    return {
      text: q.text,
      type: q.type,
      options: q.options,
      correctAnswer: withAnswer.correctAnswer ?? "",
      difficulty: q.difficulty,
      timeLimitSeconds: q.timeLimitSeconds,
    };
  });

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Editar examen</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Edita metadatos y preguntas. Guardar reemplaza las preguntas existentes.
          </p>
        </div>
        <Link
          href={`/quiz/${id}`}
          className="text-sm font-semibold px-3 py-2 rounded-lg border border-border bg-card hover:border-primary"
        >
          ← Volver
        </Link>
      </header>

      <EditQuizForm
        quizId={quiz.id}
        initialTitle={quiz.title}
        initialDescription={quiz.description ?? ""}
        initialCategory={quiz.category}
        initialDifficulty={quiz.difficulty}
        initialTimePerQuestionSeconds={quiz.timePerQuestionSeconds}
        initialIsPublished={quiz.isPublished}
        initialQuestions={questions}
      />
    </main>
  );
}
