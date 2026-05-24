import { Search, Bell } from "lucide-react";

export function Topbar({
  title,
  subtitle,
  searchPlaceholder = "Buscar…",
  actions,
}: {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-10 bg-background flex flex-wrap items-center justify-between gap-3 py-5">
      <div className="flex-1 min-w-0 pl-12 md:pl-0">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-2.5 items-center w-full md:w-auto">
        <div className="flex items-center gap-2 bg-card border border-border px-3.5 py-2 rounded-xl min-w-[280px] flex-1 md:flex-initial">
          <Search className="size-4 text-muted-foreground" strokeWidth={2} />
          <input
            type="search"
            placeholder={searchPlaceholder}
            className="border-none outline-none bg-transparent text-sm flex-1"
          />
        </div>
        {actions ?? (
          <button
            type="button"
            className="relative size-10 rounded-xl bg-card border border-border grid place-items-center text-muted-foreground hover:text-primary hover:border-primary/40"
            aria-label="Notificaciones"
          >
            <Bell className="size-[18px]" strokeWidth={2} />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-danger border-2 border-card" />
          </button>
        )}
      </div>
    </div>
  );
}
