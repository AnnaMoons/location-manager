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

  return transitionDevice(device, 'registered', { locationId });
}

export function configureDevice(device: Device, configuration: DeviceConfig): TransitionResult {
  if (device.state !== 'registered') {
    return {
      success: false,
      error: 'Device must be in registered state to configure',
    };
  }

  const updatedDevice = transitionDevice(device, 'production', { configuration });

  return updatedDevice;
}

export function uninstallDevice(device: Device): TransitionResult {
  const allowedStates: DeviceState[] = ['registered', 'production'];

  if (!allowedStates.includes(device.state)) {
    return {
      success: false,
      error: 'Device cannot be uninstalled from current state',
    };
  }

  return transitionDevice(device, 'disabled', {
    locationId: null,
    configuration: null,
  });
}

export function setDeviceMaintenance(device: Device): TransitionResult {
  if (device.state !== 'production') {
    return {
      success: false,
      error: 'Device must be in production to set to maintenance',
    };
  }

  return transitionDevice(device, 'returned');
}

export function reactivateDevice(device: Device): TransitionResult {
  if (device.state !== 'returned') {
    return {
      success: false,
      error: 'Device must be in returned state to reactivate',
    };
  }

  return transitionDevice(device, 'available');
}

export function getNextActions(device: Device): string[] {
  const transitions = getAvailableTransitions(device.state);
  return transitions.map((t) => t.action);
}
