import Link from "next/link";
import type { Metadata } from "next";
// [Página 404]: vista global por defecto si ninguna ruta coincide | [Patrón]: Null Object | [Principio]: SRP | [Paradigma]: RSC + JSX

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-6xl font-extrabold text-gradient-brand">404</h1>
        <h2 className="text-2xl font-bold">Página no encontrada</h2>
        <p className="text-muted-foreground">
          La ruta que buscas no existe o fue movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center font-semibold text-primary hover:text-primary-dark"
        >
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}
