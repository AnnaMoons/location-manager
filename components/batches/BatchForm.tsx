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
import { CreateBatchInput, BatchSex } from '@/lib/types/batch';
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
  const { locations, filterBySpecies, getChildren } = useLocations();

  const [formData, setFormData] = useState<Partial<CreateBatchInput>>(
    initialData || {}
  );

  const farms = formData.species
    ? filterBySpecies(formData.species).filter((l) => l.type === 'farm')
    : [];

  const getBarnsForFarms = (farmIds: string[]): Location[] => {
    const barns: Location[] = [];
    farmIds.forEach((farmId) => {
      const farmBarns = getChildren(farmId).filter((l) => l.type === 'barn');
      barns.push(...farmBarns);
    });
    return barns;
  };

  const barns = formData.farmIds
    ? getBarnsForFarms(formData.farmIds)
    : [];

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

  useEffect(() => {
    if (formData.species && !initialData?.farmIds) {
      updateFormData({ farmIds: [], barnIds: [], penIds: [] });
    }
  }, [formData.species]);

  useEffect(() => {
    if (formData.farmIds && !initialData?.barnIds) {
      updateFormData({ barnIds: [], penIds: [] });
    }
  }, [formData.farmIds]);

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

  useEffect(() => {
    if (formData.startDate && !formData.estimatedEndDate) {
      const startDate = new Date(formData.startDate);
      const estimatedEndDate = new Date(startDate);
      estimatedEndDate.setDate(estimatedEndDate.getDate() + 90);
      updateFormData({ estimatedEndDate: estimatedEndDate.toISOString() });
    }
  }, [formData.startDate]);

  const farmOptions = farms.map((farm) => ({
    value: farm.id,
    label: farm.name,
  }));

  const barnOptions = barns.map((barn) => ({
    value: barn.id,
    label: barn.name,
  }));

  return (
    <div className="space-y-6">
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

      <div className="space-y-2">
        <Label>{t('sex')}</Label>
        <Select
          value={formData.sex || ''}
          onValueChange={(value: BatchSex | '') =>
            updateFormData({ sex: value || undefined })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t('sexPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mixed">{t('sexMixed')}</SelectItem>
            <SelectItem value="female">{t('sexFemale')}</SelectItem>
            <SelectItem value="male">{t('sexMale')}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {t('sexHint')}
        </p>
      </div>

      {formData.species && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('selectFarms')} (*)</Label>
              {formData.farmIds && formData.farmIds.length > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {formData.farmIds.length} {formData.farmIds.length === 1 ? 'granja' : 'granjas'}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {t('selectFarmsHint')}
            </p>
            <CheckboxGroup
              options={farmOptions}
              value={formData.farmIds || []}
              onChange={(value) => updateFormData({ farmIds: value })}
            />
            {errors.farmIds && (
              <p className="text-sm text-destructive">{errors.farmIds}</p>
            )}
          </div>

          {formData.farmIds && formData.farmIds.length > 0 && barns.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('selectBarns')} (*)</Label>
                {formData.barnIds && formData.barnIds.length > 0 && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {formData.barnIds.length} {formData.barnIds.length === 1 ? 'galpón' : 'galpones'}
                  </span>
                )}
              </div>
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

          {hasDeepestLevel &&
            formData.barnIds &&
            formData.barnIds.length > 0 &&
            hasAnyPens && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t('selectPens')}</Label>
                  {formData.penIds && formData.penIds.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {formData.penIds.length} {formData.penIds.length === 1 ? 'corral' : 'corrales'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {t('selectPensHint')}
                </p>
                <div className="space-y-4">
                  {Object.entries(pensGroupedByBarn).map(([barnId, pens]) => {
                    const barn = barns.find((b) => b.id === barnId);
                    const selectedPensInBarn = (formData.penIds || []).filter(pid =>
                      pens.some(p => p.id === pid)
                    ).length;

                    return (
                      <div key={barnId} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-muted-foreground">
                            {barn?.name}
                          </p>
                          {selectedPensInBarn > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {selectedPensInBarn}/{pens.length}
                            </span>
                          )}
                        </div>
                        <div className="grid gap-2">
                          {pens.map((pen) => {
                            const isSelected = (formData.penIds || []).includes(pen.id);
                            return (
                              <div
                                key={pen.id}
                                className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
                                  isSelected ? 'border-primary bg-primary/5' : 'border-muted'
                                }`}
                              >
                                <CheckboxGroup
                                  options={[{ value: pen.id, label: pen.name }]}
                                  value={formData.penIds || []}
                                  onChange={(value) => {
                                    const otherBarnPenIds = (formData.penIds || []).filter(
                                      (penId) => {
                                        const p = locations.find((l) => l.id === penId);
                                        return p && p.parentId !== barnId;
                                      }
                                    );
                                    updateFormData({
                                      penIds: [
                                        ...otherBarnPenIds,
                                        ...value.filter((v) =>
                                          pens.some((p) => p.id === v)
                                        ),
                                      ],
                                    });
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
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
