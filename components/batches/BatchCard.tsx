'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Batch, calculateCurrentAge, calculateDaysRemaining } from '@/lib/types/batch';
import { Location } from '@/lib/types/location';

interface BatchCardProps {
  batch: Batch;
  location?: Location; // For backwards compatibility (farm)
  farm?: Location;
  barns?: Location[];
  pens?: Location[];
}

function formatLocationSummary(
  farm: Location | undefined,
  barns: Location[],
  pens: Location[],
  t: (key: string, values?: Record<string, number>) => string
): string {
  if (!farm) return '';

  const parts: string[] = [farm.name];

  if (barns.length > 0) {
    parts.push(
      barns.length === 1
        ? `1 ${t('barn')}`
        : `${barns.length} ${t('barnsPlural')}`
    );
  }

  if (pens.length > 0) {
    parts.push(
      pens.length === 1
        ? `1 ${t('pen')}`
        : `${pens.length} ${t('pensPlural')}`
    );
  }

  return parts.join(' • ');
}

export function BatchCard({ batch, location, farm, barns = [], pens = [] }: BatchCardProps) {
  const t = useTranslations('batches');
  const tSpecies = useTranslations('locations.species');

  const currentAge = calculateCurrentAge(batch);
  const daysRemaining = calculateDaysRemaining(batch);

  // Use farm prop or fall back to location for backwards compatibility
  const displayFarm = farm || location;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const locationSummary = formatLocationSummary(displayFarm, barns, pens, t);

  return (
    <Link href={`/lotes/${batch.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{batch.name}</CardTitle>
            <Badge className={getStatusColor(batch.status)}>
              {t(`status.${batch.status}`)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {tSpecies(batch.species)}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Location Summary */}
          {locationSummary && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{locationSummary}</span>
            </div>
          )}

          {/* Animal Count */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {batch.animalCount.toLocaleString()} {t('animals')}
            </span>
          </div>

          {/* Current Age */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {t('currentAge')}: {currentAge} {t('days')}
            </span>
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {t('started')}:{' '}
              {new Date(batch.startDate).toLocaleDateString()}
            </span>
          </div>

          {/* Days Remaining */}
          {daysRemaining !== null && batch.status === 'active' && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                {daysRemaining > 0
                  ? `${daysRemaining} ${t('daysRemaining')}`
                  : t('endDatePassed')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
