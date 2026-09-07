'use client';

import { Leaf, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AlertType } from '@/lib/types/alert';

interface AlertTypeBadgeProps {
  type: AlertType;
  size?: 'sm' | 'md';
}

export function AlertTypeBadge({ type, size = 'md' }: AlertTypeBadgeProps) {
  const isEnv = type === 'environmental';
  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold shrink-0',
        size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-0.75 text-micro',
        isEnv ? 'bg-success-light text-success' : 'bg-product-pigvision/40 text-fg-secondary'
      )}
    >
      {isEnv
        ? <Leaf size={iconSize} />
        : <Eye size={iconSize} />
      }
      {isEnv ? 'Medioambiental' : 'Pig Vision'}
    </span>
  );
}
