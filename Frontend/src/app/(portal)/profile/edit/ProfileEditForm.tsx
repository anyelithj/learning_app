"use client"; // [Next.js]: Client Component → necesario para hooks de React (useActionState) e interactividad
import { useActionState } from "react"; // [React 19]: conecta un <form> con una Server Action y expone estado + pending
import { useLocalStorage } from "@/hooks/useLocalStorage"; // [Custom Hook existente]: datos locales del perfil | [Principio]: DRY
import { usePreferences } from "@/components/layout/PreferencesProvider";
import { updateProfileAction, type ProfileFormState } from "./actions"; // [Server Action]: mutación en el servidor
// [ProfileEditForm]: tarjeta "Datos personales" de NeuroLearning (cabecera con avatar + campos + Guardar datos) | [Patrón]: Presentational + Controlled-by-server (campos del backend) + Custom Hook (campos locales) | [Principio]: SRP + KISS | [Paradigma]: Declarativo

// `interface` (TS): contrato de props; el servidor pasa los valores iniciales | [Principio]: ISP (solo lo necesario)
interface ProfileEditFormProps {
  storageKey: string; // Clave localStorage por usuario para los datos que el backend aún no guarda
  firstName: string;
  lastName: string;
  email: string;
  roleLabel: string; // Rol ya traducido ("Estudiante")
  section: string | null; // `| null` (TS union): el backend devuelve null si no hay sección
  isStudent: boolean; // [Regla de negocio]: solo estudiantes tienen sección/grupo
}

// [Datos locales]: el backend (PATCH /profile/me) solo acepta nombre, apellido y sección
// ponytail: bio/institución/zona horaria/idioma viven en localStorage (igual que NeuroLearning) → no viajan entre dispositivos; para sincronizarlos, añadir columnas a users + campos al UpdateProfileDto
interface LocalProfile {
  bio: string;
  institution: string;
  timezone: string;
  language: string;
}

const DEFAULT_LOCAL: LocalProfile = Object.freeze({ bio: "", institution: "", timezone: "America/Bogota", language: "es" });
const TIMEZONES = ["America/Bogota", "America/Lima", "America/Mexico_City", "America/Argentina/Buenos_Aires", "Europe/Madrid"] as const; // IANA (tz database)
const PREFERRED_LANGUAGES = ["es", "en", "pt"] as const;

// `const` (ES2015) tipado con ProfileFormState: estado inicial del formulario (antes del primer envío), fuera del componente para no recrearlo
const INITIAL_STATE: ProfileFormState = { status: "idle" };

// [Clase de control]: estilo de input del original (surf2 + borde de tema) | [Principio]: DRY (7 controles)
const controlClass =
  "w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive read-only:opacity-70";

// [initials]: "Ana Pérez" → "AP" | [Paradigma]: Funcional (pura) | `?.` + `??` (ES2020): tolera nombres vacíos
const initials = (a: string, b: string) => `${a.trim()[0] ?? ""}${b.trim()[0] ?? ""}`.toUpperCase() || "?";

export function ProfileEditForm({ storageKey, firstName, lastName, email, roleLabel, section, isStudent }: ProfileEditFormProps) {
  const { t } = usePreferences();
  const p = t.profile; // Alias de textos del perfil
  // [useActionState]: [estadoDevuelto, actionParaElForm, pending] | reemplaza varios useState + useCallback
  const [state, formAction, pending] = useActionState(updateProfileAction, INITIAL_STATE);
  const [local, setLocal] = useLocalStorage<LocalProfile>(storageKey, DEFAULT_LOCAL);
  const errors = state.fieldErrors ?? {}; // `??` (ES2020): objeto vacío si no hay errores por campo

  // [setField]: actualizador genérico e inmutable | `<K extends keyof LocalProfile>` (TS Generics): clave y valor coherentes
  const setField = <K extends keyof LocalProfile>(key: K, value: LocalProfile[K]) => setLocal((prev) => ({ ...prev, [key]: value }));

  return (
    <section aria-labelledby="personal-title" className="rounded-[14px] border border-border bg-card p-[18px] shadow-[var(--nl-shd)]">
      <h2 id="personal-title" className="sr-only">
        {p.title}
      </h2>

      {/* Cabecera con avatar: iniciales sobre el degradado morado de marca */}
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-muted p-3">
        <div className="grid size-[52px] shrink-0 place-items-center rounded-full bg-gradient-brand text-lg font-bold text-white" aria-hidden>
          {initials(firstName, lastName)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold">
            {firstName} {lastName}
          </div>
          <div className="break-all text-[11px] text-muted-foreground">
            {email} • {roleLabel}
          </div>
        </div>
      </div>

      {/* `action={formAction}` (React 19): envía FormData a la Server Action; funciona sin JS (progressive enhancement) */}
      <form action={formAction} noValidate>
        {state.message && (
          // [Mensaje global]: role/aria-live → los lectores de pantalla anuncian el resultado (WCAG 4.1.3)
          <div
            role={state.status === "error" ? "alert" : "status"}
            aria-live="polite"
            className={
              state.status === "error"
                ? "mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                : "mb-3 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary"
            }
          >
            {state.message}
          </div>
        )}

        <div className="mb-[14px] flex flex-col gap-[9px]">
          {/* [Responsive]: nombre y apellido en 2 columnas desde sm */}
          <div className="grid gap-[9px] sm:grid-cols-2">
            <Field id="firstName" label={p.firstName} error={errors.firstName} required>
              <input id="firstName" name="firstName" autoComplete="given-name" defaultValue={firstName} maxLength={80} required className={controlClass} {...ariaFor("firstName", errors.firstName)} />
            </Field>
            <Field id="lastName" label={p.lastName} error={errors.lastName} required>
              <input id="lastName" name="lastName" autoComplete="family-name" defaultValue={lastName} maxLength={80} required className={controlClass} {...ariaFor("lastName", errors.lastName)} />
            </Field>
          </div>

          <Field id="email" label={p.email} hint={p.emailHint}>
            {/* readOnly (HTML): visible y copiable pero no editable; no se envía cambio al backend */}
            <input id="email" type="email" value={email} readOnly className={controlClass} aria-describedby="email-hint" />
          </Field>

          <Field id="bio" label={p.bio}>
            <textarea id="bio" rows={2} maxLength={300} value={local.bio} placeholder={p.bioPlaceholder} onChange={(e) => setField("bio", e.target.value)} className={`${controlClass} resize-none`} />
          </Field>

          <Field id="institution" label={p.institution}>
            <input id="institution" autoComplete="organization" maxLength={120} value={local.institution} onChange={(e) => setField("institution", e.target.value)} className={controlClass} />
          </Field>

          <div className="grid gap-[9px] sm:grid-cols-2">
            <Field id="timezone" label={p.timezone}>
              <select id="timezone" value={local.timezone} onChange={(e) => setField("timezone", e.target.value)} className={controlClass}>
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, " ")} {/* `replace` con regex global: "Buenos_Aires" → "Buenos Aires" */}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="language" label={p.preferredLanguage}>
              <select id="language" value={local.language} onChange={(e) => setField("language", e.target.value)} className={controlClass}>
                {PREFERRED_LANGUAGES.map((code) => (
                  <option key={code} value={code}>
                    {p.preferredLanguages[code] ?? code}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* [Renderizado condicional]: `&&` (JS) → solo estudiantes ven el campo sección */}
          {isStudent && (
            <Field id="section" label={p.section} error={errors.section}>
              <input id="section" name="section" defaultValue={section ?? ""} maxLength={40} placeholder={p.sectionPlaceholder} className={controlClass} {...ariaFor("section", errors.section)} />
            </Field>
          )}
        </div>

        {/* [UX]: deshabilitado + texto de progreso mientras la action corre; aria-busy para tecnologías asistivas */}
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="btn btn-primary w-full"
        >
          {pending ? p.saving : p.save}
        </button>
      </form>
    </section>
  );
}

// [ariaFor]: atributos de error accesibles | [Principio]: DRY | `as const` (TS): literal true para el tipo de aria-invalid
function ariaFor(id: string, error?: string) {
  return error ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` } : {};
}

// [Field]: label + control + pista/error en un solo lugar | [Patrón]: Composite (molecule) | [Principio]: DRY
function Field({ id, label, hint, error, required, children }: { id: string; label: string; hint?: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[11px] font-semibold text-muted-foreground">
        {label}
        {required && <span aria-hidden="true"> *</span>} {/* aria-hidden: el asterisco es visual; `required` ya lo anuncia */}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-[10px] text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-[11px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
