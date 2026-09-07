'use client';

import { Fragment, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Home, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LocationPicker } from '@/components/locations/LocationPicker';
import { SafeForm } from '@/components/shared/SafeForm';
import { LoadingSpinner } from '@/components/shared/LoadingState';
import { WizardStepHeader } from './WizardStepHeader';
import { Coordinates, RuralAddress, Location } from '@/lib/types/location';
import { Species, speciesHierarchies } from '@/lib/types/species';
import { useLocations } from '@/lib/hooks/useLocations';

interface FarmStepProps {
  onComplete: (farm: Location, species: Species) => void;
}

export function FarmStep({ onComplete }: FarmStepProps) {
  const t = useTranslations('locations.wizard');
  const tLoc = useTranslations('locations');

  const { createLocation } = useLocations();

  const [species, setSpecies] = useState<Species | null>(null);
  const [name, setName] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates | undefined>();
  const [ruralAddress, setRuralAddress] = useState<RuralAddress | undefined>();
  const [address, setAddress] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!species) newErrors.species = 'required';
    if (!name.trim()) newErrors.name = 'required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const farm = await createLocation({
        name: name.trim(),
        type: 'farm',
        species: species!,
        parentId: null,
        coordinates,
        address,
        ruralAddress,
      });
      onComplete(farm, species!);
    } catch {
      setErrors({ submit: 'Error al crear la granja' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeForm onSubmit={handleSubmit} className="space-y-6">
      <WizardStepHeader
        icon={Home}
        title={t('step1Title')}
        description={t('step1Desc')}
        helpText={t('step1Help')}
      />

      {/* Species */}
      <div className="space-y-2">
        <Label>{t('selectSpecies')}</Label>
        <Select
          value={species || undefined}
          onValueChange={(v) => setSpecies(v as Species)}
        >
          <SelectTrigger className={errors.species ? 'border-error' : ''}>
            <SelectValue placeholder={t('selectSpecies')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pigs">{tLoc('species.pigs')}</SelectItem>
            <SelectItem value="broilers">{tLoc('species.broilers')}</SelectItem>
            <SelectItem value="layers">{tLoc('species.layers')}</SelectItem>
          </SelectContent>
        </Select>
        {errors.species && (
          <p className="text-sm text-error">{tLoc('form.validation.speciesRequired')}</p>
        )}
      </div>

      {/* Hierarchy preview */}
      {species && (
        <div className="p-3 rounded-lg bg-surface-2/50 border border-line">
          <p className="text-xs font-medium text-fg-tertiary mb-2">{t('hierarchyPreview')}</p>
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            {speciesHierarchies[species].levels.map((level, i, arr) => (
              <Fragment key={level}>
                <span className="px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary font-medium">
                  {speciesHierarchies[species].labels[level]}
                </span>
                {i < arr.length - 1 && <ChevronRight className="h-3 w-3 text-fg-tertiary" />}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="farmName">{t('farmName')}</Label>
        <Input
          id="farmName"
          placeholder={t('farmNamePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={errors.name ? 'border-error' : ''}
        />
        {errors.name && (
          <p className="text-sm text-error">{tLoc('form.validation.nameRequired')}</p>
        )}
      </div>

      {/* Location */}
      <LocationPicker
        coordinates={coordinates}
        address={address}
        ruralAddress={ruralAddress}
        onCoordinatesChange={setCoordinates}
        onAddressChange={setAddress}
        onRuralAddressChange={setRuralAddress}
      />

      {errors.submit && (
        <p className="text-sm text-error text-center">{errors.submit}</p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <LoadingSpinner className="py-0" /> : t('next')}
      </Button>
    </SafeForm>
  );
}
