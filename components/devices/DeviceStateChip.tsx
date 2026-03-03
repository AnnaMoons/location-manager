'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { DeviceState } from '@/lib/types/device';
import { stateColors } from '@/lib/constants/device-states';
import { cn } from '@/lib/utils';

interface DeviceStateChipProps {
  state: DeviceState;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

export function DeviceStateChip({ state, size = 'md', showTooltip = true }: DeviceStateChipProps) {
  const t = useTranslations('devices.states');
  const tTooltip = useTranslations('devices.stateTooltips');
  const colors = stateColors[state] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
  };

  const translatedState = t(state);
  const translatedTooltip = tTooltip(state);

  return (
    <Badge
      variant="outline"
      className={cn(
        colors.bg,
        colors.text,
        colors.border,
        size === 'sm' ? 'text-xs px-2 py-0' : 'text-sm',
        showTooltip && 'cursor-help'
      )}
      title={showTooltip ? (translatedTooltip || state) : undefined}
    >
      {translatedState || state}
    </Badge>
  );
}
