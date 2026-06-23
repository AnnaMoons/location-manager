'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Camera, Scale, Thermometer, Router, MapPin, Settings, Power, Wrench,
  Wifi, WifiOff, RefreshCw, History, ArrowRight, Radio, Info,
  Droplets, Wind, Sun, ChevronRight, Ruler, MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { SerialNumber } from '@/components/devices/SerialNumber';
import { RepairTimeline } from '@/components/devices/RepairTimeline';
import { DeviceQRCode } from '@/components/devices/DeviceQRCode';
import { useDevices } from '@/lib/hooks/useDevices';
import { useLocations } from '@/lib/hooks/useLocations';
import { AlertsEntryPoint } from '@/components/alerts/AlertsEntryPoint';
import { useToast } from '@/components/ui/toast';
import { useBatches } from '@/lib/hooks/useBatches';
import {
  GatewayConfig, SensorConfig, PigVisionConfig, ScaleConfig,
  SENSOR_PROFILE_LABELS, SENSOR_PROFILE_SHORT_LABELS,
  SENSOR_PROFILE_VARIABLES, INTERNAL_SENSOR_THRESHOLDS, SensorVariable,
} from '@/lib/types/device';

/* ─── Design system mappings ─────────────────────────────────── */

const TYPE_ICON = {
  pigvision: Camera,
  scale:     Scale,
  sensor:    Thermometer,
  gateway:   Router,
};

const TYPE_BORDER: Record<string, string> = {
  sensor:    'border-l-primary',
  pigvision: 'border-l-[#D1C2CE]',
  scale:     'border-l-secondary',
  gateway:   'border-l-border',
};

const TYPE_ICON_BG: Record<string, string> = {
  sensor:    'bg-primary/10',
  pigvision: 'bg-[#D1C2CE]/40',
  scale:     'bg-secondary/10',
  gateway:   'bg-muted',
};

const TYPE_ICON_COLOR: Record<string, string> = {
  sensor:    'text-primary',
  pigvision: 'text-foreground',
  scale:     'text-secondary',
  gateway:   'text-muted-foreground',
};

const sensorVariableIcons: Record<SensorVariable, React.ElementType> = {
  temperature: Thermometer,
  humidity:    Droplets,
  co2:         Wind,
  ammonia:     Wind,
  light:       Sun,
};

const sensorVariableLabels: Record<SensorVariable, string> = {
  temperature: 'Temperatura',
  humidity:    'Humedad',
  co2:         'CO₂',
  ammonia:     'NH₃ (Amoníaco)',
  light:       'Luz',
};

/* ─── Page ───────────────────────────────────────────────────── */

export default function DeviceDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const t = useTranslations('devices');
  const tCommon = useTranslations('common');
  const tToast = useTranslations('toast');
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState<'disable' | 'uninstall' | null>(null);
  const { getDevice, uninstallDevice, setDeviceState, isLoading } = useDevices();
  const { getLocation, getPath } = useLocations();
  const { toast } = useToast();
  const { activeBatches, getBatchLocations } = useBatches();

  const device = getDevice(id);
  const location = device?.locationId ? getLocation(device.locationId) : null;
  const locationPath = location ? getPath(location.id) : [];

  const activeBatchForDevice = location
    ? activeBatches.find((batch) => {
        const batchLocs = getBatchLocations(batch);
        return [
          ...batchLocs.farms.map((f) => f.id),
          ...batchLocs.barns.map((b) => b.id),
          ...batchLocs.pens.map((p) => p.id),
        ].includes(location.id);
      })
    : null;

  const sensorProfile = device?.type === 'sensor' && device.configuration?.type === 'sensor'
    ? (device.configuration as SensorConfig).sensorProfile
    : undefined;

  const deviceTypeLabel = sensorProfile
    ? `Sensor · ${SENSOR_PROFILE_SHORT_LABELS[sensorProfile]}`
    : device ? t(`types.${device.type}`) : '';

  if (isLoading) return <LoadingSpinner />;

  if (!device) {
    return (
      <EmptyState
        title={t('detail.notFound')}
        description={t('detail.notFoundDesc')}
        actionLabel={t('detail.backToList')}
        actionHref="/dispositivos"
      />
    );
  }

  const Icon = TYPE_ICON[device.type] ?? Thermometer;
  const borderColor = TYPE_BORDER[device.type] ?? 'border-l-border';
  const iconBg = TYPE_ICON_BG[device.type] ?? 'bg-muted';
  const iconColor = TYPE_ICON_COLOR[device.type] ?? 'text-muted-foreground';

  const handleUninstall = async () => {
    try {
      await uninstallDevice(device.id);
      toast({ title: tToast('deviceUninstalled'), description: tToast('deviceUninstalledDesc'), variant: 'success' });
      router.push('/dispositivos');
    } catch {
      toast({ title: tToast('error'), description: tToast('errorGeneral'), variant: 'destructive' });
    }
  };

  const handleMaintenance = async () => {
    try {
      await setDeviceState(device.id, 'disabled');
      toast({ title: tToast('deviceDisabled'), description: tToast('deviceDisabledDesc'), variant: 'success' });
    } catch {
      toast({ title: tToast('error'), description: tToast('errorGeneral'), variant: 'destructive' });
    }
  };

  const handleReactivate = async () => {
    try {
      await setDeviceState(device.id, 'production');
      toast({ title: tToast('deviceReactivated'), description: tToast('deviceReactivatedDesc'), variant: 'success' });
    } catch {
      toast({ title: tToast('error'), description: tToast('errorGeneral'), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={device.serialNumber}
        subtitle={deviceTypeLabel}
        showBack
        backHref="/dispositivos"
        actions={
          (device.state === 'production' || device.locationId) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {device.state === 'production' && (
                  <DropdownMenuItem
                    className="text-muted-foreground"
                    onSelect={() => setOpenDialog('disable')}
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    {t('detail.disable')}
                  </DropdownMenuItem>
                )}
                {device.locationId && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={() => setOpenDialog('uninstall')}
                  >
                    <Power className="h-4 w-4 mr-2" />
                    {t('uninstall')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      />

      {/* Next step banner */}
      {['registered', 'available', 'unassigned', 'configured', 'installed'].includes(device.state) && (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between gap-3">
          <div>
            <p className="font-medium text-primary text-sm">{t('detail.nextStepTitle')}</p>
            <p className="text-sm text-muted-foreground">{t('detail.nextStepDesc')}</p>
          </div>
          <NextActionCTA device={device} variant="button" />
        </div>
      )}

      {/* Info card */}
      <Card className={`border-l-4 ${borderColor}`}>
        <CardContent className="pt-5">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">{deviceTypeLabel}</Badge>
                <DeviceStateChip
                  state={device.state}
                  repairSubState={device.repairSubState}
                  size="sm"
                />
                {device.health === 'online' ? (
                  <Badge variant="success" className="flex items-center gap-1 text-xs">
                    <Wifi className="h-3 w-3" />{t('health.online')}
                  </Badge>
                ) : device.health === 'offline' ? (
                  <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                    <WifiOff className="h-3 w-3" />{t('health.offline')}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">{t('health.unknown')}</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-muted-foreground">{t('serialNumber')}: </span>
                    <SerialNumber serial={device.serialNumber} className="font-medium" />
                  </div>
                  <DeviceQRCode
                    serialNumber={device.serialNumber}
                    deviceId={device.id}
                  />
                </div>
                {device.installedAt && (
                  <div>
                    <span className="text-muted-foreground">{t('detail.installedAt')}: </span>
                    <span className="font-medium">{new Date(device.installedAt).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
                {device.lastSeen && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">{t('lastSeen')}: </span>
                    <span className="font-medium">
                      {new Date(device.lastSeen).toLocaleString('es-ES', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Last measurement highlight — always visible */}
            <div className="shrink-0 text-right">
              {device.lastMeasurement ? (
                <p className="text-2xl font-bold tabular-nums text-foreground">
                  {device.lastMeasurement.value}
                  <span className="text-base font-normal text-muted-foreground ml-0.5">
                    {device.lastMeasurement.unit}
                  </span>
                </p>
              ) : (
                <p className="text-2xl font-bold text-muted-foreground/40">—</p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">{t('detail.lastReading')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repair Timeline - H-016: Show repair process tracking */}
      {device.state === 'returned' && device.repairSubState && (
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-warning/10 shrink-0">
                <Wrench className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Proceso de reparación
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Seguimiento del estado actual del dispositivo en el proceso de soporte
                  </p>
                </div>
                <RepairTimeline currentSubState={device.repairSubState} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Identification Card - H-019: Alternative identification for devices */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  Identificación del dispositivo
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Métodos alternativos para identificar el dispositivo cuando el sticker físico no es legible
                </p>
              </div>

              <div className="space-y-3">
                {/* Full Serial */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Serial completo</p>
                    <SerialNumber serial={device.serialNumber} className="text-base" />
                  </div>
                </div>

                {/* Short ID */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      ID Corto (últimos 4 dígitos)
                    </p>
                    <div className="flex items-baseline gap-2">
                      <SerialNumber
                        serial={device.serialNumber}
                        showShortId
                        className="text-3xl"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use estos dígitos si el sticker no es legible
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info box */}
                <div className="bg-info/5 border border-info/20 rounded-lg p-3">
                  <div className="flex gap-2">
                    <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">
                        💡 Si el sticker físico se cayó:
                      </p>
                      <ul className="space-y-0.5 ml-4 list-disc">
                        <li>Use el <strong>ID Corto</strong> para identificación rápida</li>
                        <li>Descargue el código QR y péguelo como etiqueta de respaldo</li>
                        <li>El QR permite acceder al dispositivo sin tipear el serial</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Display */}
            <div className="shrink-0">
              <DeviceQRCode
                serialNumber={device.serialNumber}
                deviceId={device.id}
                showButton={false}
                size="md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t('location')}
          </h2>
          {location && (
            <Link href={`/dispositivos/${id}/instalar?cambiar=true`}>
              <Button size="sm" variant="outline">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                {t('detail.changeLocation')}
              </Button>
            </Link>
          )}
        </div>
        {location ? (
          <Link href={`/ubicaciones/${location.id}`} className="block">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{location.name}</p>
                {locationPath.length > 1 && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {locationPath.slice(0, -1).map((p) => p.name).join(' › ')}
                  </p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          </Link>
        ) : (
          <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-dashed">
            <span className="text-sm text-muted-foreground">{t('noLocation')}</span>
            <Link href={`/dispositivos/${id}/instalar`}>
              <Button size="sm">
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                {t('nextActions.assignLocation')}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Alerts entry point — sensors and pigvision devices only */}
      {location && (device.type === 'sensor' || device.type === 'pigvision') && (
        <AlertsEntryPoint deviceId={device.id} locationId={location.id} />
      )}

      {/* Configuration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t('configurationLabel')}
          </h2>
          {device.type !== 'sensor' && device.type !== 'gateway' && device.configuration && (
            <Link href={`/dispositivos/${id}/configurar`}>
              <Button size="sm" variant="outline">
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                {t('detail.modifyConfig')}
              </Button>
            </Link>
          )}
        </div>

        {device.type === 'sensor' ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg border bg-muted/40">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">{t('configuration.sensor.managedInternally')}</p>
            </div>
            {device.configuration?.type === 'sensor' && (device.configuration as SensorConfig).sensorProfile && (() => {
              const profile = (device.configuration as SensorConfig).sensorProfile!;
              const variables = SENSOR_PROFILE_VARIABLES[profile] ?? [];
              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg border">
                    <Thermometer className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground flex-1">{t('configuration.sensor.sensorProfile')}</span>
                    <Badge variant="outline" className="font-medium">{SENSOR_PROFILE_LABELS[profile]}</Badge>
                  </div>
                  {variables.length > 0 && (
                    <div className="space-y-1">
                      {variables.map((variable) => {
                        const VarIcon = sensorVariableIcons[variable];
                        const thresholds = INTERNAL_SENSOR_THRESHOLDS[variable];
                        return (
                          <div key={variable} className="flex items-center gap-3 px-4 py-3 rounded-lg border">
                            <VarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm font-medium flex-1">{sensorVariableLabels[variable]}</span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {thresholds.min} – {thresholds.max} {thresholds.unit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ) : device.configuration && device.type === 'pigvision' ? (
          <div className="space-y-1">
            {(() => {
              const cfg = device.configuration as PigVisionConfig;
              const height = cfg.installationHeight;
              const unit = cfg.installationHeightUnit ?? 'm';
              return (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg border">
                  <Ruler className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground flex-1">
                    {t('configuration.pigvision.installationHeight')}
                  </span>
                  <span className="text-sm font-medium tabular-nums">{height} {unit}</span>
                </div>
              );
            })()}
          </div>
        ) : device.configuration && device.type === 'scale' ? (
          <div className="space-y-1">
            {(() => {
              const cfg = device.configuration as ScaleConfig;
              const rows: { label: string; value: string }[] = [
                { label: t('configuration.scale.maxWeight'), value: `${cfg.maxWeight} ${cfg.unit}` },
                { label: t('configuration.scale.tareWeight'), value: `${cfg.tareWeight} ${cfg.unit}` },
              ];
              if (cfg.calibrationDate) {
                rows.push({
                  label: t('configuration.scale.calibrationDate'),
                  value: new Date(cfg.calibrationDate).toLocaleDateString('es-ES'),
                });
              }
              return rows.map((row) => (
                <div key={row.label} className="flex items-center gap-3 px-4 py-3 rounded-lg border">
                  <span className="text-sm text-muted-foreground flex-1">{row.label}</span>
                  <span className="text-sm font-medium tabular-nums">{row.value}</span>
                </div>
              ));
            })()}
          </div>
        ) : device.configuration && device.type === 'gateway' ? (
          <div className="space-y-1">
            {(() => {
              const cfg = device.configuration as GatewayConfig;
              return (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg border">
                  <span className="text-sm text-muted-foreground flex-1">
                    {t('configuration.gateway.lastSyncAt')}
                  </span>
                  <span className="text-sm font-medium">
                    {cfg.lastSyncAt
                      ? new Date(cfg.lastSyncAt).toLocaleString('es-ES', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : '—'}
                  </span>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-dashed">
            <span className="text-sm text-muted-foreground">{t('noConfig')}</span>
            {device.state === 'registered' && (
              <Link href={`/dispositivos/${id}/configurar`}>
                <Button size="sm">
                  <Settings className="h-3.5 w-3.5 mr-1.5" />
                  {t('configure')}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Connected sensors (gateway only) */}
      {device.type === 'gateway' && device.configuration && (() => {
        const config = device.configuration as GatewayConfig;
        const connectedDevices = config.connectedSensors.map((sid) => getDevice(sid)).filter(Boolean);
        return (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
              {t('connectedSensors')} · {connectedDevices.length}
            </h2>
            {connectedDevices.length > 0 ? (
              <div className="space-y-1">
                {connectedDevices.map((sensor) => sensor && (
                  <Link key={sensor.id} href={`/dispositivos/${sensor.id}`} className="block">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <Radio className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium flex-1">{sensor.serialNumber}</span>
                      <Badge
                        variant={sensor.health === 'online' ? 'success' : 'secondary'}
                        className="text-xs"
                      >
                        {sensor.health === 'online' ? t('health.online') : t('health.offline')}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground px-4 py-3">{t('noConnectedSensors')}</p>
            )}
          </div>
        );
      })()}

      {/* Reactivate — positive action, visible */}
      {device.state === 'disabled' && (
        <Button size="sm" onClick={handleReactivate}>
          <Power className="h-4 w-4 mr-2" />
          {t('detail.reactivate')}
        </Button>
      )}

      {/* Controlled dialogs for dangerous actions */}
      <AlertDialog open={openDialog === 'disable'} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {activeBatchForDevice ? tToast('deviceInActiveBatch') : t('detail.disableTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activeBatchForDevice
                ? tToast('deviceInActiveBatchDesc', { batchName: activeBatchForDevice.name })
                : t('detail.disableDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDialog(null)}>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleMaintenance}>{tCommon('continue')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={openDialog === 'uninstall'} onOpenChange={(o) => !o && setOpenDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {activeBatchForDevice ? tToast('deviceInActiveBatch') : t('detail.uninstallConfirm')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activeBatchForDevice
                ? tToast('deviceInActiveBatchDesc', { batchName: activeBatchForDevice.name })
                : t('detail.uninstallDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDialog(null)}>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleUninstall}>{t('detail.uninstallAction')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* History */}
      {device.history && device.history.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
            {t('history.title')}
          </h2>
          <div className="rounded-lg border divide-y">
            {[...device.history].reverse().map((entry) => {
              const fromLocation = entry.details?.fromLocationId ? getLocation(entry.details.fromLocationId) : null;
              const toLocation = entry.details?.toLocationId ? getLocation(entry.details.toLocationId) : null;
              return (
                <div key={entry.id} className="flex gap-3 px-4 py-3">
                  <div className="flex flex-col items-center pt-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{t(`history.actions.${entry.action}`)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString('es-ES', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    {entry.details && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {entry.details.fromState && entry.details.toState && (
                          <>
                            <Badge variant="outline" className="text-xs">{t(`states.${entry.details.fromState}`)}</Badge>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <Badge variant="outline" className="text-xs">{t(`states.${entry.details.toState}`)}</Badge>
                          </>
                        )}
                        {(fromLocation || toLocation) && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            {fromLocation && <span>{fromLocation.name}</span>}
                            {fromLocation && toLocation && <ArrowRight className="h-3 w-3" />}
                            {toLocation && <span>{toLocation.name}</span>}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
