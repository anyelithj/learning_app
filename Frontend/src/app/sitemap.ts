import type { MetadataRoute } from "next";
// [Sitemap dinámico]: convención app/sitemap.ts | [Patrón]: Convention over Configuration | [Principio]: SSOT | [Paradigma]: Funcional

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:7000";
  const now = new Date();
  // [Rutas indexables]: solo páginas públicas. Portal es noindex
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
