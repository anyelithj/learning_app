import Link from "next/link";
import { DifficultyBadge } from "./DifficultyBadge";
import { CategoryIcon } from "./CategoryIcon";
import type { QuizListItem } from "@/types/quiz";
// [QuizCard]: tarjeta de quiz en grid | [Patron]: Presentational + Atomic (molecule) | [Principio]: SRP

export function QuizCard({ quiz }: { quiz: QuizListItem & { questionsCount?: number } }) {
  return (
    <Link
      href={`/quiz/${quiz.id}`}
      className="group block rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="grid place-items-center size-12 rounded-xl bg-gradient-soft text-2xl">
          <CategoryIcon category={quiz.category} />
        </span>
        <DifficultyBadge difficulty={quiz.difficulty} />
      </div>
      <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
        {quiz.title}
      </h3>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{quiz.questionsCount ?? 0} preguntas</span>
        <span>{quiz.timePerQuestionSeconds}s c/u</span>
      </div>
    </Link>
  );
}
