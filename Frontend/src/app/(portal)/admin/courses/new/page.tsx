import type { Metadata } from "next";
import Link from "next/link";
import { getServerDictionary } from "@/lib/i18n-server";
import { CourseForm } from "../CourseForm"; // [Formulario único]: el mismo que usa la edición
// [Página /admin/courses/new]: alta de curso dentro de Gestión | [Patrón]: Container (RSC) + Presentational (form cliente) | [Principio]: SRP

export const metadata: Metadata = {
  title: "Gestión · Nuevo curso",
  robots: { index: false, follow: false }, // Privada: no indexar
};

export default async function NewCoursePage() {
  const t = await getServerDictionary();
  return (
    <div className="container mx-auto max-w-4xl py-4 space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t.adminCourses.newTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.adminCourses.newSubtitle}</p>
        </div>
        <Link href="/admin/courses" className="btn btn-outline">
          {t.adminCourses.back}
        </Link>
      </header>
      <CourseForm />
    </div>
  );
}
