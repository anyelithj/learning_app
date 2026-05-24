import Link from "next/link";
// [Layout grupo (auth)]: split 50/50 marca + form | [Patrón]: Composite + Container | [Principio]: SRP | [Paradigma]: Funcional + JSX

// [Layout]: Server Component (no necesita state cliente) | [Paradigma]: RSC
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* [Panel marca]: gradient indigo→violet con quote (oculto en móvil) */}
      <aside
        className="relative hidden md:flex flex-col justify-between p-12 lg:p-16 bg-gradient-brand text-white overflow-hidden"
        aria-hidden="false"
      >
        {/* [Decoración]: círculo borroso esquina | [Demohtml: auth-side::after] */}
        <span
          className="absolute -bottom-40 -right-40 size-[420px] rounded-full bg-white/10 pointer-events-none"
          aria-hidden="true"
        />

        {/* [Brand] */}
        <Link href="/" className="relative z-10 inline-flex items-center gap-2.5 font-bold text-lg">
          <span className="grid place-items-center size-9 rounded-xl bg-white/20 backdrop-blur">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M12 2a3 3 0 0 0-3 3 3 3 0 0 0-3 3 3 3 0 0 0 0 6 3 3 0 0 0 3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0 3-3 3 3 0 0 0 0-6 3 3 0 0 0-3-3 3 3 0 0 0-3-3z" />
            </svg>
          </span>
          <span>NeuroEdu IA</span>
        </Link>

        {/* [Mensaje principal] */}
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-3">
            Bienvenido de nuevo
          </h2>
          <p className="text-white/85 leading-relaxed">
            Continúa el camino de aprendizaje inteligente.
            El cerebro está listo para crecer.
          </p>
        </div>

        {/* [Spacer]: mantiene espaciado del split layout sin testimonial | [Patrón]: Empty Block */}
        <div aria-hidden="true" />
      </aside>

      {/* [Panel form]: centrado vertical | id main-content para skip link */}
      <main
        id="main-content"
        className="flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-background"
      >
        {children}
      </main>
    </div>
  );
}
