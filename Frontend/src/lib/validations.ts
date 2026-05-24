import { z } from "zod";
// [Validaciones Zod]: schemas runtime usados en formularios + Route Handlers | [Patrón]: Schema Validation | [Principio]: SSOT + DRY | [Paradigma]: Funcional + Declarativo

// [Login]: mismas reglas que backend NestJS LoginDto
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Formato de correo inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  // [remember]: optional sin default — evita mismatch input/output con zodResolver | [Principio]: KISS
  remember: z.boolean().optional(),
});

// [Tipo del FORM]: usa z.input (boolean | undefined) — RHF necesita la forma del input, no del output post-default
export type LoginInput = z.input<typeof loginSchema>;

// [Register]: regex coincide con backend (upper + lower + digit) | [Principio]: SSOT
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "El nombre es obligatorio")
      .max(80, "Nombre demasiado largo"),
    lastName: z
      .string()
      .trim()
      .min(1, "El apellido es obligatorio")
      .max(80, "Apellido demasiado largo"),
    email: z
      .string()
      .min(1, "El correo es obligatorio")
      .email("Formato de correo inválido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(128, "Máximo 128 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        "Debe incluir mayúscula, minúscula y dígito",
      ),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      message: "Debes aceptar los términos para continuar",
    }),
  })
  // [refine]: validación cruzada (password === confirmPassword) | [Principio]: DRY
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
