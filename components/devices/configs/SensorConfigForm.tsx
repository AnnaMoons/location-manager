'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import {
  SensorConfig,
  SENSOR_PROFILE_VARIABLES,
  SENSOR_PROFILE_LABELS,
  INTERNAL_SENSOR_THRESHOLDS,
  SensorVariable,
} from '@/lib/types/device';
import { Thermometer, Droplets, Wind, Sun, Info } from 'lucide-react';

interface SensorConfigFormProps {
  config: Partial<SensorConfig>;
  onChange: (config: Partial<SensorConfig>) => void;
  errors: Record<string, string>;
}

const variableIcons: Record<SensorVariable, typeof Thermometer> = {
  temperature: Thermometer,
  humidity: Droplets,
  co2: Wind,
  ammonia: Wind,
  light: Sun,
};

const variableLabels: Record<SensorVariable, string> = {
  temperature: 'Temperatura',
  humidity: 'Humedad',
  co2: 'CO₂',
  ammonia: 'NH₃ (Amoníaco)',
  light: 'Luz',
};

export function SensorConfigForm({ config }: SensorConfigFormProps) {
  const t = useTranslations('devices.configuration.sensor');

  const selectedProfile = config.sensorProfile;
  const variables = selectedProfile ? SENSOR_PROFILE_VARIABLES[selectedProfile] : [];

  return (
    <div className="space-y-5">
      {/* Managed internally notice */}
      <div className="flex items-start gap-3 rounded-lg border bg-surface-2/40 px-4 py-3">
        <Info className="h-4 w-4 mt-0.5 text-fg-tertiary shrink-0" />
        <p className="text-sm text-fg-tertiary">
          {t('managedInternally')}
        </p>
      </div>

      {/* Sensor profile — auto-resolved from serial */}
      {selectedProfile && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg border bg-surface-2/30">
          <div>
            <p className="text-xs text-fg-tertiary mb-0.5">{t('sensorProfile')}</p>
            <p className="text-sm font-medium">{SENSOR_PROFILE_LABELS[selectedProfile]}</p>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {t('autoDetected')}
          </Badge>
        </div>
      )}

      {/* Measured variables read-only */}
      {variables.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">{t('measuredVariables')}</p>
          <div className="flex flex-wrap gap-2">
            {variables.map((variable) => {
              const Icon = variableIcons[variable];
              const thresholds = INTERNAL_SENSOR_THRESHOLDS[variable];
              return (
                <div
                  key={variable}
                  className="flex items-center gap-2 rounded-lg border p-3 bg-surface-2/30"
                >
                  <Icon className="h-4 w-4 text-fg-tertiary" />
                  <div>
                    <p className="text-sm font-medium">{variableLabels[variable]}</p>
                    <p className="text-xs text-fg-tertiary">
                      {t('range')}: {thresholds.min} – {thresholds.max} {thresholds.unit}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
