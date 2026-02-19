import { DeviceState } from '../types/device';

export interface StateTransition {
  from: DeviceState;
  to: DeviceState;
  action: string;
}

export const validTransitions: StateTransition[] = [
  { from: 'available', to: 'registered', action: 'register' },
  { from: 'registered', to: 'installed', action: 'install' },
  { from: 'installed', to: 'configured', action: 'configure' },
  { from: 'configured', to: 'in_production', action: 'activate' },
  { from: 'in_production', to: 'maintenance', action: 'maintenance' },
  { from: 'maintenance', to: 'in_production', action: 'reactivate' },
  { from: 'installed', to: 'uninstalled', action: 'uninstall' },
  { from: 'configured', to: 'uninstalled', action: 'uninstall' },
  { from: 'in_production', to: 'uninstalled', action: 'uninstall' },
  { from: 'maintenance', to: 'uninstalled', action: 'uninstall' },
  { from: 'uninstalled', to: 'registered', action: 'reassign' },
];

export function canTransition(from: DeviceState, to: DeviceState): boolean {
  return validTransitions.some((t) => t.from === from && t.to === to);
}

export function getAvailableTransitions(from: DeviceState): StateTransition[] {
  return validTransitions.filter((t) => t.from === from);
}

export const stateColors: Record<DeviceState, { bg: string; text: string; border: string }> = {
  available: {
    bg: 'bg-gray-100 hover:bg-gray-100',
    text: 'text-gray-700 hover:text-gray-700',
    border: 'border-gray-300',
  },
  registered: {
    bg: 'bg-blue-100 hover:bg-blue-100',
    text: 'text-blue-700 hover:text-blue-700',
    border: 'border-blue-300',
  },
  installed: {
    bg: 'bg-yellow-100 hover:bg-yellow-100',
    text: 'text-yellow-700 hover:text-yellow-700',
    border: 'border-yellow-300',
  },
  configured: {
    bg: 'bg-purple-100 hover:bg-purple-100',
    text: 'text-purple-700 hover:text-purple-700',
    border: 'border-purple-300',
  },
  in_production: {
    bg: 'bg-green-100 hover:bg-green-100',
    text: 'text-green-700 hover:text-green-700',
    border: 'border-green-300',
  },
  maintenance: {
    bg: 'bg-orange-100 hover:bg-orange-100',
    text: 'text-orange-700 hover:text-orange-700',
    border: 'border-orange-300',
  },
  uninstalled: {
    bg: 'bg-red-100 hover:bg-red-100',
    text: 'text-red-700 hover:text-red-700',
    border: 'border-red-300',
  },
};

export const healthColors: Record<string, { bg: string; text: string }> = {
  online: {
    bg: 'bg-green-500',
    text: 'text-green-700',
  },
  offline: {
    bg: 'bg-red-500',
    text: 'text-red-700',
  },
  unknown: {
    bg: 'bg-gray-400',
    text: 'text-gray-700',
  },
};
