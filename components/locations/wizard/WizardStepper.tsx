'use client';

import { type LucideIcon, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface WizardStepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  stepIcons?: LucideIcon[];
}

export function WizardStepper({ currentStep, totalSteps, stepLabels, stepIcons }: WizardStepperProps) {
  const progressValue = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const StepIcon = stepIcons?.[i];

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300',
                    isCompleted && 'bg-brand-primary border-brand-primary text-brand-fg',
                    isCurrent && 'border-brand-primary text-brand-primary bg-brand-primary/10 ring-4 ring-brand-primary/10',
                    !isCompleted && !isCurrent && 'border-fg-tertiary/30 text-fg-tertiary/50'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : StepIcon ? (
                    <StepIcon className="h-4 w-4" />
                  ) : (
                    step
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs mt-1.5 whitespace-nowrap',
                    isCurrent ? 'text-brand-primary font-medium' : 'text-fg-tertiary'
                  )}
                >
                  {stepLabels[i]}
                </span>
              </div>

              {/* Connector line */}
              {step < totalSteps && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-3 mt-[-1.25rem] transition-all duration-500 ease-out',
                    isCompleted ? 'bg-brand-primary' : 'bg-fg-tertiary/20'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <Progress value={progressValue} className="h-1.5" />
    </div>
  );
}
