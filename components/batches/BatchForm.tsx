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
import { CheckboxGroup } from '@/components/ui/checkbox';
import { CreateBatchInput } from '@/lib/types/batch';
import { Species, speciesHierarchies } from '@/lib/types/species';
import { useLocations } from '@/lib/hooks/useLocations';
import { Location } from '@/lib/types/location';

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

  // Get farms for selected species
  const farms = formData.species
    ? filterBySpecies(formData.species).filter((l) => l.type === 'farm')
    : [];

  // Get barns for selected farm
  const barns = formData.farmId
    ? getChildren(formData.farmId).filter((l) => l.type === 'barn')
    : [];

  // Get pens/sections grouped by barn
  const getPensForBarns = (barnIds: string[]): Record<string, Location[]> => {
    const pensMap: Record<string, Location[]> = {};
    barnIds.forEach((barnId) => {
      const barnPens = getChildren(barnId);
      if (barnPens.length > 0) {
        pensMap[barnId] = barnPens;
      }
    });
    return pensMap;
  };

  const pensGroupedByBarn = formData.barnIds
    ? getPensForBarns(formData.barnIds)
    : {};

  const hasAnyPens = Object.keys(pensGroupedByBarn).length > 0;

  // Determine if we should show pens (species has 3+ levels)
  const speciesHierarchy = formData.species
    ? speciesHierarchies[formData.species]
    : null;
  const hasDeepestLevel =
    speciesHierarchy && speciesHierarchy.levels.length > 2;

  const updateFormData = (updates: Partial<CreateBatchInput>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onChange(newData);
  };

  // Reset dependent selections when species changes
  useEffect(() => {
    if (formData.species && !initialData?.farmId) {
      updateFormData({ farmId: undefined, barnIds: [], penIds: [] });
    }
  }, [formData.species]);

  // Reset barns and pens when farm changes
  useEffect(() => {
    if (formData.farmId && !initialData?.barnIds) {
      updateFormData({ barnIds: [], penIds: [] });
    }
  }, [formData.farmId]);

  // Clean up penIds when barnIds change (remove pens from unselected barns)
  useEffect(() => {
    if (formData.penIds && formData.penIds.length > 0 && formData.barnIds) {
      const validPenIds = formData.penIds.filter((penId) => {
        const pen = locations.find((l) => l.id === penId);
        return pen && formData.barnIds!.includes(pen.parentId || '');
      });
      if (validPenIds.length !== formData.penIds.length) {
        updateFormData({ penIds: validPenIds });
      }
    }
  }, [formData.barnIds]);

  // Convert barns to checkbox options
  const barnOptions = barns.map((barn) => ({
    value: barn.id,
    label: barn.name,
  }));

  // Get pen options for all selected barns
  const getAllPenOptions = () => {
    const options: { value: string; label: string; barnName: string }[] = [];
    Object.entries(pensGroupedByBarn).forEach(([barnId, pens]) => {
      const barn = barns.find((b) => b.id === barnId);
      pens.forEach((pen) => {
        options.push({
          value: pen.id,
          label: pen.name,
          barnName: barn?.name || '',
        });
      });
    });
    return options;
  };

  const penOptions = getAllPenOptions();

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
              value={formData.farmId || ''}
              onValueChange={(value) => updateFormData({ farmId: value })}
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
            {errors.farmId && (
              <p className="text-sm text-destructive">{errors.farmId}</p>
            )}
          </div>

          {/* Barn Multi-Selection */}
          {formData.farmId && barns.length > 0 && (
            <div className="space-y-2">
              <Label>{t('selectBarns')} (*)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                {t('selectBarnsHint')}
              </p>
              <CheckboxGroup
                options={barnOptions}
                value={formData.barnIds || []}
                onChange={(value) => updateFormData({ barnIds: value })}
              />
              {errors.barnIds && (
                <p className="text-sm text-destructive">{errors.barnIds}</p>
              )}
            </div>
          )}

          {/* Pen Multi-Selection (grouped by barn) */}
          {hasDeepestLevel &&
            formData.barnIds &&
            formData.barnIds.length > 0 &&
            hasAnyPens && (
              <div className="space-y-2">
                <Label>{t('selectPens')}</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  {t('selectPensHint')}
                </p>
                <div className="space-y-4">
                  {Object.entries(pensGroupedByBarn).map(([barnId, pens]) => {
                    const barn = barns.find((b) => b.id === barnId);
                    const penOptionsForBarn = pens.map((pen) => ({
                      value: pen.id,
                      label: pen.name,
                    }));

                    return (
                      <div key={barnId} className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          {barn?.name}
                        </p>
                        <CheckboxGroup
                          options={penOptionsForBarn}
                          value={formData.penIds || []}
                          onChange={(value) => {
                            // Merge with existing penIds from other barns
                            const otherBarnPenIds = (formData.penIds || []).filter(
                              (penId) => {
                                const pen = locations.find((l) => l.id === penId);
                                return pen && pen.parentId !== barnId;
                              }
                            );
                            updateFormData({
                              penIds: [...otherBarnPenIds, ...value.filter(
                                (v) => pens.some((p) => p.id === v)
                              )],
                            });
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                {errors.penIds && (
                  <p className="text-sm text-destructive">{errors.penIds}</p>
                )}
              </div>
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
