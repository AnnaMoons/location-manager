'use client';

import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  useDialogContext,
} from '@/components/ui/dialog';

/**
 * AlertDialog is just Dialog under a different name here — none of the 3 call sites use a
 * confirmation-specific DS Dialog variant (icon header etc.), they're plain text confirm dialogs.
 * AlertDialogAction/Cancel replicate Radix's real behavior on top of our Button: close after
 * onClick UNLESS the handler calls event.preventDefault() (Radix's own escape hatch for
 * "validate before closing" — honored here so callers that rely on it don't silently break).
 */

const AlertDialog = Dialog;
const AlertDialogTrigger = DialogTrigger;
const AlertDialogContent = DialogContent;
const AlertDialogHeader = DialogHeader;
const AlertDialogFooter = DialogFooter;
const AlertDialogTitle = DialogTitle;
const AlertDialogDescription = DialogDescription;

function AlertDialogAction({ onClick, ...props }: ButtonProps) {
  const ctx = useDialogContext();
  return (
    <Button
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx?.onOpenChange(false);
      }}
      {...props}
    />
  );
}

function AlertDialogCancel({ onClick, ...props }: ButtonProps) {
  const ctx = useDialogContext();
  return (
    <Button
      variant="outline"
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx?.onOpenChange(false);
      }}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
