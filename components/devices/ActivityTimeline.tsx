'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { DeviceHistoryEntry, DeviceState } from '@/lib/types/device';
import { 
  Plus, 
  MapPin, 
  MapPinOff, 
  Settings, 
  RefreshCw,
  AlertCircle,
  ShieldOff,
  RotateCcw,
  Wrench,
  Skull,
  ShoppingCart,
  CheckCircle2
} from 'lucide-react';

interface ActivityTimelineProps {
  history: DeviceHistoryEntry[];
  className?: string;
}

const actionConfig = {
  created: { icon: Plus, color: 'text-brand-primary' },
  sold: { icon: ShoppingCart, color: 'text-success' },
  configured: { icon: Settings, color: 'text-brand-primary' },
  activated: { icon: CheckCircle2, color: 'text-success' },
  disabled: { icon: ShieldOff, color: 'text-warning-dark' },
  returned: { icon: RotateCcw, color: 'text-warning-dark' },
  repaired: { icon: Wrench, color: 'text-success' },
  killed: { icon: Skull, color: 'text-error' },
  state_changed: { icon: RefreshCw, color: 'text-fg-tertiary' },
  location_changed: { icon: MapPin, color: 'text-brand-primary' },
};

export function ActivityTimeline({ history, className }: ActivityTimelineProps) {
  const t = useTranslations('devices');

  if (!history || history.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <AlertCircle className="w-8 h-8 text-fg-tertiary mx-auto mb-2" />
        <p className="text-sm text-fg-tertiary">{t('history.noHistory')}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {history.map((entry, index) => {
        const config = actionConfig[entry.action] || actionConfig.state_changed;
        const Icon = config.icon;
        
        return (
          <div key={entry.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                "bg-surface-2 border-2 border-white shadow-sm",
                config.color
              )}>
                <Icon className="w-4 h-4" />
              </div>
              {index < history.length - 1 && (
                <div className="w-0.5 flex-1 bg-surface-2 my-2" />
              )}
            </div>
            
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {t(`history.actions.${entry.action}`)}
                </span>
                <span className="text-xs text-fg-tertiary">
                  {formatDate(entry.timestamp)}
                </span>
              </div>
              
              {entry.details && (
                <div className="mt-1 text-sm text-fg-tertiary">
                  {entry.details.fromState && entry.details.toState && (
                    <span>
                      {t(`states.${entry.details.fromState}`) || entry.details.fromState} → {t(`states.${entry.details.toState}`) || entry.details.toState}
                    </span>
                  )}
                  {entry.details.configType && (
                    <span>{t(`types.${entry.details.configType}`)}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'ahora';
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours} h`;
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays} días`;
  
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: diffDays > 365 ? 'numeric' : undefined
  });
}
