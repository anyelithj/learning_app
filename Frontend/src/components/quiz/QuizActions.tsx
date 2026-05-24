"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// [QuizActions]: botones acciones quiz para docente/admin | [Patrón]: Presentational | [Principio]: SRP

export interface QuizActionsProps {
  quizId: string;
  title: string;
  isPublished: boolean;
}

export function QuizActions({ quizId, title, isPublished }: QuizActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePublish = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/quiz/${quizId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { message?: string };
        throw new Error(body.message ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!confirm(`¿Eliminar el examen "${title}"? No se puede deshacer.`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/quiz/${quizId}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/quiz/${quizId}`}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary hover:text-primary transition-colors"
      >
        Ver detalle
      </Link>
      <Link
        href={`/quiz/${quizId}/edit`}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary hover:text-primary transition-colors"
      >
        Editar
      </Link>
      <button
        type="button"
        onClick={togglePublish}
        disabled={busy}
        className={
          isPublished
            ? "text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-50"
            : "text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
        }
      >
        {busy ? "..." : isPublished ? "Despublicar" : "Publicar"}
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 disabled:opacity-50"
      >
        {busy ? "..." : "Eliminar"}
      </button>
      {error && <span className="text-[10px] text-destructive">{error}</span>}
    </div>
  );
}
