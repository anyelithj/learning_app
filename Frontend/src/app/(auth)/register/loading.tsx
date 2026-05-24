// [Loading auth]: spinner mínimo | [Patrón]: Composite
export default function Loading() {
  return (
    <div className="grid place-items-center" role="status" aria-live="polite">
      <div className="size-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
