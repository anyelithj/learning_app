import type { Metadata } from "next";
import Link from "next/link";
import { listUsers, listQuizzes, type AdminUser } from "@/lib/quiz-api";
import type { PaginatedQuizzes } from "@/types/quiz";
import { DeactivateUserButton } from "@/components/admin/DeactivateUserButton";
import { QuizAdminTable } from "@/components/quiz/QuizAdminTable";
import { QuizSeedButton } from "@/components/quiz/QuizSeedButton";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gestión · NeuroEdu IA",
  description: "Panel de gestión de usuarios y exámenes (ADMIN).",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Tab = "usuarios" | "examenes";

interface SearchParams {
  tab?: string;
  page?: string;
  role?: string;
  search?: string;
  category?: string;
  difficulty?: string;
}

const ROLE_LABEL: Record<string, string> = {
  USER: "Estudiante",
  TEACHER: "Docente",
  ADMIN: "Administrador",
};

const ROLE_COLOR: Record<string, string> = {
  USER: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
  TEACHER: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200",
  ADMIN: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
};

function buildQuery(sp: SearchParams, overrides: Record<string, string>): string {
  const merged: Record<string, string> = { ...overrides };
  for (const [k, v] of Object.entries(sp)) {
    if (v !== undefined && !(k in overrides)) merged[k] = v;
  }
  return new URLSearchParams(merged).toString();
}

export default async function AdminPanelPage(props: { searchParams: Promise<SearchParams> }) {
  const sp = await props.searchParams;
  const tab: Tab = sp.tab === "examenes" ? "examenes" : "usuarios";

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Gestión</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administra usuarios y exámenes desde un único panel.
        </p>
      </header>

      <nav className="flex gap-1 border-b border-border" aria-label="Pestañas de gestión">
        <TabPill href="/admin/users?tab=usuarios" active={tab === "usuarios"}>
          Usuarios
        </TabPill>
        <TabPill href="/admin/users?tab=examenes" active={tab === "examenes"}>
          Exámenes
        </TabPill>
      </nav>

      {tab === "usuarios" ? <UsersTab sp={sp} /> : <ExamsTab sp={sp} />}
    </main>
  );
}

function TabPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 -mb-px text-sm font-semibold border-b-2 transition-colors",
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

async function UsersTab({ sp }: { sp: SearchParams }) {
  let data: { data: AdminUser[]; total: number; page: number; limit: number };
  let error: string | null = null;
  try {
    data = await listUsers({
      page: sp.page ? parseInt(sp.page, 10) : 1,
      limit: 20,
      role: sp.role,
      search: sp.search,
    });
  } catch (err) {
    error = err instanceof Error ? err.message : "Error cargando usuarios";
    data = { data: [], total: 0, page: 1, limit: 20 };
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <p className="text-sm text-muted-foreground">
          {data.total} usuario{data.total === 1 ? "" : "s"} registrado
          {data.total === 1 ? "" : "s"}.
        </p>
        <Link
          href="/admin/users/new"
          className="h-10 inline-flex items-center px-4 rounded-lg bg-gradient-brand text-white font-semibold text-sm hover:opacity-90"
        >
          + Crear usuario
        </Link>
      </div>

      <form className="flex flex-wrap items-end gap-3" action="/admin/users">
        <input type="hidden" name="tab" value="usuarios" />
        <div>
          <label htmlFor="search" className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
            Buscar
          </label>
          <input
            id="search"
            name="search"
            type="search"
            defaultValue={sp.search ?? ""}
            placeholder="Nombre o email"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
            Rol
          </label>
          <select
            id="role"
            name="role"
            defaultValue={sp.role ?? ""}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Todos</option>
            <option value="USER">Estudiante</option>
            <option value="TEACHER">Docente</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>
        <button
          type="submit"
          className="h-10 px-4 rounded-md bg-gradient-brand text-white font-semibold text-sm"
        >
          Filtrar
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-3 px-4 font-semibold">Nombre</th>
              <th className="py-3 px-4 font-semibold">Email</th>
              <th className="py-3 px-4 font-semibold">Rol</th>
              <th className="py-3 px-4 font-semibold">Estado</th>
              <th className="py-3 px-4 font-semibold">Registro</th>
              <th className="py-3 px-4 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  Sin usuarios. Usa &quot;+ Crear usuario&quot; arriba.
                </td>
              </tr>
            ) : (
              data.data.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="py-2 px-4">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="py-2 px-4 font-mono text-xs">{u.email}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        ROLE_COLOR[u.role] ?? ""
                      }`}
                    >
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    {u.isActive ? (
                      <span className="text-emerald-600">Activo</span>
                    ) : (
                      <span className="text-muted-foreground">Inactivo</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/users/${u.id}/edit`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary hover:text-primary transition-colors"
                      >
                        Editar
                      </Link>
                      <DeactivateUserButton
                        userId={u.id}
                        userName={`${u.firstName} ${u.lastName}`}
                        isActive={u.isActive}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data.total > data.limit && (
        <nav className="flex items-center justify-center gap-2" aria-label="Paginación">
          {Array.from({ length: Math.ceil(data.total / data.limit) }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/users?${buildQuery(sp, { tab: "usuarios", page: String(p) })}`}
              className={
                p === data.page
                  ? "px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
                  : "px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted"
              }
            >
              {p}
            </a>
          ))}
        </nav>
      )}
    </section>
  );
}

async function ExamsTab({ sp }: { sp: SearchParams }) {
  let data: PaginatedQuizzes;
  let error: string | null = null;
  try {
    data = await listQuizzes({
      page: sp.page ? parseInt(sp.page, 10) : 1,
      category: sp.category,
      difficulty: sp.difficulty,
    });
  } catch (err) {
    error = err instanceof Error ? err.message : "Error cargando exámenes";
    data = { data: [], total: 0, page: 1, limit: 12 };
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <p className="text-sm text-muted-foreground">
          {data.total} examen{data.total === 1 ? "" : "es"} en la plataforma.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/quiz/create"
            className="inline-flex items-center h-10 px-4 rounded-lg bg-gradient-brand text-white font-semibold text-sm hover:opacity-90"
          >
            + Crear examen
          </Link>
          <QuizSeedButton label="🌐 Generar examen" />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <QuizAdminTable quizzes={data.data} />

      {data.total > data.limit && (
        <nav className="flex items-center justify-center gap-2" aria-label="Paginación">
          {Array.from({ length: Math.ceil(data.total / data.limit) }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/users?${buildQuery(sp, { tab: "examenes", page: String(p) })}`}
              className={
                p === data.page
                  ? "px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
                  : "px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted"
              }
            >
              {p}
            </a>
          ))}
        </nav>
      )}
    </section>
  );
}
