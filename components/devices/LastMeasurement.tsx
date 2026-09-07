'use client';

import { DeviceMeasurement } from '@/lib/types/device';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface LastMeasurementProps {
  measurement: DeviceMeasurement;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LastMeasurement({ 
  measurement, 
  showIcon = false,
  size = 'md',
  className 
}: LastMeasurementProps) {
  const { value, unit, timestamp } = measurement;

  // Format relative time
  const getRelativeTime = () => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Ahora';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours} h`;
      if (diffDays === 1) return 'Ayer';
      if (diffDays < 7) return `Hace ${diffDays} días`;
      
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return timestamp;
    }
  };

  // Format absolute time
  const getAbsoluteTime = () => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  // Format value
  const formatValue = () => {
    if (unit === '°C') return `${value.toFixed(1)} ${unit}`;
    if (unit === 'kg') return `${value.toFixed(1)} ${unit}`;
    if (unit === '%' || unit === 'ppm') return `${Math.round(value)} ${unit}`;
    return `${value.toFixed(1)} ${unit}`;
  };

  // Check if reading is stale (>1 hour for sensors, >24h for scales)
  const isStale = () => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffHours = (now.getTime() - date.getTime()) / 3600000;
      
      // Sensors should update frequently
      if (unit === '°C' || unit === '%' || unit === 'ppm') {
        return diffHours > 1;
      }
      
      // Weight measurements can be less frequent
      if (unit === 'kg') {
        return diffHours > 24;
      }
      
      return diffHours > 2;
    } catch {
      return false;
    }
  };

  const sizeClasses = {
    sm: {
      value: 'text-xs',
      time: 'text-2xs',
      icon: 'h-3 w-3',
    },
    md: {
      value: 'text-sm',
      time: 'text-xs',
      icon: 'h-3.5 w-3.5',
    },
    lg: {
      value: 'text-base',
      time: 'text-sm',
      icon: 'h-4 w-4',
    },
  };

  const stale = isStale();

  return (
    <div className={cn('flex flex-col', className)}>
      <div className={cn(
        'font-medium tabular-nums',
        stale ? 'text-fg-tertiary' : 'text-fg',
        sizeClasses[size].value
      )}>
        {formatValue()}
      </div>
      <div className={cn(
        'flex items-center gap-1',
        stale ? 'text-warning' : 'text-fg-tertiary',
        sizeClasses[size].time
      )}>
        {showIcon && <Clock className={sizeClasses[size].icon} />}
        <span title={getAbsoluteTime()}>
          {getRelativeTime()}
        </span>
      </div>
      <div className={cn(
        'text-fg-tertiary/70',
        'text-2xs',
        'leading-tight'
      )}>
        {getAbsoluteTime()}
      </div>
    </div>
  );
}
