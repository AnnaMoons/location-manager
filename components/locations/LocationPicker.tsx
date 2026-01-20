'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coordinates } from '@/lib/types/location';

// Dynamic import for Leaflet to avoid SSR issues
const MapComponent = dynamic(
  () => import('./MapComponent').then((mod) => mod.MapComponent),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-muted rounded-md flex items-center justify-center">
        <MapPin className="h-8 w-8 text-muted-foreground animate-pulse" />
      </div>
    )
  }
);

interface LocationPickerProps {
  coordinates: Coordinates | undefined;
  address: string | undefined;
  onCoordinatesChange: (coords: Coordinates | undefined) => void;
  onAddressChange: (address: string | undefined) => void;
}

export function LocationPicker({
  coordinates,
  address,
  onCoordinatesChange,
  onAddressChange,
}: LocationPickerProps) {
  const t = useTranslations('locations.form');
  const tMap = useTranslations('map');
  const [activeTab, setActiveTab] = useState<'map' | 'manual'>('map');
  const [lat, setLat] = useState(coordinates?.lat?.toString() || '');
  const [lng, setLng] = useState(coordinates?.lng?.toString() || '');

  useEffect(() => {
    if (coordinates) {
      setLat(coordinates.lat.toString());
      setLng(coordinates.lng.toString());
    }
  }, [coordinates]);

  const handleManualChange = () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (!isNaN(latNum) && !isNaN(lngNum)) {
      onCoordinatesChange({ lat: latNum, lng: lngNum });
    } else {
      onCoordinatesChange(undefined);
    }
  };

  return (
    <div className="space-y-4">
      <Label>{t('coordinates')}</Label>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'map' | 'manual')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">{t('useMap')}</TabsTrigger>
          <TabsTrigger value="manual">{t('manualCoords')}</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <div className="h-64 rounded-md overflow-hidden border">
            <MapComponent
              coordinates={coordinates}
              onCoordinatesChange={onCoordinatesChange}
            />
          </div>
          {coordinates && (
            <p className="text-sm text-muted-foreground">
              {tMap('coordinates')}: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </p>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">{t('latitude')}</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="-90 to 90"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                onBlur={handleManualChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">{t('longitude')}</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="-180 to 180"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                onBlur={handleManualChange}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Address field */}
      <div className="space-y-2">
        <Label htmlFor="address">{t('address')}</Label>
        <Input
          id="address"
          placeholder={t('addressPlaceholder')}
          value={address || ''}
          onChange={(e) => onAddressChange(e.target.value || undefined)}
        />
      </div>
    </div>
  );
}
