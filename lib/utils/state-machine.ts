import { Device, DeviceState, DeviceConfig } from '../types/device';
import { canTransition, getAvailableTransitions } from '../constants/device-states';

export interface TransitionResult {
  success: boolean;
  device?: Device;
  error?: string;
}

export function transitionDevice(
  device: Device,
  toState: DeviceState,
  updates?: Partial<Device>
): TransitionResult {
  if (!canTransition(device.state, toState)) {
    return {
      success: false,
      error: `Cannot transition from ${device.state} to ${toState}`,
    };
  }

  const updatedDevice: Device = {
    ...device,
    ...updates,
    state: toState,
  };

  return {
    success: true,
    device: updatedDevice,
  };
}

export function installDevice(device: Device, locationId: string): TransitionResult {
  if (device.state !== 'registered' && device.state !== 'available') {
    return {
      success: false,
      error: 'Device must be in registered or available state to install',
    };
  }

  return transitionDevice(device, 'installed', { locationId });
}

export function configureDevice(device: Device, configuration: DeviceConfig): TransitionResult {
  if (device.state !== 'installed') {
    return {
      success: false,
      error: 'Device must be in installed state to configure',
    };
  }

  const updatedDevice = transitionDevice(device, 'configured', { configuration });

  if (updatedDevice.success && updatedDevice.device) {
    // Auto-transition to in_production after configuration
    return transitionDevice(updatedDevice.device, 'in_production');
  }

  return updatedDevice;
}

export function uninstallDevice(device: Device): TransitionResult {
  const allowedStates: DeviceState[] = ['installed', 'configured', 'in_production', 'maintenance'];

  if (!allowedStates.includes(device.state)) {
    return {
      success: false,
      error: 'Device cannot be uninstalled from current state',
    };
  }

  return transitionDevice(device, 'uninstalled', {
    locationId: null,
    configuration: null,
  });
}

export function setDeviceMaintenance(device: Device): TransitionResult {
  if (device.state !== 'in_production') {
    return {
      success: false,
      error: 'Device must be in production to set to maintenance',
    };
  }

  return transitionDevice(device, 'maintenance');
}

export function reactivateDevice(device: Device): TransitionResult {
  if (device.state !== 'maintenance') {
    return {
      success: false,
      error: 'Device must be in maintenance to reactivate',
    };
  }

  return transitionDevice(device, 'in_production');
}

export function getNextActions(device: Device): string[] {
  const transitions = getAvailableTransitions(device.state);
  return transitions.map((t) => t.action);
}
