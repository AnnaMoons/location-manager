'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HierarchySelector } from './HierarchySelector';
import { LocationPicker } from './LocationPicker';
import { useLocations } from '@/lib/hooks/useLocations';
import { Location, CreateLocationInput, Coordinates } from '@/lib/types/location';
import { Species, LocationType } from '@/lib/types/species';
import { validateLocationInput } from '@/lib/utils/validation';
import { LoadingSpinner } from '@/components/shared/LoadingState';

interface LocationFormProps {
  initialData?: Location;
  mode: 'create' | 'edit';
  initialParentId?: string | null;
  initialSpecies?: Species | null;
  initialType?: LocationType | null;
  farmOnly?: boolean;
}

export function LocationForm({
  initialData,
  mode,
  initialParentId,
  initialSpecies,
  initialType,
  farmOnly = false,
}: LocationFormProps) {
  const t = useTranslations('locations.form');
  const tLoc = useTranslations('locations');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { createLocation, updateLocation, getLocation } = useLocations();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check for barn creation from installation wizard
  const [barnFromWizard, setBarnFromWizard] = useState(false);
  // Check for pen creation from installation wizard
  const [penFromWizard, setPenFromWizard] = useState(false);

  const [name, setName] = useState(initialData?.name || '');
  const [species, setSpecies] = useState<Species | null>(
    initialData?.species || initialSpecies || null
  );
  const [locationType, setLocationType] = useState<LocationType | null>(
    initialData?.type || initialType || (farmOnly ? 'farm' : null)
  );
  const [parentId, setParentId] = useState<string | null>(
    initialData?.parentId || initialParentId || null
  );
  const [coordinates, setCoordinates] = useState<Coordinates | undefined>(
    initialData?.coordinates
  );
  const [address, setAddress] = useState<string | undefined>(initialData?.address);

  // Check if we're creating a barn from the installation wizard
  useEffect(() => {
    if (typeof window !== 'undefined' && mode === 'create') {
      const barnParentId = sessionStorage.getItem('createBarnParentId');
      if (barnParentId) {
        const parentFarm = getLocation(barnParentId);
        if (parentFarm) {
          setBarnFromWizard(true);
          setParentId(barnParentId);
          setLocationType('barn');
          setSpecies(parentFarm.species);
        }
      }

      // Check for pen creation from installation wizard
      const penParentId = sessionStorage.getItem('createPenParentId');
      if (penParentId) {
        const parentBarn = getLocation(penParentId);
        if (parentBarn) {
          setPenFromWizard(true);
          setParentId(penParentId);
          setLocationType('pen');
          setSpecies(parentBarn.species);
        }
      }
    }
  }, [mode, getLocation]);

  // Check if form was pre-filled (locked mode for child locations or from wizard)
  const isPreFilled = !!(initialParentId && initialSpecies && initialType) || barnFromWizard || penFromWizard;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input: Partial<CreateLocationInput> = {
      name,
      species: species || undefined,
      type: locationType || undefined,
      parentId,
      coordinates,
      address,
    };

    const validation = validateLocationInput(input);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      let newLocation: Location | undefined;
      if (mode === 'create') {
        newLocation = await createLocation(input as CreateLocationInput);
      } else if (initialData) {
        await updateLocation(initialData.id, { name, coordinates, address });
      }
      
      // Check if we should redirect back to device installation
      const redirectTo = sessionStorage.getItem('redirectAfterLocation');
      const isBarnFromWizard = sessionStorage.getItem('createBarnParentId');
      const isPenFromWizard = sessionStorage.getItem('createPenParentId');
      
      if (redirectTo) {
        // Store the created location ID for pre-selection in wizard
        if (newLocation && mode === 'create') {
          if (isPenFromWizard) {
            sessionStorage.setItem('lastCreatedLocationId', newLocation.id);
            sessionStorage.setItem('lastCreatedPenParentId', isPenFromWizard);
          } else if (isBarnFromWizard) {
            sessionStorage.setItem('lastCreatedLocationId', newLocation.id);
            sessionStorage.setItem('lastCreatedBarnParentId', isBarnFromWizard);
          } else {
            sessionStorage.setItem('lastCreatedFarmId', newLocation.id);
          }
        }
        
        sessionStorage.removeItem('redirectAfterLocation');
        if (isBarnFromWizard) {
          sessionStorage.removeItem('createBarnParentId');
        }
        if (isPenFromWizard) {
          sessionStorage.removeItem('createPenParentId');
        }
        router.push(redirectTo);
      } else {
        router.push('/ubicaciones');
      }
    } catch (error) {
      setErrors({ submit: 'Error al guardar la ubicación' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Hierarchy Selector (only in create mode, not for farm-only) */}
          {mode === 'create' && !isPreFilled && !farmOnly && (
            <HierarchySelector
              species={species}
              locationType={locationType}
              parentId={parentId}
              onSpeciesChange={setSpecies}
              onTypeChange={setLocationType}
              onParentChange={setParentId}
            />
          )}

          {/* Species Selector (for farm-only mode) */}
          {mode === 'create' && farmOnly && (
            <div className="space-y-2">
              <Label>{tLoc('species.label')}</Label>
              <Select
                value={species || ''}
                onValueChange={(v) => setSpecies(v as Species)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectSpecies')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pigs">{tLoc('species.pigs')}</SelectItem>
                  <SelectItem value="broilers">{tLoc('species.broilers')}</SelectItem>
                  <SelectItem value="layers">{tLoc('species.layers')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              {penFromWizard ? t('penName') : barnFromWizard ? t('barnName') : t('name')}
            </Label>
            <Input
              id="name"
              placeholder={penFromWizard ? t('penNamePlaceholder') : barnFromWizard ? t('barnNamePlaceholder') : t('namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{t(`validation.nameRequired`)}</p>
            )}
          </div>

          {/* Pre-filled info (when creating child location) */}
          {mode === 'create' && isPreFilled && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <span className="text-muted-foreground">Especie:</span>{' '}
                <span className="font-medium">{tLoc(`species.${species}`)}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Tipo:</span>{' '}
                <span className="font-medium">{tLoc(`types.${locationType}`)}</span>
              </p>
            </div>
          )}

          {/* Info when creating barn from installation wizard */}
          {mode === 'create' && barnFromWizard && parentId && (
            <div className="space-y-2 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary dark:text-primary-foreground">
                {t('creatingBarnForDevice')}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">{tLoc('types.farm')}:</span>{' '}
                <span className="font-medium">{getLocation(parentId)?.name}</span>
              </p>
            </div>
          )}

          {/* Info when creating pen from installation wizard */}
          {mode === 'create' && penFromWizard && parentId && (
            <div className="space-y-2 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary dark:text-primary-foreground">
                {t('creatingPenForDevice')}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">{tLoc('types.barn')}:</span>{' '}
                <span className="font-medium">{getLocation(parentId)?.name}</span>
              </p>
            </div>
          )}

          {(errors.species || errors.type || errors.parentId) && (
            <div className="space-y-1">
              {errors.species && (
                <p className="text-sm text-destructive">{t('validation.speciesRequired')}</p>
              )}
              {errors.type && (
                <p className="text-sm text-destructive">{t('validation.typeRequired')}</p>
              )}
              {errors.parentId && (
                <p className="text-sm text-destructive">{t('validation.parentRequired')}</p>
              )}
            </div>
          )}

          {/* Location Picker (only for farms) */}
          {(mode === 'edit' || locationType === 'farm' || farmOnly) && (
            <LocationPicker
              coordinates={coordinates}
              address={address}
              onCoordinatesChange={setCoordinates}
              onAddressChange={setAddress}
            />
          )}
        </CardContent>
      </Card>

      {errors.submit && (
        <p className="text-sm text-destructive text-center">{errors.submit}</p>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const redirectTo = sessionStorage.getItem('redirectAfterLocation');
            if (redirectTo) {
              // Clear session storage and redirect to device wizard
              sessionStorage.removeItem('redirectAfterLocation');
              sessionStorage.removeItem('createBarnParentId');
              sessionStorage.removeItem('createPenParentId');
              router.push(redirectTo);
            } else {
              router.back();
            }
          }}
          className="flex-1"
          disabled={isSubmitting}
        >
          {tCommon('cancel')}
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? <LoadingSpinner className="py-0" /> : tCommon('save')}
        </Button>
      </div>
    </form>
  );
}
