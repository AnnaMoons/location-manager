'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Camera,
  Scale,
  Thermometer,
  Router,
  MapPin,
  Settings,
  Power,
  Wrench,
  Wifi,
  WifiOff,
  RefreshCw,
  History,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingState';
import { DeviceStateChip } from '@/components/devices/DeviceStateChip';
import { NextActionCTA } from '@/components/devices/NextActionCTA';
import { useDevices } from '@/lib/hooks/useDevices';
import { useLocations } from '@/lib/hooks/useLocations';
import { cn } from '@/lib/utils';
import { GatewayConfig } from '@/lib/types/device';

const deviceIcons = {
  pigvision: Camera,
  scale: Scale,
  sensor: Thermometer,
  gateway: Router,
};

export default function DeviceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const t = useTranslations('devices');
  const router = useRouter();
  const { getDevice, uninstallDevice, setDeviceState, isLoading } = useDevices();
  const { getLocation, getPath } = useLocations();

  const device = getDevice(id);
  const location = device?.locationId ? getLocation(device.locationId) : null;
  const locationPath = location ? getPath(location.id) : [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!device) {
    return (
      <EmptyState
        title="Dispositivo no encontrado"
        description="El dispositivo que buscas no existe"
        actionLabel="Ver dispositivos"
        actionHref="/dispositivos"
      />
    );
  }

  const Icon = deviceIcons[device.type];

  const handleUninstall = async () => {
    await uninstallDevice(device.id);
    router.push('/dispositivos');
  };

  const handleMaintenance = async () => {
    await setDeviceState(device.id, 'maintenance');
  };

  const handleReactivate = async () => {
    await setDeviceState(device.id, 'in_production');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={device.serialNumber}
        subtitle={t(`types.${device.type}`)}
        showBack
        backHref="/dispositivos"
        actions={<NextActionCTA device={device} />}
      />

      {/* Device Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <DeviceStateChip state={device.state} />
                {device.health === 'online' ? (
                  <Badge variant="success" className="flex items-center gap-1">
                    <Wifi className="h-3 w-3" />
                    {t('health.online')}
                  </Badge>
                ) : device.health === 'offline' ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <WifiOff className="h-3 w-3" />
                    {t('health.offline')}
                  </Badge>
                ) : (
                  <Badge variant="secondary">{t('health.unknown')}</Badge>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">{t('serialNumber')}</dt>
                  <dd className="font-medium">{device.serialNumber}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t('type')}</dt>
                  <dd className="font-medium">{t(`types.${device.type}`)}</dd>
                </div>
                {device.lastSeen && (
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">{t('lastSeen')}</dt>
                    <dd className="font-medium">
                      {new Date(device.lastSeen).toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('location')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {location ? (
            <div className="space-y-3">
              <Link
                href={`/ubicaciones/${location.id}`}
                className="block p-3 rounded-md hover:bg-muted transition-colors"
              >
                <p className="font-medium">{location.name}</p>
                <p className="text-sm text-muted-foreground">
                  {locationPath.map((p) => p.name).join(' → ')}
                </p>
              </Link>
              <Link href={`/dispositivos/${id}/instalar?cambiar=true`}>
                <Button variant="outline" size="sm" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Cambiar ubicación
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-3">{t('noLocation')}</p>
              <Link href={`/dispositivos/${id}/instalar`}>
                <Button>
                  <MapPin className="h-4 w-4 mr-2" />
                  {t('install')}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('configurationLabel')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {device.configuration ? (
            <div className="space-y-2">
              {Object.entries(device.configuration)
                .filter(([key]) => key !== 'type')
                .map(([key, value]) => {
                  // Format lastSyncAt date for gateways
                  let displayValue = String(value);
                  if (device.type === 'gateway' && key === 'lastSyncAt' && value) {
                    displayValue = new Date(value as string).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    });
                  }
                  return (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t(`configuration.${device.type}.${key}`)}
                      </span>
                      <span className="font-medium">{displayValue}</span>
                    </div>
                  );
                })}
              {device.type !== 'gateway' && (
                <>
                  <Separator className="my-3" />
                  <Link href={`/dispositivos/${id}/configurar`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Modificar configuración
                    </Button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-3">{t('noConfig')}</p>
              {device.state === 'installed' && (
                <Link href={`/dispositivos/${id}/configurar`}>
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    {t('configure')}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connected Sensors Card - Only for Gateways */}
      {device.type === 'gateway' && device.configuration && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Radio className="h-5 w-5" />
              {t('connectedSensors')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const config = device.configuration as GatewayConfig;
              const connectedDevices = config.connectedSensors
                .map((sensorId) => getDevice(sensorId))
                .filter(Boolean);

              return connectedDevices.length > 0 ? (
                <div className="space-y-3">
                  {connectedDevices.map((sensor) => sensor && (
                    <Link
                      key={sensor.id}
                      href={`/dispositivos/${sensor.id}`}
                      className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Thermometer className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{sensor.serialNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {t(`types.${sensor.type}`)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={sensor.health === 'online' ? 'success' : 'secondary'}
                        className="text-xs"
                      >
                        {sensor.health === 'online' ? t('health.online') : t('health.offline')}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('noConnectedSensors')}
                </p>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {device.state === 'in_production' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Wrench className="h-4 w-4 mr-2" />
                {t('maintenance')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Poner en mantenimiento</AlertDialogTitle>
                <AlertDialogDescription>
                  El dispositivo dejará de enviar datos mientras esté en mantenimiento.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleMaintenance}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {device.state === 'maintenance' && (
          <Button onClick={handleReactivate}>
            <Power className="h-4 w-4 mr-2" />
            Reactivar
          </Button>
        )}

        {device.locationId && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive">
                <Power className="h-4 w-4 mr-2" />
                {t('uninstall')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('uninstallConfirm')}</AlertDialogTitle>
                <AlertDialogDescription>{t('uninstallWarning')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleUninstall}
                  className="bg-destructive"
                >
                  Desinstalar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* History Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            {t('history.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!device.history || device.history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('history.noHistory')}
            </p>
          ) : (
            <div className="space-y-4">
              {[...device.history].reverse().map((entry) => {
                const fromLocation = entry.details?.fromLocationId
                  ? getLocation(entry.details.fromLocationId)
                  : null;
                const toLocation = entry.details?.toLocationId
                  ? getLocation(entry.details.toLocationId)
                  : null;

                return (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="w-px h-full bg-border" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-sm">
                        {t(`history.actions.${entry.action}`)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                      {entry.details && (
                        <div className="mt-2 text-xs space-y-1">
                          {entry.details.fromState && entry.details.toState && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {t(`states.${entry.details.fromState}`)}
                              </Badge>
                              <ArrowRight className="h-3 w-3" />
                              <Badge variant="outline" className="text-xs">
                                {t(`states.${entry.details.toState}`)}
                              </Badge>
                            </div>
                          )}
                          {(fromLocation || toLocation) && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              {fromLocation && (
                                <span>{fromLocation.name}</span>
                              )}
                              {fromLocation && toLocation && (
                                <ArrowRight className="h-3 w-3" />
                              )}
                              {toLocation && (
                                <span>{toLocation.name}</span>
                              )}
                              {!fromLocation && toLocation && (
                                <span className="text-muted-foreground">
                                  → {toLocation.name}
                                </span>
                              )}
                            </div>
                          )}
                          {entry.details.configType && (
                            <p className="text-muted-foreground">
                              {t(`types.${entry.details.configType}`)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
