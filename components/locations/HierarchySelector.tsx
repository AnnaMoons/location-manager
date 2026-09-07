'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Warehouse } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Species, LocationType, speciesHierarchies } from '@/lib/types/species';
import { useLocations } from '@/lib/hooks/useLocations';

interface HierarchySelectorProps {
  species: Species | null;
  locationType: LocationType | null;
  parentId: string | null;
  onSpeciesChange: (species: Species) => void;
  onTypeChange: (type: LocationType) => void;
  onParentChange: (parentId: string | null) => void;
}

const SPECIES_BADGE: Record<Species, string> = {
  pigs:     'bg-product-pigvision text-fg',
  broilers: 'bg-primitive-mint-500 text-fg',
  layers:   'bg-surface-blue-2 text-fg',
};

export function HierarchySelector({
  species,
  locationType,
  parentId,
  onSpeciesChange,
  onTypeChange,
  onParentChange,
}: HierarchySelectorProps) {
  const t = useTranslations('locations');
  const { farms, getChildren } = useLocations();

  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  // Barns for the selected farm
  const availableBarns = selectedFarmId ? getChildren(selectedFarmId) : [];

  // Valid child types for the selected farm's species (excludes 'farm')
  const childTypes: LocationType[] = species
    ? speciesHierarchies[species].levels.filter((l) => l !== 'farm')
    : [];

  // Level of selected type: 1 = barn, 2 = pen/section
  const typeLevel = species && locationType
    ? speciesHierarchies[species].levels.indexOf(locationType)
    : -1;

  const handleFarmSelect = (farmId: string) => {
    const farm = farms.find((f) => f.id === farmId);
    if (!farm) return;

    setSelectedFarmId(farmId);
    onSpeciesChange(farm.species);

    // Default to barn since it's always the immediate child of a farm
    const firstChildType = speciesHierarchies[farm.species].levels[1] ?? 'barn';
    onTypeChange(firstChildType);
    onParentChange(farmId); // barn parent = farm
  };

  const handleTypeSelect = (type: LocationType) => {
    onTypeChange(type);
    // If switching to barn: parent = farm; if pen/section: need barn → reset
    if (type === 'barn' && selectedFarmId) {
      onParentChange(selectedFarmId);
    } else {
      onParentChange(null);
    }
  };

  const handleBarnSelect = (barnId: string) => {
    onParentChange(barnId);
  };

  return (
    <div className="space-y-4">
      {/* Step 1: Farm selection */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-fg-tertiary" />
          {t('types.farm')}
        </Label>
        <Select value={selectedFarmId || ''} onValueChange={handleFarmSelect}>
          <SelectTrigger>
            <SelectValue placeholder={t('form.selectFarm') } />
          </SelectTrigger>
          <SelectContent>
            {farms.length === 0 ? (
              <SelectItem value="__empty__" disabled>
                {t('form.noFarmsAvailable')}
              </SelectItem>
            ) : (
              farms.map((farm) => (
                <SelectItem key={farm.id} value={farm.id}>
                  <span className="flex items-center gap-2">
                    {farm.name}
                    <Badge
                      className={`text-2xs border-0 px-1.5 py-0 ${SPECIES_BADGE[farm.species]}`}
                    >
                      {t(`species.${farm.species}`)}
                    </Badge>
                  </span>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Step 2: Child type selection (only if the farm has more than one child level) */}
      {selectedFarmId && childTypes.length > 1 && (
        <div className="space-y-2">
          <Label>{t('form.locationType')}</Label>
          <Select value={locationType || ''} onValueChange={handleTypeSelect}>
            <SelectTrigger>
              <SelectValue placeholder={t('form.selectType')} />
            </SelectTrigger>
            <SelectContent>
              {childTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`types.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Step 3: Barn selection (only for pen/section) */}
      {selectedFarmId && typeLevel >= 2 && (
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <Warehouse className="h-3.5 w-3.5 text-fg-tertiary" />
            {t('types.barn')}
          </Label>
          <Select value={parentId || ''} onValueChange={handleBarnSelect}>
            <SelectTrigger>
              <SelectValue placeholder={t('form.selectBarn')} />
            </SelectTrigger>
            <SelectContent>
              {availableBarns.length === 0 ? (
                <SelectItem value="__empty__" disabled>
                  {t('form.noBarnsAvailable')}
                </SelectItem>
              ) : (
                availableBarns.map((barn) => (
                  <SelectItem key={barn.id} value={barn.id}>
                    {barn.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
