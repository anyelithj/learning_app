import Link from "next/link";
import "./landing.css";

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <div className="landing-root">
      <header className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3 3 3 0 0 0-3 3 3 3 0 0 0 0 6 3 3 0 0 0 3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0 3-3 3 3 0 0 0 0-6 3 3 0 0 0-3-3 3 3 0 0 0-3-3z" />
                <path d="M9 8v2M15 8v2M9 14v2M15 14v2" />
              </svg>
            </span>
            <span>NeuroEdu <b style={{ color: "var(--primary)" }}>IA</b></span>
          </Link>
          <nav className="nav-links">
            <a href="#caracteristicas">Características</a>
            <a href="#roles">Roles</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#contacto">Contacto</a>
          </nav>
          <div className="nav-actions">
            <Link href="/login" className="btn btn-ghost">Iniciar sesión</Link>
            <Link href="/register" className="btn btn-primary">Registrarse</Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span
              className="section-head"
              style={{
                display: "inline-block",
                padding: "6px 14px",
                background: "rgba(255,255,255,0.7)",
                color: "var(--primary)",
                borderRadius: "99px",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: "20px",
                border: "1px solid var(--border)",
              }}
            >
              Powered by Inteligencia Artificial
            </span>
            <h1>
              Aprende más rápido con <span className="grad">neuroeducación e IA</span>
            </h1>
            <p className="lead">
              NeuroEdu IA combina ciencia cognitiva e inteligencia artificial para ofrecer
              evaluaciones adaptativas, feedback personalizado y seguimiento del progreso
              de cada estudiante.
            </p>
            <div className="hero-cta">
              <Link href="/register" className="btn btn-primary">Comenzar gratis →</Link>
              <Link href="/login" className="btn btn-outline">Iniciar sesión</Link>
            </div>
            <div className="hero-stats">
              <div><b>+10k</b><span>Estudiantes activos</span></div>
              <div><b>98%</b><span>Precisión IA</span></div>
              <div><b>500+</b><span>Evaluaciones</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <svg className="brain-svg" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <circle cx="200" cy="200" r="160" fill="url(#g1)" opacity="0.12" />
              <circle cx="200" cy="200" r="110" fill="url(#g1)" opacity="0.2" />
              <g stroke="url(#g1)" strokeWidth="2" fill="none" opacity="0.7">
                <path d="M120,180 Q160,120 200,160 T280,180" />
                <path d="M120,220 Q160,280 200,240 T280,220" />
                <path d="M140,160 Q200,200 260,160" />
                <path d="M140,240 Q200,200 260,240" />
              </g>
              <g fill="#6366f1">
                <circle cx="120" cy="180" r="6" />
                <circle cx="200" cy="160" r="8" />
                <circle cx="280" cy="180" r="6" />
                <circle cx="120" cy="220" r="6" />
                <circle cx="200" cy="240" r="8" />
                <circle cx="280" cy="220" r="6" />
                <circle cx="200" cy="200" r="12" fill="#8b5cf6" />
              </g>
            </svg>
            <div className="floating-card fc-1">
              <div className="ic">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <b style={{ display: "block", fontSize: "13px" }}>Evaluación completada</b>
                <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Puntaje: 92/100</span>
              </div>
            </div>
            <div className="floating-card fc-2">
              <div className="ic">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <b style={{ display: "block", fontSize: "13px" }}>IA: Feedback listo</b>
                <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>Refuerza álgebra</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="caracteristicas">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Características</span>
            <h2>Una plataforma neuroeducativa completa</h2>
            <p>Diseñada para potenciar el aprendizaje con tecnología adaptativa y ciencia del cerebro.</p>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 11H1l3-3M1 8l3 3M15 13h8l-3 3M23 16l-3-3" />
                  <rect x="6" y="3" width="12" height="18" rx="2" />
                </svg>
              </div>
              <h3>Evaluaciones adaptativas</h3>
              <p>Exámenes inteligentes que se ajustan al nivel del estudiante en tiempo real.</p>
            </div>
            <div className="feature-card">
              <div className="icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <h3>Feedback generado por IA</h3>
              <p>Retroalimentación personalizada al instante para cada respuesta del estudiante.</p>
            </div>
            <div className="feature-card">
              <div className="icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3>Progreso cognitivo</h3>
              <p>Visualiza el avance del aprendizaje con métricas neurocognitivas detalladas.</p>
            </div>
            <div className="feature-card">
              <div className="icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3>Recomendaciones personalizadas</h3>
              <p>La IA sugiere rutas de aprendizaje basadas en fortalezas y debilidades.</p>
            </div>
            <div className="feature-card">
              <div className="icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 9h6v6H9z" />
                </svg>
              </div>
              <h3>Gestión de exámenes</h3>
              <p>Los docentes crean, asignan y gestionan evaluaciones desde un panel sencillo.</p>
            </div>
            <div className="feature-card">
              <div className="icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Roles diferenciados</h3>
              <p>Experiencia adaptada para estudiantes, docentes y administradores.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="roles" style={{ background: "var(--bg-alt)" }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Roles del sistema</span>
            <h2>Una experiencia para cada usuario</h2>
            <p>Funcionalidades diseñadas según el rol dentro de la plataforma educativa.</p>
          </div>
          <div className="roles-grid">
            <div className="role-card">
              <span className="badge">Estudiante</span>
              <h3>Aprende a ritmo propio</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                Evaluaciones inteligentes y feedback personalizado por IA.
              </p>
              <ul>
                <li>Realizar evaluaciones inteligentes</li>
                <li>Recibir feedback generado por IA</li>
                <li>Visualizar progreso cognitivo</li>
                <li>Recomendaciones personalizadas</li>
              </ul>
              <Link href="/login" className="btn btn-outline btn-block">Acceder como estudiante</Link>
            </div>
            <div className="role-card">
              <span className="badge">Docente</span>
              <h3>Enseña con datos</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                Crea exámenes y supervisa el avance académico.
              </p>
              <ul>
                <li>Crear y gestionar exámenes</li>
                <li>Visualizar resultados de estudiantes</li>
                <li>Seguimiento al progreso académico</li>
                <li>Dashboard docente con métricas</li>
              </ul>
              <Link href="/login" className="btn btn-outline btn-block">Acceder como docente</Link>
            </div>
            <div className="role-card">
              <span className="badge">Administrador</span>
              <h3>Gestiona la plataforma</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                Control total de usuarios y contenido educativo.
              </p>
              <ul>
                <li>Gestionar estudiantes y docentes</li>
                <li>Administrar exámenes</li>
                <li>Supervisar la plataforma</li>
                <li>Dashboard administrador</li>
              </ul>
              <Link href="/login" className="btn btn-outline btn-block">Acceder como admin</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="como-funciona">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Cómo funciona</span>
            <h2>Aprendizaje inteligente en 3 pasos</h2>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="icon"><b style={{ fontSize: "22px" }}>1</b></div>
              <h3>Regístrate</h3>
              <p>Crea una cuenta como estudiante, docente o administrador en segundos.</p>
            </div>
            <div className="feature-card">
              <div className="icon"><b style={{ fontSize: "22px" }}>2</b></div>
              <h3>Realiza evaluaciones</h3>
              <p>La IA presenta exámenes adaptados al nivel cognitivo.</p>
            </div>
            <div className="feature-card">
              <div className="icon"><b style={{ fontSize: "22px" }}>3</b></div>
              <h3>Mejora con IA</h3>
              <p>Recibe feedback y recomendaciones personalizadas para avanzar.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="cta-section">
        <h2>Empieza a aprender con NeuroEdu IA</h2>
        <p>Únete a la plataforma neuroeducativa que potencia el aprendizaje.</p>
        <Link href="/register" className="btn btn-primary">Crear cuenta gratis →</Link>
      </div>

      <footer className="footer" id="contacto">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="brand" style={{ color: "#fff", marginBottom: "14px" }}>
                <span className="brand-mark">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M12 2a3 3 0 0 0-3 3 3 3 0 0 0-3 3 3 3 0 0 0 0 6 3 3 0 0 0 3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0 3-3 3 3 0 0 0 0-6 3 3 0 0 0-3-3 3 3 0 0 0-3-3z" />
                  </svg>
                </span>
                <span style={{ color: "#fff" }}>NeuroEdu IA</span>
              </div>
              <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "300px" }}>
                Plataforma neuroeducativa impulsada por inteligencia artificial para aprendizaje adaptativo.
              </p>
            </div>
            <div>
              <h4>Producto</h4>
              <a href="#caracteristicas">Características</a>
              <a href="#roles">Roles</a>
              <a href="#como-funciona">Cómo funciona</a>
            </div>
            <div>
              <h4>Cuenta</h4>
              <Link href="/login">Iniciar sesión</Link>
              <Link href="/register">Registrarse</Link>
            </div>
            <div>
              <h4>Contacto</h4>
              <a>soporte@neuroedu.ia</a>
              <a>+57 300 000 0000</a>
            </div>
          </div>
          <div className="footer-bottom">
            © <span>{year}</span> NeuroEdu IA. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
