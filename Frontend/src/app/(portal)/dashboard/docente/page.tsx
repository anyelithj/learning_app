import Link from "next/link";
import type { Metadata } from "next";
import { Users, FileText, CheckCircle2, Circle } from "lucide-react";
import { Topbar } from "@/components/portal/Topbar";
import { StatCard } from "@/components/portal/StatCard";
import { Panel, PanelHead } from "@/components/portal/Panel";
import { Tag } from "@/components/portal/Tag";
import { ChartBars } from "@/components/portal/ChartBars";
import { Donut } from "@/components/portal/Donut";
import { RecItem } from "@/components/portal/RecItem";
import { listQuizzes, getLeaderboard } from "@/lib/quiz-api";
import { categoryLabel, difficultyLabel } from "@/components/portal/quiz-format";
import { displayNameFromEmail, getCurrentUserPayload } from "@/lib/auth";
import type { QuizListItem, LeaderboardEntry, Difficulty } from "@/types/quiz";

export const metadata: Metadata = {
  title: "Dashboard Docente",
  description: "Resumen de clases y exámenes activos en NeuroEdu IA.",
  robots: { index: false, follow: false },
};

// [computeProgressBars]: tendencia accuracy del top leaderboard | [Patrón]: Map | [Principio]: SRP
function computeProgressBars(leaderboard: LeaderboardEntry[]): Array<{ label: string; height: number; value?: number }> {
  if (leaderboard.length === 0) return [];
  return leaderboard.slice(0, 8).map((e, i) => {
    const v = Math.round(e.avgAccuracy * 100);
    return { label: `#${i + 1}`, height: v, value: v };
  });
}

const MEDAL_BG = ["#fbbf24", "#94a3b8", "#cd7f32"];
const MEDAL = ["🥇", "🥈", "🥉"];

const DIFFICULTY_TONE: Record<Difficulty, "green" | "amber" | "red"> = {
  easy: "green",
  medium: "amber",
  hard: "red",
};

async function loadData() {
  const [quizzesRes, lbRes] = await Promise.allSettled([
    listQuizzes({ limit: 8 }),
    getLeaderboard(5),
  ]);
  const quizzes: QuizListItem[] = quizzesRes.status === "fulfilled" ? quizzesRes.value.data : [];
  const total = quizzesRes.status === "fulfilled" ? quizzesRes.value.total : 0;
  const leaderboard: LeaderboardEntry[] =
    lbRes.status === "fulfilled" ? lbRes.value.entries : [];
  return { quizzes, total, leaderboard, apiOk: quizzesRes.status === "fulfilled" };
}

export default async function DocenteDashboardPage() {
  const { quizzes, total, leaderboard, apiOk } = await loadData();
  const userPayload = await getCurrentUserPayload();
  const displayName = userPayload ? displayNameFromEmail(userPayload.email) : "docente";
  const progressBars = computeProgressBars(leaderboard);

  const totalQuestions = quizzes.reduce((s, q) => s + q.questionsCount, 0);
  const avgAccuracy =
    leaderboard.length > 0
      ? Math.round(
          (leaderboard.reduce((s, e) => s + e.avgAccuracy, 0) / leaderboard.length) * 100,
        )
      : 0;
  const totalStudents = leaderboard.length;

  return (
    <>
      <Topbar
        title={`Bienvenido/a, ${displayName} 👩‍🏫`}
        subtitle={
          apiOk
            ? `${total} examen${total === 1 ? "" : "es"} publicados.`
            : "API offline — mostrando datos limitados."
        }
        searchPlaceholder="Buscar estudiante…"
        actions={
          <Link
            href="/quiz/create"
            className="text-sm font-semibold px-4 py-2 rounded-xl bg-gradient-brand text-white shadow-sm hover:-translate-y-0.5 transition-transform"
          >
            + Nuevo examen
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard label="Estudiantes activos" value={String(totalStudents)} icon={Users} />
        <StatCard label="Exámenes publicados" value={String(total)} icon={FileText} />
        <StatCard
          label="Precisión promedio"
          value={`${avgAccuracy}`}
          valueSuffix="%"
          icon={CheckCircle2}
        />
        <StatCard label="Preguntas en banco" value={String(totalQuestions)} icon={Circle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mb-6">
        <Panel>
          <PanelHead
            title="Mis exámenes activos"
            actions={
              <Link
                href="/quiz"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary hover:text-primary transition-colors"
              >
                Gestionar
              </Link>
            }
          />
          {quizzes.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
              {apiOk
                ? "Aún no has publicado quizzes. Crea uno desde Open Trivia DB."
                : "API no disponible."}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Examen", "Materia", "Preguntas", "Tiempo/preg.", "Dificultad"].map((h) => (
                      <th
                        key={h}
                        className="text-left text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-2.5 py-3"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((q) => (
                    <tr key={q.id} className="border-b border-border last:border-0 hover:bg-muted/60">
                      <td className="px-2.5 py-3 text-sm">
                        <b>{q.title}</b>
                      </td>
                      <td className="px-2.5 py-3 text-sm">{categoryLabel(q.category)}</td>
                      <td className="px-2.5 py-3 text-sm">{q.questionsCount}</td>
                      <td className="px-2.5 py-3 text-sm">{q.timePerQuestionSeconds}s</td>
                      <td className="px-2.5 py-3 text-sm">
                        <Tag tone={DIFFICULTY_TONE[q.difficulty]}>
                          {difficultyLabel(q.difficulty)}
                        </Tag>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel>
          <PanelHead title="Top estudiantes" />
          {leaderboard.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Sin actividad reciente.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {leaderboard.map((e, i) => (
                <RecItem
                  key={e.userId}
                  iconNode={i < 3 ? MEDAL[i] : String(e.rank)}
                  iconClassName={i < 3 ? "" : "bg-muted text-foreground"}
                  title={`Usuario ${e.userId.slice(0, 6)}`}
                  subtitle={`${Math.round(e.totalPoints)} pts · ${Math.round(e.avgAccuracy * 100)}% precisión`}
                />
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <Panel>
          <PanelHead title="Rendimiento top estudiantes" actions={<Tag>% precisión</Tag>} />
          <ChartBars bars={progressBars} />
        </Panel>
        <Panel>
          <PanelHead title="Distribución por dificultad" />
          <Donut
            label={String(total)}
            gradient="conic-gradient(#10b981 0 45%, #f59e0b 45% 75%, #ef4444 75% 100%)"
          />
          <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="inline-block size-2.5 rounded-sm bg-emerald-500 mr-1.5" />
              Fácil
            </div>
            <div>
              <span className="inline-block size-2.5 rounded-sm bg-amber-500 mr-1.5" />
              Medio
            </div>
            <div>
              <span className="inline-block size-2.5 rounded-sm bg-red-500 mr-1.5" />
              Difícil
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
