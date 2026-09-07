import * as React from "react";
import DsButtonRaw from "@ds/components/atoms/Button";
import { cn } from "@/lib/utils";

// The DS component is plain JSX (no TypeScript); cast it so TS doesn't
// mis-infer strict/required prop shapes from the untyped source.
const DsButton = DsButtonRaw as React.ComponentType<any>;

/**
 * Adapter over the Asimetrix DS Button (vendor/asimetrix-ds/components/atoms/Button).
 * Keeps the old shadcn variant/size names so the ~70 existing call sites don't
 * need to change; every render actually goes through the real DS component.
 */

export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

const VARIANT_MAP: Record<ButtonVariant, "accent" | "neutral" | "ghost" | "destructive"> = {
  default: "accent",
  destructive: "destructive",
  outline: "neutral",
  secondary: "neutral",
  ghost: "ghost",
  link: "ghost",
};

const SIZE_MAP: Record<ButtonSize, "sm" | "md" | "lg"> = {
  default: "md",
  sm: "sm",
  lg: "lg",
  icon: "md",
};

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    React.RefAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  as?: React.ElementType;
  href?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
}

function Button({
  variant = "default",
  size = "default",
  className,
  as,
  ...props
}: ButtonProps) {
  return (
    <DsButton
      as={as}
      variant={VARIANT_MAP[variant] ?? "accent"}
      size={SIZE_MAP[size] ?? "md"}
      iconOnly={size === "icon"}
      className={cn(variant === "link" && "underline underline-offset-4", className)}
      {...props}
    />
  );
}

/**
 * Compat shim for components/ui/alert-dialog.tsx, replaced wholesale in Fase 3
 * when AlertDialog is migrated to the DS Dialog organism.
 */
export function buttonVariants({ variant = "default" as ButtonVariant } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-1.5 font-semibold rounded-md border-[1.5px] px-4.5 h-9 text-sm cursor-pointer",
    variant === "destructive"
      ? "bg-button-destructive-bg text-button-destructive-fg border-button-destructive-bg"
      : variant === "outline" || variant === "secondary" || variant === "ghost"
        ? "bg-transparent text-button-neutral-fg border-button-neutral-border"
        : "bg-button-accent-bg text-button-accent-fg border-button-accent-border",
  );
}

export { Button };
