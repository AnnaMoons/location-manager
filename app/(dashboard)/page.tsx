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
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-primary/10 shrink-0">
              <Cpu className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-foreground">
                Entendiendo tus dispositivos
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Sin instalar:</span> dispositivos que necesitan ubicación y configuración.
                {' · '}
                <span className="font-medium text-foreground">Por configurar:</span> ya instalados en una ubicación, solo falta configurarlos.
                {' · '}
                <span className="font-medium text-foreground">En producción:</span> instalados, configurados y recopilando datos.
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

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link href="/ubicaciones/nueva">
            <MapPin className="h-4 w-4 mr-2" />
            {t('createLocation')}
          </Link>
        </Button>
        <Button asChild>
          <Link href="/dispositivos/huerfanos">
            <Link2 className="h-4 w-4 mr-2" />
            {t('assignDevice')}
          </Link>
        </Button>
        <Button asChild>
          <Link href="/lotes/nuevo">
            <Layers className="h-4 w-4 mr-2" />
            {t('createBatch')}
          </Link>
        </Button>
      </div>

      {/* Recent Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Batches */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
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
            <p className="text-sm text-muted-foreground px-1 py-4 text-center border rounded-lg">
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
                    className="block px-4 py-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{batch.name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {farm}{barn ? ` · ${barn}` : ''}
                          {' · '}{batch.animalCount.toLocaleString()} animales
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={getBatchStatusVariant(batch.status)}>
                          {tBatches(`status.${batch.status}`)}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
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
            <p className="text-sm text-muted-foreground px-1 py-4 text-center border rounded-lg">
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
                    className="block px-4 py-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm font-mono truncate">{device.serialNumber}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
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
