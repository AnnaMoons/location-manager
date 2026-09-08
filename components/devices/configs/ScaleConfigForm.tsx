'use client';

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { ScaleConfig } from '@/lib/types/device';

interface ScaleConfigFormProps {
  config: Partial<ScaleConfig>;
  onChange: (config: Partial<ScaleConfig>) => void;
  errors: Record<string, string>;
}

export function ScaleConfigForm({ config, onChange, errors }: ScaleConfigFormProps) {
  const t = useTranslations('devices.configuration.scale');

  const updateConfig = (updates: Partial<ScaleConfig>) => {
    onChange({ ...config, ...updates, type: 'scale' });
  };

  const unit = config.unit || 'kg';

  return (
    <div className="space-y-6">
      {/* Unit — first, so max/tare inputs show the right unit */}
      <div className="space-y-2">
        <Label>{t('unit')}</Label>
        <Select
          value={unit}
          onValueChange={(value: 'kg' | 'lb') => updateConfig({ unit: value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kg">{t('unitKg')}</SelectItem>
            <SelectItem value="lb">{t('unitLb')}</SelectItem>
          </SelectContent>
        </Select>
        {errors.unit && (
          <div className="flex items-center gap-1.5 text-sm text-error">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors.unit}
          </div>
        )}
      </div>

      {/* Max Weight */}
      <div className="space-y-2">
        <Label htmlFor="maxWeight">
          {t('maxWeight')}
          <span className="text-error ml-1">*</span>
        </Label>
        <p className="text-xs text-fg-tertiary">{t('maxWeightDesc')}</p>
        <div className="flex gap-2">
          <Input
            id="maxWeight"
            type="number"
            min="0"
            step="10"
            placeholder="500"
            value={config.maxWeight ?? ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              updateConfig({ maxWeight: isNaN(val) ? undefined : val });
            }}
            className={`flex-1 ${errors.maxWeight ? 'border-error' : ''}`}
          />
          <span className="flex items-center text-sm text-fg-tertiary w-10">{unit}</span>
        </div>
        {errors.maxWeight && (
          <div className="flex items-center gap-1.5 text-sm text-error">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors.maxWeight}
          </div>
        )}
      </div>

      {/* Tare Weight */}
      <div className="space-y-2">
        <Label htmlFor="tareWeight">
          {t('tareWeight')}
          <span className="text-error ml-1">*</span>
        </Label>
        <p className="text-xs text-fg-tertiary">{t('tareWeightDesc')}</p>
        <div className="flex gap-2">
          <Input
            id="tareWeight"
            type="number"
            min="0"
            step="0.1"
            placeholder="0"
            value={config.tareWeight ?? ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              updateConfig({ tareWeight: isNaN(val) ? undefined : val });
            }}
            className={`flex-1 ${errors.tareWeight ? 'border-error' : ''}`}
          />
          <span className="flex items-center text-sm text-fg-tertiary w-10">{unit}</span>
        </div>
        {errors.tareWeight && (
          <div className="flex items-center gap-1.5 text-sm text-error">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors.tareWeight}
          </div>
        )}
      </div>

      {/* Calibration Date */}
      <div className="space-y-2">
        <Label htmlFor="calibrationDate">{t('calibrationDate')}</Label>
        <Input
          id="calibrationDate"
          type="date"
          value={config.calibrationDate || ''}
          onChange={(e) => updateConfig({ calibrationDate: e.target.value || undefined })}
        />
      </div>
    </div>
  );
}
