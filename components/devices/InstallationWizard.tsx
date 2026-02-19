'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MapPin, Check, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Device } from '@/lib/types/device';
import { Location } from '@/lib/types/location';
import { useLocations } from '@/lib/hooks/useLocations';
import { useDevices } from '@/lib/hooks/useDevices';
import { LoadingSpinner } from '@/components/shared/LoadingState';

interface InstallationWizardProps {
  device: Device;
  isChangingLocation?: boolean;
}

export function InstallationWizard({ device, isChangingLocation = false }: InstallationWizardProps) {
  const t = useTranslations('devices.installation');
  const tLoc = useTranslations('locations');
  const router = useRouter();
  const { farms, getChildren, locations } = useLocations();
  const { installDevice } = useDevices();

  const isGateway = device.type === 'gateway';

  // Device types that require pen/section level installation
  const REQUIRES_PEN_LEVEL = ['pigvision', 'scale'];
  const requiresPenLevel = REQUIRES_PEN_LEVEL.includes(device.type);

  // Ensure we have all farms (fallback to filtering locations if farms array is empty)
  const allFarms = farms.length > 0 ? farms : locations.filter((l) => l.type === 'farm');

  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [selectedBarn, setSelectedBarn] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const barns = selectedFarm ? getChildren(selectedFarm) : [];
  const pens = selectedBarn ? getChildren(selectedBarn) : [];

  const handleFarmChange = (farmId: string) => {
    setSelectedFarm(farmId);
    if (isGateway) {
      // For gateways, the location is the farm itself
      setSelectedLocation(farmId);
    } else {
      setSelectedBarn(null);
      setSelectedLocation(null);
    }
  };

  const handleBarnChange = (barnId: string) => {
    setSelectedBarn(barnId);
    setSelectedLocation(barnId); // Default to barn if no pens
  };

  const handlePenChange = (penId: string) => {
    setSelectedLocation(penId);
  };

  const handleInstall = async () => {
    if (!selectedLocation) return;

    setIsSubmitting(true);
    try {
      await installDevice(device.id, selectedLocation);
      // If changing location, go back to device detail; otherwise go to configure
      if (isChangingLocation) {
        router.push(`/dispositivos/${device.id}`);
      } else {
        router.push(`/dispositivos/${device.id}/configurar`);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Device Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('deviceInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Serial</dt>
              <dd className="font-medium">{device.serialNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Tipo</dt>
              <dd className="font-medium">
                {device.type === 'gateway' ? 'Gateway' : device.type}
                {isGateway && (
                  <span className="ml-2 text-xs text-muted-foreground">({tLoc('types.farm')} only)</span>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Location Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('selectLocation')}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t('selectLocationDesc')}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {allFarms.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                No hay ubicaciones creadas
              </p>
              <Button
                onClick={() => {
                  sessionStorage.setItem('redirectAfterLocation', `/dispositivos/${device.id}/instalar${isChangingLocation ? '?cambiar=true' : ''}`);
                  router.push('/ubicaciones/nueva');
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('createLocation')}
              </Button>
            </div>
          ) : (
            <>
              {/* Farm Selection */}
              <div className="space-y-2">
                <Label>{tLoc('types.farm')}{isGateway && ' *'}</Label>
                <Select
                  value={selectedFarm || ''}
                  onValueChange={handleFarmChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isGateway ? t('gatewayPlaceholder') : "Selecciona una granja"} />
                  </SelectTrigger>
                  <SelectContent>
                    {allFarms.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id}>
                        {farm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isGateway && (
                  <p className="text-xs text-muted-foreground">
                    {t('gatewayRestriction')}
                  </p>
                )}
              </div>

              {/* Barn Selection - Hidden for Gateways */}
              {!isGateway && selectedFarm && (
                <div className="space-y-2">
                  {barns.length > 0 ? (
                    <>
                      <Label>{tLoc('types.barn')}</Label>
                      <Select
                        value={selectedBarn || ''}
                        onValueChange={handleBarnChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un galpón" />
                        </SelectTrigger>
                        <SelectContent>
                          {barns.map((barn) => (
                            <SelectItem key={barn.id} value={barn.id}>
                              {barn.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 mb-3">
                        {t('noBarnsInFarm')}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          sessionStorage.setItem('redirectAfterLocation', `/dispositivos/${device.id}/instalar${isChangingLocation ? '?cambiar=true' : ''}`);
                          sessionStorage.setItem('createBarnParentId', selectedFarm);
                          router.push('/ubicaciones/nueva');
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('createBarn')}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Pen/Section Selection - Hidden for Gateways */}
              {!isGateway && selectedBarn && (
                <div className="space-y-2">
                  {pens.length > 0 ? (
                    <>
                      <Label>Corral / Sección</Label>
                      <Select
                        value={selectedLocation === selectedBarn ? '' : selectedLocation || ''}
                        onValueChange={handlePenChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un corral (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {pens.map((pen) => (
                            <SelectItem key={pen.id} value={pen.id}>
                              {pen.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  ) : requiresPenLevel ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 mb-3">
                        {t('noPensInBarn')}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          sessionStorage.setItem('redirectAfterLocation', `/dispositivos/${device.id}/instalar${isChangingLocation ? '?cambiar=true' : ''}`);
                          sessionStorage.setItem('createPenParentId', selectedBarn);
                          router.push('/ubicaciones/nueva');
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('createPen')}
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Create new location link */}
              <button
                onClick={() => {
                  sessionStorage.setItem('redirectAfterLocation', `/dispositivos/${device.id}/instalar${isChangingLocation ? '?cambiar=true' : ''}`);
                  router.push('/ubicaciones/nueva');
                }}
                className="flex items-center text-sm text-primary hover:underline"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('createLocation')}
              </button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleInstall}
          className="flex-1"
          disabled={!selectedLocation || isSubmitting}
        >
          {isSubmitting ? (
            <LoadingSpinner className="py-0" />
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              {isChangingLocation ? 'Cambiar' : t('confirm')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
