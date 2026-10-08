import { PreferencesProvider } from "@/components/layout/PreferencesProvider";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
// [Layout grupo (auth)]: navbar público + split 50/50 marca + formulario | [Patrón]: Composite + Provider | [Principio]: SRP + DRY (mismo navbar que la landing) | [Paradigma]: RSC + JSX

// `async` (RSC): el idioma sale de la cookie → login/registro se renderizan ya traducidos
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const t = getDictionary(locale).auth;
  return (
    // [PreferencesProvider]: tema (Claro/Oscuro) + idioma para los formularios cliente | [Patrón]: Provider
    <PreferencesProvider initialLocale={locale}>
      <div className="flex min-h-screen flex-col">
        <PublicNavbar />
        <div className="grid flex-1 grid-cols-1 md:grid-cols-2">
          {/* [Panel marca]: degradado de marca con mensaje (oculto en móvil) */}
          <aside className="relative hidden flex-col justify-center overflow-hidden bg-gradient-brand p-12 text-white md:flex lg:p-16">
            {/* [Decoración]: círculo borroso | aria-hidden: puramente visual */}
            <span className="pointer-events-none absolute -bottom-40 -right-40 size-[420px] rounded-full bg-white/10" aria-hidden="true" />
            <div className="relative z-10 max-w-md">
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight lg:text-4xl">{t.asideTitle}</h2>
              <p className="leading-relaxed text-white/85">{t.asideText}</p>
            </div>
          </aside>

          {/* [Panel form]: centrado vertical | id main-content para el skip link */}
          <main id="main-content" className="flex items-center justify-center bg-background p-6 sm:p-10 lg:p-16">
            {children}
          </main>
        </div>
      </div>
    </PreferencesProvider>
  );
}
