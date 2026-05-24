"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { AUTH_ROUTES } from "@/lib/constants";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
// [RegisterForm]: form crear cuenta | [Patrón]: Presentational + Container | [Principio]: SRP | [Paradigma]: Funcional + Reactivo

export function RegisterForm() {
  const { register: registerUser, isLoading, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: undefined as unknown as true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await registerUser({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-[420px] space-y-5"
      noValidate
      aria-label="Formulario de registro"
    >
      <header className="mb-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Crear cuenta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Regístrate gratis en NeuroEdu IA.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* [Nombre + Apellido]: grid 2 cols como en Demohtml */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">Nombre</Label>
          <Input
            id="firstName"
            autoComplete="given-name"
            placeholder="Nombre"
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
            {...register("firstName")}
          />
          {errors.firstName && (
            <p id="firstName-error" role="alert" className="text-xs text-destructive">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Apellido</Label>
          <Input
            id="lastName"
            autoComplete="family-name"
            placeholder="Apellido"
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
            {...register("lastName")}
          />
          {errors.lastName && (
            <p id="lastName-error" role="alert" className="text-xs text-destructive">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* [Email] */}
      <div className="space-y-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Correo electrónico"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-xs text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* [Password + Confirm] */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password && (
            <p id="password-error" role="alert" className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirmar</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword ? "confirmPassword-error" : undefined
            }
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p
              id="confirmPassword-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      {/* [Terms] */}
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          className="mt-0.5 size-4 rounded border-input accent-primary"
          aria-invalid={!!errors.acceptTerms}
          {...register("acceptTerms")}
        />
        <span>
          Acepto los{" "}
          <Link
            href={AUTH_ROUTES.terms}
            className="font-semibold text-primary hover:text-primary-dark"
          >
            términos y la política de privacidad
          </Link>
        </span>
      </label>
      {errors.acceptTerms && (
        <p role="alert" className="text-xs text-destructive -mt-3">
          {errors.acceptTerms.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-brand text-white hover:opacity-90 h-11"
      >
        {isLoading ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground my-5">
        <span className="flex-1 h-px bg-border" />
        o regístrate con
        <span className="flex-1 h-px bg-border" />
      </div>

      <OAuthButtons />

      <p className="text-center text-sm text-muted-foreground mt-5">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={AUTH_ROUTES.login}
          className="font-semibold text-primary hover:text-primary-dark"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
