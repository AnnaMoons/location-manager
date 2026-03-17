'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingState';
import { InstallationWizard } from '@/components/devices/InstallationWizard';
import { useDevices } from '@/lib/hooks/useDevices';
import { Cpu } from 'lucide-react';

export default function InstallDevicePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const searchParams = useSearchParams();
  const isChangingLocation = searchParams.get('cambiar') === 'true';
  const t = useTranslations('devices.installation');
  const tDetail = useTranslations('devices.detail');
  const { getDevice, isLoading } = useDevices();

  const device = getDevice(id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!device) {
    return (
      <EmptyState
        icon={Cpu}
        title={tDetail('notFound')}
        description={tDetail('notFoundDesc')}
        actionLabel={tDetail('backToList')}
        actionHref="/dispositivos"
      />
    );
  }

  // Only block if device has location AND we're not trying to change it
  if (device.locationId && !isChangingLocation) {
    return (
      <EmptyState
        icon={Cpu}
        title={t('alreadyInstalled')}
        description={t('alreadyInstalledDesc')}
        actionLabel={t('viewDevice')}
        actionHref={`/dispositivos/${id}`}
      />
    );
  }

  const title = isChangingLocation ? t('changeTitle') : t('title');

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title={title}
        subtitle={device.serialNumber}
        showBack
        backHref={`/dispositivos/${id}`}
      />
      <InstallationWizard device={device} isChangingLocation={isChangingLocation} />
    </div>
  );
}
