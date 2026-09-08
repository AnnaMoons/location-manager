'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Edit, Trash2, MapPin, Cpu, Plus, Home, Warehouse, Fence,
  ChevronRight, Wifi, WifiOff, Thermometer, Wind, Sun, Camera, Weight,
} from 'lucide-react';
import {
  canHaveChildren, getNextLevelType, speciesHierarchies,
  LocationType, Species,
} from '@/lib/types/species';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { SerialNumber } from '@/components/devices/SerialNumber';
import { useLocations } from '@/lib/hooks/useLocations';
import { useDevices } from '@/lib/hooks/useDevices';
import { AlertsEntryPoint } from '@/components/alerts/AlertsEntryPoint';
import { Device, SensorConfig, SensorProfile } from '@/lib/types/device';
import { Location } from '@/lib/types/location';

/* ─── Design system mappings ─────────────────────────────────── */

const SPECIES_BADGE: Record<Species, string> = {
  pigs:     'bg-product-pigvision text-fg border-0',
  broilers: 'bg-primitive-mint-500 text-fg border-0',
  layers:   'bg-surface-blue-2 text-fg border-0',
};

const TYPE_ICON: Record<LocationType, React.ElementType> = {
  farm:    Home,
  barn:    Warehouse,
  pen:     Fence,
  section: Fence,
  cage:    Fence,
};

const TYPE_BORDER: Record<LocationType, string> = {
  farm:    'border-l-brand-primary',
  barn:    'border-l-brand-accent',
  pen:     'border-l-surface-blue',
  section: 'border-l-surface-blue',
  cage:    'border-l-surface-blue',
};

type DeviceChipDef = { label: string; icon: React.ElementType; bg: string; text: string };

const SENSOR_PROFILE_CHIP: Record<SensorProfile, DeviceChipDef> = {
  temp_humidity:       { label: 'T+H',     icon: Thermometer, bg: 'bg-surface-blue',                text: 'text-brand-primary' },
  temp_humidity_co2:   { label: 'T+H+CO₂', icon: Wind,        bg: 'bg-primitive-mint-500', text: 'text-fg' },
  temp_humidity_nh3:   { label: 'T+H+NH₃', icon: Wind,        bg: 'bg-product-pigvision', text: 'text-fg' },
  temp_humidity_light: { label: 'T+H+Luz', icon: Sun,         bg: 'bg-surface-blue-2',text: 'text-fg' },
};

const DEVICE_TYPE_CHIP: Record<string, DeviceChipDef> = {
  sensor:    { label: 'Sensor',    icon: Thermometer, bg: 'bg-surface-blue',                text: 'text-brand-primary' },
  pigvision: { label: 'PigVision', icon: Camera,      bg: 'bg-product-pigvision', text: 'text-fg' },
  scale:     { label: 'Báscula',   icon: Weight,      bg: 'bg-surface-blue-2',text: 'text-fg' },
  gateway:   { label: 'Gateway',   icon: Cpu,         bg: 'bg-surface-2',                 text: 'text-fg-tertiary' },
};

function getDeviceChip(device: Device): DeviceChipDef {
  if (device.type === 'sensor' && device.configuration?.type === 'sensor') {
    const profile = (device.configuration as SensorConfig).sensorProfile;
    if (profile && SENSOR_PROFILE_CHIP[profile]) return SENSOR_PROFILE_CHIP[profile];
  }
  return DEVICE_TYPE_CHIP[device.type] ?? { label: device.type, icon: Cpu, bg: 'bg-surface-2', text: 'text-fg-tertiary' };
}

/* ─── Detail page ────────────────────────────────────────────── */

export default function LocationDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const t = useTranslations('locations');
  const router = useRouter();
  const { getLocation, getChildren, getPath, deleteLocation, isLoading } = useLocations();
  const { filterByLocation } = useDevices();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const location = getLocation(id);
  const children = location ? getChildren(id) : [];
  const path = location ? getPath(id) : [];
  const devices = location ? filterByLocation(id) : [];

  if (isLoading) return <LoadingSpinner />;

  if (!location) {
    return (
      <EmptyState
        icon={MapPin}
        title={t('notFound') || 'Ubicación no encontrada'}
        description="La ubicación que buscas no existe"
        actionLabel="Volver a ubicaciones"
        actionHref="/ubicaciones"
      />
    );
  }

  const handleDelete = async () => {
    await deleteLocation(id);
    router.push('/ubicaciones');
  };

  const Icon = TYPE_ICON[location.type] ?? Home;
  const childType = getNextLevelType(location.species, location.type);
  const totalChildDevices = children.reduce(
    (sum, child) => sum + filterByLocation(child.id).length,
    0,
  );

  // Breadcrumb — all ancestors except current (path includes current as last)
  const breadcrumb = path.slice(0, -1);

  const address = location.ruralAddress
    ? [
        location.ruralAddress.vereda ? `Vereda ${location.ruralAddress.vereda}` : null,
        location.ruralAddress.municipality,
        location.ruralAddress.department,
        location.ruralAddress.country,
      ].filter(Boolean).join(', ')
    : location.address ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={location.name}
        showBack
        backHref="/ubicaciones"
        actions={
          <div className="flex gap-2">
            <Link href={`/ubicaciones/${id}/editar`}>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4 text-error" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('deleteConfirm')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('deleteWarning')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-error">
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      {/* Breadcrumb path */}
      {breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-fg-tertiary -mt-4 flex-wrap">
          {breadcrumb.map((ancestor, i) => (
            <span key={ancestor.id} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
              <Link href={`/ubicaciones/${ancestor.id}`} className="hover:text-fg transition-colors">
                {ancestor.name}
              </Link>
            </span>
          ))}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-fg font-medium">{location.name}</span>
        </nav>
      )}

      {/* Info card */}
      <Card className={`border-l-4 ${TYPE_BORDER[location.type]}`}>
        <CardContent className="pt-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-6 w-6 text-brand-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">{t(`types.${location.type}`)}</Badge>
                <Badge className={`text-xs ${SPECIES_BADGE[location.species]}`}>
                  {t(`species.${location.species}`)}
                </Badge>
              </div>
              {address && (
                <p className="text-sm text-fg-tertiary mt-1.5">{address}</p>
              )}
              {location.coordinates && (
                <p className="text-xs text-fg-tertiary mt-0.5">
                  {location.coordinates.lat.toFixed(6)}, {location.coordinates.lng.toFixed(6)}
                </p>
              )}
            </div>

            {/* Stats (farms only) */}
            {location.type === 'farm' && (
              <div className="flex items-center gap-4 shrink-0 text-xs text-fg-tertiary">
                {children.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Warehouse className="h-3.5 w-3.5" />
                    <span className="font-semibold text-fg">{children.length}</span>
                    {t('barnCount', { count: children.length }).replace(`${children.length} `, '')}
                  </span>
                )}
                {childType && children.some(b => getChildren(b.id).length > 0) && (
                  <span className="flex items-center gap-1">
                    <Fence className="h-3.5 w-3.5" />
                    <span className="font-semibold text-fg">
                      {children.reduce((s, b) => s + getChildren(b.id).length, 0)}
                    </span>
                    {childType === 'section' ? 'secciones' : 'corrales'}
                  </span>
                )}
                {(devices.length + totalChildDevices) > 0 && (
                  <span className="flex items-center gap-1">
                    <Cpu className="h-3.5 w-3.5" />
                    <span className="font-semibold text-fg">{devices.length + totalChildDevices}</span>
                    dispositivos
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Devices */}
      {devices.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-fg-tertiary uppercase tracking-wide px-1">
            {t('devices')} · {devices.length}
          </h2>
          <div className="space-y-3">
            {devices.map((device) => {
              const chip = getDeviceChip(device);
              const ChipIcon = chip.icon;
              return (
                <Link key={device.id} href={`/dispositivos/${device.id}`} className="block">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg border hover:bg-surface-2/50 transition-colors">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium rounded-md px-2 py-0.5 shrink-0 ${chip.bg} ${chip.text}`}>
                      <ChipIcon className="h-3 w-3" />
                      {chip.label}
                    </span>
                    <SerialNumber serial={device.serialNumber} className="text-sm flex-1 min-w-0 truncate" />
                    <div className="flex items-center gap-2 shrink-0">
                      {device.lastMeasurement && (
                        <span className="text-xs font-medium tabular-nums">
                          {device.lastMeasurement.value}{device.lastMeasurement.unit}
                        </span>
                      )}
                      <DeviceStateChip state={device.state} size="sm" showTooltip={false} />
                      {device.health === 'online'
                        ? <Wifi className="h-3.5 w-3.5 text-success" />
                        : <WifiOff className="h-3.5 w-3.5 text-fg-tertiary" />}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Alerts entry point */}
      <AlertsEntryPoint locationId={id} />

      {/* Children */}
      {canHaveChildren(location.species, location.type) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-fg-tertiary uppercase tracking-wide">
              {t(`childrenOf.${childType}`)} · {children.length}
            </h2>
            <Link href={`/ubicaciones/${id}/nueva`}>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1.5" />
                {t(`types.${childType}`)}
              </Button>
            </Link>
          </div>

          {children.length === 0 ? (
            <EmptyState
              icon={childType === 'barn' ? Warehouse : Fence}
              title={t(`noChildrenOf.${childType}`)}
              description=""
              actionLabel={`Agregar ${t(`types.${childType}`)}`}
              actionHref={`/ubicaciones/${id}/nueva`}
            />
          ) : (
            <div className="space-y-3">
              {children.map((child) => (
                <ChildRow key={child.id} child={child} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Child row ──────────────────────────────────────────────── */

function ChildRow({ child }: { child: Location }) {
  const t = useTranslations('locations');
  const { getChildren } = useLocations();
  const { filterByLocation } = useDevices();

  const Icon = TYPE_ICON[child.type] ?? Fence;
  const borderColor = TYPE_BORDER[child.type];
  const grandchildren = getChildren(child.id);
  const childDevices = filterByLocation(child.id);
  const childType = getNextLevelType(child.species, child.type);

  return (
    <Link href={`/ubicaciones/${child.id}`} className="block">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border border-l-4 ${borderColor} hover:bg-surface-2/50 transition-colors`}>
        <Icon className="h-4 w-4 text-brand-primary shrink-0" />
        <span className="font-medium text-sm flex-1 min-w-0 truncate">{child.name}</span>
        <div className="flex items-center gap-3 shrink-0 text-xs text-fg-tertiary">
          {grandchildren.length > 0 && childType && (
            <span className="flex items-center gap-1">
              <Fence className="h-3.5 w-3.5" />
              {grandchildren.length}
              <span className="hidden sm:inline">{childType === 'section' ? ' secciones' : ' corrales'}</span>
            </span>
          )}
          {childDevices.length > 0 && (
            <span className="flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5" />
              {childDevices.length}
            </span>
          )}
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
