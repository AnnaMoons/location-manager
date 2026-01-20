'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Cpu, Activity, AlertTriangle, Package, Plus, MapPin, ArrowRight, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AlertBanner } from '@/components/dashboard/AlertBanner';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { useDevices } from '@/lib/hooks/useDevices';
import { useBatches } from '@/lib/hooks/useBatches';
import { useLocations } from '@/lib/hooks/useLocations';
import { getLocationPath } from '@/lib/types/location';
import { LoadingSpinner } from '@/components/shared/LoadingState';
import { PageHeader } from '@/components/shared/PageHeader';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tBatches = useTranslations('batches');
  const tDevices = useTranslations('devices');
  const tLocations = useTranslations('locations');
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

  const getLocationName = (locationId: string | null) => {
    if (!locationId) return '-';
    const location = locations.find((l) => l.id === locationId);
    return location?.name || '-';
  };

  const getBatchFarmAndBarn = (locationId: string) => {
    const path = getLocationPath(locations, locationId);
    const farm = path.find((l) => l.type === 'farm');
    const barn = path.find((l) => l.type === 'barn');
    return { farm: farm?.name || '-', barn: barn?.name || '-' };
  };

  const getBatchStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getDeviceStateVariant = (state: string) => {
    switch (state) {
      case 'in_production':
        return 'success';
      case 'configured':
      case 'installed':
        return 'warning';
      case 'maintenance':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const isLoading = devicesLoading || batchesLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} subtitle={t('welcome')} />

      {/* Alerts */}
      {stats.orphans > 0 && (
        <AlertBanner
          variant="warning"
          message={t('alerts.orphanDevices', { count: stats.orphans })}
          actionLabel={t('quickActions')}
          actionHref="/dispositivos/huerfanos"
        />
      )}

      {stats.offline > 0 && (
        <AlertBanner
          variant="error"
          message={t('alerts.offlineDevices', { count: stats.offline })}
          actionHref="/dispositivos"
        />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title={t('totalDevices')}
          value={stats.total}
          icon={Cpu}
          variant="default"
        />
        <StatsCard
          title={t('inProduction')}
          value={stats.inProduction}
          icon={Activity}
          variant="success"
        />
        <StatsCard
          title={t('pendingConfig')}
          value={stats.pending}
          icon={Package}
          variant="warning"
        />
        <StatsCard
          title={t('orphanDevices')}
          value={stats.orphans}
          icon={AlertTriangle}
          variant={stats.orphans > 0 ? 'destructive' : 'default'}
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">{t('quickActions')}</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dispositivos">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('installDevice')}
            </Button>
          </Link>
          <Link href="/ubicaciones/nueva">
            <Button variant="outline">
              <MapPin className="mr-2 h-4 w-4" />
              {t('createLocation')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Batches Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">{t('recentBatches.title')}</CardTitle>
            <Link href="/lotes">
              <Button variant="ghost" size="sm" className="gap-1">
                {t('recentBatches.viewAll')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentBatches.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {tBatches('noBatches')}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-muted-foreground">{t('recentBatches.name')}</th>
                      <th className="text-left py-2 font-medium text-muted-foreground hidden sm:table-cell">{t('recentBatches.farm')}</th>
                      <th className="text-left py-2 font-medium text-muted-foreground hidden md:table-cell">{t('recentBatches.barn')}</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">{t('recentBatches.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBatches.map((batch) => {
                      const { farm, barn } = getBatchFarmAndBarn(batch.locationId);
                      return (
                        <tr key={batch.id} className="border-b last:border-0">
                          <td className="py-2">
                            <Link href={`/lotes/${batch.id}`} className="hover:underline font-medium">
                              {batch.name}
                            </Link>
                          </td>
                          <td className="py-2 hidden sm:table-cell">{farm}</td>
                          <td className="py-2 hidden md:table-cell">{barn}</td>
                          <td className="py-2">
                            <Badge variant={getBatchStatusVariant(batch.status)}>
                              {tBatches(`status.${batch.status}`)}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Devices Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">{t('recentDevices.title')}</CardTitle>
            <Link href="/dispositivos">
              <Button variant="ghost" size="sm" className="gap-1">
                {t('recentDevices.viewAll')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentDevices.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {tDevices('noDevices')}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-muted-foreground">{t('recentDevices.serialNumber')}</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">{t('recentDevices.type')}</th>
                      <th className="text-left py-2 font-medium text-muted-foreground hidden sm:table-cell">{t('recentDevices.location')}</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">{t('recentDevices.state')}</th>
                      <th className="text-center py-2 font-medium text-muted-foreground">{t('recentDevices.health')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDevices.map((device) => (
                      <tr key={device.id} className="border-b last:border-0">
                        <td className="py-2">
                          <Link href={`/dispositivos/${device.id}`} className="hover:underline font-medium font-mono text-xs">
                            {device.serialNumber}
                          </Link>
                        </td>
                        <td className="py-2">{tDevices(`types.${device.type}`)}</td>
                        <td className="py-2 hidden sm:table-cell">{getLocationName(device.locationId)}</td>
                        <td className="py-2">
                          <Badge variant={getDeviceStateVariant(device.state)}>
                            {tDevices(`states.${device.state}`)}
                          </Badge>
                        </td>
                        <td className="py-2 text-center">
                          {device.health === 'online' ? (
                            <Wifi className="h-4 w-4 text-green-500 inline-block" />
                          ) : device.health === 'offline' ? (
                            <WifiOff className="h-4 w-4 text-red-500 inline-block" />
                          ) : (
                            <WifiOff className="h-4 w-4 text-muted-foreground inline-block" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Checklist */}
      <OnboardingChecklist />
    </div>
  );
}
