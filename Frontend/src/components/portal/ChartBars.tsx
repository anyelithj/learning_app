export type ChartBar = { label: string; height: number; value?: number | string };

export function ChartBars({ bars }: { bars: ChartBar[] }) {
  return (
    <div className="flex items-end gap-3 h-52 px-1 pt-2 pb-7">
      {bars.map((b) => (
        <div
          key={b.label}
          style={{ height: `${b.height}%` }}
          className="flex-1 min-h-2 rounded-t-lg bg-gradient-brand relative transition-opacity hover:opacity-85"
        >
          {b.value !== undefined && (
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] text-muted-foreground font-semibold">
              {b.value}
            </span>
          )}
          <small className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[11px] text-muted-foreground">
            {b.label}
          </small>
        </div>
      ))}
    </div>
  );
}
