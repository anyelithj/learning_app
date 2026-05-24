// [Loading skeleton]: spinner mínimo | [Patrón]: Composite | [Principio]: SRP | [Paradigma]: RSC + JSX
export default function Loading() {
  return (
    <div className="min-h-screen grid place-items-center" role="status" aria-live="polite">
      <div className="size-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
