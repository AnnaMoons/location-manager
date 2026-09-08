'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { MapPin, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Coordinates, RuralAddress } from '@/lib/types/location';
import { getDepartments, getMunicipalities } from '@/lib/constants/colombia-regions';

// Dynamic import for Leaflet to avoid SSR issues
const MapComponent = dynamic(
  () => import('./MapComponent').then((mod) => mod.MapComponent),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-surface-2 rounded-md flex items-center justify-center">
        <MapPin className="h-8 w-8 text-fg-tertiary animate-pulse" />
      </div>
    )
  }
);

interface LocationPickerProps {
  coordinates: Coordinates | undefined;
  address: string | undefined;
  ruralAddress?: RuralAddress;
  onCoordinatesChange: (coords: Coordinates | undefined) => void;
  onAddressChange: (address: string | undefined) => void;
  onRuralAddressChange?: (ruralAddress: RuralAddress | undefined) => void;
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function LocationPicker({
  coordinates,
  address,
  ruralAddress,
  onCoordinatesChange,
  onAddressChange,
  onRuralAddressChange,
}: LocationPickerProps) {
  const t = useTranslations('locations.form');
  const tMap = useTranslations('map');
  const [activeTab, setActiveTab] = useState<'map' | 'manual'>('map');
  const [lat, setLat] = useState(coordinates?.lat?.toString() || '');
  const [lng, setLng] = useState(coordinates?.lng?.toString() || '');
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const prevCoordsRef = useRef<string | null>(null);

  const departments = useMemo(() => getDepartments(), []);
  const municipalities = useMemo(
    () => (ruralAddress?.department ? getMunicipalities(ruralAddress.department) : []),
    [ruralAddress?.department]
  );

  useEffect(() => {
    if (coordinates) {
      setLat(coordinates.lat.toString());
      setLng(coordinates.lng.toString());
    }
  }, [coordinates]);

  const isColombia =
    !ruralAddress?.country || normalize(ruralAddress.country) === 'colombia';

  // Reverse geocoding when pin moves on map
  useEffect(() => {
    if (!coordinates || !onRuralAddressChange || activeTab !== 'map') return;

    const coordKey = `${coordinates.lat},${coordinates.lng}`;
    if (prevCoordsRef.current === coordKey) return;
    prevCoordsRef.current = coordKey;

    const geocode = async () => {
      setIsGeocoding(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&accept-language=es`
        );
        const data = await res.json();
        const addr = data.address ?? {};

        const countryName = addr.country ?? '';
        const stateName = addr.state ?? addr.region ?? '';
        const cityName = addr.city ?? addr.town ?? addr.village ?? addr.county ?? '';
        const veredaHint = addr.suburb ?? addr.neighbourhood ?? addr.hamlet ?? addr.quarter ?? '';

        const isDetectedColombia = normalize(countryName) === 'colombia';

        // Match department/municipality from Colombia list if applicable
        let finalDept = stateName;
        let finalMun = cityName;

        if (isDetectedColombia) {
          finalDept = departments.find((d) => normalize(d) === normalize(stateName)) ?? stateName;
          if (finalDept) {
            const munis = getMunicipalities(finalDept);
            finalMun = munis.find((m) => normalize(m) === normalize(cityName)) ?? cityName;
          }
        }

        if (countryName || finalDept || finalMun) {
          setIsAddressOpen(true);
          onRuralAddressChange({
            country: countryName || ruralAddress?.country || '',
            department: finalDept || ruralAddress?.department || '',
            municipality: finalMun || ruralAddress?.municipality || '',
            vereda: veredaHint || ruralAddress?.vereda || '',
            additionalInfo: ruralAddress?.additionalInfo,
          });
        }
      } catch {
        // Silent fail — user can fill manually
      } finally {
        setIsGeocoding(false);
      }
    };

    geocode();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinates, activeTab]);

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
            <p className="text-sm text-fg-tertiary">
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

      {/* Structured rural address — collapsible */}
      {onRuralAddressChange && (
        <div className="rounded-lg border">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-surface-2/50 transition-colors rounded-lg"
            onClick={() => setIsAddressOpen((prev) => !prev)}
          >
            <span className="flex items-center gap-2">
              {t('ruralAddress')}
              {isGeocoding && <Loader2 className="h-3.5 w-3.5 animate-spin text-fg-tertiary" />}
            </span>
            {isAddressOpen ? (
              <ChevronDown className="h-4 w-4 text-fg-tertiary" />
            ) : (
              <ChevronRight className="h-4 w-4 text-fg-tertiary" />
            )}
          </button>

          {isAddressOpen && (
            <div className="px-4 pb-4 space-y-4 border-t pt-4">
              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">{t('country')}</Label>
                <Input
                  id="country"
                  placeholder={t('countryPlaceholder')}
                  value={ruralAddress?.country || ''}
                  onChange={(e) =>
                    onRuralAddressChange?.({
                      ...ruralAddress!,
                      country: e.target.value || undefined,
                      department: '',
                      municipality: '',
                    })
                  }
                />
              </div>

              {/* Department / State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">{t('department')}</Label>
                  {isColombia ? (
                    <Select
                      value={ruralAddress?.department || undefined}
                      onValueChange={(v) =>
                        onRuralAddressChange?.({
                          ...ruralAddress!,
                          department: v,
                          municipality: '',
                        })
                      }
                    >
                      <SelectTrigger className="w-full truncate">
                        <SelectValue placeholder={t('selectDepartment')} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="department"
                      placeholder={t('departmentPlaceholder')}
                      value={ruralAddress?.department || ''}
                      onChange={(e) =>
                        onRuralAddressChange?.({ ...ruralAddress!, department: e.target.value })
                      }
                    />
                  )}
                </div>

                {/* Municipality / City */}
                <div className="space-y-2">
                  <Label htmlFor="municipality">{t('municipality')}</Label>
                  {isColombia ? (
                    <Select
                      value={ruralAddress?.municipality || undefined}
                      onValueChange={(v) =>
                        onRuralAddressChange?.({ ...ruralAddress!, municipality: v })
                      }
                      disabled={!ruralAddress?.department}
                    >
                      <SelectTrigger className="w-full truncate">
                        <SelectValue placeholder={t('selectMunicipality')} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {municipalities.map((mun) => (
                          <SelectItem key={mun} value={mun}>
                            {mun}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="municipality"
                      placeholder={t('municipalityPlaceholder')}
                      value={ruralAddress?.municipality || ''}
                      onChange={(e) =>
                        onRuralAddressChange?.({ ...ruralAddress!, municipality: e.target.value })
                      }
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vereda">{t('vereda')}</Label>
                  <Input
                    id="vereda"
                    placeholder={t('veredaPlaceholder')}
                    value={ruralAddress?.vereda || ''}
                    onChange={(e) =>
                      onRuralAddressChange?.({ ...ruralAddress!, vereda: e.target.value || undefined })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">{t('additionalInfo')}</Label>
                  <Input
                    id="additionalInfo"
                    placeholder={t('additionalInfoPlaceholder')}
                    value={ruralAddress?.additionalInfo || ''}
                    onChange={(e) =>
                      onRuralAddressChange?.({ ...ruralAddress!, additionalInfo: e.target.value || undefined })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legacy free-text address (fallback) */}
      {!onRuralAddressChange && (
        <div className="space-y-2">
          <Label htmlFor="address">{t('address')}</Label>
          <Input
            id="address"
            placeholder={t('addressPlaceholder')}
            value={address || ''}
            onChange={(e) => onAddressChange(e.target.value || undefined)}
          />
        </div>
      )}
    </div>
  );
}
