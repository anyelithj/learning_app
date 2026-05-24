import { QuizActions } from "./QuizActions";
import { DifficultyBadge } from "./DifficultyBadge";
import type { QuizListItem, Category } from "@/types/quiz";

const CATEGORY_LABEL: Record<Category, string> = {
  general: "General",
  science: "Ciencia",
  history: "Historia",
  geography: "Geografía",
  sports: "Deportes",
  entertainment: "Entretenimiento",
  technology: "Tecnología",
  math: "Matemáticas",
  art: "Arte",
  custom: "Personalizado",
};

export function QuizAdminTable({ quizzes }: { quizzes: QuizListItem[] }) {
  return (
    <div className="rounded-xl border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-3 px-4 font-semibold">Título</th>
            <th className="py-3 px-4 font-semibold">Categoría</th>
            <th className="py-3 px-4 font-semibold">Dificultad</th>
            <th className="py-3 px-4 font-semibold">Preguntas</th>
            <th className="py-3 px-4 font-semibold">Tiempo/preg</th>
            <th className="py-3 px-4 font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-muted-foreground">
                No hay exámenes registrados. Usa &quot;+ Crear examen&quot; o &quot;Generar examen&quot; arriba.
              </td>
            </tr>
          ) : (
            quizzes.map((q) => (
              <tr key={q.id} className="border-b last:border-0 hover:bg-muted/40">
                <td className="py-2 px-4 font-medium">{q.title}</td>
                <td className="py-2 px-4 text-muted-foreground">
                  {CATEGORY_LABEL[q.category] ?? q.category}
                </td>
                <td className="py-2 px-4">
                  <DifficultyBadge difficulty={q.difficulty} />
                </td>
                <td className="py-2 px-4 text-muted-foreground">{q.questionsCount ?? 0}</td>
                <td className="py-2 px-4 text-muted-foreground">{q.timePerQuestionSeconds}s</td>
                <td className="py-2 px-4">
                  <QuizActions quizId={q.id} title={q.title} isPublished={true} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
