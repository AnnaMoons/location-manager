'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plus, Search, Filter, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { BatchCard } from '@/components/batches/BatchCard';
import { BatchTable } from '@/components/batches/BatchTable';
import { useBatches } from '@/lib/hooks/useBatches';
import { Species } from '@/lib/types/species';
import { BatchStatus } from '@/lib/types/batch';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'table';

export default function BatchesPage() {
  const t = useTranslations('batches');
  const tSpecies = useTranslations('locations.species');
  const { batches, isLoading, getBatchesWithLocation } = useBatches();

  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<Species | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<BatchStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const batchesWithLocation = useMemo(
    () => getBatchesWithLocation(),
    [batches, getBatchesWithLocation]
  );

  const filteredBatches = useMemo(() => {
    return batchesWithLocation.filter((batch) => {
      const matchesSearch = batch.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesSpecies =
        speciesFilter === 'all' || batch.species === speciesFilter;
      const matchesStatus =
        statusFilter === 'all' || batch.status === statusFilter;
      return matchesSearch && matchesSpecies && matchesStatus;
    });
  }, [batchesWithLocation, searchQuery, speciesFilter, statusFilter]);

  if (isLoading) {
    return (
      <div>
        <PageHeader title={t('title')} subtitle={t('subtitle')} />
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        actions={
          <Link href="/lotes/nuevo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('newBatch')}
            </Button>
          </Link>
        }
      />

      {batches.length === 0 ? (
        <EmptyState
          title={t('noBatches')}
          description={t('noBatchesDesc')}
          actionLabel={t('createFirst')}
          actionHref="/lotes/nuevo"
        />
      ) : (
        <>
          {/* Filters + View Toggle */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={speciesFilter}
                onValueChange={(value) =>
                  setSpeciesFilter(value as Species | 'all')
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t('filterBySpecies')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allSpecies')}</SelectItem>
                  <SelectItem value="pigs">{tSpecies('pigs')}</SelectItem>
                  <SelectItem value="broilers">{tSpecies('broilers')}</SelectItem>
                  <SelectItem value="layers">{tSpecies('layers')}</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as BatchStatus | 'all')
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allStatuses')}</SelectItem>
                  <SelectItem value="active">{t('status.active')}</SelectItem>
                  <SelectItem value="completed">{t('status.completed')}</SelectItem>
                  <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'h-8 px-2.5',
                    viewMode === 'grid' && 'bg-muted'
                  )}
                  title={t('viewGrid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={cn(
                    'h-8 px-2.5',
                    viewMode === 'table' && 'bg-muted'
                  )}
                  title={t('viewTable')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Batch List */}
          {filteredBatches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('noResults')}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBatches.map((batch) => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  location={batch.location}
                  farm={batch.farm}
                  barns={batch.barns}
                  pens={batch.pens}
                />
              ))}
            </div>
          ) : (
            <BatchTable batches={filteredBatches} />
          )}
        </>
      )}
    </div>
  );
}
