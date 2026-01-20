'use client';

import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/PageHeader';
import { LocationForm } from '@/components/locations/LocationForm';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingState';
import { useLocations } from '@/lib/hooks/useLocations';
import { MapPin } from 'lucide-react';

export default function EditLocationPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const t = useTranslations('locations');
  const { getLocation, isLoading } = useLocations();

  const location = getLocation(id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!location) {
    return (
      <EmptyState
        icon={MapPin}
        title="Ubicación no encontrada"
        description="La ubicación que buscas no existe"
        actionLabel="Volver a ubicaciones"
        actionHref="/ubicaciones"
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title={t('editLocation')}
        subtitle={location.name}
        showBack
        backHref={`/ubicaciones/${id}`}
      />
      <LocationForm mode="edit" initialData={location} />
    </div>
  );
}
