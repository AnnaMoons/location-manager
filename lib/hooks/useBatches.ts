'use client';

import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import {
  Batch,
  getBatchesByLocation,
  getBatchesBySpecies,
  getBatchesByStatus,
  getActiveBatches,
  calculateCurrentAge,
  calculateDaysRemaining,
  getBatchLocationIds,
  BatchStatus,
  CloseBatchInput,
} from '../types/batch';
import { Species } from '../types/species';
import { Location } from '../types/location';
import { Device } from '../types/device';

export interface BatchLocations {
  farm: Location | undefined;
  barns: Location[];
  pens: Location[];
}

export interface BatchDevices {
  weightDevices: Device[];
  environmentDevices: Device[];
}

export interface BatchWithFullDetails extends Batch {
  locations: BatchLocations;
  devices: BatchDevices;
  currentAge: number;
  daysRemaining: number | null;
}

export function useBatches() {
  const {
    batches,
    locations,
    devices,
    isLoading,
    createBatch,
    updateBatch,
    deleteBatch,
    getBatch,
    closeBatch: contextCloseBatch,
  } = useData();

  const activeBatches = useMemo(() => getActiveBatches(batches), [batches]);

  const filterByLocation = (locationId: string): Batch[] => {
    return getBatchesByLocation(batches, locationId);
  };

  const filterBySpecies = (species: Species): Batch[] => {
    return getBatchesBySpecies(batches, species);
  };

  const filterByStatus = (status: BatchStatus): Batch[] => {
    return getBatchesByStatus(batches, status);
  };

  /**
   * Get farm, barns, and pens for a batch
   */
  const getBatchLocations = (batch: Batch): BatchLocations => {
    const farm = locations.find((l) => l.id === batch.farmId);
    const barns = locations.filter((l) => batch.barnIds?.includes(l.id));
    const pens = locations.filter((l) => batch.penIds?.includes(l.id));

    return { farm, barns, pens };
  };

  /**
   * Get devices associated with a batch's locations
   */
  const getBatchDevices = (batch: Batch): BatchDevices => {
    const locationIds = getBatchLocationIds(batch);

    const batchDevices = devices.filter(
      (d) => d.locationId && locationIds.includes(d.locationId)
    );

    // Weight devices: scales and pigvision
    const weightDevices = batchDevices.filter(
      (d) => d.type === 'scale' || d.type === 'pigvision'
    );

    // Environment devices: sensors
    const environmentDevices = batchDevices.filter((d) => d.type === 'sensor');

    return { weightDevices, environmentDevices };
  };

  /**
   * Get a batch with all details including locations and devices
   */
  const getBatchWithFullDetails = (id: string): BatchWithFullDetails | undefined => {
    const batch = getBatch(id);
    if (!batch) return undefined;

    const batchLocations = getBatchLocations(batch);
    const batchDevices = getBatchDevices(batch);
    const currentAge = calculateCurrentAge(batch);
    const daysRemaining = calculateDaysRemaining(batch);

    return {
      ...batch,
      locations: batchLocations,
      devices: batchDevices,
      currentAge,
      daysRemaining,
    };
  };

  const getBatchWithDetails = (id: string) => {
    const batch = getBatch(id);
    if (!batch) return undefined;

    const batchLocations = getBatchLocations(batch);
    const currentAge = calculateCurrentAge(batch);
    const daysRemaining = calculateDaysRemaining(batch);

    return {
      ...batch,
      location: batchLocations.farm, // For backwards compatibility
      farm: batchLocations.farm,
      barns: batchLocations.barns,
      pens: batchLocations.pens,
      currentAge,
      daysRemaining,
    };
  };

  const searchBatches = (query: string): Batch[] => {
    const lowerQuery = query.toLowerCase();
    return batches.filter((b) => b.name.toLowerCase().includes(lowerQuery));
  };

  const getBatchesWithLocation = () => {
    return batches.map((batch) => {
      const batchLocations = getBatchLocations(batch);
      return {
        ...batch,
        location: batchLocations.farm, // For backwards compatibility
        farm: batchLocations.farm,
        barns: batchLocations.barns,
        pens: batchLocations.pens,
        currentAge: calculateCurrentAge(batch),
        daysRemaining: calculateDaysRemaining(batch),
      };
    });
  };

  const closeBatch = async (id: string, input: CloseBatchInput): Promise<Batch> => {
    return contextCloseBatch(id, input);
  };

  return {
    batches,
    activeBatches,
    isLoading,
    createBatch,
    updateBatch,
    deleteBatch,
    getBatch,
    closeBatch,
    getBatchWithDetails,
    getBatchWithFullDetails,
    getBatchLocations,
    getBatchDevices,
    filterByLocation,
    filterBySpecies,
    filterByStatus,
    searchBatches,
    getBatchesWithLocation,
  };
}
