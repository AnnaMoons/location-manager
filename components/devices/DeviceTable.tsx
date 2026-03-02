'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeviceStateChip } from './DeviceStateChip';
import { NextActionCTA } from './NextActionCTA';
import { DeviceIcon } from './DeviceIcon';
import { Device, DeviceMeasurement } from '@/lib/types/device';
import { useLocations } from '@/lib/hooks/useLocations';
import { MapPin, Clock } from 'lucide-react';

interface DeviceTableProps {
  devices: Device[];
}

export function DeviceTable({ devices }: DeviceTableProps) {
  const t = useTranslations('devices');
  const { getLocation } = useLocations();

  if (devices.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[250px]">{t('deviceTable.device')}</TableHead>
            <TableHead className="w-[130px]">{t('deviceTable.state')}</TableHead>
            <TableHead className="w-[200px]">{t('deviceTable.location')}</TableHead>
            <TableHead className="w-[150px]">{t('deviceTable.lastReading')}</TableHead>
            <TableHead className="w-[150px]">{t('deviceTable.lastUpdate')}</TableHead>
            <TableHead className="w-[100px] text-right">{t('deviceTable.action')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => {
            const location = device.locationId ? getLocation(device.locationId) : null;
            
            return (
              <TableRow key={device.id} className="hover:bg-muted/30">
                {/* Dispositivo */}
                <TableCell>
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
                <TableCell>
                  <DeviceStateChip state={device.state} size="sm" />
                </TableCell>

                {/* Ubicación */}
                <TableCell>
                  {location ? (
                    <Link 
                      href={`/ubicaciones/${location.id}`}
                      className="flex items-center gap-2 text-sm hover:underline"
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{location.name}</span>
                    </Link>
                  ) : (
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      {t('noLocation')}
                    </span>
                  )}
                </TableCell>

                {/* Última lectura */}
                <TableCell>
                  {device.lastMeasurement ? (
                    <div className="text-sm">
                      <span className="font-medium tabular-nums">
                        {formatMeasurementValue(device.lastMeasurement)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>

                {/* Última actualización */}
                <TableCell>
                  {device.lastSeen ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{formatLastSeen(device.lastSeen)}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>

                {/* Acción */}
                <TableCell className="text-right">
                  <NextActionCTA device={device} variant="button" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function formatLastSeen(lastSeen: string): string {
  try {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return lastSeen;
  }
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
