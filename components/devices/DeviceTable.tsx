'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeviceStateChip } from './DeviceStateChip';
import { NextActionCTA } from './NextActionCTA';
import { DeviceIcon } from './DeviceIcon';
import { Device, DeviceMeasurement } from '@/lib/types/device';
import { useLocations } from '@/lib/hooks/useLocations';
import { MapPin } from 'lucide-react';

interface DeviceTableProps {
  devices: Device[];
}

export function DeviceTable({ devices }: DeviceTableProps) {
  const t = useTranslations('devices');
  const { getLocation, getPath } = useLocations();

  if (devices.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-44">{t('deviceTable.device')}</TableHead>
            <TableHead className="w-28">{t('deviceTable.state')}</TableHead>
            <TableHead className="">{t('deviceTable.location')}</TableHead>
            <TableHead className="">{t('deviceTable.lastReading')}</TableHead>
            <TableHead className="text-right">{t('deviceTable.action')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => {
            const location = device.locationId ? getLocation(device.locationId) : null;
            const locationPath = device.locationId ? getPath(device.locationId) : [];
            
            return (
              <TableRow key={device.id} className="hover:bg-muted/30">
                {/* Dispositivo */}
                <TableCell className="w-44">
                  <Link href={`/dispositivos/${device.id}`} className="block">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <DeviceIcon type={device.type} className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{device.serialNumber}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {t(`types.${device.type}`)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </TableCell>

                {/* Estado */}
                <TableCell className="w-28">
                  <DeviceStateChip state={device.state} size="sm" />
                </TableCell>

                {/* Ubicación */}
                <TableCell className="">
                  {location ? (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate" title={locationPath.map(l => l.name).join(' › ')}>
                        {locationPath.map((loc, index) => (
                          <span key={loc.id} className="inline-flex items-center">
                            <Link 
                              href={`/ubicaciones/${loc.id}`}
                              className="hover:underline hover:text-primary"
                            >
                              {loc.name}
                            </Link>
                            {index < locationPath.length - 1 && (
                              <span className="mx-0.5 text-muted-foreground/50">›</span>
                            )}
                          </span>
                        ))}
                      </span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      {t('noLocation')}
                    </span>
                  )}
                </TableCell>

                {/* Última lectura */}
                <TableCell className="">
                  {device.lastMeasurement ? (
                    <div className="text-sm">
                      <div className="font-medium tabular-nums">
                        {formatMeasurementValue(device.lastMeasurement)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatMeasurementTime(device.lastMeasurement.timestamp, t)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>

                {/* Acción */}
                <TableCell className="text-right">
                  <NextActionCTA device={device} variant="tertiary" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function formatMeasurementValue(measurement: DeviceMeasurement): string {
  const { value, unit } = measurement;
  
  // For temperature (Celsius), show 1 decimal
  if (unit === '°C') {
    return `${value.toFixed(1)} ${unit}`;
  }
  
  // For weight (kg), show 1 decimal
  if (unit === 'kg') {
    return `${value.toFixed(1)} ${unit}`;
  }
  
  // For humidity/CO2/ammonia, show whole numbers
  if (unit === '%' || unit === 'ppm') {
    return `${Math.round(value)} ${unit}`;
  }
  
  // Default: show 1 decimal
  return `${value.toFixed(1)} ${unit}`;
}

function formatMeasurementTime(timestamp: string, t: ReturnType<typeof useTranslations>): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('relativeTime.now');
    if (diffMins < 60) return t('relativeTime.minutesAgo', { value: diffMins });
    if (diffHours < 24) return t('relativeTime.hoursAgo', { value: diffHours });
    if (diffDays === 1) return t('relativeTime.yesterday');
    if (diffDays < 7) return t('relativeTime.daysAgo', { value: diffDays });
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
}
