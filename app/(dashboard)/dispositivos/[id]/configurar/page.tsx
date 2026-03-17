'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Check, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingState';
import { PigVisionConfigForm } from '@/components/devices/configs/PigVisionConfigForm';
import { ScaleConfigForm } from '@/components/devices/configs/ScaleConfigForm';
import { SensorConfigForm } from '@/components/devices/configs/SensorConfigForm';
import { useDevices } from '@/lib/hooks/useDevices';
import {
  DeviceConfig,
  PigVisionConfig,
  ScaleConfig,
  SensorConfig,
} from '@/lib/types/device';
import {
  validatePigVisionConfig,
  validateScaleConfig,
  validateSensorConfig,
} from '@/lib/utils/validation';

export default function ConfigureDevicePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const t = useTranslations('devices.configuration');
  const tDetail = useTranslations('devices.detail');
  const tInstall = useTranslations('devices.installation');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { getDevice, configureDevice, isLoading } = useDevices();

  const device = getDevice(id);

  const [config, setConfig] = useState<Partial<DeviceConfig>>(
    device?.configuration || {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!device) {
    return (
      <EmptyState
        title={tDetail('notFound')}
        description={tDetail('notFoundDesc')}
        actionLabel={tDetail('backToList')}
        actionHref="/dispositivos"
      />
    );
  }

  if (!device.locationId) {
    return (
      <EmptyState
        icon={Settings}
        title={tInstall('notInstalled')}
        description={tInstall('notInstalledDesc')}
        actionLabel={tInstall('installDevice')}
        actionHref={`/dispositivos/${id}/instalar`}
      />
    );
  }

  const handleSubmit = async () => {
    let validation;

    switch (device.type) {
      case 'pigvision':
        validation = validatePigVisionConfig(config as Partial<PigVisionConfig>);
        break;
      case 'scale':
        validation = validateScaleConfig(config as Partial<ScaleConfig>);
        break;
      case 'sensor':
        validation = validateSensorConfig(config as Partial<SensorConfig>);
        break;
      default:
        validation = { valid: false, errors: { type: t('unknownType') } };
    }

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await configureDevice(device.id, config as DeviceConfig);
      router.push(`/dispositivos/${id}`);
    } catch (error) {
      setErrors({ submit: t('saveError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (device.type) {
      case 'pigvision':
        return t('pigvision.title');
      case 'scale':
        return t('scale.title');
      case 'sensor':
        return t('sensor.title');
      default:
        return t('title');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title={getTitle()}
        subtitle={device.serialNumber}
        showBack
        backHref={`/dispositivos/${id}`}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('paramsTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {device.type === 'pigvision' && (
            <PigVisionConfigForm
              config={config as Partial<PigVisionConfig>}
              onChange={setConfig}
              errors={errors}
              deviceSerialNumber={device.serialNumber}
            />
          )}

          {device.type === 'scale' && (
            <ScaleConfigForm
              config={config as Partial<ScaleConfig>}
              onChange={setConfig}
              errors={errors}
            />
          )}

          {device.type === 'sensor' && (
            <SensorConfigForm
              config={config as Partial<SensorConfig>}
              onChange={setConfig}
              errors={errors}
            />
          )}
        </CardContent>
      </Card>

      {errors.submit && (
        <p className="text-sm text-destructive text-center mt-4">{errors.submit}</p>
      )}

      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
          disabled={isSubmitting}
        >
          {tCommon('cancel')}
        </Button>
        <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? (
            <LoadingSpinner className="py-0" />
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              {tCommon('save')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
