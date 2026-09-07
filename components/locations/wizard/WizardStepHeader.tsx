'use client';

import { type LucideIcon, HelpCircle } from 'lucide-react';

interface WizardStepHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  helpText?: string;
}

export function WizardStepHeader({ icon: Icon, title, description, helpText }: WizardStepHeaderProps) {
  return (
    <div className="mb-6 pb-4 border-b border-line">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-blue flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-brand-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-fg-tertiary">{description}</p>
        </div>
      </div>
      {helpText && (
        <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-surface-blue/20 border border-surface-blue/40">
          <HelpCircle className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
          <p className="text-xs text-fg-tertiary">{helpText}</p>
        </div>
      )}
    </div>
  );
}
