import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, listCourseMaterials } from "@/lib/courses-api";
import { ApiError } from "@/lib/errors";
import { getServerDictionary } from "@/lib/i18n-server";
import { CourseForm } from "../../CourseForm"; // [Formulario único]: el mismo del alta, con `initial`
// [Página /admin/courses/:id/edit]: edición de curso con el MISMO formulario del alta | [Patrón]: Container (RSC) + Presentational (form cliente) | [Principio]: SRP + DRY

export const metadata: Metadata = {
  title: "Gestión · Editar curso",
  robots: { index: false, follow: false }, // Privada: no indexar
};

export const dynamic = "force-dynamic"; // Depende de la sesión → render por petición

export default async function EditCoursePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  // `Promise.all` (ES2015): curso, materiales y textos en paralelo | `.catch(() => [])`: sin materiales no se rompe la página
  const [course, materials, t] = await Promise.all([
    getCourse(id).catch((err: unknown) => {
      if (err instanceof ApiError && err.status === 404) notFound(); // `notFound()` (Next.js): página 404
      throw err;
    }),
    listCourseMaterials(id).catch(() => []),
    getServerDictionary(),
  ]);

  return (
    <div className="container mx-auto max-w-4xl py-4 space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t.adminCourses.editTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.adminCourses.editSubtitle}</p>
        </div>
        <Link href="/admin/courses" className="btn btn-outline">
          {t.adminCourses.back}
        </Link>
      </header>
      {/* `key` (React): si cambia la versión del curso, el formulario se reinicia con los datos nuevos */}
      <CourseForm key={course.updatedAt} initial={course} initialMaterials={materials} />
    </div>
  );
}
