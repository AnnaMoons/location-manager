'use client';

import * as React from 'react';
import DsDialogRaw from '@ds/components/organisms/Dialog';

const DsDialog = DsDialogRaw as React.ComponentType<any>;

/**
 * Compound adapter over the Asimetrix DS Dialog organism (vendor/asimetrix-ds/components/organisms/Dialog).
 * DS's Dialog is a single props-driven component (title/children/primaryAction/secondaryAction — the
 * latter two auto-close right after firing onClick) rather than Radix's composable Trigger/Content/
 * Header/Footer. Every call site here runs an async submit that must only close on success, so footer
 * buttons stay as caller-owned <Button>s rendered inside the DS body instead of DS's auto-closing action
 * props. DialogHeader/Footer/Title/Description are extracted from children and reassembled into the DS
 * Dialog's `title` + `children`, so none of the ~8 existing call sites need to change.
 */

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const DialogContext = React.createContext<DialogContextValue | null>(null);

/** Exposed so alert-dialog.tsx can auto-close on Action/Cancel click, like Radix did. */
export function useDialogContext() {
  return React.useContext(DialogContext);
}

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>;
}

function DialogTrigger({ children }: { asChild?: boolean; children: React.ReactNode }) {
  const ctx = React.useContext(DialogContext);
  if (!React.isValidElement<{ onClick?: (e: React.MouseEvent) => void }>(children)) {
    return <>{children}</>;
  }
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e);
      ctx?.onOpenChange(true);
    },
  });
}

interface MarkerProps {
  children?: React.ReactNode;
  className?: string;
}
const DialogHeader = ({ children }: MarkerProps) => <>{children}</>;
const DialogFooter = ({ children }: MarkerProps) => <>{children}</>;
const DialogTitle = ({ children }: MarkerProps) => <>{children}</>;
const DialogDescription = ({ children }: MarkerProps) => <>{children}</>;

const MAX_W_PX: Record<string, number> = {
  sm: 384, md: 448, lg: 512, xl: 576, '2xl': 672, '3xl': 768, '4xl': 896,
};

function widthFromClassName(className?: string): number {
  const match = className?.match(/max-w-(sm|md|lg|xl|2xl|3xl|4xl)\b/);
  return (match && MAX_W_PX[match[1]]) || 480;
}

function isType(node: React.ReactNode, type: unknown): node is React.ReactElement {
  return React.isValidElement(node) && node.type === type;
}

function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(DialogContext);
  if (!ctx) return null;

  let title: React.ReactNode = null;
  let description: React.ReactNode = null;
  let footer: React.ReactNode = null;
  const body: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (isType(child, DialogHeader)) {
      React.Children.forEach(child.props.children, (headerChild) => {
        if (isType(headerChild, DialogTitle)) title = headerChild.props.children;
        else if (isType(headerChild, DialogDescription)) description = headerChild.props.children;
        else body.push(headerChild);
      });
    } else if (isType(child, DialogFooter)) {
      footer = child.props.children;
    } else {
      body.push(child);
    }
  });

  return (
    <DsDialog
      open={ctx.open}
      onClose={() => ctx.onOpenChange(false)}
      title={title}
      maxWidth={widthFromClassName(className)}
    >
      <div className="space-y-4">
        {description && <p className="text-sm text-fg-tertiary">{description}</p>}
        {body}
      </div>
      {footer && (
        <div className="sticky bottom-0 -mx-6 mt-4 flex flex-col-reverse gap-2 border-t border-line bg-dialog-panel-bg px-6 pb-1 pt-4 sm:flex-row sm:justify-end sm:gap-3">
          {footer}
        </div>
      )}
    </DsDialog>
  );
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
