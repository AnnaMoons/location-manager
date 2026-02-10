import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MapPin, Activity } from 'lucide-react';
import { Device } from '@/lib/types/device';
import { DeviceHealthBadge } from './DeviceHealthBadge';
import { DeviceIcon } from './DeviceIcon';

interface DeviceMiniCardProps {
  device: Device;
  className?: string;
}

export function DeviceMiniCard({ device, className }: DeviceMiniCardProps) {
  return (
    <Link 
      href={`/dispositivos/${device.id}`}
      className={cn(
        "block p-4 rounded-lg border bg-card hover:border-primary hover:shadow-sm transition-all",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <DeviceIcon type={device.type} className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-sm">{device.serialNumber}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {device.type}
            </p>
          </div>
        </div>
        <DeviceHealthBadge health={device.health} size="sm" />
      </div>
      
      {device.locationId && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{device.locationId}</span>
        </div>
      )}
      
      {device.lastSeen && (
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="w-3 h-3" />
          <span>Última vez: {formatLastSeen(device.lastSeen)}</span>
        </div>
      )}
    </Link>
  );
}

function formatLastSeen(lastSeen: string): string {
  const date = new Date(lastSeen);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'ahora';
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours} h`;
  if (diffDays < 7) return `hace ${diffDays} d`;
  return date.toLocaleDateString();
}
