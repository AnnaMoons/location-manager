'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateBatchInput } from '@/lib/types/batch';
import { Species, speciesHierarchies } from '@/lib/types/species';
import { useLocations } from '@/lib/hooks/useLocations';

interface BatchFormProps {
  initialData?: Partial<CreateBatchInput>;
  onChange: (data: Partial<CreateBatchInput>) => void;
  errors: Record<string, string>;
}

export function BatchForm({ initialData, onChange, errors }: BatchFormProps) {
  const t = useTranslations('batches.form');
  const tSpecies = useTranslations('locations.species');
  const tTypes = useTranslations('locations.types');
  const { locations, filterBySpecies, getChildren } = useLocations();

  const [formData, setFormData] = useState<Partial<CreateBatchInput>>(
    initialData || {}
  );
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [selectedBarnId, setSelectedBarnId] = useState<string>('');

  // Get farms for selected species
  const farms = formData.species
    ? filterBySpecies(formData.species).filter((l) => l.type === 'farm')
    : [];

  // Get barns for selected farm
  const barns = selectedFarmId
    ? getChildren(selectedFarmId).filter((l) => l.type === 'barn')
    : [];

  // Get pens/sections for selected barn (deepest level for location)
  const deepestLocations = selectedBarnId
    ? getChildren(selectedBarnId)
    : [];

  const updateFormData = (updates: Partial<CreateBatchInput>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onChange(newData);
  };

  // Reset dependent selections when species changes
  useEffect(() => {
    if (formData.species) {
      setSelectedFarmId('');
      setSelectedBarnId('');
      updateFormData({ locationId: undefined });
    }
  }, [formData.species]);

  // Reset barn and location when farm changes
  useEffect(() => {
    if (selectedFarmId) {
      setSelectedBarnId('');
      updateFormData({ locationId: undefined });
    }
  }, [selectedFarmId]);

  // Reset location when barn changes
  useEffect(() => {
    if (selectedBarnId) {
      updateFormData({ locationId: undefined });
    }
  }, [selectedBarnId]);

  // Determine if we should show the deepest level selector
  const speciesHierarchy = formData.species
    ? speciesHierarchies[formData.species]
    : null;
  const hasDeepestLevel =
    speciesHierarchy && speciesHierarchy.levels.length > 2;

  return (
    <div className="space-y-6">
      {/* Batch Name */}
      <div className="space-y-2">
        <Label htmlFor="name">{t('name')} (*)</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder={t('namePlaceholder')}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      {/* Species */}
      <div className="space-y-2">
        <Label>{t('species')} (*)</Label>
        <Select
          value={formData.species || ''}
          onValueChange={(value: Species) =>
            updateFormData({ species: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t('speciesPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pigs">{tSpecies('pigs')}</SelectItem>
            <SelectItem value="broilers">{tSpecies('broilers')}</SelectItem>
            <SelectItem value="layers">{tSpecies('layers')}</SelectItem>
          </SelectContent>
        </Select>
        {errors.species && (
          <p className="text-sm text-destructive">{errors.species}</p>
        )}
      </div>

      {/* Location Selection - Hierarchical */}
      {formData.species && (
        <>
          {/* Farm Selection */}
          <div className="space-y-2">
            <Label>{t('farm')} (*)</Label>
            <Select
              value={selectedFarmId}
              onValueChange={(value) => setSelectedFarmId(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('farmPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {farms.map((farm) => (
                  <SelectItem key={farm.id} value={farm.id}>
                    {farm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Barn Selection */}
          {selectedFarmId && (
            <div className="space-y-2">
              <Label>{tTypes('barn')} (*)</Label>
              <Select
                value={selectedBarnId}
                onValueChange={(value) => {
                  setSelectedBarnId(value);
                  // For layers (only 2 levels), barn is the final location
                  if (!hasDeepestLevel) {
                    updateFormData({ locationId: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('barnPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {barns.map((barn) => (
                    <SelectItem key={barn.id} value={barn.id}>
                      {barn.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Deepest Level (Pen/Section) Selection */}
          {hasDeepestLevel && selectedBarnId && deepestLocations.length > 0 && (
            <div className="space-y-2">
              <Label>
                {speciesHierarchy &&
                  tTypes(speciesHierarchy.levels[2])}{' '}
                (*)
              </Label>
              <Select
                value={formData.locationId || ''}
                onValueChange={(value) => updateFormData({ locationId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('locationPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {deepestLocations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {errors.locationId && (
            <p className="text-sm text-destructive">{errors.locationId}</p>
          )}
        </>
      )}

      {/* Animal Count */}
      <div className="space-y-2">
        <Label htmlFor="animalCount">{t('animalCount')} (*)</Label>
        <Input
          id="animalCount"
          type="number"
          min="1"
          value={formData.animalCount || ''}
          onChange={(e) =>
            updateFormData({ animalCount: parseInt(e.target.value) || undefined })
          }
          placeholder={t('animalCountPlaceholder')}
        />
        {errors.animalCount && (
          <p className="text-sm text-destructive">{errors.animalCount}</p>
        )}
      </div>

      {/* Average Age at Start */}
      <div className="space-y-2">
        <Label htmlFor="averageAgeAtStart">{t('averageAge')} (*)</Label>
        <div className="flex gap-2 items-center">
          <Input
            id="averageAgeAtStart"
            type="number"
            min="0"
            value={formData.averageAgeAtStart || ''}
            onChange={(e) =>
              updateFormData({
                averageAgeAtStart: parseInt(e.target.value) || undefined,
              })
            }
            placeholder={t('averageAgePlaceholder')}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground">{t('days')}</span>
        </div>
        {errors.averageAgeAtStart && (
          <p className="text-sm text-destructive">{errors.averageAgeAtStart}</p>
        )}
      </div>

      {/* Start Date */}
      <div className="space-y-2">
        <Label htmlFor="startDate">{t('startDate')} (*)</Label>
        <Input
          id="startDate"
          type="date"
          value={
            formData.startDate
              ? new Date(formData.startDate).toISOString().split('T')[0]
              : ''
          }
          onChange={(e) =>
            updateFormData({
              startDate: e.target.value
                ? new Date(e.target.value).toISOString()
                : undefined,
            })
          }
        />
        {errors.startDate && (
          <p className="text-sm text-destructive">{errors.startDate}</p>
        )}
      </div>

      {/* Estimated End Date (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="estimatedEndDate">{t('estimatedEndDate')}</Label>
        <Input
          id="estimatedEndDate"
          type="date"
          value={
            formData.estimatedEndDate
              ? new Date(formData.estimatedEndDate).toISOString().split('T')[0]
              : ''
          }
          onChange={(e) =>
            updateFormData({
              estimatedEndDate: e.target.value
                ? new Date(e.target.value).toISOString()
                : undefined,
            })
          }
        />
        <p className="text-xs text-muted-foreground">{t('optional')}</p>
      </div>
    </div>
  );
}
