"use server"; // [Next.js]: Server Action → el token viaja solo en el servidor
import { revalidatePath } from "next/cache";
import { changeCurriculumStatus, deleteCurriculumItem, getCurriculumItem, listCurriculum } from "@/lib/curriculum-api"; // [Facade]: DELETE /curriculum/:id (ADMIN) y POST /curriculum/:id/status
import type { CurriculumItemKind, ReviewStatus } from "@/types/curriculum";
// [Server Actions de recursos]: acciones de fila de la tabla de Gestión | [Patrón]: Command | [Principio]: SRP

type RowResult = { ok: true } | { ok: false; message: string }; // Mismo contrato que las acciones de fila de cursos

// [runRow]: try/catch + revalidación común | [Patrón]: Template Method funcional | [Principio]: DRY
async function runRow(action: () => Promise<unknown>): Promise<RowResult> {
  try {
    await action();
    revalidatePath("/admin/curriculum");
    revalidatePath("/resources"); // El catálogo publicado de estudiantes
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}

// [deleteResourceAction]: baja definitiva + refresco del listado
export async function deleteResourceAction(id: string): Promise<RowResult> {
  return runRow(() => deleteCurriculumItem(id));
}

// [Camino hasta "aprobado"]: la máquina de estados del backend no permite saltos (borrador → revisión → aprobado) | [Patrón]: Lookup Table
const PUBLISH_PATH: Readonly<Record<ReviewStatus, ReadonlyArray<ReviewStatus>>> = {
  draft: ["in_review", "approved"],
  in_review: ["approved"],
  rejected: ["draft", "in_review", "approved"],
  archived: ["draft", "in_review", "approved"],
  approved: [],
};

// [setResourcePublishedAction]: Publicar = recorre las transiciones hasta "aprobado" (solo ADMIN aprueba) · Despublicar = vuelve a borrador (deja de verse para estudiantes)
// Cada paso usa la versión devuelta por el anterior → concurrencia optimista respetada | [Patrón]: Command + Pipeline
export async function setResourcePublishedAction(id: string, publish: boolean): Promise<RowResult> {
  return runRow(() => publishOne(id, publish));
}

// [publishOne]: recorre las transiciones de UN recurso | [Principio]: DRY (fila individual y tema completo)
async function publishOne(id: string, publish: boolean): Promise<void> {
  const { item } = await getCurriculumItem(id);
  let version = item.version;
  const steps: ReadonlyArray<ReviewStatus> = publish ? PUBLISH_PATH[item.reviewStatus] : item.reviewStatus === "approved" ? ["draft"] : [];
  for (const status of steps) {
    const saved = (await changeCurriculumStatus(id, { status, expectedVersion: version })) as { version: number };
    version = saved.version;
  }
}

// ───── Acciones por TEMA (grupo de la tabla de Gestión) ─────
// `export type` (TS): identifica un grupo = tema + idioma + nivel + tipo
export type TopicGroupRef = { topic: string; language: string; level: string; kind: CurriculumItemKind };

// [groupIds]: ids de todos los recursos del grupo (máx. 100 por tema) | [Patrón]: Query
async function groupIds(g: TopicGroupRef): Promise<string[]> {
  const res = await listCurriculum({ ...g, limit: 100 });
  return res.data.map((i) => i.id);
}

// [setTopicPublishedAction]: publica o despublica TODOS los recursos del tema → los estudiantes ven el tema completo | `for…of` secuencial (respeta la concurrencia optimista de cada recurso) | [Patrón]: Composite Command
export async function setTopicPublishedAction(g: TopicGroupRef, publish: boolean): Promise<RowResult> {
  return runRow(async () => {
    for (const id of await groupIds(g)) await publishOne(id, publish);
  });
}

// [deleteTopicAction]: elimina todos los recursos del tema (solo ADMIN; el backend lo exige)
export async function deleteTopicAction(g: TopicGroupRef): Promise<RowResult> {
  return runRow(async () => {
    for (const id of await groupIds(g)) await deleteCurriculumItem(id);
  });
}
