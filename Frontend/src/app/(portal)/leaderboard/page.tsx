import type { Metadata } from "next";
import { getLeaderboard } from "@/lib/quiz-api";
// [LeaderboardPage]: top global con ISR | [Patron]: Container | [Principio]: SRP | [Paradigma]: RSC + ISR

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Ranking global de NeuroEdu IA.",
  robots: { index: false, follow: false },
};

// [ISR revalidate 60s]: spec define revalidate: 60 para leaderboard
export const revalidate = 60;

export default async function LeaderboardPage() {
  let entries;
  try {
    const data = await getLeaderboard(20);
    entries = data.entries;
  } catch {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-destructive">
        No se pudo cargar el leaderboard. Verifica el backend.
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">🏆 Leaderboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Top {entries.length} de la comunidad. Actualiza cada 60s.
        </p>
      </header>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Aun no hay scores registrados.
        </div>
      ) : (
        <table className="w-full rounded-2xl border border-border bg-card overflow-hidden">
          <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-right">Puntos</th>
              <th className="px-4 py-3 text-right hidden sm:table-cell">Quizzes</th>
              <th className="px-4 py-3 text-right hidden sm:table-cell">Precision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((e) => (
              <tr key={e.userId} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-bold">
                  {e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : e.rank === 3 ? "🥉" : `#${e.rank}`}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {e.userId.slice(0, 8)}...
                </td>
                <td className="px-4 py-3 text-right font-bold tabular-nums">
                  {Math.round(e.totalPoints)}
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  {e.quizzesCompleted}
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell tabular-nums">
                  {Math.round(e.avgAccuracy * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
