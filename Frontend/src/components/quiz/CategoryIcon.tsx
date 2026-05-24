import type { Category } from "@/types/quiz";
// [Atom CategoryIcon]: emoji por categoria | [Patron]: Atomic Design | [Principio]: SRP

const EMOJI: Record<Category, string> = {
  general: "🧠",
  science: "🔬",
  history: "📜",
  geography: "🌍",
  sports: "⚽",
  entertainment: "🎬",
  technology: "💻",
  math: "🧮",
  art: "🎨",
  custom: "✨",
};

export function CategoryIcon({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  return (
    <span className={className} role="img" aria-label={category}>
      {EMOJI[category] ?? "❓"}
    </span>
  );
}
