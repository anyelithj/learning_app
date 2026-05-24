import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
// [Página /login]: Server Component, monta LoginForm | [Patrón]: Container/Presentational | [Principio]: SRP | [Paradigma]: RSC + JSX

// [Metadata SEO]: específica por página | [Buena práctica]: SEO técnico
export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a la cuenta NeuroEdu IA para continuar el aprendizaje.",
  alternates: { canonical: "/login" },
  robots: { index: true, follow: true },
};

export default function LoginPage() {
  return <LoginForm />;
}
