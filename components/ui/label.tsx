"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

/** Restyled with the DS's input-label token (same one used inside DS Input's own <label>). */
const LABEL_CLASSES = "text-xs font-semibold text-input-label peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(LABEL_CLASSES, className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
