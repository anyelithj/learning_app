import * as React from "react";
import { cn } from "@/lib/utils";
// [Componente Input]: primitive accesible | [Patrón]: Atomic Design (atom) | [Principio]: SRP + LSP | [Paradigma]: Funcional + JSX

// [Props]: extiende input nativo para que `aria-*`, `name`, `type`, etc. funcionen sin envolver | [Principio]: LSP
export interface InputProps extends React.ComponentProps<"input"> {}

// [Estilos]: focus ring + estados invalid (aria-invalid) | [Buena práctica]: WCAG 2.1 AA
const baseClasses = [
  "flex h-11 w-full rounded-lg border border-input bg-card px-3.5 py-2 text-sm",
  "shadow-xs transition-colors",
  "placeholder:text-muted-foreground",
  "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15",
  "file:border-0 file:bg-transparent file:text-sm file:font-medium",
].join(" ");

// [forwardRef]: necesario para integraciones (RHF, Radix) | [Patrón]: Forwarding Ref
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(baseClasses, className)}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
