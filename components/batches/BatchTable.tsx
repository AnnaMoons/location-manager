'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MapPin, Users, Clock, Calendar } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Batch, calculateCurrentAge, calculateDaysRemaining } from '@/lib/types/batch';
import { Location } from '@/lib/types/location';

interface BatchWithLocation extends Batch {
  location?: Location;
  farm?: Location;
  barns?: Location[];
  pens?: Location[];
}

interface BatchTableProps {
  batches: BatchWithLocation[];
}

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
  pens: Location[]
): string {
  if (!farm) return '';
  const parts: string[] = [farm.name];
  if (barns.length > 0) parts.push(`${barns.length} galp.`);
  if (pens.length > 0) parts.push(`${pens.length} corr.`);
  return parts.join(' · ');
}

export function BatchTable({ batches }: BatchTableProps) {
  const t = useTranslations('batches');
  const tSpecies = useTranslations('locations.species');

  if (batches.length === 0) {
    return null;
  }

  return (
    <div className="border border-line rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-2/50">
            <TableHead>{t('batchTable.name')}</TableHead>
            <TableHead>{t('batchTable.species')}</TableHead>
            <TableHead>{t('batchTable.status')}</TableHead>
            <TableHead>{t('batchTable.location')}</TableHead>
            <TableHead className="text-right">{t('batchTable.animals')}</TableHead>
            <TableHead className="text-right">{t('batchTable.age')}</TableHead>
            <TableHead>{t('batchTable.startDate')}</TableHead>
            <TableHead className="text-right">{t('batchTable.remaining')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches.map((batch) => {
            const currentAge = calculateCurrentAge(batch);
            const daysRemaining = calculateDaysRemaining(batch);
            const displayFarm = batch.farm || batch.location;
            const locationSummary = formatLocationSummary(
              displayFarm,
              batch.barns || [],
              batch.pens || []
            );

            return (
              <TableRow key={batch.id} className="hover:bg-surface-2/30">
                {/* Nombre */}
                <TableCell>
                  <Link
                    href={`/lotes/${batch.id}`}
                    className="font-medium text-fg hover:underline"
                  >
                    {batch.name}
                  </Link>
                </TableCell>

                {/* Especie */}
                <TableCell className="text-sm text-fg-tertiary">
                  {tSpecies(batch.species)}
                </TableCell>

                {/* Estado */}
                <TableCell>
                  <Badge variant={getStatusVariant(batch.status)}>
                    {t(`status.${batch.status}`)}
                  </Badge>
                </TableCell>

                {/* Ubicación */}
                <TableCell>
                  {locationSummary ? (
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-fg-tertiary flex-shrink-0" />
                      <span className="truncate max-w-50">{locationSummary}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-fg-tertiary">-</span>
                  )}
                </TableCell>

                {/* Animales */}
                <TableCell className="text-right tabular-nums">
                  {batch.animalCount.toLocaleString()}
                </TableCell>

                {/* Edad */}
                <TableCell className="text-right text-sm text-fg-tertiary tabular-nums">
                  {currentAge} {t('days')}
                </TableCell>

                {/* Fecha inicio */}
                <TableCell className="text-sm text-fg-tertiary">
                  {new Date(batch.startDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>

                {/* Días restantes */}
                <TableCell className="text-right text-sm tabular-nums">
                  {batch.status !== 'active' ? (
                    <span className="text-fg-tertiary">-</span>
                  ) : daysRemaining !== null && daysRemaining > 0 ? (
                    <span className="text-fg-tertiary">
                      {daysRemaining} {t('days')}
                    </span>
                  ) : daysRemaining !== null ? (
                    <span className="text-error font-medium">
                      {t('endDatePassed')}
                    </span>
                  ) : (
                    <span className="text-fg-tertiary">-</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
