import { cn } from '@/lib/utils';
import { DeviceHistoryEntry } from '@/lib/types/device';
import { 
  Plus, 
  MapPin, 
  MapPinOff, 
  Settings, 
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface ActivityTimelineProps {
  history: DeviceHistoryEntry[];
  className?: string;
}

const actionConfig = {
  created: { icon: Plus, label: 'Dispositivo creado', color: 'text-blue-500' },
  installed: { icon: MapPin, label: 'Instalado', color: 'text-green-500' },
  uninstalled: { icon: MapPinOff, label: 'Desinstalado', color: 'text-orange-500' },
  configured: { icon: Settings, label: 'Configurado', color: 'text-purple-500' },
  state_changed: { icon: RefreshCw, label: 'Estado cambiado', color: 'text-blue-500' },
  location_changed: { icon: MapPin, label: 'Ubicación cambiada', color: 'text-yellow-500' }
};

export function ActivityTimeline({ history, className }: ActivityTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Sin historial de actividad</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {history.map((entry, index) => {
        const config = actionConfig[entry.action];
        const Icon = config.icon;
        
        return (
          <div key={entry.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                "bg-slate-100 border-2 border-white shadow-sm",
                config.color
              )}>
                <Icon className="w-4 h-4" />
              </div>
              {index < history.length - 1 && (
                <div className="w-0.5 flex-1 bg-slate-200 my-2" />
              )}
            </div>
            
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{config.label}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(entry.timestamp)}
                </span>
              </div>
              
              {entry.details && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {entry.details.fromState && entry.details.toState && (
                    <span>
                      {entry.details.fromState} → {entry.details.toState}
                    </span>
                  )}
                  {entry.details.fromLocationId && entry.details.toLocationId && (
                    <span>
                      {entry.details.fromLocationId || 'Sin ubicación'} → {entry.details.toLocationId}
                    </span>
                  )}
                  {entry.details.configType && (
                    <span>Tipo: {entry.details.configType}</span>
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
