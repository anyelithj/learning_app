import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/store/provider";
// [Root Layout]: layout HTML raíz Next.js | [Patrón]: Composite | [Principio]: SRP | [Paradigma]: Funcional + JSX

// [Inter font]: carga via next/font para zero layout shift | [Patrón]: Adapter (Google Fonts)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// [Metadata SEO]: Open Graph + Twitter + canonical | [Buena práctica]: SEO técnico
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:7000"),
  title: {
    default: "NeuroEdu IA — Plataforma de Evaluación Cognitiva Inteligente",
    template: "%s | NeuroEdu IA",
  },
  description:
    "Evaluaciones inteligentes con IA, feedback pedagógico personalizado y seguimiento del progreso académico.",
  keywords: [
    "evaluación cognitiva",
    "trivia educativa",
    "IA educativa",
    "feedback pedagógico",
    "aprendizaje adaptativo",
  ],
  authors: [{ name: "NeuroEdu IA" }],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "NeuroEdu IA",
    title: "NeuroEdu IA — Evaluación Cognitiva con IA",
    description:
      "Plataforma educativa con quizzes adaptativos y agente tutor inteligente.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroEdu IA",
    description: "Evaluación Cognitiva Inteligente con IA",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// [Viewport]: separado de metadata desde Next.js 15+
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#6366f1" },
    { media: "(prefers-color-scheme: dark)", color: "#1e293b" },
  ],
};

// [RootLayout]: Server Component por defecto (no 'use client') | [Paradigma]: RSC
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* [Skip-to-content]: enlace accesibilidad teclado | [WCAG 2.4.1] */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          Saltar al contenido
        </a>
        {/* [Provider Redux]: envuelve toda la app | [Patrón]: Provider (Context) */}
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
