import type { DeviceType } from './device';

export type Species = 'pigs' | 'broilers' | 'layers';

export type LocationType = 'farm' | 'barn' | 'pen' | 'section' | 'cage';

export interface SpeciesHierarchy {
  name: string;
  levels: LocationType[];
  labels: Record<LocationType, string>;
}

export type SpeciesHierarchies = Record<Species, SpeciesHierarchy>;

export const speciesHierarchies: SpeciesHierarchies = {
  pigs: {
    name: 'Cerdos',
    levels: ['farm', 'barn', 'pen'],
    labels: {
      farm: 'Granja',
      barn: 'Galpón',
      pen: 'Corral',
      section: 'Sección',
      cage: 'Jaula',
    },
  },
  broilers: {
    name: 'Pollos de engorde',
    levels: ['farm', 'barn', 'section'],
    labels: {
      farm: 'Granja',
      barn: 'Galpón',
      pen: 'Corral',
      section: 'Sección',
      cage: 'Jaula',
    },
  },
  layers: {
    name: 'Ponedoras',
    levels: ['farm', 'barn'],
    labels: {
      farm: 'Granja',
      barn: 'Galpón',
      pen: 'Corral',
      section: 'Sección',
      cage: 'Jaula',
    },
  },
};

/**
 * H-009/H-010: Device-aware installation depth.
 * Environmental sensors in poultry only need farm > barn (not section/pen).
 * PigVision needs pen level. Gateways install at farm level.
 */
export type DeviceInstallationDepth = 'farm' | 'barn' | 'pen';

const DEVICE_INSTALLATION_DEPTH: Record<DeviceType, Record<Species, DeviceInstallationDepth>> = {
  sensor: {
    pigs: 'barn',
    broilers: 'barn',
    layers: 'barn',
  },
  pigvision: {
    pigs: 'pen',
    broilers: 'pen', // not applicable but safe fallback
    layers: 'barn',
  },
  scale: {
    pigs: 'pen',
    broilers: 'barn',
    layers: 'barn',
  },
  gateway: {
    pigs: 'farm',
    broilers: 'farm',
    layers: 'farm',
  },
};

/**
 * H-009: Get the minimum required installation depth for a device type + species combo.
 * For example, sensors in broilers only need 'barn' (no section required).
 */
export function getInstallationDepth(deviceType: DeviceType, species: Species): DeviceInstallationDepth {
  return DEVICE_INSTALLATION_DEPTH[deviceType]?.[species] ?? 'barn';
}

/**
 * H-009: Get the hierarchy levels needed for installing a device.
 * Filters the species hierarchy to only include levels up to the required depth.
 */
export function getHierarchyForDevice(deviceType: DeviceType, species: Species): LocationType[] {
  const depth = getInstallationDepth(deviceType, species);
  const fullLevels = speciesHierarchies[species].levels;

  // Map depth to maximum index in hierarchy
  const depthIndex = fullLevels.indexOf(depth);
  if (depthIndex === -1) {
    // depth type not in this species hierarchy — return up to barn
    const barnIndex = fullLevels.indexOf('barn');
    return fullLevels.slice(0, barnIndex + 1);
  }
  return fullLevels.slice(0, depthIndex + 1);
}

export function getAvailableTypesForSpecies(species: Species): LocationType[] {
  return speciesHierarchies[species].levels;
}

export function getNextLevelType(species: Species, currentType: LocationType): LocationType | null {
  const levels = speciesHierarchies[species].levels;
  const currentIndex = levels.indexOf(currentType);
  if (currentIndex === -1 || currentIndex === levels.length - 1) {
    return null;
  }
  return levels[currentIndex + 1];
}

export function canHaveChildren(species: Species, type: LocationType): boolean {
  const levels = speciesHierarchies[species].levels;
  const index = levels.indexOf(type);
  return index !== -1 && index < levels.length - 1;
}
