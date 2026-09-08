'use client';

import { Fragment, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Building2, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LocationForm } from '@/components/locations/LocationForm';
import { FarmCreationWizard } from '@/components/locations/wizard/FarmCreationWizard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { speciesHierarchies } from '@/lib/types/species';

type PageMode = 'select' | 'wizard' | 'form';

export default function NewLocationPage() {
  const t = useTranslations('locations');
  const tWiz = useTranslations('locations.wizard');
  const [mode, setMode] = useState<PageMode>('select');
  const [backHref, setBackHref] = useState('/ubicaciones');
  const [fromHub, setFromHub] = useState(false);

  // If coming from device installation wizard, go straight to form mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const redirectTo = sessionStorage.getItem('redirectAfterLocation');
      const barnParent = sessionStorage.getItem('createBarnParentId');
      const penParent = sessionStorage.getItem('createPenParentId');
      if (redirectTo || barnParent || penParent) {
        setMode('form');
        if (redirectTo) setBackHref(redirectTo);
      }
    }
  }, []);

  // Wizard mode
  if (mode === 'wizard') {
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader title={tWiz('title')} showBack onBack={() => setMode('select')} />
        <FarmCreationWizard />
      </div>
    );
  }

  // Form mode
  if (mode === 'form') {
    const backToHub = fromHub ? () => setMode('select') : undefined;
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title={t('newLocation')}
          showBack
          onBack={backToHub}
          backHref={backToHub ? undefined : backHref}
        />
        <LocationForm
          mode="create"
          onCancel={backToHub}
        />
      </div>
    );
  }

  // Hierarchy preview for pigs (most common)
  const previewSpecies = 'pigs' as const;
  const hierarchy = speciesHierarchies[previewSpecies];

  // Selection mode
  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title={t('newLocation')} showBack backHref="/ubicaciones" />

      <p className="text-fg-tertiary mb-6 text-center">{tWiz('selectMode')}</p>

      <div className="grid gap-4">
        {/* Wizard card — recommended */}
        <Card
          className="cursor-pointer border-2 border-brand-primary hover:bg-brand-primary/5 transition-colors relative"
          onClick={() => setMode('wizard')}
        >
          <Badge className="absolute -top-2.5 left-4 bg-brand-primary text-brand-fg text-xs">
            {tWiz('recommended')}
          </Badge>
          <CardContent className="pt-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-brand-primary" />
            </div>
            <div className="space-y-2">
              <div>
                <p className="font-semibold">{tWiz('farmGuided')}</p>
                <p className="text-sm text-fg-tertiary">{tWiz('farmGuidedDesc')}</p>
              </div>
              {/* Hierarchy preview pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {hierarchy.levels.map((level, i, arr) => (
                  <Fragment key={level}>
                    <span className="px-2 py-0.5 rounded-full bg-surface-blue text-xs font-medium text-brand-primary">
                      {hierarchy.labels[level]}
                    </span>
                    {i < arr.length - 1 && (
                      <ChevronRight className="h-3 w-3 text-fg-tertiary" />
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other location card — subdued */}
        <Card
          className="cursor-pointer hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-colors"
          onClick={() => { setFromHub(true); setMode('form'); }}
        >
          <CardContent className="pt-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-fg-tertiary" />
            </div>
            <div>
              <p className="font-semibold">{tWiz('otherLocation')}</p>
              <p className="text-sm text-fg-tertiary">{tWiz('otherLocationDesc')}</p>
              <p className="text-xs text-fg-tertiary mt-1">{tWiz('otherLocationHint')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
