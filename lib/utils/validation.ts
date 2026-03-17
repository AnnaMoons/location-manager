import { PigVisionConfig, ScaleConfig, SensorConfig, DeviceConfig, Device, DeviceType } from '../types/device';
import { CreateLocationInput } from '../types/location';
import { CreateBatchInput, CloseBatchInput, Batch, requiresCloseReason } from '../types/batch';
import { Location } from '../types/location';
import { Species, speciesHierarchies } from '../types/species';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validatePigVisionConfig(config: Partial<PigVisionConfig>): ValidationResult {
  const errors: Record<string, string> = {};

  if (config.installationHeight === undefined || config.installationHeight === null) {
    errors.installationHeight = 'Ingresa la altura de instalación';
  } else {
    // Convert to meters for validation
    const heightInMeters = config.installationHeightUnit === 'cm'
      ? config.installationHeight / 100
      : config.installationHeight;

    if (heightInMeters < 2.30 || heightInMeters > 2.45) {
      errors.installationHeight = 'La altura debe estar entre 2.30 y 2.45 metros';
    }
  }

  if (config.installationHeightConfirmation === undefined || config.installationHeightConfirmation === null) {
    errors.installationHeightConfirmation = 'Confirma la altura de instalación';
  } else if (config.installationHeight !== undefined) {
    // Convert both to same unit for comparison
    const height1 = config.installationHeightUnit === 'cm'
      ? config.installationHeight / 100
      : config.installationHeight;
    const height2 = config.installationHeightConfirmationUnit === 'cm'
      ? config.installationHeightConfirmation / 100
      : config.installationHeightConfirmation;

    if (Math.abs(height1 - height2) > 0.01) {
      errors.installationHeightConfirmation = 'Las alturas no coinciden. Verifica las mediciones.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateScaleConfig(config: Partial<ScaleConfig>): ValidationResult {
  const errors: Record<string, string> = {};

  if (config.maxWeight === undefined || config.maxWeight === null) {
    errors.maxWeight = 'Ingresa el peso máximo';
  } else if (config.maxWeight <= 0) {
    errors.maxWeight = 'El peso máximo debe ser mayor a 0';
  }

  if (config.tareWeight === undefined || config.tareWeight === null) {
    errors.tareWeight = 'Ingresa el peso de tara';
  } else if (config.tareWeight < 0) {
    errors.tareWeight = 'El peso de tara no puede ser negativo';
  }

  if (!config.unit) {
    errors.unit = 'Selecciona la unidad de peso';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSensorConfig(config: Partial<SensorConfig>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!config.sensorType) {
    errors.sensorType = 'Selecciona el tipo de sensor';
  }

  if (config.readingInterval === undefined || config.readingInterval === null) {
    errors.readingInterval = 'Ingresa el intervalo de lectura';
  } else if (config.readingInterval < 1) {
    errors.readingInterval = 'El intervalo debe ser de al menos 1 segundo';
  }

  if (
    config.alertThresholdMin !== undefined &&
    config.alertThresholdMax !== undefined &&
    config.alertThresholdMin >= config.alertThresholdMax
  ) {
    errors.alertThresholdMin = 'El umbral mínimo debe ser menor que el máximo';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateDeviceConfig(config: DeviceConfig): ValidationResult {
  switch (config.type) {
    case 'pigvision':
      return validatePigVisionConfig(config);
    case 'scale':
      return validateScaleConfig(config);
    case 'sensor':
      return validateSensorConfig(config);
    default:
      return { valid: false, errors: { type: 'Tipo de dispositivo no reconocido' } };
  }
}

export function validateLocationInput(input: Partial<CreateLocationInput>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim() === '') {
    errors.name = 'Name is required';
  }

  if (!input.species) {
    errors.species = 'Species is required';
  }

  if (!input.type) {
    errors.type = 'Location type is required';
  }

  if (input.species && input.type) {
    const hierarchy = speciesHierarchies[input.species];
    const typeIndex = hierarchy.levels.indexOf(input.type);

    // If not a root type (farm), parent is required
    if (typeIndex > 0 && !input.parentId) {
      errors.parentId = 'Parent location is required for this type';
    }
  }

  if (input.coordinates) {
    if (input.coordinates.lat < -90 || input.coordinates.lat > 90) {
      errors.latitude = 'Latitude must be between -90 and 90';
    }
    if (input.coordinates.lng < -180 || input.coordinates.lng > 180) {
      errors.longitude = 'Longitude must be between -180 and 180';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateBatchInput(
  input: Partial<CreateBatchInput>,
  locations?: Location[]
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim() === '') {
    errors.name = 'El nombre del lote es obligatorio';
  }

  if (!input.species) {
    errors.species = 'La especie es obligatoria';
  }

  // Validate multi-location fields
  if (!input.farmIds || input.farmIds.length === 0) {
    errors.farmIds = 'Debes seleccionar al menos una granja';
  }

  if (!input.barnIds || input.barnIds.length === 0) {
    errors.barnIds = 'Debes seleccionar al menos un galpón';
  }

  // Validate that barns belong to one of the selected farms
  if (locations && input.farmIds && input.farmIds.length > 0 && input.barnIds && input.barnIds.length > 0) {
    const invalidBarns = input.barnIds.filter((barnId) => {
      const barn = locations.find((l) => l.id === barnId);
      return !barn || !input.farmIds!.includes(barn.parentId || '');
    });
    if (invalidBarns.length > 0) {
      errors.barnIds = 'Los galpones seleccionados no pertenecen a las granjas seleccionadas';
    }
  }

  // Only validate pens if species has that level (not layers)
  const hierarchy = input.species ? speciesHierarchies[input.species] : null;
  const hasPenLevel = hierarchy && hierarchy.levels.includes('pen');

  if (hasPenLevel && locations && input.penIds && input.penIds.length > 0 && input.barnIds) {
    const invalidPens = input.penIds.filter((penId) => {
      const pen = locations.find((l) => l.id === penId);
      return !pen || !input.barnIds!.includes(pen.parentId || '');
    });
    if (invalidPens.length > 0) {
      errors.penIds = 'Los corrales seleccionados no pertenecen a los galpones';
    }
  }

  if (input.animalCount === undefined || input.animalCount === null) {
    errors.animalCount = 'La cantidad de animales es obligatoria';
  } else if (input.animalCount <= 0) {
    errors.animalCount = 'La cantidad debe ser mayor a 0';
  }

  if (input.averageAgeAtStart === undefined || input.averageAgeAtStart === null) {
    errors.averageAgeAtStart = 'La edad promedio inicial es obligatoria';
  } else if (input.averageAgeAtStart < 0) {
    errors.averageAgeAtStart = 'La edad no puede ser negativa';
  }

  if (!input.startDate) {
    errors.startDate = 'La fecha de inicio es obligatoria';
  }

  if (input.startDate && input.estimatedEndDate) {
    const start = new Date(input.startDate);
    const end = new Date(input.estimatedEndDate);
    if (end <= start) {
      errors.estimatedEndDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCloseBatchInput(
  input: Partial<CloseBatchInput>,
  batch: Batch
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.closeType) {
    errors.closeType = 'El tipo de cierre es obligatorio';
  }

  if (!input.closedDate) {
    errors.closedDate = 'La fecha de cierre es obligatoria';
  } else {
    const closedDate = new Date(input.closedDate);
    const startDate = new Date(batch.startDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Allow today

    if (closedDate < startDate) {
      errors.closedDate = 'La fecha de cierre no puede ser anterior a la fecha de inicio';
    }

    if (closedDate > today) {
      errors.closedDate = 'La fecha de cierre no puede ser futura';
    }
  }

  // Check if close reason is required (closing before estimated end date)
  if (input.closedDate && requiresCloseReason(batch, input.closedDate)) {
    if (!input.closeReason || input.closeReason.trim() === '') {
      errors.closeReason = 'El motivo es obligatorio cuando se cierra antes de la fecha estimada';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Map of device types allowed per species.
 * - pigvision: only for pigs
 * - scale: only for broilers
 * - sensor: all species
 * - gateway: all species (installed at farm level)
 */
const DEVICE_TYPES_BY_SPECIES: Record<Species, DeviceType[]> = {
  pigs: ['pigvision', 'sensor', 'gateway'],
  broilers: ['scale', 'sensor', 'gateway'],
  layers: ['sensor', 'gateway'],
};

/**
 * Device types that conflict with each other in the same pen/location.
 * A PigVision and a Scale must never coexist in the same pen.
 */
const CONFLICTING_DEVICE_TYPES: [DeviceType, DeviceType][] = [
  ['pigvision', 'scale'],
];

/**
 * Check if a device type is compatible with a given species.
 */
export function isDeviceTypeAllowedForSpecies(deviceType: DeviceType, species: Species): boolean {
  return DEVICE_TYPES_BY_SPECIES[species].includes(deviceType);
}

/**
 * Get the list of species compatible with a device type.
 */
export function getCompatibleSpecies(deviceType: DeviceType): Species[] {
  return (Object.keys(DEVICE_TYPES_BY_SPECIES) as Species[]).filter(
    (species) => DEVICE_TYPES_BY_SPECIES[species].includes(deviceType)
  );
}

/**
 * Validate that installing a device at a location does not violate any rules.
 * Rules:
 * 1. Device type must be compatible with the location's species.
 * 2. A PigVision and a Scale cannot coexist in the same pen.
 */
export function validateDeviceInstallation(
  device: Device,
  location: Location,
  existingDevicesAtLocation: Device[]
): ValidationResult {
  const errors: Record<string, string> = {};

  // Rule 1: Species compatibility
  if (!isDeviceTypeAllowedForSpecies(device.type, location.species)) {
    const speciesName = speciesHierarchies[location.species]?.name || location.species;
    errors.species = `Este tipo de dispositivo (${device.type}) no es compatible con la especie ${speciesName}`;
  }

  // Rule 2: Conflicting device types in the same location
  for (const [typeA, typeB] of CONFLICTING_DEVICE_TYPES) {
    const deviceIsTypeA = device.type === typeA;
    const deviceIsTypeB = device.type === typeB;

    if (deviceIsTypeA || deviceIsTypeB) {
      const conflictType = deviceIsTypeA ? typeB : typeA;
      const hasConflict = existingDevicesAtLocation.some(
        (d) => d.type === conflictType && d.id !== device.id
      );
      if (hasConflict) {
        errors.conflict = `No se puede instalar un dispositivo ${device.type} en una ubicación que ya tiene un dispositivo ${conflictType}`;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
