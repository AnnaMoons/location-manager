'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { DeviceCard } from '@/components/devices/DeviceCard';
import { AlertBanner } from '@/components/dashboard/AlertBanner';
import { useDevices } from '@/lib/hooks/useDevices';
import { DeviceState } from '@/lib/types/device';

const STATE_ORDER: Record<DeviceState, number> = {
  registered: 1,
  installed: 2,
  available: 3,
  uninstalled: 4,
  unassigned: 5,
  configured: 6,
  in_production: 7,
  production: 8,
  disabled: 9,
  returned: 10,
  maintenance: 11,
  dead: 12,
};

export default function OrphanDevicesPage() {
  const t = useTranslations('devices');
  const { orphanDevices, isLoading } = useDevices();

  const sortedOrphanDevices = [...orphanDevices].sort((a, b) => {
    const orderA = STATE_ORDER[a.state] ?? 99;
    const orderB = STATE_ORDER[b.state] ?? 99;
    return orderA - orderB;
  });

  if (isLoading) {
    return (
      <div>
        <PageHeader title={t('orphans')} showBack backHref="/dispositivos" />
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('orphans')}
        subtitle={t('orphansDesc')}
        showBack
        backHref="/dispositivos"
      />

      {orphanDevices.length > 0 && (
        <AlertBanner
          variant="warning"
          message={t('orphansBanner', { count: orphanDevices.length })}
          dismissible={false}
        />
      )}

      {orphanDevices.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title={t('noOrphans')}
          description={t('noOrphansDesc')}
          actionLabel={t('viewAll')}
          actionHref="/dispositivos"
        />
      ) : (
        <div className="space-y-3">
          {sortedOrphanDevices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}
