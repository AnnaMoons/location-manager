'use client';

import { useTranslations } from 'next-intl';
import { RepairSubState } from '@/lib/types/device';
import { Check, Circle, Clock, Package, Wrench, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RepairTimelineProps {
  currentSubState: RepairSubState;
  compact?: boolean;
}

type TimelineStep = {
  key: RepairSubState;
  icon: React.ElementType;
  label: string;
};

export function RepairTimeline({ currentSubState, compact = false }: RepairTimelineProps) {
  const t = useTranslations('devices');

  const steps: TimelineStep[] = [
    { key: 'reported', icon: Clock, label: t('repairSubStates.reported') },
    { key: 'pending_shipment', icon: Package, label: t('repairSubStates.pending_shipment') },
    { key: 'received', icon: CheckCircle2, label: t('repairSubStates.received') },
    { key: 'in_repair', icon: Wrench, label: t('repairSubStates.in_repair') },
    { key: 'ready_to_return', icon: Check, label: t('repairSubStates.ready_to_return') },
  ];

  const currentIndex = steps.findIndex(s => s.key === currentSubState);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isComplete = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={step.key} className="flex items-center">
              <div
                className={cn(
                  'flex items-center justify-center rounded-full',
                  'transition-all',
                  isCurrent && 'w-7 h-7 bg-primary',
                  isComplete && 'w-5 h-5 bg-primary/30',
                  isPending && 'w-5 h-5 bg-muted'
                )}
              >
                <Icon
                  className={cn(
                    'transition-all',
                    isCurrent && 'h-4 w-4 text-primary-foreground',
                    isComplete && 'h-3 w-3 text-primary',
                    isPending && 'h-3 w-3 text-muted-foreground'
                  )}
                />
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-6 h-0.5 mx-1',
                    index < currentIndex ? 'bg-primary/30' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <div key={step.key} className="flex items-start gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center pt-1">
              <div
                className={cn(
                  'flex items-center justify-center rounded-full transition-all',
                  isCurrent && 'w-8 h-8 bg-primary',
                  isComplete && 'w-6 h-6 bg-success',
                  isPending && 'w-6 h-6 bg-muted'
                )}
              >
                <Icon
                  className={cn(
                    'transition-all',
                    isCurrent && 'h-4 w-4 text-primary-foreground',
                    isComplete && 'h-3.5 w-3.5 text-success-foreground',
                    isPending && 'h-3.5 w-3.5 text-muted-foreground'
                  )}
                />
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-0.5 h-8 my-1',
                    index < currentIndex ? 'bg-success' : 'bg-muted'
                  )}
                />
              )}
            </div>

            {/* Step label */}
            <div className="flex-1 pt-1.5 pb-2">
              <p
                className={cn(
                  'text-sm font-medium transition-colors',
                  isCurrent && 'text-foreground',
                  isComplete && 'text-muted-foreground',
                  isPending && 'text-muted-foreground/60'
                )}
              >
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Estado actual
                </p>
              )}
              {isComplete && (
                <p className="text-xs text-success mt-0.5">
                  ✓ Completado
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
