// [Not-Found para quiz inexistente]: 404 contextual | [Patrón]: Null Object
import Link from "next/link";
export default function QuizNotFound() {
  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="text-center max-w-md space-y-3">
        <h1 className="text-2xl font-extrabold">Quiz no encontrado</h1>
        <p className="text-sm text-muted-foreground">El quiz que buscas no existe o fue eliminado.</p>
        <Link href="/quiz" className="font-semibold text-primary hover:text-primary-dark">← Ver lista de quizzes</Link>
      </div>
    </main>
  );
}
