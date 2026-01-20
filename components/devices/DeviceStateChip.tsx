'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { DeviceState } from '@/lib/types/device';
import { stateColors } from '@/lib/constants/device-states';
import { cn } from '@/lib/utils';

interface DeviceStateChipProps {
  state: DeviceState;
  size?: 'sm' | 'md';
}

export function DeviceStateChip({ state, size = 'md' }: DeviceStateChipProps) {
  const t = useTranslations('devices.states');
  const colors = stateColors[state];

  return (
    <Badge
      className={cn(
        colors.bg,
        colors.text,
        'border',
        colors.border,
        size === 'sm' && 'text-xs px-2 py-0'
      )}
    >
      {t(state)}
    </Badge>
  );
}
