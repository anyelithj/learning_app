import type { Metadata } from "next";
import Link from "next/link";
import { listTopicGroups } from "@/lib/curriculum-api";
import { getCurrentUserPayload } from "@/lib/auth";
import { LANGUAGES, languageLabel } from "@/lib/languages";
import { ManagementHeader } from "@/components/portal/ManagementHeader";
import { toPortalRole } from "@/components/portal/portal-role";
import { RowActions } from "@/components/admin/RowActions"; // [CRUD por fila]: mismo componente que la tabla de cursos | [Principio]: DRY
import { Role } from "@/lib/constants";
import { deleteTopicAction, setTopicPublishedAction } from "./actions";
import { groupQuery, KIND_META, KINDS, SKILL_LABEL, STATUS_LABEL, type CurriculumItemKind, type CurriculumSkill, type ReviewStatus, type TopicGroup } from "@/types/curriculum";
// [Página /admin/curriculum]: pestaña "Recursos" de Gestión — TABLA AGRUPADA POR TEMA (una fila = tema + idioma + nivel + tipo, p. ej. "Las frutas · Vocabulario · 10"); publicar el tema publica todos sus elementos | [Patrón]: Container (RSC) + URL State (filtros en query) | [Principio]: SRP + consistencia de UI | [Paradigma]: Declarativo
// [Tecnología]: Next.js Server Component — datos pedidos en el servidor; los filtros son un <form method="get"> nativo → funcionan sin JavaScript
// [UX]: el TIPO se elige con chips (qué es: palabra, regla…); los selects con etiqueta visible filtran a quién va dirigido → ya no hay dos listas iguales "Todos los tipos / Todas las competencias"

export const metadata: Metadata = {
  title: "Gestión · Recursos",
  description: "Recursos de aprendizaje: vocabulario, reglas gramaticales, ejemplos, pronunciación, errores frecuentes, ejercicios y rúbricas.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic"; // Datos por usuario/rol: sin caché estática

// `interface` (TS): query params admitidos (todos opcionales, llegan como string)
interface SearchParams {
  language?: string;
  level?: string;
  skill?: string;
  kind?: string;
  status?: string;
  search?: string;
}

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const; // `as const` (TS): tupla de literales inmutable

// [GroupStatus]: estado del grupo según cuántos elementos están publicados | [Paradigma]: Funcional (derivado, sin estado)
function GroupStatus({ g }: { g: TopicGroup }) {
  const [label, cls] =
    g.approved === g.count ? ["Publicado", "bg-tone-brand-soft text-tone-brand"] : g.approved === 0 ? ["Borrador", "bg-muted text-muted-foreground"] : [`Parcial ${g.approved}/${g.count}`, "bg-tone-warning-soft text-tone-warning"];
  return <span className={`badge ${cls}`}>{label}</span>;
}

// [href]: construye la URL conservando los filtros actuales y aplicando cambios | `Object.entries/fromEntries` (ES2019) | [Paradigma]: Funcional (pura)
function href(sp: SearchParams, patch: Partial<Record<keyof SearchParams, string | undefined>>) {
  const merged = { ...sp, ...patch };
  const query = Object.fromEntries(Object.entries(merged).filter(([, v]) => v)) as Record<string, string>; // Sin claves vacías → URL limpia
  return { pathname: "/admin/curriculum", query };
}

// [FilterSelect]: label visible + <select> | [Principio]: DRY (4 filtros iguales)
function FilterSelect({ name, label, value, all, options }: { name: string; label: string; value?: string; all: string; options: ReadonlyArray<{ value: string; label: string }> }) {
  return (
    <div className="min-w-36 flex-1">
      <label htmlFor={`f-${name}`} className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <select id={`f-${name}`} name={name} defaultValue={value ?? ""} className="control w-full">
        <option value="">{all}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default async function CurriculumListPage(props: { searchParams: Promise<SearchParams> }) {
  // `Promise.all` (ES2015): params y rol en paralelo | el rol solo decide qué pestañas se ven (la autorización real la hace el backend)
  const [sp, user] = await Promise.all([props.searchParams, getCurrentUserPayload()]);
  const role = toPortalRole(user?.role ?? null);
  const isAdmin = user?.role === Role.ADMIN; // Solo ADMIN elimina (el backend lo exige)
  const activeKind = KINDS.includes(sp.kind as CurriculumItemKind) ? (sp.kind as CurriculumItemKind) : undefined;

  let groups: TopicGroup[] = [];
  let loadError: string | null = null;
  try {
    // [perKind]: una fila por tema y tipo | `status` filtra los elementos antes de agrupar
    groups = await listTopicGroups({ ...sp, kind: activeKind, perKind: true });
  } catch (err) {
    loadError = err instanceof Error ? err.message : "error desconocido";
  }
  const totalItems = groups.reduce((n, g) => n + g.count, 0); // `reduce` (ES5)

  return (
    // [Semántica]: <div> (el layout del portal ya aporta el <main>)
    <div className="container mx-auto max-w-6xl space-y-5 py-4">
      <ManagementHeader role={role} active="content" />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Material de estudio propio (vocabulario, reglas, ejemplos, ejercicios…). La plataforma lo usa antes de recurrir a la IA.{" "}
          <b className="text-foreground">
            {groups.length} tema{groups.length === 1 ? "" : "s"} · {totalItems} elemento{totalItems === 1 ? "" : "s"}
          </b>
          .
        </p>
        <Link href="/admin/curriculum/new" className="btn btn-primary">
          + Nuevo recurso
        </Link>
      </div>

      {/* [Chips de tipo]: enlaces con aria-current → navegables sin JS y con el estado anunciado */}
      <nav aria-label="Tipo de recurso" className="flex flex-wrap gap-1.5">
        <Link href={href(sp, { kind: undefined })} aria-current={!activeKind ? "page" : undefined} className="chip">
          ✨ Todos
        </Link>
        {KINDS.map((k) => (
          <Link key={k} href={href(sp, { kind: k })} aria-current={activeKind === k ? "page" : undefined} className="chip">
            <span aria-hidden>{KIND_META[k].icon}</span> {KIND_META[k].label}
          </Link>
        ))}
      </nav>

      {/* [Filtros]: GET nativo → URL compartible | cada select con etiqueta visible */}
      <form method="get" className="surface flex flex-wrap items-end gap-3 p-4" aria-label="Filtros de recursos">
        {activeKind && <input type="hidden" name="kind" value={activeKind} />}
        <div className="min-w-48 flex-[2]">
          <label htmlFor="f-search" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Buscar
          </label>
          <input id="f-search" name="search" type="search" defaultValue={sp.search ?? ""} placeholder="Tema o palabra clave…" className="control w-full" />
        </div>
        <FilterSelect name="language" label="Idioma" value={sp.language} all="Todos" options={LANGUAGES.map((l) => ({ value: l.value, label: l.label }))} />
        <FilterSelect name="level" label="Nivel" value={sp.level} all="Todos" options={LEVELS.map((l) => ({ value: l, label: l }))} />
        <FilterSelect name="skill" label="Habilidad" value={sp.skill} all="Todas" options={(Object.keys(SKILL_LABEL) as CurriculumSkill[]).map((s) => ({ value: s, label: SKILL_LABEL[s] }))} />
        <FilterSelect name="status" label="Estado" value={sp.status} all="Todos" options={(Object.keys(STATUS_LABEL) as ReviewStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }))} />
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary">
            Filtrar
          </button>
          <Link href="/admin/curriculum" className="btn btn-ghost">
            Limpiar
          </Link>
        </div>
      </form>

      {loadError && (
        <p role="alert" className="rounded-lg border border-tone-danger-line bg-tone-danger-soft p-4 text-sm text-tone-danger">
          No se pudieron cargar los recursos: {loadError}
        </p>
      )}

      {groups.length === 0 && !loadError ? (
        // [Estado vacío]: explica qué hacer (no solo "sin datos")
        <div role="status" className="surface p-10 text-center">
          <p className="text-3xl" aria-hidden>
            📚
          </p>
          <p className="mt-2 text-sm text-muted-foreground">No hay recursos con estos filtros.</p>
          <Link href="/admin/curriculum/new" className="btn btn-primary mt-4">
            + Crear el primero
          </Link>
        </div>
      ) : (
        // [Tabla por tema]: overflow-x-auto → responsive | <th scope="col"> → accesible
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">Tema</th>
                <th scope="col" className="px-4 py-3">Tipo</th>
                <th scope="col" className="px-4 py-3">Idioma · nivel</th>
                <th scope="col" className="px-4 py-3">Elementos</th>
                <th scope="col" className="px-4 py-3">Estado</th>
                <th scope="col" className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => {
                const kind = g.kinds[0];
                const ref = { topic: g.topic, language: g.language, level: g.level, kind };
                const q = groupQuery(ref);
                const published = g.approved === g.count;
                return (
                  <tr key={q} className="border-t border-border hover:bg-muted/40">
                    <td className="px-4 py-2">
                      <Link href={`/admin/curriculum/tema?${q}`} className="flex items-center gap-2 font-semibold text-primary hover:underline">
                        <span aria-hidden className="text-lg">
                          {g.emoji ?? KIND_META[kind]?.icon}
                        </span>
                        {g.topic}
                      </Link>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span aria-hidden>{KIND_META[kind]?.icon}</span> {KIND_META[kind]?.label ?? kind}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {languageLabel(g.language)} · <b>{g.level}</b>
                    </td>
                    <td className="px-4 py-2">
                      <b className="eeg-mono">{g.count}</b>
                    </td>
                    <td className="px-4 py-2">
                      <GroupStatus g={g} />
                    </td>
                    <td className="px-4 py-2">
                      {/* [Acciones del tema]: ver elementos · editar/añadir más · publicar todos · eliminar todos | `.bind` (JS): Server Action con el grupo aplicado */}
                      <RowActions
                        title={`${g.topic} (${g.count})`}
                        viewHref={`/admin/curriculum/tema?${q}`}
                        editHref={`/admin/curriculum/tema/editar?${q}`}
                        publish={isAdmin || g.approved > 0 ? { isPublished: published, toggle: setTopicPublishedAction.bind(null, ref, !published) } : undefined}
                        onDelete={isAdmin ? deleteTopicAction.bind(null, ref) : undefined}
                        deleteTitle={`Eliminar el tema y sus ${g.count} elementos`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
