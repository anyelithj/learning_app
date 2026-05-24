import type { Metadata } from "next";
import Link from "next/link";
// [Página /terms]: contenido estático (Server Component) | [Patrón]: Static Page | [Principio]: SRP | [Paradigma]: RSC + JSX

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Términos de uso y política de privacidad de la plataforma NeuroEdu IA.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <article className="w-full max-w-[640px] prose prose-slate text-sm space-y-4">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Términos y Política de Privacidad
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Última actualización: 17 de mayo de 2026
        </p>
      </header>

      <section>
        <h2 className="text-lg font-bold mt-6 mb-2">1. Uso de la plataforma</h2>
        <p className="text-muted-foreground leading-relaxed">
          NeuroEdu IA es una plataforma académica desarrollada como práctica
          empresarial universitaria. Los datos almacenados se usan exclusivamente
          para fines educativos y de evaluación.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold mt-6 mb-2">2. Privacidad y datos</h2>
        <p className="text-muted-foreground leading-relaxed">
          Las credenciales se almacenan cifradas (bcrypt) y los tokens viajan
          en cookies httpOnly. No compartimos datos con terceros sin
          consentimiento explícito.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold mt-6 mb-2">3. Propiedad intelectual</h2>
        <p className="text-muted-foreground leading-relaxed">
          El contenido pedagógico, código y diseño son propiedad de NeuroEdu IA
          o sus licenciantes y están protegidos por las leyes de propiedad
          intelectual aplicables.
        </p>
      </section>

      <p className="pt-6">
        <Link href="/register" className="font-semibold text-primary hover:text-primary-dark">
          ← Volver al registro
        </Link>
      </p>
    </article>
  );
}
