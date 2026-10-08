import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { initialsFromName, ROLE_GRADIENT, toPortalRole } from "@/components/portal/portal-role";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { PreferencesProvider } from "@/components/layout/PreferencesProvider";
import { MobileNavProvider } from "@/components/portal/MobileNav"; // [Menú móvil]: estado compartido hamburguesa ↔ sidebar
import { displayNameFromEmail, getCurrentUserPayload } from "@/lib/auth";
import { getLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";
// [Portal Layout]: server component, deriva rol + displayName del JWT e idioma de la cookie | [Patrón]: Container + Provider | [Principio]: SSOT

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  // `Promise.all` (ES2015): lee sesión e idioma en paralelo (ambos son lecturas de cookies, sin red)
  const [payload, locale] = await Promise.all([getCurrentUserPayload(), getLocale()]);
  const role = toPortalRole(payload?.role ?? null);
  const displayName = payload ? displayNameFromEmail(payload.email) : undefined;
  const t = getDictionary(locale);
  const name = displayName ?? t.roles[role];
  // [Usuario del topbar]: todo derivado en el servidor desde el JWT (sin petición extra) | [Principio]: SSOT
  const user = { name, email: payload?.email ?? "", roleLabel: t.roles[role], initials: initialsFromName(name), gradient: ROLE_GRADIENT[role] };
  return (
    // [PreferencesProvider]: idioma + tema disponibles para todos los Client Components del portal | [Patrón]: Provider
    <PreferencesProvider initialLocale={locale}>
      {/* [MobileNavProvider]: el botón hamburguesa (topbar) abre el sidebar (drawer) en pantallas < lg | [Patrón]: Provider */}
      <MobileNavProvider>
        {/* [Responsive]: sidebar fijo en columna desde lg (≥1024px); por debajo es un drawer → el contenido usa todo el ancho en móvil y tablet */}
        <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_1fr]">
          <PortalSidebar role={role} displayName={displayName} />
          <main id="main-content" className="flex min-w-0 flex-col px-4 pb-10 md:px-8">
            {/* [Barra superior global]: hamburguesa (móvil), buscador, notificaciones, carrito, tema, idioma y perfil */}
            <PortalTopbar user={user} />
            {children}
          </main>
        </div>
      </MobileNavProvider>
    </PreferencesProvider>
  );
}
