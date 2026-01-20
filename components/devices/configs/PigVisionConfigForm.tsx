'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Lightbulb } from 'lucide-react';
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
import { useLocations } from '@/lib/hooks/useLocations';

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
  deviceSerialNumber,
}: PigVisionConfigFormProps) {
  const t = useTranslations('devices.configuration.pigvision');
  const { locations, filterByType, getChildren } = useLocations();

  const barns = filterByType('barn');
  const pens = config.barnId ? getChildren(config.barnId).filter(l => l.type === 'pen') : [];

  const updateConfig = (updates: Partial<PigVisionConfig>) => {
    onChange({ ...config, ...updates, type: 'pigvision' });
  };

  // Reset pen when barn changes
  useEffect(() => {
    if (config.barnId && config.penId) {
      const penBelongsToBarn = pens.some(p => p.id === config.penId);
      if (!penBelongsToBarn) {
        updateConfig({ penId: undefined });
      }
    }
  }, [config.barnId]);

  return (
    <div className="space-y-8">
      {/* Device Serial Number */}
      {deviceSerialNumber && (
        <div className="text-sm font-mono text-muted-foreground">
          {deviceSerialNumber}
        </div>
      )}

      {/* Ubicación Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('locationSection')}</h3>

        {/* Galpón */}
        <div className="space-y-2">
          <Label>{t('barn')} (*)</Label>
          <Select
            value={config.barnId || ''}
            onValueChange={(value) => updateConfig({ barnId: value, penId: undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('barnPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {barns.map((barn) => (
                <SelectItem key={barn.id} value={barn.id}>
                  {barn.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.barnId && (
            <p className="text-sm text-destructive">{errors.barnId}</p>
          )}
        </div>

        {/* Corral */}
        <div className="space-y-2">
          <Label>{t('pen')} (*)</Label>
          <Select
            value={config.penId || ''}
            onValueChange={(value) => updateConfig({ penId: value })}
            disabled={!config.barnId}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('penPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {pens.map((pen) => (
                <SelectItem key={pen.id} value={pen.id}>
                  {pen.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.penId && (
            <p className="text-sm text-destructive">{errors.penId}</p>
          )}
        </div>

        {/* Sexo del corral */}
        <div className="space-y-2">
          <Label>{t('penSex')} (*)</Label>
          <Select
            value={config.penSex || ''}
            onValueChange={(value: 'male' | 'female' | 'mixed') =>
              updateConfig({ penSex: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('penSexPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t('penSexMale')}</SelectItem>
              <SelectItem value="female">{t('penSexFemale')}</SelectItem>
              <SelectItem value="mixed">{t('penSexMixed')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.penSex && (
            <p className="text-sm text-destructive">{errors.penSex}</p>
          )}
        </div>
      </div>

      {/* PigVision Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">PigVision</h3>

        {/* Info Box */}
        <div className="flex gap-3 p-4 bg-slate-100 rounded-lg border-l-4 border-slate-400">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-slate-500" />
          </div>
          <p className="text-sm text-slate-700">
            {t('heightInfo')}{' '}
            <a href="#" className="text-primary underline hover:no-underline">
              {t('learnMore')}
            </a>
          </p>
        </div>

        {/* Altura de instalación */}
        <div className="space-y-2">
          <Label>{t('installationHeight')} (*)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.01"
              placeholder={t('heightPlaceholder')}
              value={config.installationHeight || ''}
              onChange={(e) =>
                updateConfig({ installationHeight: parseFloat(e.target.value) || undefined })
              }
              className="flex-1"
            />
            <Select
              value={config.installationHeightUnit || 'm'}
              onValueChange={(value: 'm' | 'cm') =>
                updateConfig({ installationHeightUnit: value })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('unitPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="m">{t('unitMeters')}</SelectItem>
                <SelectItem value="cm">{t('unitCentimeters')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.installationHeight && (
            <p className="text-sm text-destructive">{errors.installationHeight}</p>
          )}
        </div>

        {/* Confirmación de altura */}
        <div className="space-y-2">
          <Label>{t('installationHeightConfirmation')} (*)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.01"
              placeholder={t('heightPlaceholder')}
              value={config.installationHeightConfirmation || ''}
              onChange={(e) =>
                updateConfig({
                  installationHeightConfirmation: parseFloat(e.target.value) || undefined,
                })
              }
              className="flex-1"
            />
            <Select
              value={config.installationHeightConfirmationUnit || 'm'}
              onValueChange={(value: 'm' | 'cm') =>
                updateConfig({ installationHeightConfirmationUnit: value })
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('unitPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="m">{t('unitMeters')}</SelectItem>
                <SelectItem value="cm">{t('unitCentimeters')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.installationHeightConfirmation && (
            <p className="text-sm text-destructive">
              {errors.installationHeightConfirmation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
