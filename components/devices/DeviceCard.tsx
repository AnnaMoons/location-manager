'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Camera, Scale, Thermometer, MapPin, Wifi, WifiOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DeviceStateChip } from './DeviceStateChip';
import { NextActionCTA } from './NextActionCTA';
import { Device } from '@/lib/types/device';
import { useLocations } from '@/lib/hooks/useLocations';
import { cn } from '@/lib/utils';

interface DeviceCardProps {
  device: Device;
  showLocation?: boolean;
}

const deviceIcons = {
  pigvision: Camera,
  scale: Scale,
  sensor: Thermometer,
};

const healthIndicator = {
  online: { icon: Wifi, color: 'text-green-500' },
  offline: { icon: WifiOff, color: 'text-red-500' },
  unknown: { icon: WifiOff, color: 'text-gray-400' },
};

export function DeviceCard({ device, showLocation = true }: DeviceCardProps) {
  const t = useTranslations('devices');
  const { getLocation } = useLocations();

  const Icon = deviceIcons[device.type];
  const location = device.locationId ? getLocation(device.locationId) : null;
  const Health = healthIndicator[device.health];

  return (
    <Link href={`/dispositivos/${device.id}`}>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{device.serialNumber}</h3>
                  <Health.icon className={cn('h-4 w-4', Health.color)} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t(`types.${device.type}`)}
                </p>
                {showLocation && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{location?.name || t('noLocation')}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <DeviceStateChip state={device.state} size="sm" />
              <NextActionCTA device={device} variant="inline" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
