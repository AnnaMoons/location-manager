'use client';

import { useTranslations } from 'next-intl';
import { Ruler, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PigVisionConfig } from '@/lib/types/device';

interface PigVisionConfigFormProps {
  config: Partial<PigVisionConfig>;
  onChange: (config: Partial<PigVisionConfig>) => void;
  errors: Record<string, string>;
  deviceSerialNumber?: string;
}

export function PigVisionConfigForm({
  config,
  onChange,
  errors,
}: PigVisionConfigFormProps) {
  const t = useTranslations('devices.configuration.pigvision');

  const updateConfig = (updates: Partial<PigVisionConfig>) => {
    onChange({ ...config, ...updates, type: 'pigvision' });
  };

  const parseDecimal = (value: string): number | undefined => {
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  };

  return (
    <div className="space-y-6">
      {/* Info contextual */}
      <div className="flex items-start gap-3 rounded-lg border bg-surface-2/40 px-4 py-3">
        <Ruler className="h-4 w-4 mt-0.5 text-fg-tertiary shrink-0" />
        <p className="text-sm text-fg-tertiary">{t('heightInfo')}</p>
      </div>

      {/* Altura de instalación */}
      <div className="space-y-2">
        <Label>
          {t('installationHeight')}
          <span className="text-error ml-1">*</span>
        </Label>
        <p className="text-xs text-fg-tertiary">{t('installationHeightDesc')}</p>
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.01"
            min="1"
            max="5"
            placeholder="ej. 2.35"
            value={config.installationHeight || ''}
            onChange={(e) => updateConfig({ installationHeight: parseDecimal(e.target.value) })}
            className={`flex-1 ${errors.installationHeight ? 'border-error' : ''}`}
          />
          <Select
            value={config.installationHeightUnit || 'm'}
            onValueChange={(value: 'm' | 'cm') => updateConfig({ installationHeightUnit: value })}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="m">m</SelectItem>
              <SelectItem value="cm">cm</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {errors.installationHeight && (
          <div className="flex items-center gap-1.5 text-sm text-error">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors.installationHeight}
          </div>
        )}
      </div>

      {/* Confirmación de altura */}
      <div className="space-y-2">
        <Label>
          {t('installationHeightConfirmation')}
          <span className="text-error ml-1">*</span>
        </Label>
        <p className="text-xs text-fg-tertiary">{t('installationHeightConfirmationDesc')}</p>
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.01"
            min="1"
            max="5"
            placeholder="ej. 2.35"
            value={config.installationHeightConfirmation || ''}
            onChange={(e) =>
              updateConfig({ installationHeightConfirmation: parseDecimal(e.target.value) })
            }
            className={`flex-1 ${errors.installationHeightConfirmation ? 'border-error' : ''}`}
          />
          <Select
            value={config.installationHeightConfirmationUnit || 'm'}
            onValueChange={(value: 'm' | 'cm') =>
              updateConfig({ installationHeightConfirmationUnit: value })
            }
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="m">m</SelectItem>
              <SelectItem value="cm">cm</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {errors.installationHeightConfirmation && (
          <div className="flex items-center gap-1.5 text-sm text-error">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors.installationHeightConfirmation}
          </div>
        )}
      </div>
    </div>
  );
}
