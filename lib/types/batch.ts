import { Species } from './species';

export interface Batch {
  id: string;
  name: string;
  species: Species;
  locationId: string;
  animalCount: number;
  averageAgeAtStart: number; // days
  startDate: string;
  estimatedEndDate?: string;
  // sex: 'male' | 'female' | 'mixed'; // Not in MVP
  status: BatchStatus;
  createdAt: string;
  updatedAt: string;
}

export type BatchStatus = 'active' | 'completed' | 'cancelled';

export interface CreateBatchInput {
  name: string;
  species: Species;
  locationId: string;
  animalCount: number;
  averageAgeAtStart: number;
  startDate: string;
  estimatedEndDate?: string;
}

export interface UpdateBatchInput {
  name?: string;
  locationId?: string;
  animalCount?: number;
  averageAgeAtStart?: number;
  startDate?: string;
  estimatedEndDate?: string;
  status?: BatchStatus;
}

export function getBatchesByLocation(batches: Batch[], locationId: string): Batch[] {
  return batches.filter((b) => b.locationId === locationId);
}

export function getBatchesBySpecies(batches: Batch[], species: Species): Batch[] {
  return batches.filter((b) => b.species === species);
}

export function getBatchesByStatus(batches: Batch[], status: BatchStatus): Batch[] {
  return batches.filter((b) => b.status === status);
}

export function getActiveBatches(batches: Batch[]): Batch[] {
  return batches.filter((b) => b.status === 'active');
}

export function calculateCurrentAge(batch: Batch): number {
  const startDate = new Date(batch.startDate);
  const today = new Date();
  const daysSinceStart = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return batch.averageAgeAtStart + daysSinceStart;
}

export function calculateDaysRemaining(batch: Batch): number | null {
  if (!batch.estimatedEndDate) return null;
  const endDate = new Date(batch.estimatedEndDate);
  const today = new Date();
  return Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
}
