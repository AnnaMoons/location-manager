'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { DeviceCard } from '@/components/devices/DeviceCard';
import { AlertBanner } from '@/components/dashboard/AlertBanner';
import { useDevices } from '@/lib/hooks/useDevices';

export default function OrphanDevicesPage() {
  const t = useTranslations('devices');
  const { orphanDevices, isLoading } = useDevices();

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
          message={`${orphanDevices.length} dispositivos necesitan atención`}
          dismissible={false}
        />
      )}

      {orphanDevices.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title={t('noOrphans')}
          description={t('noOrphansDesc')}
          actionLabel="Ver todos los dispositivos"
          actionHref="/dispositivos"
        />
      ) : (
        <div className="space-y-3">
          {orphanDevices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}
