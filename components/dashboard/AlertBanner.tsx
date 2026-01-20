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
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
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
        'rounded-lg border p-4 flex items-center gap-3',
        variantStyles[variant]
      )}
    >
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button size="sm" variant="outline" className="shrink-0">
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
