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
  default: 'bg-primary/10 text-primary',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  destructive: 'bg-red-100 text-red-700',
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
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground/80 mt-0.5 leading-tight">{description}</p>
          )}
          <p className="text-2xl font-bold mt-1.5">{value}</p>
          {helpText && (
            <p className="text-xs text-muted-foreground/70 mt-1 leading-snug">{helpText}</p>
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
      <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
        <Link href={href} className="block">
          {content}
        </Link>
      </Card>
    );
  }

  return <Card>{content}</Card>;
}
