import { Species, LocationType } from './species';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  species: Species;
  parentId: string | null;
  coordinates?: Coordinates;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocationWithChildren extends Location {
  children: LocationWithChildren[];
}

export interface CreateLocationInput {
  name: string;
  type: LocationType;
  species: Species;
  parentId: string | null;
  coordinates?: Coordinates;
  address?: string;
}

export interface UpdateLocationInput {
  name?: string;
  coordinates?: Coordinates;
  address?: string;
}

export function buildLocationTree(locations: Location[]): LocationWithChildren[] {
  const locationMap = new Map<string, LocationWithChildren>();
  const roots: LocationWithChildren[] = [];

  // First pass: create all nodes with empty children
  locations.forEach((location) => {
    locationMap.set(location.id, { ...location, children: [] });
  });

  // Second pass: build the tree
  locations.forEach((location) => {
    const node = locationMap.get(location.id)!;
    if (location.parentId === null) {
      roots.push(node);
    } else {
      const parent = locationMap.get(location.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  return roots;
}

export function getLocationPath(locations: Location[], locationId: string): Location[] {
  const path: Location[] = [];
  const locationMap = new Map(locations.map((l) => [l.id, l]));

  let current = locationMap.get(locationId);
  while (current) {
    path.unshift(current);
    current = current.parentId ? locationMap.get(current.parentId) : undefined;
  }

  return path;
}

export function getLocationsByType(locations: Location[], type: LocationType): Location[] {
  return locations.filter((l) => l.type === type);
}

export function getLocationsBySpecies(locations: Location[], species: Species): Location[] {
  return locations.filter((l) => l.species === species);
}

export function getChildLocations(locations: Location[], parentId: string): Location[] {
  return locations.filter((l) => l.parentId === parentId);
}
