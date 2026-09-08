'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Coordinates } from '@/lib/types/location';
import { Search, LocateFixed, Layers } from 'lucide-react';

// Fix for default marker icons in Leaflet with Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapComponentProps {
  coordinates: Coordinates | undefined;
  onCoordinatesChange: (coords: Coordinates) => void;
}

export function MapComponent({ coordinates, onCoordinatesChange }: MapComponentProps) {
  const t = useTranslations('map');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);

  // Default center (Colombia)
  const defaultCenter: Coordinates = { lat: 4.5709, lng: -74.2973 };
  const center = coordinates || defaultCenter;

  const osmTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const satelliteTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([center.lat, center.lng], 10);

    const tileLayer = L.tileLayer(osmTileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const marker = L.marker([center.lat, center.lng], {
      icon: defaultIcon,
      draggable: true,
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onCoordinatesChange({ lat: pos.lat, lng: pos.lng });
    });

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      onCoordinatesChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
    tileLayerRef.current = tileLayer;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      tileLayerRef.current = null;
    };
  }, []);

  // Update marker position when coordinates change externally
  useEffect(() => {
    if (markerRef.current && coordinates) {
      markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
      mapInstanceRef.current?.setView([coordinates.lat, coordinates.lng]);
    }
  }, [coordinates]);

  // H-001: Search address using Nominatim (OpenStreetMap geocoding)
  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const results = await response.json();

      if (results.length > 0) {
        const { lat, lon } = results[0];
        const coords = { lat: parseFloat(lat), lng: parseFloat(lon) };
        markerRef.current?.setLatLng([coords.lat, coords.lng]);
        mapInstanceRef.current.setView([coords.lat, coords.lng], 15);
        onCoordinatesChange(coords);
      }
    } catch {
      // Silently fail — search is a convenience feature
    } finally {
      setIsSearching(false);
    }
  };

  // H-001: Use current location (geolocation API)
  const handleUseMyLocation = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        markerRef.current?.setLatLng([coords.lat, coords.lng]);
        mapInstanceRef.current?.setView([coords.lat, coords.lng], 15);
        onCoordinatesChange(coords);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // H-001: Toggle satellite / street view
  const handleToggleSatellite = () => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const newUrl = isSatellite ? osmTileUrl : satelliteTileUrl;
    const newAttribution = isSatellite
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      : '&copy; <a href="https://www.esri.com">Esri</a>';

    const newLayer = L.tileLayer(newUrl, { attribution: newAttribution }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
    setIsSatellite(!isSatellite);
  };

  return (
    <div className="relative h-full w-full">
      {/* Search bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex gap-2">
        <div className="flex-1 flex gap-1 bg-surface/95 backdrop-blur rounded-lg shadow-md border p-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('searchPlaceholder')}
            className="flex-1 px-3 py-1.5 text-sm bg-transparent outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="p-1.5 rounded-md hover:bg-surface-2 transition-colors disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-14 right-3 z-[1000] flex flex-col gap-2">
        {/* Use my location button */}
        <button
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="p-2 bg-surface/95 backdrop-blur rounded-lg shadow-md border hover:bg-surface-2 transition-colors disabled:opacity-50"
          title={t('currentLocation')}
        >
          <LocateFixed className={`h-4 w-4 ${isLocating ? 'animate-pulse text-brand-primary' : ''}`} />
        </button>

        {/* Satellite toggle */}
        <button
          onClick={handleToggleSatellite}
          className={`p-2 bg-surface/95 backdrop-blur rounded-lg shadow-md border hover:bg-surface-2 transition-colors ${isSatellite ? 'ring-2 ring-brand-primary' : ''}`}
          title={isSatellite ? 'Vista mapa' : 'Vista satelital'}
        >
          <Layers className="h-4 w-4" />
        </button>
      </div>

      {/* Coordinates display */}
      {coordinates && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-surface/95 backdrop-blur rounded-lg shadow-md border px-3 py-1.5">
          <p className="text-xs text-fg-tertiary">
            {t('coordinates')}: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </p>
        </div>
      )}

      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
