import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Restyled with the Asimetrix DS input tokens (vendor/asimetrix-ds/components/atoms/Input
 * defines the same field look, but wraps it in its own label/wrapper div — this project's
 * call sites pair a bare <Input> with a separate <Label>, so we keep the flat <input>
 * contract and just apply the DS's semantic classes directly).
 */

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-input border border-input-border bg-input-bg px-3 text-sm text-input-fg",
          "transition-[border-color,box-shadow] duration-100",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-input-placeholder",
          "focus-visible:outline-none focus-visible:border-input-border-focus focus-visible:ring-2 focus-visible:ring-input-focus-ring",
          "disabled:cursor-not-allowed disabled:opacity-55 disabled:bg-input-disabled-bg",
          "aria-[invalid=true]:border-error aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-input-error-ring",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
