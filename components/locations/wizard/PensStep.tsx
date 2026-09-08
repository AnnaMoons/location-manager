'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Home, Warehouse, Fence, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SafeForm } from '@/components/shared/SafeForm';
import { LoadingSpinner } from '@/components/shared/LoadingState';
import { WizardStepHeader } from './WizardStepHeader';
import { Location } from '@/lib/types/location';
import { Species, speciesHierarchies, getNextLevelType } from '@/lib/types/species';
import { useLocations } from '@/lib/hooks/useLocations';

interface PenConfig {
  count: number;
  prefix: string;
}

interface PensStepProps {
  farm: Location;
  barns: Location[];
  species: Species;
  onComplete: (totalPensCreated: number) => void;
  onSkip: () => void;
}

export function PensStep({ farm, barns, species, onComplete, onSkip }: PensStepProps) {
  const t = useTranslations('locations.wizard');
  const tLoc = useTranslations('locations');

  const { createLocation } = useLocations();

  const childType = getNextLevelType(species, 'barn');
  const childLabel = childType ? speciesHierarchies[species].labels[childType] : 'Corral';
  const isSection = childType === 'section';

  const [penConfigs, setPenConfigs] = useState<Record<string, PenConfig>>(() => {
    const initial: Record<string, PenConfig> = {};
    barns.forEach((barn) => {
      initial[barn.id] = { count: 4, prefix: childLabel };
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOptional = species === 'broilers' || species === 'layers';

  const updateConfig = (barnId: string, field: keyof PenConfig, value: string | number) => {
    setPenConfigs((prev) => ({
      ...prev,
      [barnId]: { ...prev[barnId], [field]: value },
    }));
  };

  const generateNames = (config: PenConfig): string[] => {
    return Array.from({ length: config.count }, (_, i) => `${config.prefix} ${i + 1}`);
  };

  const totalPens = useMemo(() => {
    return Object.values(penConfigs).reduce((sum, c) => sum + c.count, 0);
  }, [penConfigs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let created = 0;
      for (const barn of barns) {
        const config = penConfigs[barn.id];
        if (!config || config.count <= 0) continue;

        const names = generateNames(config);
        for (const name of names) {
          await createLocation({
            name,
            type: childType || 'pen',
            species,
            parentId: barn.id,
          });
          created++;
        }
      }
      onComplete(created);
    } catch {
      setError('Error al crear los corrales');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeForm onSubmit={handleSubmit} className="space-y-6">
      <WizardStepHeader
        icon={Fence}
        title={isSection ? t('step3TitleSection') : t('step3Title')}
        description={isSection ? t('step3DescSection') : t('step3Desc')}
        helpText={isSection ? t('step3HelpSection') : t('step3Help')}
      />

      {/* Context breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-fg-tertiary flex-wrap">
        <span className="flex items-center gap-1">
          <Home className="h-3 w-3" />
          <span className="font-medium text-fg">{farm.name}</span>
        </span>
        <ChevronRight className="h-3 w-3" />
        <span className="flex items-center gap-1">
          <Warehouse className="h-3 w-3" />
          <span>{t('barnsCreated', { count: barns.length })}</span>
        </span>
        <ChevronRight className="h-3 w-3" />
        <span className="flex items-center gap-1 text-brand-primary font-medium">
          <Fence className="h-3 w-3" />
          {isSection ? t('step3TitleSection') : t('step3Title')}
        </span>
      </div>

      {/* Optional notice */}
      {isOptional && (
        <div className="p-3 rounded-lg bg-surface-blue/20 border border-surface-blue/40">
          <p className="text-sm text-fg-tertiary">
            {t('penStepOptional', { species: tLoc(`species.${species}`) })}
          </p>
        </div>
      )}

      {/* Per-barn config */}
      <div className="space-y-6">
        {barns.map((barn) => {
          const config = penConfigs[barn.id];
          const preview = config ? generateNames(config) : [];

          return (
            <div key={barn.id} className="space-y-3 p-4 rounded-lg border">
              <p className="font-medium text-sm">
                {isSection
                  ? t('sectionsForBarn', { barn: barn.name })
                  : t('pensForBarn', { barn: barn.name })}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">{t('penCount')}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    value={config?.count ?? 4}
                    onChange={(e) =>
                      updateConfig(barn.id, 'count', Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('penPrefix')}</Label>
                  <Input
                    value={config?.prefix ?? childLabel}
                    onChange={(e) => updateConfig(barn.id, 'prefix', e.target.value)}
                  />
                </div>
              </div>

              {/* Preview */}
              {preview.length > 0 && (
                <div>
                  <p className="text-xs text-fg-tertiary mb-1">{t('penPreview')}</p>
                  <div className="flex flex-wrap gap-1">
                    {preview.map((name) => (
                      <Badge key={name} variant="secondary" className="text-xs">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-error text-center">{error}</p>}

      <div className="flex gap-3">
        {isOptional && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onSkip}
            disabled={isSubmitting}
          >
            {t('skipStep')}
          </Button>
        )}
        <Button type="submit" className={isOptional ? 'flex-1' : 'w-full'} disabled={isSubmitting}>
          {isSubmitting ? <LoadingSpinner className="py-0" /> : t('createAndFinish')}
        </Button>
      </div>
    </SafeForm>
  );
}
