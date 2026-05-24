"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutGrid,
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/LogoutButton";

export type PortalRole = "estudiante" | "docente" | "admin";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV_BY_ROLE: Record<PortalRole, NavItem[]> = {
  estudiante: [
    { href: "/dashboard/estudiante", label: "Dashboard", icon: LayoutGrid },
    { href: "/quiz", label: "Exámenes", icon: FileText },
    { href: "/assistant", label: "Feedback IA", icon: MessageSquare },
    { href: "/profile", label: "Progreso", icon: TrendingUp },
  ],
  docente: [
    { href: "/dashboard/docente", label: "Dashboard", icon: LayoutGrid },
    { href: "/teacher/quizzes", label: "Gestión", icon: Users },
    { href: "/quiz", label: "Exámenes", icon: FileText },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Dashboard", icon: LayoutGrid },
    { href: "/admin/users", label: "Gestión", icon: Users },
    { href: "/admin/reports", label: "Reportes", icon: BarChart3 },
    { href: "/quiz", label: "Exámenes", icon: FileText },
  ],
};

const AVATAR_BY_ROLE: Record<PortalRole, { initials: string; name: string; gradient: string }> = {
  estudiante: {
    initials: "JA",
    name: "Juan Andrés",
    gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  },
  docente: {
    initials: "MR",
    name: "María Rodríguez",
    gradient: "linear-gradient(135deg,#06b6d4,#3b82f6)",
  },
  admin: {
    initials: "AD",
    name: "Admin",
    gradient: "linear-gradient(135deg,#f59e0b,#ef4444)",
  },
};

const ROLE_LABEL: Record<PortalRole, string> = {
  estudiante: "Estudiante",
  docente: "Docente",
  admin: "Administrador",
};

function deriveRole(pathname: string): PortalRole {
  if (pathname.startsWith("/dashboard/docente")) return "docente";
  if (pathname.startsWith("/dashboard/admin")) return "admin";
  return "estudiante";
}

// [initialsFromName]: deriva 2 letras de "Ana Pérez" → "AP" | [Patrón]: Pure Function
function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

export function PortalSidebar({
  role: roleProp,
  displayName,
}: { role?: PortalRole; displayName?: string } = {}) {
  const pathname = usePathname();
  const role = roleProp ?? deriveRole(pathname);
  const [open, setOpen] = useState(false);
  const nav = NAV_BY_ROLE[role];
  const fallback = AVATAR_BY_ROLE[role];
  // [Override con datos reales]: displayName del JWT pisa el placeholder | [Principio]: SSOT
  const user = displayName
    ? { name: displayName, initials: initialsFromName(displayName), gradient: fallback.gradient }
    : fallback;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className="md:hidden fixed top-3 left-3 z-50 size-10 rounded-xl bg-card border border-border grid place-items-center"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 md:z-auto",
          "w-[260px] h-screen overflow-y-auto",
          "bg-card border-r border-border p-5 flex flex-col gap-1",
          "transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-lg pb-5 mb-3 border-b border-border"
        >
          <span className="grid place-items-center size-9 rounded-xl bg-gradient-brand text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2a3 3 0 0 0-3 3 3 3 0 0 0-3 3 3 3 0 0 0 0 6 3 3 0 0 0 3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0 3-3 3 3 0 0 0 0-6 3 3 0 0 0-3-3 3 3 0 0 0-3-3z" />
            </svg>
          </span>
          <span>NeuroEdu IA</span>
        </Link>

        <nav className="flex flex-col gap-1" aria-label="Navegación principal">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground/80 px-3 pt-3 pb-1.5">
            {ROLE_LABEL[role]}
          </div>
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-gradient-soft text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="size-[18px] shrink-0" strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-border flex items-center gap-3">
          <div
            className="grid place-items-center size-10 rounded-full text-white font-bold text-sm"
            style={{ background: user.gradient }}
          >
            {user.initials}
          </div>
          <div className="flex-1 min-w-0">
            <b className="block text-sm truncate">{user.name}</b>
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
