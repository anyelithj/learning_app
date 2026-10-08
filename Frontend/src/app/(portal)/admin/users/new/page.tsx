import type { Metadata } from "next";
import Link from "next/link";
import { UserForm } from "../UserForm"; // [Formulario único]: el mismo que usa la edición
// [Página crear usuario admin]: cabecera + formulario compartido | [Patrón]: Container (RSC) + Presentational | [Principio]: SRP + DRY

export const metadata: Metadata = {
  title: "Gestión · Nuevo usuario",
  robots: { index: false, follow: false }, // Privada: no indexar
};

export default function NewUserPage() {
  return (
    // [Semántica]: <div> (el layout del portal ya aporta el <main>)
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Crear usuario</h1>
          <p className="mt-1 text-sm text-muted-foreground">Alta directa de usuario por administrador.</p>
        </div>
        <Link href="/admin/users" className="btn btn-outline">
          ← Volver
        </Link>
      </header>
      <UserForm />
    </div>
  );
}
