'use client';

import { cn } from '@/lib/utils';

interface SerialNumberProps {
  serial: string;
  className?: string;
  showShortId?: boolean;
  emphasizeLastDigits?: boolean;
}

/**
 * H-018: Displays a serial number with the last 4 characters visually emphasized.
 * Can also show only last 4 digits for compact displays.
 */
export function SerialNumber({
  serial,
  className = '',
  showShortId = false,
  emphasizeLastDigits = true,
}: SerialNumberProps) {
  if (serial.length <= 4) {
    return <span className={cn('font-mono font-bold', className)}>{serial}</span>;
  }

  const prefix = serial.slice(0, -4);
  const suffix = serial.slice(-4);

  // Short ID mode: Only show last 4 digits with a prefix indicator
  if (showShortId) {
    return (
      <span className={cn('font-mono', className)} title={serial}>
        <span className="text-muted-foreground text-[10px]">···</span>
        <span className="font-bold text-foreground">{suffix}</span>
      </span>
    );
  }

  // Full serial with emphasis on last 4 digits
  if (emphasizeLastDigits) {
    return (
      <span className={cn('font-mono', className)} title={serial}>
        <span className="text-muted-foreground/70">{prefix}</span>
        <span className="font-bold text-foreground">{suffix}</span>
      </span>
    );
  }

  // Plain display
  return <span className={cn('font-mono', className)}>{serial}</span>;
}
