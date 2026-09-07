'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Cpu, Activity, AlertTriangle, Package, MapPin, ArrowRight,
  Users, ChevronRight, Link2, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AlertBanner } from '@/components/dashboard/AlertBanner';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { DeviceStateChip } from '@/components/devices/DeviceStateChip';
import { NextActionCTA } from '@/components/devices/NextActionCTA';
import { useDevices } from '@/lib/hooks/useDevices';
import { useBatches } from '@/lib/hooks/useBatches';
import { useLocations } from '@/lib/hooks/useLocations';
import { getLocationPath } from '@/lib/types/location';
import { SENSOR_PROFILE_SHORT_LABELS, SensorConfig } from '@/lib/types/device';
import { LoadingSpinner } from '@/components/shared/LoadingState';
import { PageHeader } from '@/components/shared/PageHeader';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tBatches = useTranslations('batches');
  const tDevices = useTranslations('devices');
  const { stats, devices, isLoading: devicesLoading } = useDevices();
  const { batches, isLoading: batchesLoading } = useBatches();
  const { locations } = useLocations();

  const recentBatches = useMemo(() => {
    return [...batches]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [batches]);

  const recentDevices = useMemo(() => {
    return [...devices]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [devices]);

  const getBatchFarmAndBarn = (batch: typeof batches[0]) => {
    if (batch.farmId) {
      const farm = locations.find((l) => l.id === batch.farmId);
      const barn = batch.barnIds?.length
        ? locations.find((l) => l.id === batch.barnIds[0])
        : undefined;
      return { farm: farm?.name || '-', barn: barn?.name };
    }
    if (batch.locationId) {
      const path = getLocationPath(locations, batch.locationId);
      const farm = path.find((l) => l.type === 'farm');
      const barn = path.find((l) => l.type === 'barn');
      return { farm: farm?.name || '-', barn: barn?.name };
    }
    return { farm: '-', barn: undefined };
  };

  const getDeviceTypeLabel = (device: typeof devices[0]) => {
    if (device.type === 'sensor') {
      const config = device.configuration as Partial<SensorConfig> | undefined;
      const profile = config?.sensorProfile;
      if (profile) {
        return `Sensor · ${SENSOR_PROFILE_SHORT_LABELS[profile]}`;
      }
    }
    return tDevices(`types.${device.type}`);
  };

  const getDeviceLocationName = (locationId: string | null) => {
    if (!locationId) return null;
    return locations.find((l) => l.id === locationId)?.name || null;
  };

  const getBatchStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const activeBatchCount = useMemo(() => batches.filter(b => b.status === 'active').length, [batches]);

  if (devicesLoading || batchesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} subtitle={t('welcome')} />

      {/* Alerts — ordered by severity */}
      {(stats.offline > 0 || stats.orphans > 0 || stats.pending > 0) && (
        <div className="space-y-2">
          {stats.offline > 0 && (
            <AlertBanner
              variant="error"
              message={t('alerts.offlineDevices', { count: stats.offline })}
              actionLabel={t('alerts.fixOffline')}
              actionHref="/dispositivos"
            />
          )}
          {stats.orphans > 0 && (
            <AlertBanner
              variant="warning"
              message={t('alerts.orphanDevices', { count: stats.orphans })}
              actionLabel={t('alerts.fixOrphans')}
              actionHref="/dispositivos/huerfanos"
            />
          )}
          {stats.pending > 0 && (
            <AlertBanner
              variant="warning"
              message={t('alerts.pendingConfig', { count: stats.pending })}
              actionLabel={t('alerts.fixPending')}
              actionHref="/dispositivos"
            />
          )}
        </div>
      )}

      {/* Info banner explicativo */}
      {stats.total > 0 && (
        <div className="bg-surface-2/30 border border-line rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-brand-primary/10 shrink-0">
              <Cpu className="h-4 w-4 text-brand-primary" />
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-fg">
                Entendiendo tus dispositivos
              </p>
              <p className="text-fg-tertiary leading-relaxed">
                <span className="font-medium text-fg">Sin instalar:</span> dispositivos que necesitan ubicación y configuración.
                {' · '}
                <span className="font-medium text-fg">Por configurar:</span> ya instalados en una ubicación, solo falta configurarlos.
                {' · '}
                <span className="font-medium text-fg">En producción:</span> instalados, configurados y recopilando datos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatsCard
          title={t('totalDevices')}
          description={t('totalDevicesDesc')}
          helpText={stats.total > 0 ? `${stats.inProduction} + ${stats.pending} + ${stats.orphans}` : undefined}
          value={stats.total}
          icon={Cpu}
          variant="default"
          href="/dispositivos"
        />
        <StatsCard
          title={t('inProduction')}
          description={t('inProductionDesc')}
          helpText={t('inProductionHelp')}
          value={stats.inProduction}
          icon={Activity}
          variant="success"
          href="/dispositivos"
        />
        <StatsCard
          title={t('pendingConfig')}
          description={t('pendingConfigDesc')}
          helpText={t('pendingConfigHelp')}
          value={stats.pending}
          icon={Package}
          variant={stats.pending > 0 ? 'warning' : 'default'}
          href="/dispositivos"
        />
        <StatsCard
          title={t('orphanDevices')}
          description={t('orphanDevicesDesc')}
          helpText={t('orphanDevicesHelp')}
          value={stats.orphans}
          icon={AlertTriangle}
          variant={stats.orphans > 0 ? 'destructive' : 'default'}
          href="/dispositivos/huerfanos"
        />
        <StatsCard
          title={t('activeBatches')}
          value={activeBatchCount}
          icon={Users}
          variant={activeBatchCount > 0 ? 'success' : 'default'}
          href="/lotes"
        />
      </div>

      {/* Quick Actions - Contextual based on device state */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fg-tertiary uppercase tracking-wide">
            {t('quickActions')}
          </h2>
          {(stats.orphans > 0 || stats.pending > 0) && (
            <p className="text-xs text-fg-tertiary">
              Para dispositivos en tu cuenta
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Show orphan device action if there are orphans */}
          {stats.orphans > 0 && (
            <Link href="/dispositivos/huerfanos" className="block">
              <div className="p-4 rounded-lg border border-error/50 bg-error/5 hover:bg-error/10 transition-colors h-full">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-error/20 shrink-0">
                    <Link2 className="h-4 w-4 text-error" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-fg">
                      {t('installOrphanDevices', { count: stats.orphans })}
                    </p>
                    <p className="text-xs text-fg-tertiary mt-1 leading-relaxed">
                      Asignar ubicación a dispositivos que ya tienes
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Show pending config action if there are pending */}
          {stats.pending > 0 && (
            <Link href="/dispositivos?filter=pending" className="block">
              <div className="p-4 rounded-lg border border-warning/50 bg-warning/5 hover:bg-warning/10 transition-colors h-full">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-warning/20 shrink-0">
                    <Package className="h-4 w-4 text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-fg">
                      {t('configurePendingDevices', { count: stats.pending })}
                    </p>
                    <p className="text-xs text-fg-tertiary mt-1 leading-relaxed">
                      Completar configuración de los ya instalados
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Always show create location if no urgent actions or show as third option */}
          {(stats.orphans === 0 && stats.pending === 0) && (
            <Link href="/ubicaciones/nueva" className="block">
              <div className="p-4 rounded-lg border hover:bg-surface-2/50 transition-colors h-full">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-brand-primary/10 shrink-0">
                    <MapPin className="h-4 w-4 text-brand-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-fg">
                      {t('createLocation')}
                    </p>
                    <p className="text-xs text-fg-tertiary mt-1 leading-relaxed">
                      Agregar nueva granja o galpón
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Secondary actions */}
        {(stats.orphans > 0 || stats.pending > 0) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button as={Link} href="/ubicaciones/nueva" variant="ghost" size="sm" icon={<MapPin className="h-3.5 w-3.5" />}>
              {t('createLocation')}
            </Button>
            {stats.inProduction > 0 && (
              <Button as={Link} href="/lotes/nuevo" variant="ghost" size="sm" icon={<Layers className="h-3.5 w-3.5" />}>
                {t('createBatch')}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Recent Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Batches */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-fg-tertiary uppercase tracking-wide">
              {t('recentBatches.title')}
            </h2>
            <Link href="/lotes">
              <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs">
                {t('recentBatches.viewAll')}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {recentBatches.length === 0 ? (
            <p className="text-sm text-fg-tertiary px-1 py-4 text-center border rounded-lg">
              {tBatches('noBatches')}
            </p>
          ) : (
            <div className="space-y-2">
              {recentBatches.map((batch) => {
                const { farm, barn } = getBatchFarmAndBarn(batch);
                return (
                  <Link
                    key={batch.id}
                    href={`/lotes/${batch.id}`}
                    className="block px-4 py-3 rounded-lg border hover:bg-surface-2/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{batch.name}</p>
                        <p className="text-xs text-fg-tertiary truncate mt-0.5">
                          {farm}{barn ? ` · ${barn}` : ''}
                          {' · '}{batch.animalCount.toLocaleString()} animales
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={getBatchStatusVariant(batch.status)}>
                          {tBatches(`status.${batch.status}`)}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-fg-tertiary" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Devices */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-fg-tertiary uppercase tracking-wide">
              {t('recentDevices.title')}
            </h2>
            <Link href="/dispositivos">
              <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs">
                {t('recentDevices.viewAll')}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {recentDevices.length === 0 ? (
            <p className="text-sm text-fg-tertiary px-1 py-4 text-center border rounded-lg">
              {tDevices('noDevices')}
            </p>
          ) : (
            <div className="space-y-2">
              {recentDevices.map((device) => {
                const locationName = getDeviceLocationName(device.locationId);
                return (
                  <Link
                    key={device.id}
                    href={`/dispositivos/${device.id}`}
                    className="block px-4 py-3 rounded-lg border hover:bg-surface-2/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm font-mono truncate">{device.serialNumber}</p>
                        <p className="text-xs text-fg-tertiary mt-0.5">
                          {getDeviceTypeLabel(device)}
                          {locationName && ` · ${locationName}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <DeviceStateChip state={device.state} size="sm" />
                        <NextActionCTA device={device} variant="tertiary" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Checklist */}
      <OnboardingChecklist />
    </div>
  );
}
