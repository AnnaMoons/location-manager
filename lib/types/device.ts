export type DeviceType = 'pigvision' | 'scale' | 'sensor' | 'gateway';

export type DeviceState =
  | 'undefined'
  | 'available'
  | 'registered'
  | 'production'
  | 'disabled'
  | 'returned'
  | 'dead';

export type DeviceHealth = 'online' | 'offline' | 'unknown';

export type SensorType = 'temperature' | 'humidity' | 'co2' | 'ammonia';

export type DeviceHistoryAction =
  | 'created'
  | 'sold'
  | 'configured'
  | 'activated'
  | 'uninstalled'
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
  sensorType: SensorType;
  alertThresholdMin?: number;
  alertThresholdMax?: number;
  readingInterval: number;
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

export interface Device {
  id: string;
  serialNumber: string;
  type: DeviceType;
  state: DeviceState;
  locationId: string | null;
  companyId: string;
  configuration: DeviceConfig | null;
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

export function getNextAction(device: Device): 'install' | 'configure' | 'activate' | 'check' | null {
  switch (device.state) {
    case 'available':
      return 'install';
    case 'registered':
      return 'configure';
    case 'production':
      return 'check';
    case 'disabled':
    case 'returned':
    case 'undefined':
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
