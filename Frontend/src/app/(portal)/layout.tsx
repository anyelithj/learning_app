import { PortalSidebar, type PortalRole } from "@/components/portal/PortalSidebar";
import { displayNameFromEmail, getCurrentUserPayload } from "@/lib/auth";
import { Role } from "@/lib/constants";
// [Portal Layout]: server component, deriva rol + displayName del JWT en cookie | [Patrón]: Container | [Principio]: SSOT

// [Mapeo Role NestJS → PortalRole UI]: SSOT | [Principio]: DRY
function toPortalRole(role: Role | null): PortalRole {
  if (role === Role.TEACHER) return "docente";
  if (role === Role.ADMIN) return "admin";
  return "estudiante";
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const payload = await getCurrentUserPayload();
  const role = toPortalRole(payload?.role ?? null);
  const displayName = payload ? displayNameFromEmail(payload.email) : undefined;
  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr] bg-background">
      <PortalSidebar role={role} displayName={displayName} />
      <main id="main-content" className="px-4 md:px-8 pb-10 min-w-0 flex flex-col">
        {children}
      </main>
    </div>
  );
}
