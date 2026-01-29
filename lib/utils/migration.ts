import { Batch } from '../types/batch';
import { Location, getLocationPath } from '../types/location';

/**
 * Check if a batch needs migration from legacy locationId to multi-location format
 */
export function needsBatchMigration(batch: Batch): boolean {
  // Needs migration if has locationId but no farmId
  return Boolean(batch.locationId && !batch.farmId);
}

/**
 * Migrate a single batch from legacy locationId to multi-location format
 * Uses the location hierarchy to determine farmId, barnIds, and penIds
 */
export function migrateBatchToMultiLocation(
  batch: Batch,
  locations: Location[]
): Batch {
  if (!batch.locationId) {
    // No location to migrate from, return with empty arrays
    return {
      ...batch,
      farmId: batch.farmId || '',
      barnIds: batch.barnIds || [],
      penIds: batch.penIds || [],
    };
  }

  // Get the location path (from farm to the deepest level)
  const path = getLocationPath(locations, batch.locationId);

  if (path.length === 0) {
    // Location not found, keep legacy field and set empty new fields
    return {
      ...batch,
      farmId: batch.farmId || '',
      barnIds: batch.barnIds || [],
      penIds: batch.penIds || [],
    };
  }

  // Find farm (first level)
  const farm = path.find((l) => l.type === 'farm');

  // Find barn (second level)
  const barn = path.find((l) => l.type === 'barn');

  // Find pen/section (third level) - the deepest location
  const deepest = path[path.length - 1];
  const isPenOrSection = deepest.type === 'pen' || deepest.type === 'section';

  // Build the migrated batch
  const migratedBatch: Batch = {
    ...batch,
    farmId: farm?.id || '',
    barnIds: barn ? [barn.id] : [],
    penIds: isPenOrSection && deepest.id !== barn?.id ? [deepest.id] : [],
  };

  return migratedBatch;
}

/**
 * Migrate all batches that need migration
 */
export function migrateAllBatches(batches: Batch[], locations: Location[]): Batch[] {
  return batches.map((batch) => {
    if (needsBatchMigration(batch)) {
      return migrateBatchToMultiLocation(batch, locations);
    }
    // Ensure arrays exist even for non-migrated batches
    return {
      ...batch,
      farmId: batch.farmId || '',
      barnIds: batch.barnIds || [],
      penIds: batch.penIds || [],
    };
  });
}
