'use client';

import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/PageHeader';
import { LocationForm } from '@/components/locations/LocationForm';

export default function NewLocationPage() {
  const t = useTranslations('locations');

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title={t('newLocation')} showBack backHref="/ubicaciones" />
      <LocationForm mode="create" />
    </div>
  );
}
