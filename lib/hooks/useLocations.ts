'use client';

import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import {
  Location,
  LocationWithChildren,
  buildLocationTree,
  getLocationPath,
  getChildLocations,
  getLocationsBySpecies,
  getLocationsByType,
} from '../types/location';
import { Species, LocationType } from '../types/species';

export function useLocations() {
  const {
    locations,
    isLoading,
    createLocation,
    updateLocation,
    deleteLocation,
    getLocation,
  } = useData();

  const locationTree = useMemo(() => buildLocationTree(locations), [locations]);

  const farms = useMemo(
    () => locations.filter((l) => l.type === 'farm'),
    [locations]
  );

  const getPath = (locationId: string): Location[] => {
    return getLocationPath(locations, locationId);
  };

  const getChildren = (parentId: string): Location[] => {
    return getChildLocations(locations, parentId);
  };

  const filterBySpecies = (species: Species): Location[] => {
    return getLocationsBySpecies(locations, species);
  };

  const filterByType = (type: LocationType): Location[] => {
    return getLocationsByType(locations, type);
  };

  const getParentOptions = (species: Species, type: LocationType): Location[] => {
    // For farms, no parent needed
    if (type === 'farm') {
      return [];
    }

    // Get the parent type based on species hierarchy
    const speciesLocations = filterBySpecies(species);

    // For barns, return farms
    if (type === 'barn') {
      return speciesLocations.filter((l) => l.type === 'farm');
    }

    // For pens/sections, return barns
    if (type === 'pen' || type === 'section') {
      return speciesLocations.filter((l) => l.type === 'barn');
    }

    return [];
  };

  const searchLocations = (query: string): Location[] => {
    const lowerQuery = query.toLowerCase();
    return locations.filter(
      (l) =>
        l.name.toLowerCase().includes(lowerQuery) ||
        l.address?.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    locations,
    locationTree,
    farms,
    isLoading,
    createLocation,
    updateLocation,
    deleteLocation,
    getLocation,
    getPath,
    getChildren,
    filterBySpecies,
    filterByType,
    getParentOptions,
    searchLocations,
  };
}
