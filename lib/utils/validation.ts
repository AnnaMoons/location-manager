import { PigVisionConfig, ScaleConfig, SensorConfig, DeviceConfig } from '../types/device';
import { CreateLocationInput } from '../types/location';
import { CreateBatchInput } from '../types/batch';
import { speciesHierarchies } from '../types/species';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validatePigVisionConfig(config: Partial<PigVisionConfig>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!config.barnId) {
    errors.barnId = 'Galpón es requerido';
  }

  if (!config.penId) {
    errors.penId = 'Corral es requerido';
  }

  if (!config.penSex) {
    errors.penSex = 'Sexo del corral es requerido';
  }

  if (config.installationHeight === undefined || config.installationHeight === null) {
    errors.installationHeight = 'Altura de instalación es requerida';
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
    errors.installationHeightConfirmation = 'Confirmación de altura es requerida';
  } else if (config.installationHeight !== undefined) {
    // Convert both to same unit for comparison
    const height1 = config.installationHeightUnit === 'cm'
      ? config.installationHeight / 100
      : config.installationHeight;
    const height2 = config.installationHeightConfirmationUnit === 'cm'
      ? config.installationHeightConfirmation / 100
      : config.installationHeightConfirmation;

    if (Math.abs(height1 - height2) > 0.01) {
      errors.installationHeightConfirmation = 'Las alturas no coinciden';
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
    errors.maxWeight = 'Max weight is required';
  } else if (config.maxWeight <= 0) {
    errors.maxWeight = 'Max weight must be greater than 0';
  }

  if (config.tareWeight === undefined || config.tareWeight === null) {
    errors.tareWeight = 'Tare weight is required';
  } else if (config.tareWeight < 0) {
    errors.tareWeight = 'Tare weight cannot be negative';
  }

  if (!config.unit) {
    errors.unit = 'Unit is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSensorConfig(config: Partial<SensorConfig>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!config.sensorType) {
    errors.sensorType = 'Sensor type is required';
  }

  if (config.readingInterval === undefined || config.readingInterval === null) {
    errors.readingInterval = 'Reading interval is required';
  } else if (config.readingInterval < 1) {
    errors.readingInterval = 'Reading interval must be at least 1 second';
  }

  if (
    config.alertThresholdMin !== undefined &&
    config.alertThresholdMax !== undefined &&
    config.alertThresholdMin >= config.alertThresholdMax
  ) {
    errors.alertThresholdMin = 'Min threshold must be less than max threshold';
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
      return { valid: false, errors: { type: 'Invalid device type' } };
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

export function validateBatchInput(input: Partial<CreateBatchInput>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim() === '') {
    errors.name = 'El nombre del lote es obligatorio';
  }

  if (!input.species) {
    errors.species = 'La especie es obligatoria';
  }

  if (!input.locationId) {
    errors.locationId = 'La ubicación es obligatoria';
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
