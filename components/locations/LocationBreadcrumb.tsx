import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { Location } from '@/lib/types/location';

interface LocationBreadcrumbProps {
  path: Location[];
  className?: string;
}

export function LocationBreadcrumb({ path, className }: LocationBreadcrumbProps) {
  if (!path || path.length === 0) {
    return (
      <span className="text-sm text-fg-tertiary italic">
        Sin ubicación asignada
      </span>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1 text-sm", className)}>
      {path.map((location, index) => (
        <span key={location.id} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-fg-tertiary mx-1" />
          )}
          <span
            className={cn(
              index === path.length - 1 
                ? "font-medium text-fg" 
                : "text-fg-tertiary hover:text-fg transition-colors"
            )}
          >
            {location.name}
          </span>
        </span>
      ))}
    </div>
  );
}
