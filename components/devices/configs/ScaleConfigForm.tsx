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
import { ScaleConfig } from '@/lib/types/device';

interface ScaleConfigFormProps {
  config: Partial<ScaleConfig>;
  onChange: (config: Partial<ScaleConfig>) => void;
  errors: Record<string, string>;
}

export function ScaleConfigForm({
  config,
  onChange,
  errors,
}: ScaleConfigFormProps) {
  const t = useTranslations('devices.configuration.scale');

  const updateConfig = (updates: Partial<ScaleConfig>) => {
    onChange({ ...config, ...updates, type: 'scale' });
  };

  return (
    <div className="space-y-6">
      {/* Max Weight */}
      <div className="space-y-2">
        <Label htmlFor="maxWeight">{t('maxWeight')}</Label>
        <div className="flex gap-2">
          <Input
            id="maxWeight"
            type="number"
            min="0"
            step="10"
            placeholder="500"
            value={config.maxWeight || ''}
            onChange={(e) =>
              updateConfig({ maxWeight: parseFloat(e.target.value) || undefined })
            }
            className={errors.maxWeight ? 'border-destructive' : ''}
          />
          <span className="flex items-center text-sm text-muted-foreground w-12">
            {config.unit || 'kg'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{t('maxWeightDesc')}</p>
        {errors.maxWeight && (
          <p className="text-sm text-destructive">{errors.maxWeight}</p>
        )}
      </div>

      {/* Tare Weight */}
      <div className="space-y-2">
        <Label htmlFor="tareWeight">{t('tareWeight')}</Label>
        <div className="flex gap-2">
          <Input
            id="tareWeight"
            type="number"
            min="0"
            step="0.1"
            placeholder="0"
            value={config.tareWeight ?? ''}
            onChange={(e) =>
              updateConfig({ tareWeight: parseFloat(e.target.value) || 0 })
            }
            className={errors.tareWeight ? 'border-destructive' : ''}
          />
          <span className="flex items-center text-sm text-muted-foreground w-12">
            {config.unit || 'kg'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{t('tareWeightDesc')}</p>
        {errors.tareWeight && (
          <p className="text-sm text-destructive">{errors.tareWeight}</p>
        )}
      </div>

      {/* Unit */}
      <div className="space-y-2">
        <Label>{t('unit')}</Label>
        <Select
          value={config.unit || 'kg'}
          onValueChange={(value: 'kg' | 'lb') => updateConfig({ unit: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kg">{t('unitKg')}</SelectItem>
            <SelectItem value="lb">{t('unitLb')}</SelectItem>
          </SelectContent>
        </Select>
        {errors.unit && (
          <p className="text-sm text-destructive">{errors.unit}</p>
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
