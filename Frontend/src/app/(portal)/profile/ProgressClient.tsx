"use client";
import { useMemo } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ScoreEntry } from "@/types/quiz";
// [ProgressClient]: visualiza historial + tendencia + stats | [Patron]: Presentational | [Principio]: SRP | [Paradigma]: Funcional + Reactivo

export interface ProgressClientProps {
  history: ScoreEntry[];
  error: string | null;
}

// [Stats agregadas]: pura derivación del historial | [Principio]: SRP
function computeStats(history: ScoreEntry[]) {
  if (history.length === 0) {
    return {
      totalQuizzes: 0,
      totalPoints: 0,
      avgAccuracy: 0,
      bestAccuracy: 0,
    };
  }
  const totalPoints = history.reduce((sum, h) => sum + h.points, 0);
  const avgAccuracy =
    history.reduce((sum, h) => sum + h.accuracy, 0) / history.length;
  const bestAccuracy = Math.max(...history.map((h) => h.accuracy));
  return {
    totalQuizzes: history.length,
    totalPoints,
    avgAccuracy,
    bestAccuracy,
  };
}

export function ProgressClient({ history, error }: ProgressClientProps) {
  const stats = useMemo(() => computeStats(history), [history]);

  // [Tendencia]: últimos 20 puntos en orden cronológico | [Patrón]: Map-Transform
  const trend = useMemo(() => {
    return [...history]
      .reverse()
      .slice(-20)
      .map((h, idx) => ({
        idx: idx + 1,
        accuracy: Math.round(h.accuracy * 100),
        points: h.points,
        date: new Date(h.createdAt).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
        }),
      }));
  }, [history]);

  // [Distribución por accuracy bucket]: <40, 40-70, >70 | [Patrón]: Bucketing
  const distribution = useMemo(() => {
    const buckets = { low: 0, mid: 0, high: 0 };
    for (const h of history) {
      if (h.accuracy < 0.4) buckets.low += 1;
      else if (h.accuracy < 0.7) buckets.mid += 1;
      else buckets.high += 1;
    }
    return [
      { range: "< 40%", quizzes: buckets.low, fill: "#ef4444" },
      { range: "40 – 70%", quizzes: buckets.mid, fill: "#f59e0b" },
      { range: "≥ 70%", quizzes: buckets.high, fill: "#10b981" },
    ];
  }, [history]);

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive"
      >
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <section className="rounded-xl border bg-card p-8 text-center space-y-3">
        <h2 className="text-xl font-bold">Aún no hay historial</h2>
        <p className="text-sm text-muted-foreground">
          Completa el primer quiz para empezar a ver el progreso.
        </p>
        <Link
          href="/quiz"
          className="inline-block px-5 py-2.5 rounded-xl bg-gradient-brand text-white font-semibold"
        >
          Ir a Exámenes
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* [Stats cards]: KPIs rápidos | [Patrón]: Card Composite */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Quizzes" value={stats.totalQuizzes.toString()} />
        <StatCard label="Puntos totales" value={stats.totalPoints.toLocaleString("es-ES")} />
        <StatCard
          label="Precisión promedio"
          value={`${Math.round(stats.avgAccuracy * 100)}%`}
        />
        <StatCard
          label="Mejor precisión"
          value={`${Math.round(stats.bestAccuracy * 100)}%`}
        />
      </section>

      {/* [Gráfica tendencia accuracy]: últimos 20 quizzes | [Patrón]: Line Chart */}
      <section className="rounded-xl border bg-card p-5 space-y-3">
        <h2 className="text-lg font-bold">Tendencia de precisión</h2>
        <p className="text-xs text-muted-foreground">
          Porcentaje de aciertos en los últimos {trend.length} quizzes.
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Precisión"]}
                contentStyle={{ fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#7c3aed"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* [Distribución accuracy]: bucketing global | [Patrón]: Bar Chart */}
      <section className="rounded-xl border bg-card p-5 space-y-3">
        <h2 className="text-lg font-bold">Distribución por rango de precisión</h2>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribution} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="quizzes" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* [Historial reciente]: tabla simple | [Patrón]: Composite */}
      <section className="rounded-xl border bg-card p-5">
        <h2 className="text-lg font-bold mb-3">Historial reciente</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3 font-semibold">Fecha</th>
                <th className="py-2 pr-3 font-semibold">Aciertos</th>
                <th className="py-2 pr-3 font-semibold">Precisión</th>
                <th className="py-2 pr-3 font-semibold">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 10).map((h) => (
                <tr key={h.id} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="py-2 pr-3">
                    {new Date(h.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </td>
                  <td className="py-2 pr-3">
                    {h.correctCount} / {h.totalQuestions}
                  </td>
                  <td className="py-2 pr-3 font-semibold">
                    {Math.round(h.accuracy * 100)}%
                  </td>
                  <td className="py-2 pr-3">{h.points.toLocaleString("es-ES")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// [StatCard]: componente atómico card de KPI | [Patrón]: Presentational + Atomic Design (atom)
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight">{value}</p>
    </div>
  );
}
