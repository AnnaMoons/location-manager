'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MapPin, Users, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Batch, calculateCurrentAge, calculateDaysRemaining } from '@/lib/types/batch';
import { Location } from '@/lib/types/location';
import { cn } from '@/lib/utils';

interface BatchCardProps {
  batch: Batch;
  location?: Location;
  farm?: Location;
  barns?: Location[];
  pens?: Location[];
}

const SPECIES_BORDER: Record<string, string> = {
  pigs: 'border-l-product-pigvision',
  broilers: 'border-l-surface-blue-2',
  layers: 'border-l-primitive-mint-500',
};

function getStatusVariant(status: string): 'success' | 'secondary' | 'destructive' | 'default' {
  switch (status) {
    case 'active': return 'success';
    case 'completed': return 'secondary';
    case 'cancelled': return 'destructive';
    default: return 'default';
  }
}

function formatLocationSummary(
  farm: Location | undefined,
  barns: Location[],
  pens: Location[],
  t: (key: string, values?: Record<string, number>) => string
): string {
  if (!farm) return '';
  const parts: string[] = [farm.name];
  if (barns.length > 0) parts.push(barns.length === 1 ? `1 ${t('barn')}` : `${barns.length} ${t('barnsPlural')}`);
  if (pens.length > 0) parts.push(pens.length === 1 ? `1 ${t('pen')}` : `${pens.length} ${t('pensPlural')}`);
  return parts.join(' · ');
}

export function BatchCard({ batch, location, farm, barns = [], pens = [] }: BatchCardProps) {
  const t = useTranslations('batches');
  const tSpecies = useTranslations('locations.species');

  const currentAge = calculateCurrentAge(batch);
  const daysRemaining = calculateDaysRemaining(batch);
  const displayFarm = farm || location;
  const locationSummary = formatLocationSummary(displayFarm, barns, pens, t);
  const borderColor = SPECIES_BORDER[batch.species] ?? 'border-l-line';

  return (
    <Link href={`/lotes/${batch.id}`} className="block">
      <div className={cn('rounded-lg border border-l-4 hover:bg-surface-2/50 transition-colors p-4 space-y-3', borderColor)}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-snug truncate">{batch.name}</p>
            <p className="text-xs text-fg-tertiary mt-0.5">{tSpecies(batch.species)}</p>
          </div>
          <Badge variant={getStatusVariant(batch.status)} className="shrink-0">
            {t(`status.${batch.status}`)}
          </Badge>
        </div>

        {/* Metadata */}
        <div className="space-y-1.5">
          {locationSummary && (
            <div className="flex items-center gap-2 text-xs text-fg-tertiary">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{locationSummary}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-fg-tertiary">
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span>{batch.animalCount.toLocaleString()} {t('animals')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-fg-tertiary">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{t('currentAge')}: {currentAge} {t('days')}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-xs text-fg-tertiary">
            {batch.status === 'active' && daysRemaining !== null
              ? daysRemaining > 0
                ? `${daysRemaining} ${t('daysRemaining')}`
                : t('endDatePassed')
              : new Date(batch.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <ChevronRight className="h-3.5 w-3.5 text-fg-tertiary" />
        </div>
      </div>
    </Link>
  );
}
