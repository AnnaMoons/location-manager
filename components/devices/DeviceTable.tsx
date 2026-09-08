'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeviceStateChip } from './DeviceStateChip';
import { NextActionCTA } from './NextActionCTA';
import { DeviceIcon } from './DeviceIcon';
import { SerialNumber } from './SerialNumber';
import { LastMeasurement } from './LastMeasurement';
import { Device, SensorConfig, SENSOR_PROFILE_LABELS } from '@/lib/types/device';
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
    <div className="border border-line rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-2/50">
            <TableHead className="w-80">{t('deviceTable.device')}</TableHead>
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
              <TableRow key={device.id} className="hover:bg-surface-2/30">
                {/* Dispositivo */}
                <TableCell className="w-80">
                  <Link href={`/dispositivos/${device.id}`} className="block">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brand-primary/10">
                        <DeviceIcon type={device.type} className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-fg">
                            <SerialNumber serial={device.serialNumber} className="text-sm" />
                          </p>
                          <span className="text-2xs text-fg-tertiary/70 font-mono">
                            ID: <SerialNumber serial={device.serialNumber} showShortId className="text-xs" />
                          </span>
                        </div>
                        <div className="mt-0.5">
                          {device.type === 'sensor' && device.configuration?.type === 'sensor' && (device.configuration as SensorConfig).sensorProfile ? (
                            <span className="text-sm text-fg-tertiary">
                              {SENSOR_PROFILE_LABELS[(device.configuration as SensorConfig).sensorProfile!]}
                            </span>
                          ) : (
                            <span className="text-sm text-fg-tertiary capitalize">
                              {t(`types.${device.type}`)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </TableCell>

                {/* Estado */}
                <TableCell className="w-28">
                  <DeviceStateChip
                    state={device.state}
                    repairSubState={device.repairSubState}
                    size="sm"
                  />
                </TableCell>

                {/* Ubicación */}
                <TableCell className="">
                  {location ? (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-fg-tertiary flex-shrink-0" />
                      <span className="truncate" title={locationPath.map(l => l.name).join(' › ')}>
                        {locationPath.map((loc, index) => (
                          <span key={loc.id} className="inline-flex items-center">
                            <Link 
                              href={`/ubicaciones/${loc.id}`}
                              className="hover:underline hover:text-brand-primary"
                            >
                              {loc.name}
                            </Link>
                            {index < locationPath.length - 1 && (
                              <span className="mx-0.5 text-fg-tertiary/50">›</span>
                            )}
                          </span>
                        ))}
                      </span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2 text-sm text-fg-tertiary">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      {t('noLocation')}
                    </span>
                  )}
                </TableCell>

                {/* Última lectura */}
                <TableCell className="">
                  {device.lastMeasurement ? (
                    <LastMeasurement measurement={device.lastMeasurement} size="md" showIcon />
                  ) : (
                    <span className="text-sm text-fg-tertiary">-</span>
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
