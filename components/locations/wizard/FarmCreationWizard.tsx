'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Home, Warehouse, Fence } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { WizardStepper } from './WizardStepper';
import { FarmStep } from './FarmStep';
import { BarnsStep } from './BarnsStep';
import { PensStep } from './PensStep';
import { WizardSuccess } from './WizardSuccess';
import { Location } from '@/lib/types/location';
import { Species, getNextLevelType } from '@/lib/types/species';
import type { LucideIcon } from 'lucide-react';

interface WizardState {
  currentStep: number;
  species: Species | null;
  farm: Location | null;
  barns: Location[];
  pensCreated: number;
}

const initialState: WizardState = {
  currentStep: 1,
  species: null,
  farm: null,
  barns: [],
  pensCreated: 0,
};

export function FarmCreationWizard() {
  const t = useTranslations('locations.wizard');

  const [state, setState] = useState<WizardState>(initialState);

  const totalSteps = useMemo(() => {
    if (!state.species) return 3;
    const hasThirdLevel = getNextLevelType(state.species, 'barn') !== null;
    return hasThirdLevel ? 3 : 2;
  }, [state.species]);

  const stepLabels = useMemo(() => {
    const labels = [t('step1Title'), t('step2Title')];
    if (totalSteps >= 3) {
      const childType = state.species ? getNextLevelType(state.species, 'barn') : null;
      labels.push(childType === 'section' ? t('step3TitleSection') : t('step3Title'));
    }
    return labels;
  }, [t, totalSteps, state.species]);

  const stepIcons = useMemo((): LucideIcon[] => {
    const icons: LucideIcon[] = [Home, Warehouse];
    if (totalSteps >= 3) icons.push(Fence);
    return icons;
  }, [totalSteps]);

  const isSection = state.species
    ? getNextLevelType(state.species, 'barn') === 'section'
    : false;

  const handleFarmComplete = (farm: Location, species: Species) => {
    setState((prev) => ({ ...prev, farm, species, currentStep: 2 }));
  };

  const handleBarnsComplete = (barns: Location[]) => {
    const hasThirdLevel = state.species ? getNextLevelType(state.species, 'barn') !== null : false;
    setState((prev) => ({
      ...prev,
      barns,
      currentStep: hasThirdLevel ? 3 : prev.currentStep + 1,
    }));
    if (!hasThirdLevel) {
      setState((prev) => ({ ...prev, barns, currentStep: totalSteps + 1 }));
    }
  };

  const handlePensComplete = (count: number) => {
    setState((prev) => ({ ...prev, pensCreated: count, currentStep: totalSteps + 1 }));
  };

  const handleSkipPens = () => {
    setState((prev) => ({ ...prev, currentStep: totalSteps + 1 }));
  };

  const handleReset = () => {
    setState(initialState);
  };

  const isSuccess = state.currentStep > totalSteps;

  return (
    <div className="space-y-6">
      {/* Subtitle */}
      <p className="text-fg-tertiary text-center">{t('subtitle')}</p>

      {/* Stepper (hidden on success) */}
      {!isSuccess && (
        <WizardStepper
          currentStep={state.currentStep}
          totalSteps={totalSteps}
          stepLabels={stepLabels}
          stepIcons={stepIcons}
        />
      )}

      {/* Step content with animation */}
      <Card>
        <CardContent className="pt-6">
          {isSuccess ? (
            <div key="success" className="animate-in fade-in zoom-in-95 duration-500">
              {state.farm && state.species && (
                <WizardSuccess
                  farm={state.farm}
                  species={state.species}
                  barns={state.barns}
                  pensCreated={state.pensCreated}
                  isSection={isSection}
                  onCreateAnother={handleReset}
                />
              )}
            </div>
          ) : (
            <div key={state.currentStep} className="animate-in fade-in slide-in-from-right-4 duration-300">
              {state.currentStep === 1 && (
                <FarmStep onComplete={handleFarmComplete} />
              )}

              {state.currentStep === 2 && state.farm && state.species && (
                <BarnsStep
                  farm={state.farm}
                  species={state.species}
                  onComplete={handleBarnsComplete}
                />
              )}

              {state.currentStep === 3 && state.farm && state.species && state.barns.length > 0 && (
                <PensStep
                  farm={state.farm}
                  barns={state.barns}
                  species={state.species}
                  onComplete={handlePensComplete}
                  onSkip={handleSkipPens}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
