import Link from "next/link";
import type { Metadata } from "next";
import {
  FileText,
  CheckCircle2,
  Trophy,
  Brain,
  BookOpen,
  Video,
  Clock,
  Layers,
} from "lucide-react";
import { Topbar } from "@/components/portal/Topbar";
import { StatCard } from "@/components/portal/StatCard";
import { Panel, PanelHead } from "@/components/portal/Panel";
import { Tag } from "@/components/portal/Tag";
import { ChartBars } from "@/components/portal/ChartBars";
import { Donut } from "@/components/portal/Donut";
import { RecItem } from "@/components/portal/RecItem";
import { listQuizzes, getMyHistory } from "@/lib/quiz-api";
import { categoryLabel, totalMinutes } from "@/components/portal/quiz-format";
import { displayNameFromEmail, getCurrentUserPayload } from "@/lib/auth";
import type { ScoreEntry, QuizListItem } from "@/types/quiz";

export const metadata: Metadata = {
  title: "Dashboard Estudiante",
  description: "Resumen de actividad en NeuroEdu IA.",
  robots: { index: false, follow: false },
};

const WEEK_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// [computeWeeklyBars]: agrupa accuracy promedio por día semana actual | [Patrón]: Map-Reduce | [Principio]: SRP
function computeWeeklyBars(history: ScoreEntry[]): Array<{ label: string; height: number; value?: number }> {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const bucket: Record<number, { sum: number; n: number }> = {};
  for (const h of history) {
    const d = new Date(h.createdAt);
    if (d < sevenDaysAgo) continue;
    const day = d.getDay();
    if (!bucket[day]) bucket[day] = { sum: 0, n: 0 };
    bucket[day].sum += h.accuracy * 100;
    bucket[day].n += 1;
  }
  const result: Array<{ label: string; height: number; value?: number }> = [];
  for (let i = 0; i < 7; i++) {
    const offset = (sevenDaysAgo.getDay() + i) % 7;
    const b = bucket[offset];
    const v = b && b.n > 0 ? Math.round(b.sum / b.n) : 0;
    result.push({ label: WEEK_LABELS[offset], height: v, value: v });
  }
  return result;
}

async function loadData() {
  const [quizzesRes, historyRes] = await Promise.allSettled([
    listQuizzes({ limit: 6 }),
    getMyHistory(20),
  ]);
  const quizzes: QuizListItem[] = quizzesRes.status === "fulfilled" ? quizzesRes.value.data : [];
  const history: ScoreEntry[] = historyRes.status === "fulfilled" ? historyRes.value : [];
  return { quizzes, history, apiOk: quizzesRes.status === "fulfilled" };
}

export default async function EstudianteDashboardPage() {
  const { quizzes, history, apiOk } = await loadData();
  const historyByQuiz = new Map(history.map((h) => [h.quizId, h]));
  const userPayload = await getCurrentUserPayload();
  const displayName = userPayload ? displayNameFromEmail(userPayload.email) : "estudiante";
  const weekBars = computeWeeklyBars(history);

  const completed = history.length;
  const pending = Math.max(0, quizzes.length - completed);
  const avgScore =
    history.length > 0
      ? Math.round(history.reduce((s, h) => s + h.points, 0) / history.length)
      : 0;
  const avgAccuracy =
    history.length > 0
      ? Math.round((history.reduce((s, h) => s + h.accuracy, 0) / history.length) * 100)
      : 0;

  return (
    <>
      <Topbar
        title={`Hola, ${displayName} 👋`}
        subtitle={
          apiOk
            ? `Tienes ${pending} examen${pending === 1 ? "" : "es"} esperando.`
            : "API offline — mostrando datos limitados."
        }
        searchPlaceholder="Buscar evaluaciones…"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard label="Exámenes pendientes" value={String(pending)} icon={FileText} />
        <StatCard label="Completados" value={String(completed)} icon={CheckCircle2} />
        <StatCard
          label="Puntaje promedio"
          value={String(avgScore)}
          valueSuffix={`/${history[0]?.totalQuestions ? history[0].totalQuestions * 10 : 100}`}
          icon={Trophy}
        />
        <StatCard
          label="Precisión"
          value={`${avgAccuracy}%`}
          delta={avgAccuracy >= 70 ? "Buen nivel" : "Sigue practicando"}
          icon={Brain}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mb-6">
        <Panel>
          <PanelHead
            title="Mis exámenes"
            subtitle="Evaluaciones publicadas disponibles"
            actions={
              <Link
                href="/quiz"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary hover:text-primary transition-colors"
              >
                Ver todos
              </Link>
            }
          />
          {quizzes.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
              {apiOk
                ? "Aún no hay quizzes publicados. Pídele a un docente que publique uno."
                : "No se pudo cargar la API. Verifica que el backend esté arriba en /api/v1/quiz."}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Examen", "Materia", "Estado", "Puntaje", ""].map((h) => (
                      <th
                        key={h || "actions"}
                        className="text-left text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-2.5 py-3"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((q) => {
                    const done = historyByQuiz.get(q.id);
                    const minutes = totalMinutes(q.timePerQuestionSeconds, q.questionsCount);
                    return (
                      <tr key={q.id} className="border-b border-border last:border-0 hover:bg-muted/60">
                        <td className="px-2.5 py-3 text-sm">
                          <b>{q.title}</b>
                          <br />
                          <small className="text-muted-foreground">
                            {q.questionsCount} preguntas · {minutes} min
                          </small>
                        </td>
                        <td className="px-2.5 py-3 text-sm">{categoryLabel(q.category)}</td>
                        <td className="px-2.5 py-3 text-sm">
                          {done ? (
                            <Tag tone="green">Completado</Tag>
                          ) : (
                            <Tag tone="amber">Pendiente</Tag>
                          )}
                        </td>
                        <td className="px-2.5 py-3 text-sm">
                          {done ? (
                            <b className={done.accuracy >= 0.8 ? "text-emerald-600" : ""}>
                              {Math.round(done.points)}
                            </b>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-2.5 py-3 text-sm">
                          <Link
                            href={`/quiz/${q.id}`}
                            className={
                              done
                                ? "text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary hover:text-primary transition-colors"
                                : "text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-brand text-white shadow-sm hover:-translate-y-0.5 transition-transform inline-block"
                            }
                          >
                            {done ? "Ver feedback" : "Iniciar"}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel>
          <PanelHead title="Recomendaciones IA" />
          <div className="flex flex-col gap-3">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Completa el primer quiz para ver recomendaciones personalizadas del tutor IA.
              </p>
            ) : (
              <>
                <RecItem
                  icon={BookOpen}
                  title={avgAccuracy < 60 ? "Refuerza fundamentos" : "Acepta retos mayores"}
                  subtitle={`Precisión promedio: ${avgAccuracy}%`}
                />
                <RecItem
                  icon={Clock}
                  title="Practica diariamente"
                  subtitle={`Llevas ${history.length} quiz${history.length === 1 ? "" : "zes"} completado${history.length === 1 ? "" : "s"}`}
                />
                <RecItem
                  icon={Layers}
                  title="Explora más temas"
                  subtitle="Visita la sección de exámenes"
                />
                <RecItem
                  icon={Video}
                  title="Consulta al tutor IA"
                  subtitle="Pide feedback ad-hoc en /assistant"
                />
              </>
            )}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <Panel>
          <PanelHead title="Progreso cognitivo semanal" />
          <ChartBars bars={weekBars} />
        </Panel>
        <Panel>
          <PanelHead title="Nivel cognitivo" />
          <Donut label={`${avgAccuracy}%`} />
          <div className="flex justify-center gap-4 mt-5 text-xs text-muted-foreground">
            <span>
              <span className="inline-block size-2.5 rounded-sm bg-primary mr-1.5" />
              Lógica
            </span>
            <span>
              <span className="inline-block size-2.5 rounded-sm bg-accent mr-1.5" />
              Memoria
            </span>
            <span>
              <span className="inline-block size-2.5 rounded-sm bg-muted border border-border mr-1.5" />
              Verbal
            </span>
          </div>
        </Panel>
      </div>
    </>
  );
}
