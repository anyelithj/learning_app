"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category, CreateQuizInput, Difficulty, Language, QuestionType, Quiz } from "@/types/quiz";
// [Página crear quiz]: form RHF + Zod + idioma EN/ES | [Patrón]: Container/Presentational + Composite | [Principio]: SRP + DRY | [Paradigma]: Funcional + Reactivo + Declarativo

// [Schema Zod alineado con backend CreateQuizDto]: validación cliente + tipos exactos | [Patrón]: SSOT
const questionSchema = z
  .object({
    text: z.string().trim().min(1, "El enunciado es obligatorio").max(1000),
    type: z.enum(["multiple_choice", "true_false", "open_answer"]),
    options: z
      .array(z.string().trim().min(1, "Opción vacía"))
      .max(6, "Máximo 6 opciones")
      .optional(),
    correctAnswer: z.string().trim().min(1, "Respuesta correcta obligatoria").max(1000),
    difficulty: z.enum(["easy", "medium", "hard"]),
    timeLimitSeconds: z.coerce.number().int().min(5).optional(),
  })
  // [Validación cruzada]: si type=multiple_choice, options requerido y correctAnswer debe estar en options
  .superRefine((q, ctx) => {
    if (q.type === "multiple_choice") {
      if (!q.options || q.options.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message: "Multiple choice requiere al menos 2 opciones",
        });
      } else if (!q.options.includes(q.correctAnswer)) {
        ctx.addIssue({
          code: "custom",
          path: ["correctAnswer"],
          message: "La respuesta correcta debe estar entre las opciones",
        });
      }
    }
    if (q.type === "true_false") {
      const allowed = ["true", "false", "True", "False", "verdadero", "falso"];
      if (!allowed.includes(q.correctAnswer.toLowerCase())) {
        ctx.addIssue({
          code: "custom",
          path: ["correctAnswer"],
          message: "Para true/false la respuesta debe ser 'true' o 'false'",
        });
      }
    }
  });

const createQuizSchema = z.object({
  title: z.string().trim().min(3, "Mínimo 3 caracteres").max(160),
  description: z.string().trim().max(2000).optional(),
  category: z.enum([
    "general",
    "science",
    "history",
    "geography",
    "sports",
    "entertainment",
    "technology",
    "math",
    "art",
    "custom",
  ]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  // [Selector idioma]: aplica a quiz completo; si en el futuro hay preguntas EN/ES mezcladas se override por pregunta
  language: z.enum(["en", "es"]),
  timePerQuestionSeconds: z.coerce.number().int().min(0).max(600).optional(),
  isPublished: z.boolean().optional(),
  questions: z.array(questionSchema).min(1, "Agrega al menos una pregunta"),
});

type CreateQuizForm = z.input<typeof createQuizSchema>;

// [Listas para selects]: SSOT con enums backend | [Principio]: DRY
const CATEGORIES: Array<{ value: Category; label: string }> = [
  { value: "general", label: "General" },
  { value: "science", label: "Ciencia" },
  { value: "history", label: "Historia" },
  { value: "geography", label: "Geografía" },
  { value: "sports", label: "Deportes" },
  { value: "entertainment", label: "Entretenimiento" },
  { value: "technology", label: "Tecnología" },
  { value: "math", label: "Matemáticas" },
  { value: "art", label: "Arte" },
  { value: "custom", label: "Personalizada" },
];

const DIFFICULTIES: Array<{ value: Difficulty; label: string }> = [
  { value: "easy", label: "Fácil" },
  { value: "medium", label: "Media" },
  { value: "hard", label: "Difícil" },
];

const LANGUAGES: Array<{ value: Language; label: string }> = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
];

const QUESTION_TYPES: Array<{ value: QuestionType; label: string }> = [
  { value: "multiple_choice", label: "Opción múltiple" },
  { value: "true_false", label: "Verdadero / Falso" },
  { value: "open_answer", label: "Respuesta abierta" },
];

// [Clases reutilizables]: Tailwind compartido entre selects e inputs | [Principio]: DRY
const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function CreateQuizPage() {
  const router = useRouter();
  // [Estado submit]: separado del form para mostrar error de red sin contaminar Zod | [Principio]: SRP
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateQuizForm>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "general",
      difficulty: "medium",
      language: "es",
      timePerQuestionSeconds: 30,
      isPublished: false,
      questions: [
        {
          text: "",
          type: "multiple_choice",
          options: ["", "", "", ""],
          correctAnswer: "",
          difficulty: "medium",
        },
      ],
    } as CreateQuizForm,
  });

  // [useFieldArray]: lista dinámica de preguntas | [Patrón]: Composite
  const { fields, append, remove } = useFieldArray({ control, name: "questions" });

  const watchedQuestions = watch("questions");

  // [onSubmit]: ya validado por Zod; llama API y redirige | [Principio]: SRP
  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const payload: CreateQuizInput = {
        title: values.title,
        description: values.description || undefined,
        category: values.category,
        difficulty: values.difficulty,
        language: values.language,
        timePerQuestionSeconds: values.timePerQuestionSeconds,
        isPublished: values.isPublished,
        questions: values.questions.map((q) => ({
          text: q.text,
          type: q.type,
          options: q.type === "multiple_choice" ? q.options : undefined,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
          timeLimitSeconds: q.timeLimitSeconds,
        })),
      };
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json()) as { message?: string };
        throw new Error(body.message ?? `HTTP ${res.status}`);
      }
      const created = (await res.json()) as Quiz;
      router.push(`/quiz/${created.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al crear quiz");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Crear quiz</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define el contenido, idioma y preguntas. Las preguntas en español se almacenan tal cual; las traducciones desde OpenTrivia se hacen al traer trivia externa.
        </p>
      </header>

      {submitError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {submitError}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        {/* [Sección metadatos del quiz]: título, descripción, categoría, dificultad, idioma | [Patrón]: Composite */}
        <section className="space-y-4 rounded-lg border bg-card p-5">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" autoComplete="off" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="category">Categoría *</Label>
              <select id="category" className={selectClass} {...register("category")}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="difficulty">Dificultad *</Label>
              <select id="difficulty" className={selectClass} {...register("difficulty")}>
                {DIFFICULTIES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* [Selector idioma]: aplica al quiz completo | [Patrón]: Default Policy */}
            <div className="space-y-1.5">
              <Label htmlFor="language">Idioma *</Label>
              <select
                id="language"
                className={selectClass}
                aria-describedby="language-help"
                {...register("language")}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
              <p id="language-help" className="text-xs text-muted-foreground">
                Idioma del contenido del quiz.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="timePerQuestionSeconds">Tiempo por pregunta (s)</Label>
              <Input
                id="timePerQuestionSeconds"
                type="number"
                min={0}
                {...register("timePerQuestionSeconds")}
              />
            </div>
            <div className="flex items-end gap-2">
              <input
                id="isPublished"
                type="checkbox"
                className="h-4 w-4 rounded border-input"
                {...register("isPublished")}
              />
              <Label htmlFor="isPublished" className="cursor-pointer">
                Publicar inmediatamente
              </Label>
            </div>
          </div>
        </section>

        {/* [Sección preguntas dinámicas]: array RHF | [Patrón]: Composite */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Preguntas</h2>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                append({
                  text: "",
                  type: "multiple_choice",
                  options: ["", "", "", ""],
                  correctAnswer: "",
                  difficulty: "medium",
                })
              }
            >
              + Añadir pregunta
            </Button>
          </div>

          {errors.questions && typeof errors.questions.message === "string" && (
            <p className="text-xs text-destructive">{errors.questions.message}</p>
          )}

          {fields.map((field, idx) => {
            const currentType = watchedQuestions?.[idx]?.type ?? "multiple_choice";
            return (
              <article
                key={field.id}
                className="space-y-3 rounded-lg border bg-card p-5"
                aria-label={`Pregunta ${idx + 1}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Pregunta #{idx + 1}
                  </h3>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => remove(idx)}
                      aria-label={`Eliminar pregunta ${idx + 1}`}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`q-${idx}-text`}>Enunciado *</Label>
                  <Input id={`q-${idx}-text`} {...register(`questions.${idx}.text` as const)} />
                  {errors.questions?.[idx]?.text && (
                    <p className="text-xs text-destructive">
                      {errors.questions[idx]?.text?.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`q-${idx}-type`}>Tipo *</Label>
                    <select
                      id={`q-${idx}-type`}
                      className={selectClass}
                      {...register(`questions.${idx}.type` as const, {
                        onChange: (e) => {
                          // [Resetea options cuando cambia de tipo]: evita validación cruzada inconsistente | [Principio]: Robustez
                          if (e.target.value !== "multiple_choice") {
                            setValue(`questions.${idx}.options`, undefined);
                          } else {
                            setValue(`questions.${idx}.options`, ["", "", "", ""]);
                          }
                          setValue(`questions.${idx}.correctAnswer`, "");
                        },
                      })}
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`q-${idx}-difficulty`}>Dificultad *</Label>
                    <select
                      id={`q-${idx}-difficulty`}
                      className={selectClass}
                      {...register(`questions.${idx}.difficulty` as const)}
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* [Bloque condicional por tipo]: Strategy de UI según questionType | [Patrón]: Strategy UI */}
                {currentType === "multiple_choice" && (
                  <div className="space-y-2">
                    <Label>Opciones *</Label>
                    {[0, 1, 2, 3].map((optIdx) => (
                      <Input
                        key={optIdx}
                        placeholder={`Opción ${optIdx + 1}`}
                        {...register(`questions.${idx}.options.${optIdx}` as const)}
                      />
                    ))}
                    {errors.questions?.[idx]?.options && (
                      <p className="text-xs text-destructive">
                        {errors.questions[idx]?.options?.message as string}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor={`q-${idx}-correctAnswer`}>
                    Respuesta correcta *{" "}
                    {currentType === "true_false" && (
                      <span className="text-xs text-muted-foreground">(true / false)</span>
                    )}
                  </Label>
                  <Input
                    id={`q-${idx}-correctAnswer`}
                    {...register(`questions.${idx}.correctAnswer` as const)}
                  />
                  {errors.questions?.[idx]?.correctAnswer && (
                    <p className="text-xs text-destructive">
                      {errors.questions[idx]?.correctAnswer?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`q-${idx}-timeLimit`}>Tiempo límite (s, opcional)</Label>
                  <Input
                    id={`q-${idx}-timeLimit`}
                    type="number"
                    min={5}
                    {...register(`questions.${idx}.timeLimitSeconds` as const)}
                  />
                </div>
              </article>
            );
          })}
        </section>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Crear quiz"}
          </Button>
        </div>
      </form>
    </main>
  );
}
