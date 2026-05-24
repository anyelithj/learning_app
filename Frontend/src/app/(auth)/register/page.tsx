import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
// [Página /register]: Server Component, monta RegisterForm | [Patrón]: Container/Presentational | [Principio]: SRP | [Paradigma]: RSC + JSX

export const metadata: Metadata = {
  title: "Crear cuenta",
  description:
    "Regístrate gratis en NeuroEdu IA — evaluaciones inteligentes y feedback con IA.",
  alternates: { canonical: "/register" },
  robots: { index: true, follow: true },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
