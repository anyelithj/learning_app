// [ScoreDisplay]: muestra puntaje final con accuracy | [Patron]: Presentational | [Principio]: SRP

export interface ScoreDisplayProps {
  points: number;
  correctCount: number;
  totalQuestions: number;
}

export function ScoreDisplay({ points, correctCount, totalQuestions }: ScoreDisplayProps) {
  const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const tier =
    accuracy === 100
      ? { label: "PERFECTO", emoji: "🏆", color: "text-warning" }
      : accuracy >= 75
        ? { label: "Excelente", emoji: "🎉", color: "text-success" }
        : accuracy >= 50
          ? { label: "Bien hecho", emoji: "👍", color: "text-primary" }
          : { label: "Sigue practicando", emoji: "💪", color: "text-muted-foreground" };

  return (
    <section className="rounded-2xl border border-border bg-card p-8 text-center space-y-4">
      <div className="text-6xl" aria-hidden="true">{tier.emoji}</div>
      <h2 className={`text-2xl font-extrabold ${tier.color}`}>{tier.label}</h2>
      <div className="text-5xl font-extrabold text-gradient-brand tabular-nums">
        {Math.round(points)}
      </div>
      <p className="text-sm text-muted-foreground">
        Aciertos: <b className="text-foreground">{correctCount}/{totalQuestions}</b>
        {" · "}
        Precision: <b className="text-foreground">{Math.round(accuracy)}%</b>
      </p>
    </section>
  );
}
