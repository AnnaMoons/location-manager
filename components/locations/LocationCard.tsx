'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Home, Warehouse, LayoutGrid, ChevronRight, Cpu, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Location } from '@/lib/types/location';
import { LocationType } from '@/lib/types/species';
import { useDevices } from '@/lib/hooks/useDevices';
import { cn } from '@/lib/utils';

interface LocationCardProps {
  location: Location;
  childCount?: number;
  indent?: number;
}

const speciesColors: Record<string, string> = {
  pigs: 'bg-pink-100 text-pink-700',
  broilers: 'bg-orange-100 text-orange-700',
  layers: 'bg-amber-100 text-amber-700',
};

const locationIcons: Record<LocationType, LucideIcon> = {
  farm: Home,
  barn: Warehouse,
  pen: LayoutGrid,
  section: LayoutGrid,
  cage: LayoutGrid,
};

export function LocationCard({ location, childCount = 0, indent = 0 }: LocationCardProps) {
  const t = useTranslations('locations');
  const { filterByLocation } = useDevices();
  const devices = filterByLocation(location.id);
  const Icon = locationIcons[location.type] || Home;

  return (
    <Link href={`/ubicaciones/${location.id}`}>
      <Card
        className={cn(
          'hover:bg-muted/50 transition-colors cursor-pointer',
          indent > 0 && 'border-l-4 border-l-primary/20'
        )}
        style={{ marginLeft: indent * 16 }}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{location.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {t(`types.${location.type}`)}
                  </Badge>
                  <Badge className={cn('text-xs', speciesColors[location.species])}>
                    {t(`species.${location.species}`)}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              {devices.length > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <Cpu className="h-4 w-4" />
                  <span>{devices.length}</span>
                </div>
              )}
              {childCount > 0 && (
                <span className="text-sm">{childCount} hijos</span>
              )}
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
          {location.address && (
            <p className="text-sm text-muted-foreground mt-2 ml-12">
              {location.address}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
