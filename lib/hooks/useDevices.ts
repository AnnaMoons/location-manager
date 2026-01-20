'use client';

import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import {
  Device,
  DeviceState,
  DeviceType,
  getOrphanDevices,
  getDevicesByState,
  getDevicesByType,
  getDevicesByLocation,
  getNextAction,
} from '../types/device';

export function useDevices() {
  const {
    devices,
    isLoading,
    installDevice,
    configureDevice,
    uninstallDevice,
    setDeviceState,
    getDevice,
  } = useData();

  const orphanDevices = useMemo(() => getOrphanDevices(devices), [devices]);

  const devicesByState = useMemo(() => {
    const states: DeviceState[] = [
      'available',
      'registered',
      'installed',
      'configured',
      'in_production',
      'maintenance',
      'uninstalled',
    ];
    return states.reduce(
      (acc, state) => {
        acc[state] = getDevicesByState(devices, state);
        return acc;
      },
      {} as Record<DeviceState, Device[]>
    );
  }, [devices]);

  const stats = useMemo(
    () => ({
      total: devices.length,
      inProduction: devicesByState.in_production.length,
      pending: devicesByState.installed.length + devicesByState.configured.length,
      orphans: orphanDevices.length,
      maintenance: devicesByState.maintenance.length,
      offline: devices.filter((d) => d.health === 'offline').length,
    }),
    [devices, devicesByState, orphanDevices]
  );

  const filterByState = (state: DeviceState): Device[] => {
    return getDevicesByState(devices, state);
  };

  const filterByType = (type: DeviceType): Device[] => {
    return getDevicesByType(devices, type);
  };

  const filterByLocation = (locationId: string): Device[] => {
    return getDevicesByLocation(devices, locationId);
  };

  const getDeviceNextAction = (device: Device) => {
    return getNextAction(device);
  };

  const searchDevices = (query: string): Device[] => {
    const lowerQuery = query.toLowerCase();
    return devices.filter((d) => d.serialNumber.toLowerCase().includes(lowerQuery));
  };

  const filterDevices = (filters: {
    state?: DeviceState;
    type?: DeviceType;
    locationId?: string;
    orphansOnly?: boolean;
  }): Device[] => {
    let filtered = devices;

    if (filters.orphansOnly) {
      filtered = orphanDevices;
    }

    if (filters.state) {
      filtered = filtered.filter((d) => d.state === filters.state);
    }

    if (filters.type) {
      filtered = filtered.filter((d) => d.type === filters.type);
    }

    if (filters.locationId) {
      filtered = filtered.filter((d) => d.locationId === filters.locationId);
    }

    return filtered;
  };

  return {
    devices,
    orphanDevices,
    devicesByState,
    stats,
    isLoading,
    installDevice,
    configureDevice,
    uninstallDevice,
    setDeviceState,
    getDevice,
    filterByState,
    filterByType,
    filterByLocation,
    getDeviceNextAction,
    searchDevices,
    filterDevices,
  };
}
