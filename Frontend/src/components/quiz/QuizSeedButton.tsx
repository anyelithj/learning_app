"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const SEED_LANGUAGE = "es";

interface SeedResult {
  created: number;
  errors: string[];
  skipped?: string[];
  language?: string;
  message?: string;
}

export function QuizSeedButton({ label = "Generar quizzes desde Trivia DB" }: { label?: string }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const inFlight = useRef(false);

  const onClick = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/quiz/seed-trivia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: SEED_LANGUAGE }),
      });
      const body = await res.json();
      if (!res.ok) {
        setResult({ created: 0, errors: [body.message ?? `HTTP ${res.status}`] });
        return;
      }
      setResult({
        created: body.created?.length ?? 0,
        errors: body.errors ?? [],
        skipped: body.skipped ?? [],
        language: body.language,
        message: body.message,
      });
      startTransition(() => router.refresh());
    } catch (err) {
      setResult({
        created: 0,
        errors: [err instanceof Error ? err.message : "Error de red"],
      });
    } finally {
      setRunning(false);
      inFlight.current = false;
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={onClick}
        disabled={running}
        className="bg-gradient-brand text-white h-11 px-6"
      >
        {running ? "Generando..." : label}
      </Button>
      {result && (
        <div
          role="status"
          aria-live="polite"
          className={
            result.errors.length > 0
              ? "rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-xs space-y-1"
              : "rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs"
          }
        >
          <p className="font-semibold">
            {result.created} quiz{result.created === 1 ? "" : "zes"} creados
            {result.language ? ` (${result.language})` : ""}.
          </p>
          {result.message && (
            <p className="mt-1 text-amber-900">{result.message}</p>
          )}
          {result.errors.length > 0 && (
            <>
              <p className="font-semibold mt-1">Errores:</p>
              <ul className="list-disc list-inside text-amber-900">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
