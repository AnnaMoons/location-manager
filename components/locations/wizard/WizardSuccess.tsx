'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CheckCircle, MapPin, Warehouse, Fence } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Location } from '@/lib/types/location';
import { Species } from '@/lib/types/species';

interface WizardSuccessProps {
  farm: Location;
  species: Species;
  barns: Location[];
  pensCreated: number;
  isSection: boolean;
  onCreateAnother: () => void;
}

export function WizardSuccess({
  farm,
  species,
  barns,
  pensCreated,
  isSection,
  onCreateAnother,
}: WizardSuccessProps) {
  const t = useTranslations('locations.wizard');
  const tLoc = useTranslations('locations');

  return (
    <div className="space-y-6 text-center">
      {/* Success icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center animate-in zoom-in-50 duration-500">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold">{t('successTitle')}</h2>
        <p className="text-fg-tertiary mt-1">{t('successDesc')}</p>
      </div>

      {/* Tree summary */}
      <div className="rounded-lg border p-4 text-left">
        <h3 className="text-xs font-medium text-fg-tertiary mb-3 uppercase tracking-wide">
          {t('summary')}
        </h3>

        {/* Farm */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-brand-primary shrink-0" />
          <span className="font-semibold text-sm">{farm.name}</span>
          <span className="text-xs text-fg-tertiary">({tLoc(`species.${species}`)})</span>
        </div>

        {/* Barns */}
        <div className="ml-3 mt-2 border-l-2 border-surface-2 pl-4 space-y-1.5">
          {barns.map((barn) => (
            <div key={barn.id} className="flex items-center gap-2">
              <Warehouse className="h-3.5 w-3.5 text-brand-primary shrink-0" />
              <span className="text-sm">{barn.name}</span>
            </div>
          ))}
        </div>

        {/* Pens */}
        {pensCreated > 0 && (
          <div className="mt-3 flex items-center gap-2 ml-3 pl-4">
            <Fence className="h-3.5 w-3.5 text-success shrink-0" />
            <span className="text-sm text-fg-tertiary">
              {isSection
                ? t('sectionsCreated', { count: pensCreated })
                : t('pensCreated', { count: pensCreated })}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCreateAnother}>
          {t('createAnother')}
        </Button>
        <Link href={`/ubicaciones/${farm.id}`} className="flex-1">
          <Button className="w-full">{t('viewFarm')}</Button>
        </Link>
      </div>
    </div>
  );
}
