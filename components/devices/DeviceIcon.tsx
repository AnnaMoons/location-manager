import { cn } from '@/lib/utils';
import { Camera, Scale, Thermometer, Activity, Router } from 'lucide-react';
import { DeviceType } from '@/lib/types/device';

interface DeviceIconProps {
  type: DeviceType;
  className?: string;
}

const iconMap = {
  pigvision: Camera,
  scale: Scale,
  sensor: Thermometer,
  gateway: Router
};

export function DeviceIcon({ type, className }: DeviceIconProps) {
  const Icon = iconMap[type] || Activity;
  
  return <Icon className={cn("", className)} />;
}
