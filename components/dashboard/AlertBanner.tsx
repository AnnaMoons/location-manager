'use client';

import Link from 'next/link';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AlertBannerProps {
  variant?: 'warning' | 'error' | 'info';
  message: string;
  actionLabel?: string;
  actionHref?: string;
  dismissible?: boolean;
}

const variantStyles = {
  warning: 'bg-warning-light border-warning text-warning-dark',
  error: 'bg-error-light border-error text-error',
  info: 'bg-surface-blue border-brand-primary/30 text-brand-primary',
};

export function AlertBanner({
  variant = 'warning',
  message,
  actionLabel,
  actionHref,
  dismissible = true,
}: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-2.5 flex items-center gap-2.5',
        variantStyles[variant]
      )}
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <p className="flex-1 text-sm">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button size="sm" variant="outline" className="shrink-0 h-7 text-xs px-3">
            {actionLabel}
          </Button>
        </Link>
      )}
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-black/5 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
