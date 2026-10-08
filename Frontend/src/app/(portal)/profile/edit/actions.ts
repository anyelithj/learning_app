"use server"; // [Next.js]: directiva que convierte cada export en Server Action (se ejecuta solo en el servidor)
import { revalidatePath } from "next/cache"; // [Next.js]: invalida la caché de una ruta tras una mutación
import { z } from "zod"; // [Zod]: validación de esquemas en runtime con inferencia de tipos TS
import { updateMyProfile } from "@/lib/profile-api"; // [Facade]: cliente del backend NestJS PATCH /profile/me
import { fmt, type Dictionary } from "@/lib/i18n";
import { getServerDictionary } from "@/lib/i18n-server"; // [i18n]: mensajes en el idioma del usuario (cookie ui-lang)
// [Server Action perfil]: valida FormData y actualiza el perfil propio | [Patrón]: Command | [Principio]: SRP | [Paradigma]: Funcional + asíncrono
// [Por qué]: profile-api usa `cookies()` de next/headers (solo servidor); antes se llamaba desde un Client Component y rompía la página

// [Esquema]: misma regla que el backend (máx 80/80/40) con mensajes traducidos | [Patrón]: Factory (esquema por idioma)
function buildProfileSchema(t: Dictionary) {
  const max = (n: number) => fmt(t.common.max, { n }); // Closure (JS): mensaje con el límite concreto
  return z.object({
    firstName: z.string().trim().min(1, t.common.required).max(80, max(80)), // `trim` limpia espacios antes de validar
    lastName: z.string().trim().min(1, t.common.required).max(80, max(80)),
    section: z.string().trim().max(40, max(40)).optional(), // `optional` (Zod): docente/admin no envían sección
  });
}

// [Estado del formulario]: contrato entre la action y useActionState | `export type` (TS): tipo público, no genera JS
export type ProfileFormState = {
  status: "idle" | "success" | "error"; // [Union literal TS]: solo estos 3 valores son válidos (tipado seguro)
  message?: string; // `?` (TS): propiedad opcional
  fieldErrors?: Partial<Record<keyof z.infer<ReturnType<typeof buildProfileSchema>>, string>>; // [TS utility types]: error por campo, todos opcionales
};

// `export async function` (ES2017): función asíncrona exportada; React la invoca con (estadoPrevio, FormData)
export async function updateProfileAction(
  _prev: ProfileFormState, // `_` prefijo: parámetro requerido por la firma de useActionState pero no usado
  formData: FormData, // [Web API]: datos nativos del <form>, funciona incluso sin JavaScript (progressive enhancement)
): Promise<ProfileFormState> {
  // `safeParse` (Zod): valida sin lanzar excepción → devuelve { success, data | error }
  const t = await getServerDictionary();
  const parsed = buildProfileSchema(t).safeParse({
    firstName: formData.get("firstName") ?? "", // `??` (ES2020): string vacío si el campo no llegó
    lastName: formData.get("lastName") ?? "",
    section: formData.get("section") ?? undefined, // undefined si el input no se renderizó (no estudiante)
  });

  if (!parsed.success) {
    // `z.flattenError` (Zod 4): { fieldErrors: { campo: string[] } } → tomamos el primer mensaje de cada campo
    const f = z.flattenError(parsed.error).fieldErrors;
    return {
      status: "error",
      message: t.profile.fixFields,
      fieldErrors: { firstName: f.firstName?.[0], lastName: f.lastName?.[0], section: f.section?.[0] }, // `?.[0]` (ES2020): acceso seguro
    };
  }

  try {
    await updateMyProfile({ ...parsed.data, section: parsed.data.section || undefined }); // `...` spread (ES2018) | "" → undefined: no pisar con vacío
  } catch (err) {
    // `instanceof` (JS): estrecha el tipo unknown a Error para leer .message de forma segura
    return { status: "error", message: err instanceof Error ? err.message : t.profile.saveError };
  }

  revalidatePath("/profile/edit"); // [Next.js]: el próximo render trae los datos recién guardados
  return { status: "success", message: t.profile.saved };
}
