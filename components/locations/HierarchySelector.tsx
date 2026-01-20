'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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

  // Track selected farm for cascading selection
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  const speciesOptions: Species[] = ['pigs', 'broilers', 'layers'];
  const typeOptions = species ? speciesHierarchies[species].levels : [];

  // Get the level index of the current location type (0 = farm, 1 = barn, 2 = pen/section)
  const typeLevel = species && locationType
    ? speciesHierarchies[species].levels.indexOf(locationType)
    : -1;

  // Filter farms by selected species
  const availableFarms = farms.filter((f) => f.species === species);

  // Get barns for the selected farm
  const availableBarns = selectedFarmId ? getChildren(selectedFarmId) : [];

  // Reset selections when species or type changes
  useEffect(() => {
    setSelectedFarmId(null);
    onParentChange(null);
  }, [species, locationType]);

  const handleFarmSelect = (farmId: string) => {
    setSelectedFarmId(farmId);
    // If creating a barn, the farm is the parent
    if (typeLevel === 1) {
      onParentChange(farmId);
    } else {
      // If creating a section/pen, need to also select barn
      onParentChange(null);
    }
  };

  const handleBarnSelect = (barnId: string) => {
    onParentChange(barnId);
  };

  return (
    <div className="space-y-4">
      {/* Species Selector */}
      <div className="space-y-2">
        <Label>{t('form.species')}</Label>
        <Select
          value={species || ''}
          onValueChange={(value) => {
            onSpeciesChange(value as Species);
            onTypeChange(speciesHierarchies[value as Species].levels[0]);
            onParentChange(null);
            setSelectedFarmId(null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('form.selectSpecies')} />
          </SelectTrigger>
          <SelectContent>
            {speciesOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`species.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {species && (
          <p className="text-xs text-muted-foreground">
            {t(`hierarchy.${species}`)}
          </p>
        )}
      </div>

      {/* Location Type Selector */}
      {species && (
        <div className="space-y-2">
          <Label>{t('form.locationType')}</Label>
          <Select
            value={locationType || ''}
            onValueChange={(value) => {
              onTypeChange(value as LocationType);
              onParentChange(null);
              setSelectedFarmId(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('form.selectType')} />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`types.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Farm Selector (for barns, pens, sections) */}
      {typeLevel >= 1 && (
        <div className="space-y-2">
          <Label>{t('types.farm')}</Label>
          <Select
            value={selectedFarmId || ''}
            onValueChange={handleFarmSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una granja" />
            </SelectTrigger>
            <SelectContent>
              {availableFarms.length === 0 ? (
                <SelectItem value="" disabled>
                  No hay granjas disponibles
                </SelectItem>
              ) : (
                availableFarms.map((farm) => (
                  <SelectItem key={farm.id} value={farm.id}>
                    {farm.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Barn Selector (for pens, sections - level 2) */}
      {typeLevel >= 2 && selectedFarmId && (
        <div className="space-y-2">
          <Label>{t('types.barn')}</Label>
          <Select
            value={parentId || ''}
            onValueChange={handleBarnSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un galpón" />
            </SelectTrigger>
            <SelectContent>
              {availableBarns.length === 0 ? (
                <SelectItem value="" disabled>
                  No hay galpones en esta granja
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
