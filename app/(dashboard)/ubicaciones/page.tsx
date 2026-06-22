'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Plus, Search, MapPin, ChevronDown, ChevronRight,
  Warehouse, Fence, MoreVertical, Cpu,
  Thermometer, Wind, Sun, Camera, Weight, Wifi,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { LocationForm } from '@/components/locations/LocationForm';
import { useLocations } from '@/lib/hooks/useLocations';
import { useDevices } from '@/lib/hooks/useDevices';
import { useBatches } from '@/lib/hooks/useBatches';
import { Species, getNextLevelType, canHaveChildren } from '@/lib/types/species';
import { LocationWithChildren } from '@/lib/types/location';
import { LocationType } from '@/lib/types/species';
import { Device, SensorConfig, SensorProfile } from '@/lib/types/device';
import { Batch, BatchSex } from '@/lib/types/batch';

interface AddModalTarget {
  parentId: string;
  type: LocationType;
  species: Species;
  title: string;
}

/* ─── Species config ───────────────────────────────────────── */

const SPECIES_BADGE_STYLES: Record<Species, string> = {
  pigs: 'bg-asimetrix-accent-pink text-foreground',
  broilers: 'bg-asimetrix-accent-mint text-foreground',
  layers: 'bg-asimetrix-accent-steel text-foreground',
};

/* ─── Device display config ────────────────────────────────── */

type DeviceChipDef = {
  label: string;
  icon: React.ElementType;
  bg: string;
  text: string;
};

const SENSOR_PROFILE_CHIP: Record<SensorProfile, DeviceChipDef> = {
  temp_humidity:       { label: 'T+H',       icon: Thermometer, bg: 'bg-accent',                   text: 'text-primary' },
  temp_humidity_co2:   { label: 'T+H+CO₂',   icon: Wind,        bg: 'bg-asimetrix-accent-mint',     text: 'text-foreground' },
  temp_humidity_nh3:   { label: 'T+H+NH₃',   icon: Wind,        bg: 'bg-asimetrix-accent-pink',     text: 'text-foreground' },
  temp_humidity_light: { label: 'T+H+Luz',   icon: Sun,         bg: 'bg-asimetrix-accent-steel',    text: 'text-foreground' },
};

const DEVICE_TYPE_CHIP: Record<string, DeviceChipDef> = {
  sensor:    { label: 'Sensor',    icon: Thermometer, bg: 'bg-accent',                text: 'text-primary' },
  pigvision: { label: 'PigVision', icon: Camera,      bg: 'bg-asimetrix-accent-pink', text: 'text-foreground' },
  scale:     { label: 'Báscula',   icon: Weight,      bg: 'bg-asimetrix-accent-steel',text: 'text-foreground' },
  gateway:   { label: 'Gateway',   icon: Wifi,        bg: 'bg-muted',                 text: 'text-muted-foreground' },
};

type DeviceGroup = DeviceChipDef & { count: number };

function groupDevices(devices: Device[]): DeviceGroup[] {
  const map = new Map<string, DeviceGroup>();
  for (const d of devices) {
    let key: string;
    let chip: DeviceChipDef;

    if (d.type === 'sensor' && d.configuration?.type === 'sensor') {
      const profile = (d.configuration as SensorConfig).sensorProfile;
      if (profile && SENSOR_PROFILE_CHIP[profile]) {
        key = `sensor_${profile}`;
        chip = SENSOR_PROFILE_CHIP[profile];
      } else {
        key = 'sensor_generic';
        chip = DEVICE_TYPE_CHIP.sensor;
      }
    } else {
      key = d.type;
      chip = DEVICE_TYPE_CHIP[d.type] ?? { label: d.type, icon: Cpu, bg: 'bg-muted', text: 'text-muted-foreground' };
    }

    const existing = map.get(key);
    if (existing) {
      existing.count++;
    } else {
      map.set(key, { ...chip, count: 1 });
    }
  }
  return Array.from(map.values());
}

/* ─── Helpers ───────────────────────────────────────────────── */

function countAllDevices(loc: LocationWithChildren, devices: Device[]): number {
  let count = devices.filter((d) => d.locationId === loc.id).length;
  for (const child of loc.children) {
    count += countAllDevices(child, devices);
  }
  return count;
}

function formatAddress(loc: LocationWithChildren): string | null {
  if (loc.ruralAddress) {
    const parts = [
      loc.ruralAddress.vereda ? `Vereda ${loc.ruralAddress.vereda}` : null,
      loc.ruralAddress.municipality,
      loc.ruralAddress.department,
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
  }
  if (loc.address) return loc.address;
  return null;
}

/* ─── Page ──────────────────────────────────────────────────── */

export default function LocationsPage() {
  const t = useTranslations('locations');
  const { locations, locationTree, isLoading } = useLocations();
  const { devices } = useDevices();
  const { activeBatches } = useBatches();

  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<Species | 'all'>('all');
  const [addModal, setAddModal] = useState<AddModalTarget | null>(null);

  const openAddModal = (target: AddModalTarget) => setAddModal(target);
  const closeAddModal = () => setAddModal(null);

  const filteredTree = useMemo(() => {
    let filtered = locationTree;

    if (speciesFilter !== 'all') {
      filtered = filtered.filter((loc) => loc.species === speciesFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (loc: LocationWithChildren): boolean => {
        return (
          loc.name.toLowerCase().includes(query) ||
          loc.address?.toLowerCase().includes(query) ||
          loc.children.some(matchesSearch)
        );
      };
      filtered = filtered.filter(matchesSearch);
    }

    return filtered;
  }, [locationTree, speciesFilter, searchQuery]);

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title={t('title')}
          actions={
            <Link href="/ubicaciones/nueva">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('newLocation')}
              </Button>
            </Link>
          }
        />
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        actions={
          <Link href="/ubicaciones/nueva">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('newLocation')}
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={speciesFilter}
          onValueChange={(v) => setSpeciesFilter(v as Species | 'all')}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las especies</SelectItem>
            <SelectItem value="pigs">{t('species.pigs')}</SelectItem>
            <SelectItem value="broilers">{t('species.broilers')}</SelectItem>
            <SelectItem value="layers">{t('species.layers')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location List */}
      {locations.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title={t('noLocations')}
          description={t('noLocationsDesc')}
          actionLabel={t('createFirst')}
          actionHref="/ubicaciones/nueva"
        />
      ) : filteredTree.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Sin resultados"
          description="No se encontraron ubicaciones con los filtros aplicados"
        />
      ) : (
        <div className="space-y-4">
          {filteredTree.map((farm) => (
            <FarmCard key={farm.id} farm={farm} devices={devices} batches={activeBatches} onAddChild={openAddModal} />
          ))}
        </div>
      )}

      {/* Add location modal */}
      <Dialog open={!!addModal} onOpenChange={(open) => !open && closeAddModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{addModal?.title}</DialogTitle>
          </DialogHeader>
          {addModal && (
            <LocationForm
              mode="create"
              initialParentId={addModal.parentId}
              initialType={addModal.type}
              initialSpecies={addModal.species}
              onSuccess={closeAddModal}
              onCancel={closeAddModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Farm Card ──────────────────────────────────────────────── */

function FarmCard({
  farm,
  devices,
  batches,
  onAddChild,
}: {
  farm: LocationWithChildren;
  devices: Device[];
  batches: Batch[];
  onAddChild: (target: AddModalTarget) => void;
}) {
  const t = useTranslations('locations');
  const [isExpanded, setIsExpanded] = useState(true);

  const barnCount = farm.children.length;
  const totalPens = farm.children.reduce((sum, barn) => sum + barn.children.length, 0);
  const farmDirectDevices = devices.filter((d) => d.locationId === farm.id);
  const totalDevices = countAllDevices(farm, devices);
  const address = formatAddress(farm);
  const penType = getNextLevelType(farm.species, 'barn');
  const penLabel = penType === 'section' ? t('sectionCount', { count: totalPens }) : t('penCount', { count: totalPens });

  // Get active batches for this farm
  const farmBatches = batches.filter((b) => b.farmIds?.includes(farm.id));
  const totalAnimals = farmBatches.reduce((sum, b) => sum + b.animalCount, 0);

  // Get all sensors across farm
  const getAllSensors = (loc: LocationWithChildren): Device[] => {
    let sensors = devices.filter((d) => d.locationId === loc.id && d.type === 'sensor' && d.lastMeasurement?.unit === '°C');
    for (const child of loc.children) {
      sensors = sensors.concat(getAllSensors(child));
    }
    return sensors;
  };

  const allSensors = getAllSensors(farm);
  const avgTemp = allSensors.length > 0
    ? Math.round(allSensors.reduce((sum, s) => sum + (s.lastMeasurement?.value ?? 0), 0) / allSensors.length)
    : null;

  return (
    <Card className="overflow-hidden border-l-4 border-l-primary">
      {/* Farm header */}
      <div className="flex items-start px-4 py-4 gap-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 shrink-0 mt-0.5"
        >
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/ubicaciones/${farm.id}`}
              className="font-semibold text-base hover:underline"
            >
              {farm.name}
            </Link>
            <Badge
              className={`text-[11px] font-medium border-0 ${SPECIES_BADGE_STYLES[farm.species]}`}
            >
              {t(`species.${farm.species}`)}
            </Badge>
          </div>
          {address && (
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {address}
            </p>
          )}

          {/* Farm operational summary */}
          {(avgTemp !== null || totalAnimals > 0) && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-xs text-muted-foreground">
              {avgTemp !== null && (
                <span className="flex items-center gap-1">
                  <Thermometer className="h-3 w-3" />
                  <span className="font-medium text-foreground tabular-nums">
                    {avgTemp}°C promedio
                  </span>
                </span>
              )}

              {totalAnimals > 0 && (
                <span className="flex items-center gap-1">
                  <span className="font-medium text-foreground">
                    {totalAnimals} animales
                  </span>
                </span>
              )}
            </div>
          )}

          {farmDirectDevices.length > 0 && (
            <DeviceChips devices={farmDirectDevices} />
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Consolidated stats */}
          {barnCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
              <Warehouse className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{barnCount}</span>
              {t('barnCount', { count: barnCount }).replace(`${barnCount} `, '')}
            </span>
          )}
          {totalPens > 0 && penType && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
              <Fence className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{totalPens}</span>
              {penLabel.replace(`${totalPens} `, '')}
            </span>
          )}
          {totalDevices > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
              <Cpu className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{totalDevices}</span>
              dispositivos
            </span>
          )}
          <LocationMenu locationId={farm.id} />
        </div>
      </div>

      {/* Expanded: barns inside farm */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {farm.children.map((barn) => (
            <BarnRow key={barn.id} barn={barn} devices={devices} batches={batches} onAddChild={onAddChild} />
          ))}

          {/* Add barn */}
          <button
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 pl-3"
            onClick={() => onAddChild({ parentId: farm.id, type: 'barn', species: farm.species, title: t('addBarnAction') })}
          >
            <Plus className="h-4 w-4" />
            {t('addBarnAction')}
          </button>
        </div>
      )}
    </Card>
  );
}

/* ─── Barn Row ───────────────────────────────────────────────── */

function BarnRow({
  barn,
  devices,
  batches,
  onAddChild,
}: {
  barn: LocationWithChildren;
  devices: Device[];
  batches: Batch[];
  onAddChild: (target: AddModalTarget) => void;
}) {
  const t = useTranslations('locations');
  const [isExpanded, setIsExpanded] = useState(true);

  const barnDirectDevices = devices.filter((d) => d.locationId === barn.id);
  const totalBarnDevices = countAllDevices(barn, devices);
  const penCount = barn.children.length;
  const childType = getNextLevelType(barn.species, 'barn');
  const isSection = childType === 'section';
  const canAddChildren = canHaveChildren(barn.species, barn.type);

  const countLabel = isSection
    ? t('sectionCount', { count: penCount })
    : t('penCount', { count: penCount });

  const addLabel = isSection ? t('addSectionAction') : t('addPenAction');

  // Get active batches for this barn
  const barnBatches = batches.filter((b) => b.barnIds?.includes(barn.id));
  const totalAnimals = barnBatches.reduce((sum, b) => sum + b.animalCount, 0);

  // Get average temperature from barn sensors
  const barnSensors = barnDirectDevices.filter((d) => d.type === 'sensor' && d.lastMeasurement?.unit === '°C');
  const avgTemp = barnSensors.length > 0
    ? Math.round(barnSensors.reduce((sum, s) => sum + (s.lastMeasurement?.value ?? 0), 0) / barnSensors.length)
    : null;

  return (
    <div className="rounded-lg border border-l-[3px] border-l-secondary">
      {/* Barn header */}
      <div className="flex items-start px-3 py-3 gap-2">
        {canAddChildren && penCount > 0 ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 shrink-0 mt-0.5"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-5 shrink-0" />
        )}

        <Warehouse className="h-4 w-4 text-primary shrink-0 mt-0.5" />

        <div className="flex-1 min-w-0">
          <Link
            href={`/ubicaciones/${barn.id}`}
            className="font-medium text-sm hover:underline truncate block"
          >
            {barn.name}
          </Link>

          {/* Barn operational summary */}
          {(avgTemp !== null || totalAnimals > 0) && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
              {avgTemp !== null && (
                <span className="flex items-center gap-1">
                  <Thermometer className="h-3 w-3" />
                  <span className="font-medium text-foreground tabular-nums">
                    {avgTemp}°C
                  </span>
                </span>
              )}

              {totalAnimals > 0 && (
                <span className="flex items-center gap-1">
                  <span className="font-medium text-foreground">
                    {totalAnimals} animales
                  </span>
                </span>
              )}
            </div>
          )}

          {barnDirectDevices.length > 0 && (
            <DeviceChips devices={barnDirectDevices} />
          )}
        </div>

        <div className="flex items-center gap-2 ml-2 shrink-0">
          {totalBarnDevices > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Cpu className="h-3.5 w-3.5" />
              {totalBarnDevices}
            </span>
          )}
          {penCount > 0 && (
            <Badge className="text-[11px] whitespace-nowrap bg-secondary text-secondary-foreground hover:bg-secondary/80">
              {countLabel}
            </Badge>
          )}
          <LocationMenu locationId={barn.id} />
        </div>
      </div>

      {/* Pens inside barn */}
      {isExpanded && penCount > 0 && (
        <div className="mx-3 mb-2 space-y-1">
          {barn.children.map((pen) => {
            const penDevices = devices.filter((d) => d.locationId === pen.id);
            return <PenRow key={pen.id} pen={pen} devices={penDevices} batches={batches} />;
          })}
        </div>
      )}

      {/* Add pen/section — always visible when species allows children */}
      {canAddChildren && (
        <div className="mx-3 mb-3">
          <button
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5 pl-2"
            onClick={() => onAddChild({
              parentId: barn.id,
              type: childType ?? 'pen',
              species: barn.species,
              title: addLabel,
            })}
          >
            <Plus className="h-3.5 w-3.5" />
            {addLabel}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Pen Row ────────────────────────────────────────────────── */

function PenRow({ pen, devices, batches }: { pen: LocationWithChildren; devices: Device[]; batches: Batch[] }) {
  // Find active batch for this pen
  const activeBatch = batches.find((b) => b.penIds?.includes(pen.id));

  // Get pen-specific data from batch distribution
  const penDistribution = activeBatch?.penDistribution?.find((pd) => pd.penId === pen.id);

  // Calculate operational data
  const daysInPen = activeBatch ? Math.floor((Date.now() - new Date(activeBatch.startDate).getTime()) / (1000 * 60 * 60 * 24)) : null;
  const avgWeight = penDistribution?.initialWeight ?? activeBatch?.initialWeight;
  const sex = penDistribution?.sex ?? activeBatch?.sex;
  const animalCount = penDistribution?.animalCount;

  // Get temperature sensor reading with profile info
  const tempSensor = devices.find((d) => d.type === 'sensor' && d.lastMeasurement?.unit === '°C');
  const currentTemp = tempSensor?.lastMeasurement;
  const sensorProfile = tempSensor?.configuration?.type === 'sensor' ? (tempSensor.configuration as SensorConfig).sensorProfile : null;

  // Get scale or pigvision with latest measurement
  const weightDevice = devices.find((d) => d.type === 'scale' || d.type === 'pigvision');
  const currentWeight = weightDevice?.lastMeasurement?.unit === 'kg' ? weightDevice.lastMeasurement.value : null;

  // Calculate daily weight gain (ganancia diaria promedio)
  const dailyGain = avgWeight && currentWeight && daysInPen && daysInPen > 0
    ? ((currentWeight - avgWeight) / daysInPen)
    : null;

  return (
    <div className="flex items-start py-2 px-3 rounded-md border border-l-[3px] border-l-info">
      <Fence className="h-3.5 w-3.5 text-success mr-2 shrink-0 mt-0.5" />

      <div className="flex-1 min-w-0">
        <Link
          href={`/ubicaciones/${pen.id}`}
          className="text-sm hover:underline truncate block font-medium"
        >
          {pen.name}
        </Link>

        {/* Operational summary */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
          {currentTemp && (
            <span className="flex items-center gap-1" title={sensorProfile ? `Sensor: ${SENSOR_PROFILE_SHORT_LABELS[sensorProfile]}` : 'Temperatura actual'}>
              <Thermometer className="h-3 w-3" />
              <span className="font-medium text-foreground tabular-nums">
                {currentTemp.value}°C
              </span>
            </span>
          )}

          {currentWeight && (
            <span className="flex items-center gap-1">
              <Weight className="h-3 w-3" />
              <span className="font-medium text-foreground tabular-nums">
                {currentWeight.toFixed(1)} kg
              </span>
            </span>
          )}

          {animalCount && (
            <span className="flex items-center gap-1">
              <span className="font-medium text-foreground">
                {animalCount} {sex === 'male' ? '♂ machos' : sex === 'female' ? '♀ hembras' : sex === 'mixed' ? 'animales' : 'animales'}
              </span>
            </span>
          )}

          {daysInPen !== null && (
            <span className="flex items-center gap-1">
              <span className="font-medium text-foreground">
                {daysInPen} días
              </span>
            </span>
          )}

          {dailyGain !== null && dailyGain > 0 && (
            <span className="flex items-center gap-1">
              <span className="font-medium text-success tabular-nums">
                +{dailyGain.toFixed(2)} kg/día
              </span>
            </span>
          )}

          {weightDevice && (
            <span className="flex items-center gap-1 font-mono text-[10px]">
              {weightDevice.serialNumber}
            </span>
          )}
        </div>

        {devices.length > 0 && (
          <DeviceChips devices={devices} />
        )}
      </div>

      <div className="flex items-center gap-2 ml-2 shrink-0">
        {devices.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Cpu className="h-3 w-3" />
            {devices.length}
          </span>
        )}
        <LocationMenu locationId={pen.id} />
      </div>
    </div>
  );
}

/* ─── Location Menu ──────────────────────────────────────────── */

function LocationMenu({ locationId }: { locationId: string }) {
  const t = useTranslations('locations');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 rounded-md hover:bg-muted transition-colors">
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/ubicaciones/${locationId}`}>{t('viewDetails')}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/ubicaciones/${locationId}/editar`}>{t('edit')}</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ─── Device Chips ──────────────────────────────────────────── */

const MAX_VISIBLE_CHIPS = 4;

function getDeviceChip(device: Device): DeviceChipDef {
  if (device.type === 'sensor' && device.configuration?.type === 'sensor') {
    const profile = (device.configuration as SensorConfig).sensorProfile;
    if (profile && SENSOR_PROFILE_CHIP[profile]) return SENSOR_PROFILE_CHIP[profile];
  }
  return DEVICE_TYPE_CHIP[device.type] ?? { label: device.type, icon: Cpu, bg: 'bg-muted', text: 'text-muted-foreground' };
}

function DeviceChips({ devices }: { devices: Device[] }) {
  const visible = devices.slice(0, MAX_VISIBLE_CHIPS);
  const overflow = devices.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {visible.map((device) => {
        const chip = getDeviceChip(device);
        const Icon = chip.icon;
        return (
          <Link
            key={device.id}
            href={`/dispositivos/${device.id}`}
            className={`inline-flex items-center gap-1 text-xs font-medium rounded-md px-2 py-0.5 transition-opacity hover:opacity-75 ${chip.bg} ${chip.text}`}
          >
            <Icon className="h-3 w-3 shrink-0" />
            <span>{chip.label}</span>
          </Link>
        );
      })}
      {overflow > 0 && (
        <span className="inline-flex items-center text-xs text-muted-foreground bg-muted rounded-md px-2 py-0.5">
          +{overflow}
        </span>
      )}
    </div>
  );
}
