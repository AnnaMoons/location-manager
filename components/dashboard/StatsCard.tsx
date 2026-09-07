'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  href?: string;
  description?: string;
  helpText?: string;
}

const variantStyles = {
  default: 'bg-brand-primary/10 text-brand-primary',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning-dark',
  destructive: 'bg-error-light text-error',
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  variant = 'default',
  href,
  description,
  helpText,
}: StatsCardProps) {
  const content = (
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-fg-tertiary">{title}</p>
          {description && (
            <p className="text-xs text-fg-tertiary/80 mt-0.5 leading-tight">{description}</p>
          )}
          <p className="text-2xl font-bold mt-1.5">{value}</p>
          {helpText && (
            <p className="text-xs text-fg-tertiary/70 mt-1 leading-snug">{helpText}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-full shrink-0 ml-3', variantStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  );

  if (href) {
    return (
      <Card className="transition-colors hover:bg-surface-2/50 cursor-pointer">
        <Link href={href} className="block">
          {content}
        </Link>
      </Card>
    );
  }

  return <Card>{content}</Card>;
}
