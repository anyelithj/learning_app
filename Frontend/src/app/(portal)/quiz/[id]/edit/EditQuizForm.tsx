"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// [EditQuizForm]: edita quiz completo (metadatos + preguntas) | [Patron]: Presentational + Composite | [Principio]: SRP

const questionSchema = z
  .object({
    text: z.string().trim().min(1, "Enunciado obligatorio").max(1000),
    type: z.enum(["multiple_choice", "true_false", "open_answer"]),
    options: z.array(z.string().trim().min(1, "Opción vacía")).max(6).optional(),
    correctAnswer: z.string().trim().min(1, "Respuesta correcta obligatoria").max(1000),
    difficulty: z.enum(["easy", "medium", "hard"]),
    timeLimitSeconds: z.coerce.number().int().min(5).optional(),
  })
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

const editQuizSchema = z.object({
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
  timePerQuestionSeconds: z.coerce.number().int().min(0).max(600),
  isPublished: z.boolean(),
  questions: z.array(questionSchema).min(1, "Agrega al menos una pregunta"),
});

type EditQuizForm = z.input<typeof editQuizSchema>;

const CATEGORIES = [
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
] as const;

const DIFFICULTIES = [
  { value: "easy", label: "Fácil" },
  { value: "medium", label: "Media" },
  { value: "hard", label: "Difícil" },
] as const;

const QUESTION_TYPES = [
  { value: "multiple_choice", label: "Opción múltiple" },
  { value: "true_false", label: "Verdadero / Falso" },
  { value: "open_answer", label: "Respuesta abierta" },
] as const;

const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export interface EditQuizFormProps {
  quizId: string;
  initialTitle: string;
  initialDescription: string;
  initialCategory: EditQuizForm["category"];
  initialDifficulty: EditQuizForm["difficulty"];
  initialTimePerQuestionSeconds: number;
  initialIsPublished: boolean;
  initialQuestions: Array<{
    text: string;
    type: "multiple_choice" | "true_false" | "open_answer";
    options?: string[];
    correctAnswer: string;
    difficulty: "easy" | "medium" | "hard";
    timeLimitSeconds?: number;
  }>;
}

export function EditQuizForm({
  quizId,
  initialTitle,
  initialDescription,
  initialCategory,
  initialDifficulty,
  initialTimePerQuestionSeconds,
  initialIsPublished,
  initialQuestions,
}: EditQuizFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditQuizForm>({
    resolver: zodResolver(editQuizSchema),
    defaultValues: {
      title: initialTitle,
      description: initialDescription,
      category: initialCategory,
      difficulty: initialDifficulty,
      timePerQuestionSeconds: initialTimePerQuestionSeconds,
      isPublished: initialIsPublished,
      questions: initialQuestions.map((q) => ({
        text: q.text,
        type: q.type,
        options: q.options ?? (q.type === "multiple_choice" ? ["", "", "", ""] : undefined),
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        timeLimitSeconds: q.timeLimitSeconds,
      })),
    } as EditQuizForm,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "questions" });
  const watchedQuestions = watch("questions");

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const payload = {
        title: values.title,
        description: values.description || undefined,
        category: values.category,
        difficulty: values.difficulty,
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
      const res = await fetch(`/api/quiz/${quizId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json()) as { message?: string };
        throw new Error(body.message ?? `HTTP ${res.status}`);
      }
      router.push(`/quiz/${quizId}`);
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {submitError && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {submitError}
        </div>
      )}

      {/* [Metadatos] */}
      <section className="space-y-4 rounded-lg border bg-card p-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Título *</Label>
          <Input id="title" autoComplete="off" {...register("title")} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Descripción</Label>
          <textarea
            id="description"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register("description")}
          />
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
          <div className="space-y-1.5">
            <Label htmlFor="timePerQuestionSeconds">Tiempo/preg. (s)</Label>
            <Input
              id="timePerQuestionSeconds"
              type="number"
              min={0}
              max={600}
              {...register("timePerQuestionSeconds")}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isPublished"
            type="checkbox"
            className="h-4 w-4 rounded border-input"
            {...register("isPublished")}
          />
          <Label htmlFor="isPublished" className="cursor-pointer">
            Publicado
          </Label>
        </div>
      </section>

      {/* [Preguntas dinámicas] */}
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
            <article key={field.id} className="space-y-3 rounded-lg border bg-card p-5">
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

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
