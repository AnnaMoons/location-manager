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
  BatchStatus,
} from '../types/batch';
import { Species } from '../types/species';

export function useBatches() {
  const {
    batches,
    locations,
    isLoading,
    createBatch,
    updateBatch,
    deleteBatch,
    getBatch,
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

  const getBatchWithDetails = (id: string) => {
    const batch = getBatch(id);
    if (!batch) return undefined;

    const location = locations.find((l) => l.id === batch.locationId);
    const currentAge = calculateCurrentAge(batch);
    const daysRemaining = calculateDaysRemaining(batch);

    return {
      ...batch,
      location,
      currentAge,
      daysRemaining,
    };
  };

  const searchBatches = (query: string): Batch[] => {
    const lowerQuery = query.toLowerCase();
    return batches.filter((b) => b.name.toLowerCase().includes(lowerQuery));
  };

  const getBatchesWithLocation = () => {
    return batches.map((batch) => ({
      ...batch,
      location: locations.find((l) => l.id === batch.locationId),
      currentAge: calculateCurrentAge(batch),
      daysRemaining: calculateDaysRemaining(batch),
    }));
  };

  return {
    batches,
    activeBatches,
    isLoading,
    createBatch,
    updateBatch,
    deleteBatch,
    getBatch,
    getBatchWithDetails,
    filterByLocation,
    filterBySpecies,
    filterByStatus,
    searchBatches,
    getBatchesWithLocation,
  };
}
