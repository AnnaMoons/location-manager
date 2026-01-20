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
  const { getDevice, isLoading } = useDevices();

  const device = getDevice(id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!device) {
    return (
      <EmptyState
        icon={Cpu}
        title="Dispositivo no encontrado"
        description="El dispositivo que buscas no existe"
        actionLabel="Ver dispositivos"
        actionHref="/dispositivos"
      />
    );
  }

  // Only block if device has location AND we're not trying to change it
  if (device.locationId && !isChangingLocation) {
    return (
      <EmptyState
        icon={Cpu}
        title="Dispositivo ya instalado"
        description="Este dispositivo ya tiene una ubicación asignada"
        actionLabel="Ver dispositivo"
        actionHref={`/dispositivos/${id}`}
      />
    );
  }

  const title = isChangingLocation ? 'Cambiar ubicación' : t('title');

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
