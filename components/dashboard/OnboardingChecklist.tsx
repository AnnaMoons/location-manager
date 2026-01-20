'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Check, Circle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useOnboarding, OnboardingStep } from '@/lib/hooks/useOnboarding';
import { cn } from '@/lib/utils';

export function OnboardingChecklist() {
  const t = useTranslations('dashboard.onboarding');
  const { steps, completedSteps, totalSteps, progress, isComplete, nextStep } =
    useOnboarding();

  if (isComplete) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('title')}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {t('progress', { completed: completedSteps, total: totalSteps })}
          </span>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step) => (
          <StepItem key={step.id} step={step} />
        ))}
        {nextStep && (
          <Link href={nextStep.href} className="block mt-4">
            <Button className="w-full">
              {nextStep.title}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function StepItem({ step }: { step: OnboardingStep }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-2 rounded-md transition-colors',
        step.completed ? 'opacity-60' : 'bg-muted/50'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center h-6 w-6 rounded-full',
          step.completed
            ? 'bg-primary text-primary-foreground'
            : 'border-2 border-muted-foreground/30'
        )}
      >
        {step.completed ? (
          <Check className="h-4 w-4" />
        ) : (
          <Circle className="h-3 w-3 text-muted-foreground/30" />
        )}
      </div>
      <div className="flex-1">
        <p
          className={cn(
            'text-sm font-medium',
            step.completed && 'line-through text-muted-foreground'
          )}
        >
          {step.title}
        </p>
        <p className="text-xs text-muted-foreground">{step.description}</p>
      </div>
    </div>
  );
}
