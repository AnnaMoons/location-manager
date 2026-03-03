import { DeviceState } from '../types/device';

export interface StateTransition {
  from: DeviceState;
  to: DeviceState;
  action: string;
}

export const validTransitions: StateTransition[] = [
  { from: 'unassigned', to: 'available', action: 'fabricate' },
  { from: 'unassigned', to: 'disabled', action: 'disable' },
  { from: 'unassigned', to: 'returned', action: 'return' },
  { from: 'unassigned', to: 'dead', action: 'kill' },
  
  { from: 'available', to: 'registered', action: 'sell' },
  { from: 'available', to: 'disabled', action: 'disable' },
  { from: 'available', to: 'returned', action: 'return' },
  { from: 'available', to: 'dead', action: 'kill' },
  
  { from: 'registered', to: 'production', action: 'configure' },
  { from: 'registered', to: 'disabled', action: 'uninstall' },
  { from: 'registered', to: 'returned', action: 'return' },
  { from: 'registered', to: 'dead', action: 'kill' },
  
  { from: 'production', to: 'registered', action: 'deactivate' },
  { from: 'production', to: 'disabled', action: 'uninstall' },
  { from: 'production', to: 'returned', action: 'return' },
  { from: 'production', to: 'dead', action: 'kill' },
  
  { from: 'disabled', to: 'registered', action: 'reassign' },
  { from: 'disabled', to: 'returned', action: 'return' },
  { from: 'disabled', to: 'dead', action: 'kill' },
  
  { from: 'returned', to: 'available', action: 'repair' },
  { from: 'returned', to: 'dead', action: 'kill' },
];

export function canTransition(from: DeviceState, to: DeviceState): boolean {
  return validTransitions.some((t) => t.from === from && t.to === to);
}

export function getAvailableTransitions(from: DeviceState): StateTransition[] {
  return validTransitions.filter((t) => t.from === from);
}

export const stateColors: Record<DeviceState, { bg: string; text: string; border: string }> = {
  unassigned: {
    bg: 'bg-gray-100 hover:bg-gray-100',
    text: 'text-gray-700 hover:text-gray-700',
    border: 'border-gray-300',
  },
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
  production: {
    bg: 'bg-green-100 hover:bg-green-100',
    text: 'text-green-700 hover:text-green-700',
    border: 'border-green-300',
  },
  disabled: {
    bg: 'bg-orange-100 hover:bg-orange-100',
    text: 'text-orange-700 hover:text-orange-700',
    border: 'border-orange-300',
  },
  returned: {
    bg: 'bg-purple-100 hover:bg-purple-100',
    text: 'text-purple-700 hover:text-purple-700',
    border: 'border-purple-300',
  },
  dead: {
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
