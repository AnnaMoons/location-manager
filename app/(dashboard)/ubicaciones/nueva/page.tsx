'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/shared/PageHeader';
import { LocationForm } from '@/components/locations/LocationForm';

export default function NewLocationPage() {
  const t = useTranslations('locations');
  const [backHref, setBackHref] = useState('/ubicaciones');

  useEffect(() => {
    const redirectTo = sessionStorage.getItem('redirectAfterLocation');
    if (redirectTo) {
      setBackHref(redirectTo);
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title={t('newLocation')} showBack backHref={backHref} />
      <LocationForm mode="create" />
    </div>
  );
}
