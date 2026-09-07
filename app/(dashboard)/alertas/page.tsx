'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bell, Plus, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { AlertCard } from '@/components/alerts/AlertCard';
import { CreateAlertModal } from '@/components/alerts/CreateAlertModal';
import { useData } from '@/lib/context/DataContext';
import type { AlertType } from '@/lib/types/alert';
import type { Location } from '@/lib/types/location';

type FilterType = 'all' | AlertType;
type FilterStatus = 'all' | 'active' | 'inactive';

function getDescendantIds(locations: Location[], locationId: string): Set<string> {
  const result = new Set<string>([locationId]);
  const queue = [locationId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    locations.filter((l) => l.parentId === current).forEach((child) => {
      result.add(child.id);
      queue.push(child.id);
    });
  }
  return result;
}

export default function AlertasPage() {
  const searchParams = useSearchParams();
  const { alerts, locations, devices } = useData();

  const prefilterLocation = searchParams.get('location') ?? undefined;
  const prefilterDevice = searchParams.get('device') ?? undefined;

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterFarm, setFilterFarm] = useState('all');
  const [filterBarn, setFilterBarn] = useState('all');
  const [showCreate, setShowCreate] = useState(false);

  const farmOptions = useMemo(
    () => locations.filter((l) => l.type === 'farm'),
    [locations]
  );

  const barnOptions = useMemo(() => {
    const barns = locations.filter((l) => l.type === 'barn');
    if (filterFarm === 'all') return barns;
    return barns.filter((l) => l.parentId === filterFarm);
  }, [locations, filterFarm]);

  function handleFarmChange(value: string) {
    setFilterFarm(value);
    setFilterBarn('all');
  }

  const filtered = useMemo(() => {
    const farmDescendants =
      filterFarm !== 'all' ? getDescendantIds(locations, filterFarm) : null;
    const barnDescendants =
      filterBarn !== 'all' ? getDescendantIds(locations, filterBarn) : null;

    return alerts.filter((a) => {
      if (prefilterLocation && a.locationId !== prefilterLocation) return false;
      if (prefilterDevice && a.deviceId !== prefilterDevice) return false;
      if (farmDescendants && !farmDescendants.has(a.locationId)) return false;
      if (barnDescendants && !barnDescendants.has(a.locationId)) return false;
      if (filterType !== 'all' && a.type !== filterType) return false;
      if (filterStatus === 'active' && !a.active) return false;
      if (filterStatus === 'inactive' && a.active) return false;
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [alerts, locations, prefilterLocation, prefilterDevice, filterFarm, filterBarn, filterType, filterStatus, search]);

  function getLocationName(locationId: string) {
    return locations.find((l) => l.id === locationId)?.name ?? locationId;
  }

  function getDeviceSerial(deviceId?: string) {
    if (!deviceId) return undefined;
    return devices.find((d) => d.id === deviceId)?.serialNumber;
  }

  const prefilterLabel = prefilterLocation
    ? locations.find((l) => l.id === prefilterLocation)?.name
    : prefilterDevice
    ? devices.find((d) => d.id === prefilterDevice)?.serialNumber
    : undefined;

  return (
    <div>
      <PageHeader
        title="Alertas"
        subtitle={
          prefilterLabel
            ? `Alertas para ${prefilterLabel}`
            : 'Configura alertas para tus granjas y dispositivos'
        }
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-md bg-brand-primary text-white text-sm font-semibold border-none cursor-pointer"
          >
            <Plus size={16} />
            Nueva alerta
          </button>
        }
      />

      {/* Filters */}
      <div className="flex gap-2.5 mb-5 flex-wrap items-center">
        {/* Farm dropdown */}
        {!prefilterLocation && !prefilterDevice && (
          <FilterDropdown
            value={filterFarm}
            onChange={handleFarmChange}
            placeholder="Granja"
            options={farmOptions.map((f) => ({ value: f.id, label: f.name }))}
          />
        )}

        {/* Barn dropdown */}
        {!prefilterLocation && !prefilterDevice && (
          <FilterDropdown
            value={filterBarn}
            onChange={setFilterBarn}
            placeholder="Galpón"
            options={barnOptions.map((b) => ({ value: b.id, label: b.name }))}
            disabled={barnOptions.length === 0}
          />
        )}

        {!prefilterLocation && !prefilterDevice && (
          <div className="w-px h-5 bg-line shrink-0" />
        )}

        {/* Search */}
        <div className="relative flex-[1_1_220px] max-w-80">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-placeholder" />
          <input
            type="text"
            placeholder="Buscar alertas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-8 pr-3 border border-line rounded text-sm outline-none box-border"
          />
        </div>

        {/* Type filter */}
        <FilterChip label="Todas" active={filterType === 'all'} onClick={() => setFilterType('all')} />
        <FilterChip label="Medioambiental" active={filterType === 'environmental'} onClick={() => setFilterType('environmental')} />
        <FilterChip label="Pig Vision" active={filterType === 'pigvision'} onClick={() => setFilterType('pigvision')} />

        <div className="w-px h-5 bg-line shrink-0" />

        <FilterChip label="Activas" active={filterStatus === 'active'} onClick={() => setFilterStatus(filterStatus === 'active' ? 'all' : 'active')} accent />
        <FilterChip label="Inactivas" active={filterStatus === 'inactive'} onClick={() => setFilterStatus(filterStatus === 'inactive' ? 'all' : 'inactive')} />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-surface-2 flex items-center justify-center">
            <Bell size={24} className="text-fg-placeholder" />
          </div>
          <div>
            <p className="text-base font-bold text-fg mb-1">
              {alerts.length === 0 ? 'Sin alertas configuradas' : 'No hay resultados'}
            </p>
            <p className="text-sm text-fg-tertiary">
              {alerts.length === 0
                ? 'Crea tu primera alerta para recibir notificaciones cuando las condiciones de tu granja estén fuera de rango.'
                : 'Prueba con otros filtros o términos de búsqueda.'}
            </p>
          </div>
          {alerts.length === 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4.5 py-2 rounded-md bg-brand-primary text-white text-sm font-semibold border-none cursor-pointer"
            >
              <Plus size={16} />
              Crear alerta
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-fg-placeholder mb-1">
            {filtered.length} {filtered.length === 1 ? 'alerta' : 'alertas'}
          </p>
          {filtered.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              locationName={getLocationName(alert.locationId)}
              deviceSerial={getDeviceSerial(alert.deviceId)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateAlertModal
          prefilterLocationId={prefilterLocation}
          prefilterDeviceId={prefilterDevice}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

function FilterDropdown({
  value,
  onChange,
  placeholder,
  options,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  const isActive = value !== 'all';
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'h-9 pl-2.5 pr-7 rounded text-sm-tight outline-none appearance-none min-w-32.5 border',
          isActive ? 'border-brand-primary bg-surface-blue text-brand-primary font-semibold' : 'border-line bg-surface-elevated font-normal',
          !isActive && (disabled ? 'text-fg-disabled cursor-default' : 'text-fg-secondary cursor-pointer')
        )}
      >
        <option value="all">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none',
          isActive ? 'text-brand-primary' : disabled ? 'text-fg-disabled' : 'text-fg-placeholder'
        )}
      />
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  accent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-3 py-1.25 rounded-full text-xs border whitespace-nowrap transition-all cursor-pointer',
        active ? 'font-semibold' : 'font-normal',
        active
          ? accent
            ? 'border-success bg-success-light text-success'
            : 'border-brand-primary bg-surface-blue text-brand-primary'
          : 'border-line bg-surface-elevated text-fg-tertiary'
      )}
    >
      {active && (
        <span className={cn('w-1.5 h-1.5 rounded-full mr-1.25 shrink-0', accent ? 'bg-success' : 'bg-brand-primary')} />
      )}
      {label}
    </button>
  );
}
