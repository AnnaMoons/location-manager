'use client';

import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingState';
import { LocationForm } from '@/components/locations/LocationForm';
import { useLocations } from '@/lib/hooks/useLocations';
import { canHaveChildren, getNextLevelType } from '@/lib/types/species';

export default function NewChildLocationPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const t = useTranslations('locations');
  const { getLocation, isLoading } = useLocations();

  const parentLocation = getLocation(id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!parentLocation) {
    return (
      <EmptyState
        icon={MapPin}
        title="Ubicación no encontrada"
        description="La ubicación padre no existe"
        actionLabel="Ver ubicaciones"
        actionHref="/ubicaciones"
      />
    );
  }

  if (!canHaveChildren(parentLocation.species, parentLocation.type)) {
    return (
      <EmptyState
        icon={MapPin}
        title="No se pueden agregar hijos"
        description="Este tipo de ubicación no permite ubicaciones hijas"
        actionLabel="Volver"
        actionHref={`/ubicaciones/${id}`}
      />
    );
  }

  const childType = getNextLevelType(parentLocation.species, parentLocation.type);

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title={`${t('newLocation')}: ${t(`types.${childType}`)}`}
        showBack
        backHref={`/ubicaciones/${id}`}
      />
      <LocationForm
        mode="create"
        initialParentId={id}
        initialSpecies={parentLocation.species}
        initialType={childType}
      />
    </div>
  );
}
