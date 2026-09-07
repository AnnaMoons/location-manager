'use client';

import Link from 'next/link';
import { Bell, ChevronRight } from 'lucide-react';
import { useData } from '@/lib/context/DataContext';
import { cn } from '@/lib/utils';

interface AlertsEntryPointProps {
  locationId?: string;
  deviceId?: string;
}

export function AlertsEntryPoint({ locationId, deviceId }: AlertsEntryPointProps) {
  const { alerts } = useData();

  const relevant = alerts.filter((a) => {
    if (deviceId) return a.deviceId === deviceId;
    if (locationId) return a.locationId === locationId;
    return false;
  });

  const activeCount = relevant.filter((a) => a.active).length;

  const params = new URLSearchParams();
  if (locationId) params.set('location', locationId);
  if (deviceId) params.set('device', deviceId);
  const href = `/alertas?${params.toString()}`;

  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3.5 py-2.5 border border-line rounded-lg bg-surface-elevated no-underline transition-[border-color] hover:border-brand-primary"
    >
      <Bell size={16} className="text-brand-primary shrink-0" />
      <span className="flex-1 text-sm text-fg font-medium">
        Alertas
      </span>
      {relevant.length > 0 ? (
        <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', activeCount > 0 ? 'text-brand-primary' : 'text-fg-placeholder')}>
          <span className={cn('w-1.75 h-1.75 rounded-full', activeCount > 0 ? 'bg-success' : 'bg-fg-placeholder')} />
          {relevant.length} {relevant.length === 1 ? 'alerta' : 'alertas'}
        </span>
      ) : (
        <span className="text-xs text-fg-placeholder">Sin alertas</span>
      )}
      <ChevronRight size={14} className="text-fg-placeholder shrink-0" />
    </Link>
  );
}
