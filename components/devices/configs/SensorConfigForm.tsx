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
import { SensorConfig, SensorType } from '@/lib/types/device';

interface SensorConfigFormProps {
  config: Partial<SensorConfig>;
  onChange: (config: Partial<SensorConfig>) => void;
  errors: Record<string, string>;
}

const sensorUnits: Record<SensorType, string> = {
  temperature: '°C',
  humidity: '%',
  co2: 'ppm',
  ammonia: 'ppm',
};

const sensorDefaults: Record<SensorType, { min?: number; max?: number }> = {
  temperature: { min: 18, max: 30 },
  humidity: { min: 40, max: 70 },
  co2: { max: 3000 },
  ammonia: { max: 25 },
};

export function SensorConfigForm({
  config,
  onChange,
  errors,
}: SensorConfigFormProps) {
  const t = useTranslations('devices.configuration.sensor');

  const updateConfig = (updates: Partial<SensorConfig>) => {
    onChange({ ...config, ...updates, type: 'sensor' });
  };

  const unit = config.sensorType ? sensorUnits[config.sensorType] : '';

  return (
    <div className="space-y-6">
      {/* Sensor Type */}
      <div className="space-y-2">
        <Label>{t('sensorType')}</Label>
        <Select
          value={config.sensorType || ''}
          onValueChange={(value: SensorType) => {
            const defaults = sensorDefaults[value];
            updateConfig({
              sensorType: value,
              alertThresholdMin: defaults.min,
              alertThresholdMax: defaults.max,
            });
          }}
        >
          <SelectTrigger className={errors.sensorType ? 'border-destructive' : ''}>
            <SelectValue placeholder={t('sensorTypePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="temperature">{t('temperature')}</SelectItem>
            <SelectItem value="humidity">{t('humidity')}</SelectItem>
            <SelectItem value="co2">{t('co2')}</SelectItem>
            <SelectItem value="ammonia">{t('ammonia')}</SelectItem>
          </SelectContent>
        </Select>
        {errors.sensorType && (
          <p className="text-sm text-destructive">{errors.sensorType}</p>
        )}
      </div>

      {/* Alert Thresholds */}
      {config.sensorType && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="alertMin">{t('alertThresholdMin')}</Label>
            <div className="flex gap-2">
              <Input
                id="alertMin"
                type="number"
                step="1"
                value={config.alertThresholdMin ?? ''}
                onChange={(e) =>
                  updateConfig({
                    alertThresholdMin: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                className={errors.alertThresholdMin ? 'border-destructive' : ''}
              />
              <span className="flex items-center text-sm text-muted-foreground w-12">
                {unit}
              </span>
            </div>
            {errors.alertThresholdMin && (
              <p className="text-sm text-destructive">{errors.alertThresholdMin}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alertMax">{t('alertThresholdMax')}</Label>
            <div className="flex gap-2">
              <Input
                id="alertMax"
                type="number"
                step="1"
                value={config.alertThresholdMax ?? ''}
                onChange={(e) =>
                  updateConfig({
                    alertThresholdMax: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
              />
              <span className="flex items-center text-sm text-muted-foreground w-12">
                {unit}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Reading Interval */}
      <div className="space-y-2">
        <Label htmlFor="readingInterval">{t('readingInterval')}</Label>
        <div className="flex gap-2">
          <Input
            id="readingInterval"
            type="number"
            min="1"
            step="1"
            placeholder="300"
            value={config.readingInterval || ''}
            onChange={(e) =>
              updateConfig({
                readingInterval: parseInt(e.target.value) || undefined,
              })
            }
            className={errors.readingInterval ? 'border-destructive' : ''}
          />
          <span className="flex items-center text-sm text-muted-foreground w-20">
            {t('seconds')}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{t('readingIntervalDesc')}</p>
        {errors.readingInterval && (
          <p className="text-sm text-destructive">{errors.readingInterval}</p>
        )}
      </div>
    </div>
  );
}
