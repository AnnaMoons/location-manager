'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { DeviceState, RepairSubState } from '@/lib/types/device';
import { stateColors } from '@/lib/constants/device-states';
import { cn } from '@/lib/utils';

interface DeviceStateChipProps {
  state: string;
  repairSubState?: RepairSubState;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

export function DeviceStateChip({ state, repairSubState, size = 'md', showTooltip = true }: DeviceStateChipProps) {
  const t = useTranslations('devices');

  const colors = (stateColors as Record<string, { bg: string; text: string; border: string }>)[state] || {
    bg: 'bg-surface-2',
    text: 'text-fg-tertiary',
    border: 'border-line',
  };

  const translatedState = t(`states.${state}`);
  const translatedTooltip = t(`stateTooltips.${state}`);

  // H-016: Show repair sub-state detail with enhanced visibility
  const repairDetail = state === 'returned' && repairSubState
    ? t(`repairSubStates.${repairSubState}`)
    : null;

  // Show repair detail as primary label when available
  const displayLabel = repairDetail || translatedState || state;
  const hasRepairDetail = !!repairDetail;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold whitespace-nowrap',
          colors.bg,
          colors.text,
          colors.border,
          size === 'sm' ? 'text-xs px-2 py-0' : 'text-sm',
          showTooltip && 'cursor-help'
        )}
        title={showTooltip ? (repairDetail ? `${translatedState}: ${repairDetail}` : translatedTooltip || state) : undefined}
      >
        {displayLabel}
      </span>
      {hasRepairDetail && size !== 'sm' && (
        <span className="text-2xs text-fg-tertiary/70 font-medium">
          En reparación
        </span>
      )}
    </span>
  );
}
