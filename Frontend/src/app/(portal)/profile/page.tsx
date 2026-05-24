import { Suspense } from "react";
import { getMyHistory } from "@/lib/quiz-api";
import { ProgressClient } from "./ProgressClient";
import type { ScoreEntry } from "@/types/quiz";
// [Página Progreso /profile]: stats + historial + tendencia | [Patrón]: Container (RSC) + Presentational (Client) | [Principio]: SRP | [Paradigma]: RSC + Server Fetch

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Progreso · NeuroEdu IA",
  description: "Historial de quizzes, precisión promedio y análisis de tendencias.",
};

// [Skeleton Suspense]: visible mientras llega el historial | [Patrón]: Suspense Boundary
function ProgressSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded bg-muted animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-muted animate-pulse" />
    </div>
  );
}

async function ProgressData() {
  // [Server fetch]: corre en el server, manda cookies httpOnly al backend | [Principio]: SSOT
  let history: ScoreEntry[] = [];
  let error: string | null = null;
  try {
    history = await getMyHistory(50);
  } catch (err) {
    error = err instanceof Error ? err.message : "No se pudo cargar el historial";
  }

  return <ProgressClient history={history} error={error} />;
}

export default function ProfilePage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Progreso</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Historial de quizzes, precisión promedio y temas a reforzar.
        </p>
      </header>
      <Suspense fallback={<ProgressSkeleton />}>
        <ProgressData />
      </Suspense>
    </main>
  );
}
