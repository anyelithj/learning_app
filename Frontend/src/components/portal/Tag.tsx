import { cn } from "@/lib/utils";

type Tone = "default" | "green" | "amber" | "red" | "gray";

const toneClass: Record<Tone, string> = {
  default: "bg-gradient-soft text-primary",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
  gray: "bg-muted text-muted-foreground",
};

export function Tag({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
