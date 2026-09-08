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

/**
 * 12 lifecycle states need 12 visually distinct treatments, but the DS's semantic layer only
 * defines 3 state colors (success/warning/error) plus brand-primary/brand-accent — not enough
 * to keep every state distinguishable. States with a clear positive/negative meaning use those
 * semantic tokens; the purely-neutral in-between states borrow named DS *primitive* scales
 * (still real, documented DS colors — see vendor/asimetrix-ds/app/globals.css primitives layer)
 * instead of generic Tailwind palette colors that have no relationship to the DS at all.
 */
export const stateColors: Record<DeviceState, { bg: string; text: string; border: string }> = {
  unassigned: {
    bg: 'bg-surface-2 hover:bg-surface-2',
    text: 'text-fg-tertiary hover:text-fg-tertiary',
    border: 'border-line',
  },
  available: {
    bg: 'bg-surface-2 hover:bg-surface-2',
    text: 'text-fg-secondary hover:text-fg-secondary',
    border: 'border-line',
  },
  registered: {
    bg: 'bg-brand-primary/10 hover:bg-brand-primary/10',
    text: 'text-brand-primary hover:text-brand-primary',
    border: 'border-brand-primary/30',
  },
  installed: {
    bg: 'bg-primitive-mistblue-100 hover:bg-primitive-mistblue-100',
    text: 'text-primitive-mistblue-900 hover:text-primitive-mistblue-900',
    border: 'border-primitive-mistblue-500',
  },
  configured: {
    bg: 'bg-primitive-indigo-100 hover:bg-primitive-indigo-100',
    text: 'text-primitive-indigo-700 hover:text-primitive-indigo-700',
    border: 'border-primitive-indigo-300',
  },
  in_production: {
    bg: 'bg-success-light hover:bg-success-light',
    text: 'text-success hover:text-success',
    border: 'border-success/40',
  },
  production: {
    bg: 'bg-success-light hover:bg-success-light',
    text: 'text-success hover:text-success',
    border: 'border-success/40',
  },
  maintenance: {
    bg: 'bg-warning-light hover:bg-warning-light',
    text: 'text-warning-dark hover:text-warning-dark',
    border: 'border-warning',
  },
  disabled: {
    bg: 'bg-primitive-clay-100 hover:bg-primitive-clay-100',
    text: 'text-primitive-clay-700 hover:text-primitive-clay-700',
    border: 'border-primitive-clay-300',
  },
  uninstalled: {
    bg: 'bg-surface-2 hover:bg-surface-2',
    text: 'text-fg-disabled hover:text-fg-disabled',
    border: 'border-line',
  },
  returned: {
    bg: 'bg-warning-light hover:bg-warning-light',
    text: 'text-warning-dark hover:text-warning-dark',
    border: 'border-warning',
  },
  dead: {
    bg: 'bg-error-light hover:bg-error-light',
    text: 'text-error hover:text-error',
    border: 'border-error/40',
  },
};

export const healthColors: Record<string, { bg: string; text: string }> = {
  online: {
    bg: 'bg-success',
    text: 'text-success',
  },
  offline: {
    bg: 'bg-error',
    text: 'text-error',
  },
  unknown: {
    bg: 'bg-fg-placeholder',
    text: 'text-fg-tertiary',
  },
};
