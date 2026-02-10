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
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  offline: {
    label: 'Sin conexión',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  unknown: {
    label: 'Desconocido',
    color: 'bg-gray-400',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
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
