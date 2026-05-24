import Link from "next/link";
import { DifficultyBadge } from "./DifficultyBadge";
import { CategoryIcon } from "./CategoryIcon";
import { QuizActions } from "./QuizActions";
import type { QuizListItem } from "@/types/quiz";
// [QuizGrid]: layout grid responsive con acciones opcionales TEACHER/ADMIN | [Patron]: Composite | [Principio]: SRP

export interface QuizGridProps {
  quizzes: QuizListItem[];
  // [showActions]: si true, renderiza botones gestión (publicar/eliminar/ver) | [Patrón]: Conditional Render
  showActions?: boolean;
}

export function QuizGrid({ quizzes, showActions = false }: QuizGridProps) {
  if (quizzes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">Aún no hay quizzes publicados.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {quizzes.map((q) => (
        <article
          key={q.id}
          className="rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary flex flex-col gap-3"
        >
          <Link href={`/quiz/${q.id}`} className="block group">
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="grid place-items-center size-12 rounded-xl bg-gradient-soft text-2xl">
                <CategoryIcon category={q.category} />
              </span>
              <DifficultyBadge difficulty={q.difficulty} />
            </div>
            <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
              {q.title}
            </h3>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{q.questionsCount ?? 0} preguntas</span>
              <span>{q.timePerQuestionSeconds}s c/u</span>
            </div>
          </Link>
          {showActions && (
            <div className="border-t border-border pt-3">
              <QuizActions quizId={q.id} title={q.title} isPublished={true} />
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
