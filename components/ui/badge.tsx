import * as React from "react";
import DsBadgeRaw from "@ds/components/atoms/Badge";

const DsBadge = DsBadgeRaw as React.ComponentType<any>;

/**
 * Adapter over the Asimetrix DS Badge (vendor/asimetrix-ds/components/atoms/Badge).
 * Keeps the old shadcn variant names so existing call sites don't need to change.
 */

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "info";

const VARIANT_MAP: Record<BadgeVariant, "crisis" | "caution" | "verdant" | "neutral" | "harbor" | "ghost"> = {
  default: "harbor",
  secondary: "neutral",
  destructive: "crisis",
  outline: "ghost",
  success: "verdant",
  warning: "caution",
  info: "neutral",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

function Badge({ variant = "default", ...props }: BadgeProps) {
  return <DsBadge variant={VARIANT_MAP[variant] ?? "neutral"} {...props} />;
}

export { Badge };
