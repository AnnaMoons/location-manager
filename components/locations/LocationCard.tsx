'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Home, Warehouse, LayoutGrid, ChevronRight, ChevronDown, Cpu, Wifi, WifiOff, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Location } from '@/lib/types/location';
import { Device } from '@/lib/types/device';
import { LocationType } from '@/lib/types/species';
import { useDevices } from '@/lib/hooks/useDevices';
import { DeviceStateChip } from '@/components/devices/DeviceStateChip';
import { cn } from '@/lib/utils';

interface LocationCardProps {
  location: Location;
  childCount?: number;
  devices?: Device[];
  totalDeviceCount?: number;
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

export function LocationCard({ location, childCount = 0, devices: providedDevices, totalDeviceCount, indent = 0 }: LocationCardProps) {
  const t = useTranslations('locations');
  const tDevices = useTranslations('devices');
  const { filterByLocation } = useDevices();

  // Use provided devices if available, otherwise fetch
  const devices = providedDevices ?? filterByLocation(location.id);
  const hasDevices = devices.length > 0;

  // Use totalDeviceCount for display in header (includes all descendants), fallback to direct devices count
  const displayDeviceCount = totalDeviceCount ?? devices.length;

  const [devicesExpanded, setDevicesExpanded] = useState(false);
  const Icon = locationIcons[location.type] || Home;

  const handleDevicesToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDevicesExpanded(!devicesExpanded);
  };

  return (
    <Card
      className={cn(
        'transition-colors',
        indent > 0 && 'border-l-4 border-l-primary/20'
      )}
      style={{ marginLeft: indent * 16 }}
    >
      <CardContent className="p-4">
        <Link href={`/ubicaciones/${location.id}`} className="block hover:bg-muted/50 rounded-md -m-2 p-2 transition-colors">
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
              {displayDeviceCount > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <Cpu className="h-4 w-4" />
                  <span>{displayDeviceCount}</span>
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
        </Link>

        {/* Devices collapsible section inside the card */}
        {hasDevices && (
          <div className="mt-3 pt-3 border-t">
            <button
              onClick={handleDevicesToggle}
              className="flex items-center gap-2 w-full text-left text-sm hover:bg-muted/50 rounded-md p-1 -ml-1 transition-colors"
            >
              {devicesExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{tDevices('title')}</span>
              <Badge variant="secondary" className="ml-1">
                {devices.length}
              </Badge>
            </button>

            <div
              className={cn(
                'overflow-hidden transition-all duration-300 ease-in-out',
                devicesExpanded ? 'opacity-100 mt-2' : 'opacity-0 max-h-0'
              )}
              style={{
                display: 'grid',
                gridTemplateRows: devicesExpanded ? '1fr' : '0fr',
              }}
            >
              <div className="min-h-0 space-y-1 ml-5">
                {devices.map((device) => (
                  <Link key={device.id} href={`/dispositivos/${device.id}`}>
                    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{device.serialNumber}</span>
                        <span className="text-xs text-muted-foreground">
                          {tDevices(`types.${device.type}`)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DeviceStateChip state={device.state} size="sm" showTooltip={false} />
                        {device.health === 'online' ? (
                          <Wifi className="h-3 w-3 text-green-500" />
                        ) : device.health === 'offline' ? (
                          <WifiOff className="h-3 w-3 text-red-500" />
                        ) : (
                          <WifiOff className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
