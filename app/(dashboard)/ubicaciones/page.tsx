'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plus, Search, MapPin, ChevronRight } from 'lucide-react';
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
import { LocationCard } from '@/components/locations/LocationCard';
import { useLocations } from '@/lib/hooks/useLocations';
import { Species } from '@/lib/types/species';
import { LocationWithChildren } from '@/lib/types/location';

export default function LocationsPage() {
  const t = useTranslations('locations');
  const { locations, locationTree, isLoading, getChildren } = useLocations();

  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<Species | 'all'>('all');

  const filteredTree = useMemo(() => {
    let filtered = locationTree;

    if (speciesFilter !== 'all') {
      filtered = filtered.filter((loc) => loc.species === speciesFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (loc: LocationWithChildren): boolean => {
        return (
          loc.name.toLowerCase().includes(query) ||
          loc.address?.toLowerCase().includes(query) ||
          loc.children.some(matchesSearch)
        );
      };
      filtered = filtered.filter(matchesSearch);
    }

    return filtered;
  }, [locationTree, speciesFilter, searchQuery]);

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title={t('title')}
          actions={
            <Link href="/ubicaciones/nueva">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('newLocation')}
              </Button>
            </Link>
          }
        />
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        actions={
          <Link href="/ubicaciones/nueva">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('newLocation')}
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search') || 'Buscar...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={speciesFilter}
          onValueChange={(v) => setSpeciesFilter(v as Species | 'all')}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las especies</SelectItem>
            <SelectItem value="pigs">{t('species.pigs')}</SelectItem>
            <SelectItem value="broilers">{t('species.broilers')}</SelectItem>
            <SelectItem value="layers">{t('species.layers')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location List */}
      {locations.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title={t('noLocations')}
          description={t('noLocationsDesc')}
          actionLabel={t('createFirst')}
          actionHref="/ubicaciones/nueva"
        />
      ) : filteredTree.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Sin resultados"
          description="No se encontraron ubicaciones con los filtros aplicados"
        />
      ) : (
        <div className="space-y-3">
          {filteredTree.map((location) => (
            <LocationTreeItem
              key={location.id}
              location={location}
              getChildren={getChildren}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LocationTreeItem({
  location,
  getChildren,
  depth = 0,
  searchQuery = '',
}: {
  location: LocationWithChildren;
  getChildren: (id: string) => any[];
  depth?: number;
  searchQuery?: string;
}) {
  const children = location.children;
  const canCollapse = children.length > 0 && (location.type === 'farm' || location.type === 'barn');

  // Auto-expand if searching and a child matches
  const hasMatchingChild = (loc: LocationWithChildren): boolean => {
    if (!searchQuery) return false;
    const query = searchQuery.toLowerCase();
    return loc.children.some(
      (child) =>
        child.name.toLowerCase().includes(query) ||
        child.address?.toLowerCase().includes(query) ||
        hasMatchingChild(child)
    );
  };

  const [isExpanded, setIsExpanded] = useState(() => {
    // Start expanded if searching and has matching children
    if (searchQuery && hasMatchingChild(location)) return true;
    // Otherwise start collapsed for farms and barns
    return !canCollapse;
  });

  const toggleExpand = () => {
    if (canCollapse) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <div className="flex items-start gap-1">
        {canCollapse ? (
          <button
            onClick={toggleExpand}
            className="mt-3 p-1 hover:bg-muted rounded-md transition-colors flex-shrink-0"
            aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
          >
            <ChevronRight
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ease-in-out ${
                isExpanded ? 'rotate-90' : 'rotate-0'
              }`}
            />
          </button>
        ) : (
          <div className="w-6 flex-shrink-0" />
        )}
        <div className="flex-1">
          <LocationCard
            location={location}
            childCount={children.length}
            indent={depth}
          />
        </div>
      </div>
      {children.length > 0 && (
        <div
          className={`ml-6 overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'opacity-100 mt-2' : 'opacity-0 max-h-0'
          }`}
          style={{
            display: 'grid',
            gridTemplateRows: isExpanded ? '1fr' : '0fr',
          }}
        >
          <div className="min-h-0 space-y-2">
            {children.map((child) => (
              <LocationTreeItem
                key={child.id}
                location={child}
                getChildren={getChildren}
                depth={depth + 1}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
