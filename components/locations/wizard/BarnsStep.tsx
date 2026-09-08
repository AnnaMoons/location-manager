'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, X, CheckCircle, Warehouse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SafeForm } from '@/components/shared/SafeForm';
import { LoadingSpinner } from '@/components/shared/LoadingState';
import { WizardStepHeader } from './WizardStepHeader';
import { Location } from '@/lib/types/location';
import { Species } from '@/lib/types/species';
import { useLocations } from '@/lib/hooks/useLocations';

interface BarnsStepProps {
  farm: Location;
  species: Species;
  onComplete: (barns: Location[]) => void;
}

export function BarnsStep({ farm, species, onComplete }: BarnsStepProps) {
  const t = useTranslations('locations.wizard');
  const tLoc = useTranslations('locations');

  const { createLocation } = useLocations();

  const [barnNames, setBarnNames] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validCount = barnNames.filter((n) => n.trim()).length;

  const addBarn = () => {
    setBarnNames((prev) => [...prev, '']);
  };

  const removeBarn = (index: number) => {
    if (barnNames.length <= 1) return;
    setBarnNames((prev) => prev.filter((_, i) => i !== index));
  };

  const updateBarnName = (index: number, value: string) => {
    setBarnNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validNames = barnNames.map((n) => n.trim()).filter(Boolean);
    if (validNames.length === 0) {
      setError(t('atLeastOneBarn'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const createdBarns: Location[] = [];
      for (const name of validNames) {
        const barn = await createLocation({
          name,
          type: 'barn',
          species,
          parentId: farm.id,
        });
        createdBarns.push(barn);
      }
      onComplete(createdBarns);
    } catch {
      setError('Error al crear los galpones');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeForm onSubmit={handleSubmit} className="space-y-6">
      <WizardStepHeader
        icon={Warehouse}
        title={t('step2Title')}
        description={t('step2Desc', { farmName: farm.name })}
        helpText={t('step2Help')}
      />

      {/* Farm context */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/30">
        <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center shrink-0">
          <CheckCircle className="h-4 w-4 text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{farm.name}</p>
          <p className="text-xs text-fg-tertiary">
            {tLoc(`species.${species}`)} &middot; {t('farmCreated')}
          </p>
        </div>
      </div>

      {/* Barn list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t('barnName')}</Label>
          {validCount > 0 && (
            <span className="text-xs text-fg-tertiary">
              {t('barnsConfigured', { count: validCount })}
            </span>
          )}
        </div>
        {barnNames.map((name, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder={t('barnPlaceholder', { number: index + 1 })}
              value={name}
              onChange={(e) => updateBarnName(index, e.target.value)}
              autoFocus={index === barnNames.length - 1}
            />
            {barnNames.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeBarn(index)}
                className="text-fg-tertiary hover:text-error shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addBarn}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('addBarn')}
        </Button>
      </div>

      {error && <p className="text-sm text-error text-center">{error}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <LoadingSpinner className="py-0" /> : t('createBarns')}
      </Button>
    </SafeForm>
  );
}
