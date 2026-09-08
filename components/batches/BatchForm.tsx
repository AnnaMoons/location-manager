'use client';

import { useEffect, useRef, useState } from 'react';
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
import { CreateBatchInput, BatchSex, PenDistribution } from '@/lib/types/batch';
import { Species, speciesHierarchies } from '@/lib/types/species';
import { useLocations } from '@/lib/hooks/useLocations';
import { Location } from '@/lib/types/location';

// H-020: Typical cycle durations by species+sex (days)
// H-043: Updated broiler durations per Germán's specification
const CYCLE_DURATION: Record<string, Record<string, number>> = {
  broilers: { male: 39, female: 35, mixed: 37 },
  pigs: { male: 150, female: 150, mixed: 150 },
  layers: { male: 504, female: 504, mixed: 504 },
};

function getDefaultCycleDays(species?: Species, sex?: string): number {
  if (!species) return 90;
  const speciesCycles = CYCLE_DURATION[species];
  return speciesCycles?.[sex || 'mixed'] || 90;
}

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
  // Ref to suppress cascading resets when syncing from initialData
  const isSyncingRef = useRef(false);

  // H-035: Auto-detect species when all farms share the same one
  const allFarms = locations.filter((l) => l.type === 'farm');
  const uniqueSpecies = Array.from(new Set(allFarms.map((f) => f.species)));
  const singleSpecies = uniqueSpecies.length === 1 ? uniqueSpecies[0] : null;

  useEffect(() => {
    if (singleSpecies && !formData.species && !isSyncingRef.current) {
      updateFormData({ species: singleSpecies as Species });
    }
  }, [singleSpecies]);

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

  // Sync internal state when initialData arrives asynchronously (edit mode)
  useEffect(() => {
    if (initialData && initialData.name) {
      isSyncingRef.current = true;
      setFormData(initialData);
      // Use setTimeout to keep the flag on through React's render+effects cycle
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 0);
    }
  }, [initialData]);

  useEffect(() => {
    if (formData.species && !isSyncingRef.current) {
      updateFormData({ farmIds: [], barnIds: [], penIds: [] });
    }
  }, [formData.species]);

  useEffect(() => {
    if (formData.farmIds && !isSyncingRef.current) {
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

  // H-020: Auto-suggest end date based on species+sex
  // H-043: Update when sex changes to recalculate based on new duration
  useEffect(() => {
    if (formData.startDate) {
      const cycleDays = getDefaultCycleDays(formData.species, formData.sex);
      const startDate = new Date(formData.startDate);
      const estimatedEndDate = new Date(startDate);
      estimatedEndDate.setDate(estimatedEndDate.getDate() + cycleDays);
      updateFormData({ estimatedEndDate: estimatedEndDate.toISOString() });
    }
  }, [formData.startDate, formData.sex, formData.species]);

  const farmOptions = farms.map((farm) => ({
    value: farm.id,
    label: farm.name,
  }));

  const barnOptions = barns.map((barn) => ({
    value: barn.id,
    label: barn.name,
  }));

  // Single source of truth for species-specific field visibility, instead of repeating the
  // same `formData.species === '...'` comparison at every conditional section below.
  const isPigsSpecies = formData.species === 'pigs';
  const isPoultrySpecies = formData.species === 'broilers' || formData.species === 'layers';

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
          <p className="text-sm text-error">{errors.name}</p>
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
          <p className="text-sm text-error">{errors.species}</p>
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
        <p className="text-xs text-fg-tertiary">
          {t('sexHint')}
        </p>
      </div>

      {formData.species && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('selectFarms')} (*)</Label>
              {formData.farmIds && formData.farmIds.length > 0 && (
                <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-full">
                  {formData.farmIds.length} {formData.farmIds.length === 1 ? 'granja' : 'granjas'}
                </span>
              )}
            </div>
            <p className="text-xs text-fg-tertiary mb-2">
              {t('selectFarmsHint')}
            </p>
            <CheckboxGroup
              options={farmOptions}
              value={formData.farmIds || []}
              onChange={(value) => updateFormData({ farmIds: value })}
            />
            {errors.farmIds && (
              <p className="text-sm text-error">{errors.farmIds}</p>
            )}
          </div>

          {formData.farmIds && formData.farmIds.length > 0 && barns.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('selectBarns')} (*)</Label>
                {formData.barnIds && formData.barnIds.length > 0 && (
                  <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-full">
                    {formData.barnIds.length} {formData.barnIds.length === 1 ? 'galpón' : 'galpones'}
                  </span>
                )}
              </div>
              <p className="text-xs text-fg-tertiary mb-2">
                {t('selectBarnsHint')}
              </p>
              <CheckboxGroup
                options={barnOptions}
                value={formData.barnIds || []}
                onChange={(value) => updateFormData({ barnIds: value })}
              />
              {errors.barnIds && (
                <p className="text-sm text-error">{errors.barnIds}</p>
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
                    <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-full">
                      {formData.penIds.length} {formData.penIds.length === 1 ? 'corral' : 'corrales'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-fg-tertiary mb-2">
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
                          <p className="text-sm font-medium text-fg-tertiary">
                            {barn?.name}
                          </p>
                          {selectedPensInBarn > 0 && (
                            <span className="text-xs text-fg-tertiary">
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
                                  isSelected ? 'border-brand-primary bg-brand-primary/5' : 'border-surface-2'
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
                  <p className="text-sm text-error">{errors.penIds}</p>
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
        <p className="text-xs text-fg-tertiary">{t('animalCountHint')}</p>
        {errors.animalCount && (
          <p className="text-sm text-error">{errors.animalCount}</p>
        )}
      </div>

      {/* H-022: Male/Female count for pigs (general breakdown) */}
      {isPigsSpecies && (
        <div className="space-y-3">
          <div>
            <Label>{t('sexBreakdownTitle')}</Label>
            <p className="text-xs text-fg-tertiary mt-1">{t('sexBreakdownHint')}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maleCount">{t('maleCount')}</Label>
              <Input
                id="maleCount"
                type="number"
                min="0"
                value={formData.maleCount ?? ''}
                onChange={(e) =>
                  updateFormData({ maleCount: parseInt(e.target.value) || undefined })
                }
                placeholder="0"
              />
              {errors.maleCount && (
                <p className="text-sm text-error">{errors.maleCount}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="femaleCount">{t('femaleCount')}</Label>
              <Input
                id="femaleCount"
                type="number"
                min="0"
                value={formData.femaleCount ?? ''}
                onChange={(e) =>
                  updateFormData({ femaleCount: parseInt(e.target.value) || undefined })
                }
                placeholder="0"
              />
              {errors.femaleCount && (
                <p className="text-sm text-error">{errors.femaleCount}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* H-023: Initial weight for pigs */}
      {isPigsSpecies && (
        <div className="space-y-2">
          <Label htmlFor="initialWeight">{t('initialWeight')}</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="initialWeight"
              type="number"
              min="0"
              step="0.1"
              value={formData.initialWeight ?? ''}
              onChange={(e) =>
                updateFormData({ initialWeight: parseFloat(e.target.value) || undefined })
              }
              placeholder={t('initialWeightPlaceholder')}
              className="flex-1"
            />
            <span className="text-sm text-fg-tertiary">kg</span>
          </div>
          <p className="text-xs text-fg-tertiary">{t('initialWeightHint')}</p>
          {errors.initialWeight && (
            <p className="text-sm text-error">{errors.initialWeight}</p>
          )}
        </div>
      )}

      {/* H-022: Per-pen distribution for pigs with pens selected */}
      {isPigsSpecies && formData.penIds && formData.penIds.length > 0 && (
        <div className="space-y-3 p-4 rounded-lg border-2 border-brand-primary/20 bg-brand-primary/5">
          <div>
            <Label className="text-base">{t('penDistribution')}</Label>
            <p className="text-xs text-fg-tertiary mt-1">{t('penDistributionHint')}</p>
          </div>
          <div className="space-y-3">
            {formData.penIds.map((penId) => {
              const pen = locations.find((l) => l.id === penId);
              const existing = (formData.penDistribution || []).find((pd) => pd.penId === penId);
              const totalAnimals = existing?.animalCount || 0;

              return (
                <div key={penId} className="p-4 rounded-lg border bg-surface shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">{pen?.name || penId}</Label>
                    {totalAnimals > 0 && (
                      <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-full">
                        {totalAnimals} {totalAnimals === 1 ? 'animal' : 'animales'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs text-fg-tertiary">{t('animalsInPen')}</Label>
                      <Input
                        type="number"
                        min="0"
                        className="h-9 mt-1"
                        value={existing?.animalCount ?? ''}
                        onChange={(e) => {
                          const dist = [...(formData.penDistribution || [])];
                          const idx = dist.findIndex((pd) => pd.penId === penId);
                          const entry: PenDistribution = {
                            penId,
                            animalCount: parseInt(e.target.value) || 0,
                            sex: existing?.sex || 'mixed',
                            initialWeight: existing?.initialWeight,
                          };
                          if (idx >= 0) dist[idx] = entry;
                          else dist.push(entry);
                          updateFormData({ penDistribution: dist });
                        }}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-fg-tertiary">{t('penSex')}</Label>
                      <Select
                        value={existing?.sex || 'mixed'}
                        onValueChange={(value: BatchSex) => {
                          const dist = [...(formData.penDistribution || [])];
                          const idx = dist.findIndex((pd) => pd.penId === penId);
                          const entry: PenDistribution = {
                            penId,
                            animalCount: existing?.animalCount || 0,
                            sex: value,
                            initialWeight: existing?.initialWeight,
                          };
                          if (idx >= 0) dist[idx] = entry;
                          else dist.push(entry);
                          updateFormData({ penDistribution: dist });
                        }}
                      >
                        <SelectTrigger className="h-9 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mixed">{t('sexMixed')}</SelectItem>
                          <SelectItem value="male">{t('sexMale')}</SelectItem>
                          <SelectItem value="female">{t('sexFemale')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-fg-tertiary">{t('penWeightAvg')}</Label>
                      <div className="flex gap-1 items-center mt-1">
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          className="h-9"
                          placeholder="0.0"
                          value={existing?.initialWeight ?? ''}
                          onChange={(e) => {
                            const dist = [...(formData.penDistribution || [])];
                            const idx = dist.findIndex((pd) => pd.penId === penId);
                            const entry: PenDistribution = {
                              penId,
                              animalCount: existing?.animalCount || 0,
                              sex: existing?.sex || 'mixed',
                              initialWeight: parseFloat(e.target.value) || undefined,
                            };
                            if (idx >= 0) dist[idx] = entry;
                            else dist.push(entry);
                            updateFormData({ penDistribution: dist });
                          }}
                        />
                        <span className="text-xs text-fg-tertiary">kg</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary of distribution */}
          {(() => {
            const totalInPens = (formData.penDistribution || []).reduce(
              (sum, pd) => sum + (pd.animalCount || 0),
              0
            );
            const totalBatch = formData.animalCount || 0;
            const hasOverflow = totalInPens > totalBatch;

            return totalInPens > 0 ? (
              <div className={`p-3 rounded-lg border ${hasOverflow ? 'border-error bg-error/5' : 'border-surface-2 bg-surface-2/30'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('distributionSummary')}</span>
                  <span className={`text-sm font-semibold ${hasOverflow ? 'text-error' : ''}`}>
                    {totalInPens.toLocaleString()} / {totalBatch.toLocaleString()} {t('animals')}
                  </span>
                </div>
                {hasOverflow && (
                  <p className="text-xs text-error mt-1">{t('distributionOverflow')}</p>
                )}
              </div>
            ) : null;
          })()}

          {errors.penDistribution && (
            <p className="text-sm text-error">{errors.penDistribution}</p>
          )}
        </div>
      )}

      {/* H-042: For poultry, use arrival date and day 1 date instead of average age */}
      {isPoultrySpecies ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="arrivalDate">{t('arrivalDate')} (*)</Label>
            <Input
              id="arrivalDate"
              type="date"
              value={
                formData.arrivalDate
                  ? new Date(formData.arrivalDate).toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) =>
                updateFormData({
                  arrivalDate: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined,
                })
              }
            />
            <p className="text-xs text-fg-tertiary">{t('arrivalDateHint')}</p>
            {errors.arrivalDate && (
              <p className="text-sm text-error">{errors.arrivalDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">{t('dayOneDate')} (*)</Label>
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
            <p className="text-xs text-fg-tertiary">{t('dayOneDateHint')}</p>
            {errors.startDate && (
              <p className="text-sm text-error">{errors.startDate}</p>
            )}
          </div>
        </>
      ) : (
        <>
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
              <span className="text-sm text-fg-tertiary">{t('days')}</span>
            </div>
            {errors.averageAgeAtStart && (
              <p className="text-sm text-error">{errors.averageAgeAtStart}</p>
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
              <p className="text-sm text-error">{errors.startDate}</p>
            )}
          </div>
        </>
      )}

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
        {isPoultrySpecies ? (
          <p className="text-xs text-fg-tertiary">{t('estimatedEndDateHintPoultry')}</p>
        ) : (
          <p className="text-xs text-fg-tertiary">{t('optional')}</p>
        )}
      </div>
    </div>
  );
}
