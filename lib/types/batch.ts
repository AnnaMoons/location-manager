import { Species } from './species';

export interface Batch {
  id: string;
  name: string;
  species: Species;
  // Multi-location support
  farmIds: string[];
  barnIds: string[];
  penIds: string[];
  // Legacy field - kept for migration
  /** @deprecated Use farmIds, barnIds, penIds instead */
  farmId?: string;
  /** @deprecated Use farmIds, barnIds, penIds instead */
  locationId?: string;
  animalCount: number;
  averageAgeAtStart: number; // days
  startDate: string;
  estimatedEndDate?: string;
  // Closure fields
  closedDate?: string;
  closeReason?: string;
  // sex: 'male' | 'female' | 'mixed'; // Not in MVP
  status: BatchStatus;
  createdAt: string;
  updatedAt: string;
}

export type BatchStatus = 'active' | 'completed' | 'cancelled';

export interface CreateBatchInput {
  name: string;
  species: Species;
  farmIds: string[];
  barnIds: string[];
  penIds?: string[];
  animalCount: number;
  averageAgeAtStart: number;
  startDate: string;
  estimatedEndDate?: string;
}

export interface UpdateBatchInput {
  name?: string;
  farmIds?: string[];
  barnIds?: string[];
  penIds?: string[];
  animalCount?: number;
  averageAgeAtStart?: number;
  startDate?: string;
  estimatedEndDate?: string;
  status?: BatchStatus;
  closedDate?: string;
  closeReason?: string;
}

export interface CloseBatchInput {
  closeType: 'completed' | 'cancelled';
  closedDate: string;
  closeReason?: string;
}

export function getBatchesByLocation(batches: Batch[], locationId: string): Batch[] {
  return batches.filter((b) => {
    // Check new multi-location fields
    if (b.farmIds?.includes(locationId)) return true;
    if (b.barnIds?.includes(locationId)) return true;
    if (b.penIds?.includes(locationId)) return true;
    // Legacy support
    if (b.farmId === locationId) return true;
    if (b.locationId === locationId) return true;
    return false;
  });
}

/**
 * Get all location IDs associated with a batch
 */
export function getBatchLocationIds(batch: Batch): string[] {
  const ids: string[] = [];
  if (batch.farmIds) ids.push(...batch.farmIds);
  if (batch.barnIds) ids.push(...batch.barnIds);
  if (batch.penIds) ids.push(...batch.penIds);
  // Legacy support
  if (batch.farmId && !ids.includes(batch.farmId)) {
    ids.push(batch.farmId);
  }
  if (batch.locationId && !ids.includes(batch.locationId)) {
    ids.push(batch.locationId);
  }
  return ids;
}

/**
 * Check if a batch requires a close reason (closing before estimated end date)
 */
export function requiresCloseReason(batch: Batch, closedDate: string): boolean {
  if (!batch.estimatedEndDate) return false;
  const closeDate = new Date(closedDate);
  const estimatedEnd = new Date(batch.estimatedEndDate);
  return closeDate < estimatedEnd;
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
