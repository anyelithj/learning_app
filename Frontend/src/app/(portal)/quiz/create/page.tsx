import type { Metadata } from "next";
import { QuizForm } from "@/components/quiz/QuizForm"; // [Formulario único]: el mismo que usa la edición
// [Página crear examen]: cabecera + formulario compartido | [Patrón]: Container (RSC) + Presentational | [Principio]: SRP + DRY

export const metadata: Metadata = {
  title: "Crear examen",
  robots: { index: false, follow: false }, // Privada: no indexar
};

export default function CreateQuizPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Crear examen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define idioma, competencia y nivel MCER. Las preguntas van en el idioma objetivo y las explicaciones en español. Puedes crearlas manualmente o generarlas con IA local.
        </p>
      </header>
      <QuizForm />
    </div>
  );
}
