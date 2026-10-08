import Link from "next/link";
import "./landing.css";
import { BRAND } from "@/config/brand";
import { PreferencesProvider } from "@/components/layout/PreferencesProvider"; // [Provider]: tema + idioma también en la landing
import { PublicNavbar } from "@/components/layout/PublicNavbar"; // [Navbar público compartido]: landing + login + registro | [Principio]: DRY
import { fmt, getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
// [Landing /]: página pública traducida (ES/EN) | [Patrón]: Template + Data-driven rendering (secciones desde el diccionario) | [Principio]: DRY + OCP | [Tecnología]: React Server Component (HTML completo en servidor → SEO)

// [Iconos de características]: mismo orden que `landing.features` del diccionario | `ReadonlyArray<JSX>` | [Patrón]: Lookup Table
const FEATURE_ICONS = [
  <svg key="0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M9 11H1l3-3M1 8l3 3M15 13h8l-3 3M23 16l-3-3" />
    <rect x="6" y="3" width="12" height="18" rx="2" />
  </svg>,
  <svg key="1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>,
  <svg key="2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>,
  <svg key="3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>,
  <svg key="4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 9h6v6H9z" />
  </svg>,
  <svg key="5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>,
];

// `async` (RSC): lee la cookie de idioma → la página se genera ya traducida
export default async function Home() {
  const year = new Date().getFullYear();
  const locale = await getLocale();
  const d = getDictionary(locale);
  const l = d.landing; // Alias de la sección landing
  const n = d.publicNav;

  return (
    <PreferencesProvider initialLocale={locale}>
      {/* [Fuera de .landing-root]: los estilos propios de la landing (.btn, button) no alteran el navbar compartido */}
      <PublicNavbar showSections />
      <div className="landing-root">

        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span
                className="section-head"
                style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  background: "var(--surface)",
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
                {l.pill}
              </span>
              <h1>
                {l.titleA}
                <span className="grad">{l.titleB}</span>
              </h1>
              <p className="lead">{l.lead}</p>
              <div className="hero-cta">
                <Link href="/register" className="btn btn-primary">
                  {l.start}
                </Link>
                <Link href="/login" className="btn btn-outline">
                  {n.login}
                </Link>
              </div>
              <div className="hero-stats">
                {l.stats.map((s) => (
                  <div key={s.label}>
                    <b>{s.value}</b>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-visual" aria-hidden>
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
                  <b style={{ display: "block", fontSize: "13px" }}>{l.card1Title}</b>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{l.card1Sub}</span>
                </div>
              </div>
              <div className="floating-card fc-2">
                <div className="ic">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <b style={{ display: "block", fontSize: "13px" }}>{l.card2Title}</b>
                  <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{l.card2Sub}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="caracteristicas">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{l.featuresEyebrow}</span>
              <h2>{l.featuresTitle}</h2>
              <p>{l.featuresLead}</p>
            </div>
            <div className="feature-grid">
              {/* `map` con índice (ES5): icono i ↔ característica i */}
              {l.features.map((f, i) => (
                <div key={f.title} className="feature-card">
                  <div className="icon">{FEATURE_ICONS[i]}</div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="roles" style={{ background: "var(--bg-alt)" }}>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{l.rolesEyebrow}</span>
              <h2>{l.rolesTitle}</h2>
              <p>{l.rolesLead}</p>
            </div>
            <div className="roles-grid">
              {l.roles.map((r) => (
                <div key={r.badge} className="role-card">
                  <span className="badge">{r.badge}</span>
                  <h3>{r.title}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{r.text}</p>
                  <ul>
                    {r.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                  <Link href="/login" className="btn btn-outline btn-block">
                    {r.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="como-funciona">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{l.howEyebrow}</span>
              <h2>{l.howTitle}</h2>
            </div>
            <div className="feature-grid">
              {l.steps.map((s, i) => (
                <div key={s.title} className="feature-card">
                  <div className="icon">
                    <b style={{ fontSize: "22px" }}>{i + 1}</b>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="cta-section">
          <h2>{fmt(l.ctaTitle, { brand: BRAND.name })}</h2>
          <p>{l.ctaText}</p>
          <Link href="/register" className="btn btn-primary">
            {l.ctaButton}
          </Link>
        </div>

        <footer className="footer" id="contacto">
          <div className="container">
            <div className="footer-grid">
              <div>
                <div className="brand" style={{ color: "#fff", marginBottom: "14px" }}>
                  <span className="brand-mark" aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M12 2a3 3 0 0 0-3 3 3 3 0 0 0-3 3 3 3 0 0 0 0 6 3 3 0 0 0 3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0 3-3 3 3 0 0 0 0-6 3 3 0 0 0-3-3 3 3 0 0 0-3-3z" />
                    </svg>
                  </span>
                  <span style={{ color: "#fff" }}>{BRAND.name}</span>
                </div>
                <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "300px" }}>{l.footerAbout}</p>
              </div>
              <div>
                <h4>{l.footerProduct}</h4>
                <a href="#caracteristicas">{n.features}</a>
                <a href="#roles">{n.roles}</a>
                <a href="#como-funciona">{n.how}</a>
              </div>
              <div>
                <h4>{l.footerAccount}</h4>
                <Link href="/login">{n.login}</Link>
                <Link href="/register">{n.register}</Link>
              </div>
              <div>
                <h4>{l.footerContact}</h4>
                <span>{BRAND.supportEmail}</span>
              </div>
            </div>
            <div className="footer-bottom">
              © <span>{year}</span> {BRAND.name}. {l.footerRights}
            </div>
          </div>
        </footer>
      </div>
    </PreferencesProvider>
  );
}
