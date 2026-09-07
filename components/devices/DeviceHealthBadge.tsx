import { cn } from '@/lib/utils';
import { DeviceHealth } from '@/lib/types/device';

interface DeviceHealthBadgeProps {
  health: DeviceHealth;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const healthConfig = {
  online: {
    label: 'En línea',
    color: 'bg-success',
    textColor: 'text-success',
    bgColor: 'bg-success-light',
    borderColor: 'border-success/40'
  },
  offline: {
    label: 'Sin conexión',
    color: 'bg-error',
    textColor: 'text-error',
    bgColor: 'bg-error-light',
    borderColor: 'border-error/40'
  },
  unknown: {
    label: 'Desconocido',
    color: 'bg-fg-placeholder',
    textColor: 'text-fg-tertiary',
    bgColor: 'bg-surface-2',
    borderColor: 'border-line'
  }
};

const sizeConfig = {
  sm: 'w-2 h-2 text-xs',
  md: 'w-2.5 h-2.5 text-sm',
  lg: 'w-3 h-3 text-base'
};

export function DeviceHealthBadge({ 
  health, 
  size = 'md',
  className 
}: DeviceHealthBadgeProps) {
  const config = healthConfig[health];
  const sizeClasses = sizeConfig[size];

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-1 rounded-full border",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <span className={cn("rounded-full", config.color, sizeClasses)} />
      <span className={cn("font-medium", config.textColor, size === 'sm' ? 'text-xs' : 'text-sm')}>
        {config.label}
      </span>
    </div>
  );
}
