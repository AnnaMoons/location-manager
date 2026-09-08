export type DeviceType = 'pigvision' | 'scale' | 'sensor' | 'gateway';

export type DeviceState =
  | 'unassigned'
  | 'available'
  | 'registered'
  | 'installed'
  | 'configured'
  | 'in_production'
  | 'production'
  | 'maintenance'
  | 'disabled'
  | 'uninstalled'
  | 'returned'
  | 'dead';

export type DeviceHealth = 'online' | 'offline' | 'unknown';

/** H-016: Repair sub-states for detailed repair tracking */
export type RepairSubState = 'reported' | 'pending_shipment' | 'received' | 'in_repair' | 'ready_to_return';

export type SensorVariable = 'temperature' | 'humidity' | 'co2' | 'ammonia' | 'light';

/**
 * H-003: Sensor profiles represent multivariable sensors.
 * Each profile maps to a physical device that measures multiple variables simultaneously.
 */
export type SensorProfile =
  | 'temp_humidity'
  | 'temp_humidity_co2'
  | 'temp_humidity_nh3'
  | 'temp_humidity_light';

export const SENSOR_PROFILE_VARIABLES: Record<SensorProfile, SensorVariable[]> = {
  temp_humidity: ['temperature', 'humidity'],
  temp_humidity_co2: ['temperature', 'humidity', 'co2'],
  temp_humidity_nh3: ['temperature', 'humidity', 'ammonia'],
  temp_humidity_light: ['temperature', 'humidity', 'light'],
};

export const SENSOR_PROFILE_LABELS: Record<SensorProfile, string> = {
  temp_humidity: 'Temperatura + Humedad',
  temp_humidity_co2: 'Temperatura + Humedad + CO₂',
  temp_humidity_nh3: 'Temperatura + Humedad + NH₃',
  temp_humidity_light: 'Temperatura + Humedad + Luz',
};

export const SENSOR_PROFILE_SHORT_LABELS: Record<SensorProfile, string> = {
  temp_humidity: 'T+H',
  temp_humidity_co2: 'T+H+CO₂',
  temp_humidity_nh3: 'T+H+NH₃',
  temp_humidity_light: 'T+H+Luz',
};

/**
 * H-004: Internal standard thresholds per variable.
 * These are NOT configurable by the client — they are Asimetrix technical ranges.
 */
export const INTERNAL_SENSOR_THRESHOLDS: Record<SensorVariable, { min: number; max: number; unit: string }> = {
  temperature: { min: 0, max: 60, unit: '°C' },
  humidity: { min: 0, max: 100, unit: '%' },
  co2: { min: 0, max: 5000, unit: 'ppm' },
  ammonia: { min: 0, max: 100, unit: 'ppm' },
  light: { min: 0, max: 2000, unit: 'lux' },
};

/**
 * H-005: Temperature curve segment for age-based alerts.
 * Defines target temperature and alert thresholds for a range of animal days.
 */
export interface TemperatureCurveSegment {
  dayFrom: number;
  dayTo: number;
  targetTemp: number;
  alertMin: number;
  alertMax: number;
}

/**
 * H-005: Default temperature curves by species.
 * Based on standard production practices.
 */
export const DEFAULT_TEMPERATURE_CURVES: Record<string, TemperatureCurveSegment[]> = {
  broilers: [
    { dayFrom: 1, dayTo: 7, targetTemp: 32, alertMin: 30, alertMax: 34 },
    { dayFrom: 8, dayTo: 14, targetTemp: 29, alertMin: 27, alertMax: 31 },
    { dayFrom: 15, dayTo: 21, targetTemp: 27, alertMin: 25, alertMax: 29 },
    { dayFrom: 22, dayTo: 28, targetTemp: 24, alertMin: 22, alertMax: 26 },
    { dayFrom: 29, dayTo: 42, targetTemp: 21, alertMin: 19, alertMax: 23 },
  ],
  pigs: [
    { dayFrom: 1, dayTo: 7, targetTemp: 30, alertMin: 28, alertMax: 32 },
    { dayFrom: 8, dayTo: 21, targetTemp: 28, alertMin: 26, alertMax: 30 },
    { dayFrom: 22, dayTo: 42, targetTemp: 25, alertMin: 23, alertMax: 27 },
    { dayFrom: 43, dayTo: 70, targetTemp: 22, alertMin: 20, alertMax: 24 },
    { dayFrom: 71, dayTo: 150, targetTemp: 20, alertMin: 18, alertMax: 22 },
  ],
};

/** @deprecated Use SensorProfile instead — kept for migration */
export type SensorType = 'temperature' | 'humidity' | 'co2' | 'ammonia';

export type DeviceHistoryAction =
  | 'created'
  | 'sold'
  | 'configured'
  | 'activated'
  | 'disabled'
  | 'returned'
  | 'repaired'
  | 'killed'
  | 'state_changed'
  | 'location_changed';

export interface DeviceHistoryEntry {
  id: string;
  action: DeviceHistoryAction;
  timestamp: string;
  details?: {
    fromState?: DeviceState;
    toState?: DeviceState;
    fromLocationId?: string | null;
    toLocationId?: string | null;
    configType?: string;
  };
}

export interface DeviceMeasurement {
  value: number;
  unit: string;
  timestamp: string;
}

export interface PigVisionConfig {
  type: 'pigvision';
  installationHeight: number;
  installationHeightUnit: 'm' | 'cm';
  installationHeightConfirmation: number;
  installationHeightConfirmationUnit: 'm' | 'cm';
}

export interface ScaleConfig {
  type: 'scale';
  maxWeight: number;
  tareWeight: number;
  unit: 'kg' | 'lb';
  calibrationDate?: string;
}

export interface SensorConfig {
  type: 'sensor';
  /** H-003: Multivariable sensor profile */
  sensorProfile: SensorProfile;
  /** H-004/H-029: Client-configurable alert thresholds per variable (for alerts module) */
  alertThresholds?: Record<SensorVariable, { min?: number; max?: number }>;
  /** H-005: Temperature curve segments for age-based dynamic alerts */
  temperatureCurve?: TemperatureCurveSegment[];
  /** Reading interval in minutes (H-007: changed from seconds to minutes) */
  readingIntervalMinutes: number;
  /** @deprecated Use sensorProfile instead — kept for migration */
  sensorType?: SensorType;
  /** @deprecated Use alertThresholds instead */
  alertThresholdMin?: number;
  /** @deprecated Use alertThresholds instead */
  alertThresholdMax?: number;
  /** @deprecated Use readingIntervalMinutes instead */
  readingInterval?: number;
}

export interface GatewayConfig {
  type: 'gateway';
  firmwareVersion: string;
  connectedSensors: string[];
  lastSyncAt?: string;
  networkStatus: 'online' | 'offline' | 'unstable';
  signalStrength?: number;
}

export type DeviceConfig = PigVisionConfig | ScaleConfig | SensorConfig | GatewayConfig;

/**
 * H-029: Internal configuration managed by Asimetrix, not exposed to clients.
 * Includes technical thresholds, dashboard links, and system parameters.
 */
export interface InternalDeviceConfig {
  /** Internal technical thresholds per variable (H-004) */
  technicalThresholds?: Record<SensorVariable, { min: number; max: number }>;
  /** Auto-detected sensor profile from serial (H-006) */
  detectedProfile?: SensorProfile;
  /** Internal dashboard URL */
  dashboardUrl?: string;
  /** Firmware update channel */
  firmwareChannel?: string;
  /** Notes from Asimetrix support */
  internalNotes?: string;
}

/**
 * H-006: Serial prefix to sensor profile mapping.
 * Allows auto-detection of sensor type from serial number.
 */
export const SERIAL_PREFIX_TO_PROFILE: Record<string, SensorProfile> = {
  'SN-TH': 'temp_humidity',
  'SN-THC': 'temp_humidity_co2',
  'SN-THA': 'temp_humidity_nh3',
  'SN-THL': 'temp_humidity_light',
};

export function detectSensorProfileFromSerial(serialNumber: string): SensorProfile | null {
  // Check longest prefixes first to avoid partial matches
  const prefixes = Object.keys(SERIAL_PREFIX_TO_PROFILE).sort((a, b) => b.length - a.length);
  for (const prefix of prefixes) {
    if (serialNumber.startsWith(prefix)) {
      return SERIAL_PREFIX_TO_PROFILE[prefix];
    }
  }
  return null;
}

export interface Device {
  id: string;
  serialNumber: string;
  type: DeviceType;
  state: DeviceState;
  locationId: string | null;
  companyId: string;
  configuration: DeviceConfig | null;
  /** H-029: Internal config — not visible to clients */
  internalConfig?: InternalDeviceConfig;
  /** H-008: Installation date for traceability */
  installedAt?: string;
  /** H-008: Uninstallation date for traceability */
  uninstalledAt?: string;
  /** H-016: Repair sub-state (only when state === 'returned') */
  repairSubState?: RepairSubState;
  lastSeen?: string;
  health: DeviceHealth;
  createdAt: string;
  history?: DeviceHistoryEntry[];
  lastMeasurement?: DeviceMeasurement;
}

export interface CreateDeviceInput {
  serialNumber: string;
  type: DeviceType;
  companyId: string;
}

export interface InstallDeviceInput {
  locationId: string;
}

export interface ConfigureDeviceInput {
  configuration: DeviceConfig;
}

export function isOrphanDevice(device: Device): boolean {
  return device.locationId === null || device.configuration === null;
}

export function needsInstallation(device: Device): boolean {
  return device.state === 'registered';
}

export function needsConfiguration(device: Device): boolean {
  return device.state === 'registered' && device.configuration === null;
}

export function getNextAction(device: Device): 'install' | 'configure' | 'activate' | 'check' | 'reactivate' | 'view' | null {
  switch (device.state) {
    case 'available':
    case 'unassigned':
      return 'install';
    case 'registered':
    case 'installed':
      return 'configure';
    case 'configured':
    case 'in_production':
    case 'production':
      return 'view';
    case 'disabled':
    case 'uninstalled':
      return 'reactivate';
    case 'returned':
    case 'maintenance':
      return 'check';
    case 'dead':
    default:
      return null;
  }
}

export function getDevicesByState(devices: Device[], state: DeviceState): Device[] {
  return devices.filter((d) => d.state === state);
}

export function getDevicesByType(devices: Device[], type: DeviceType): Device[] {
  return devices.filter((d) => d.type === type);
}

export function getDevicesByLocation(devices: Device[], locationId: string): Device[] {
  return devices.filter((d) => d.locationId === locationId);
}

export function getOrphanDevices(devices: Device[]): Device[] {
  return devices.filter(isOrphanDevice);
}
