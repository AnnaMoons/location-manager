export type DeviceType = 'pigvision' | 'scale' | 'sensor' | 'gateway';

export type DeviceState =
  | 'available'
  | 'registered'
  | 'installed'
  | 'configured'
  | 'in_production'
  | 'maintenance'
  | 'uninstalled';

export type DeviceHealth = 'online' | 'offline' | 'unknown';

export type SensorType = 'temperature' | 'humidity' | 'co2' | 'ammonia';

export type DeviceHistoryAction =
  | 'created'
  | 'installed'
  | 'uninstalled'
  | 'configured'
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
  return device.state === 'registered' || device.state === 'available';
}

export function needsConfiguration(device: Device): boolean {
  return device.state === 'installed' && device.configuration === null;
}

export function getNextAction(device: Device): 'install' | 'configure' | 'ready' | 'maintenance' | null {
  switch (device.state) {
    case 'available':
    case 'registered':
      return 'install';
    case 'installed':
      return 'configure';
    case 'configured':
      return 'ready';
    case 'maintenance':
      return 'maintenance';
    case 'in_production':
    case 'uninstalled':
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
