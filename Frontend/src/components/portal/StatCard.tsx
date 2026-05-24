import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
  deltaDir = "up",
  icon: Icon,
  valueSuffix,
}: {
  label: string;
  value: React.ReactNode;
  delta?: string;
  deltaDir?: "up" | "down";
  icon: LucideIcon;
  valueSuffix?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden bg-card border border-border rounded-xl p-5">
      <div className="absolute top-5 right-5 grid place-items-center size-10 rounded-xl bg-gradient-soft text-primary">
        <Icon className="size-5" strokeWidth={2} />
      </div>
      <div className="text-sm text-muted-foreground mb-1.5">{label}</div>
      <div className="text-3xl font-extrabold tracking-tight">
        {value}
        {valueSuffix && (
          <span className="text-lg text-muted-foreground font-extrabold">{valueSuffix}</span>
        )}
      </div>
      {delta && (
        <div
          className={cn(
            "text-xs font-semibold mt-1.5",
            deltaDir === "up" ? "text-emerald-600" : "text-red-600",
          )}
        >
          {deltaDir === "up" ? "↑" : "↓"} {delta}
        </div>
      )}
    </div>
  );
}
