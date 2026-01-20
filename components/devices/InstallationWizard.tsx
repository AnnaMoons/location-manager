'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
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
  const { farms, getChildren } = useLocations();
  const { installDevice } = useDevices();

  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [selectedBarn, setSelectedBarn] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const barns = selectedFarm ? getChildren(selectedFarm) : [];
  const pens = selectedBarn ? getChildren(selectedBarn) : [];

  const handleFarmChange = (farmId: string) => {
    setSelectedFarm(farmId);
    setSelectedBarn(null);
    setSelectedLocation(null);
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
              <dd className="font-medium">{device.type}</dd>
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
          {farms.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                No hay ubicaciones creadas
              </p>
              <Link href="/ubicaciones/nueva">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('createLocation')}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Farm Selection */}
              <div className="space-y-2">
                <Label>{tLoc('types.farm')}</Label>
                <Select
                  value={selectedFarm || ''}
                  onValueChange={handleFarmChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una granja" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id}>
                        {farm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Barn Selection */}
              {selectedFarm && barns.length > 0 && (
                <div className="space-y-2">
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
                </div>
              )}

              {/* Pen/Section Selection */}
              {selectedBarn && pens.length > 0 && (
                <div className="space-y-2">
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
                </div>
              )}

              {/* Create new location link */}
              <Link
                href="/ubicaciones/nueva"
                className="flex items-center text-sm text-primary hover:underline"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('createLocation')}
              </Link>
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
