'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Location, CreateLocationInput, UpdateLocationInput } from '../types/location';
import { Device, DeviceConfig, DeviceState, DeviceHistoryEntry, DeviceHistoryAction } from '../types/device';
import { Batch, CreateBatchInput, UpdateBatchInput } from '../types/batch';
import initialLocations from '../mock-data/locations.json';
import initialDevices from '../mock-data/devices.json';
import initialBatches from '../mock-data/batches.json';

const STORAGE_KEY_LOCATIONS = 'smartfarm_locations';
const STORAGE_KEY_DEVICES = 'smartfarm_devices';
const STORAGE_KEY_BATCHES = 'smartfarm_batches';

interface DataContextType {
  locations: Location[];
  devices: Device[];
  batches: Batch[];
  isLoading: boolean;
  // Location operations
  createLocation: (input: CreateLocationInput) => Promise<Location>;
  updateLocation: (id: string, input: UpdateLocationInput) => Promise<Location>;
  deleteLocation: (id: string) => Promise<void>;
  getLocation: (id: string) => Location | undefined;
  // Device operations
  installDevice: (deviceId: string, locationId: string) => Promise<Device>;
  configureDevice: (deviceId: string, config: DeviceConfig) => Promise<Device>;
  uninstallDevice: (deviceId: string) => Promise<Device>;
  setDeviceState: (deviceId: string, state: DeviceState) => Promise<Device>;
  getDevice: (id: string) => Device | undefined;
  // Batch operations
  createBatch: (input: CreateBatchInput) => Promise<Batch>;
  updateBatch: (id: string, input: UpdateBatchInput) => Promise<Batch>;
  deleteBatch: (id: string) => Promise<void>;
  getBatch: (id: string) => Batch | undefined;
  // Utility
  simulateDelay: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage or use initial mock data
  useEffect(() => {
    const loadData = () => {
      try {
        const storedLocations = localStorage.getItem(STORAGE_KEY_LOCATIONS);
        const storedDevices = localStorage.getItem(STORAGE_KEY_DEVICES);
        const storedBatches = localStorage.getItem(STORAGE_KEY_BATCHES);

        setLocations(
          storedLocations ? JSON.parse(storedLocations) : (initialLocations as Location[])
        );
        setDevices(storedDevices ? JSON.parse(storedDevices) : (initialDevices as Device[]));
        setBatches(storedBatches ? JSON.parse(storedBatches) : (initialBatches as Batch[]));
      } catch {
        setLocations(initialLocations as Location[]);
        setDevices(initialDevices as Device[]);
        setBatches(initialBatches as Batch[]);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Persist locations to localStorage
  useEffect(() => {
    if (!isLoading && locations.length > 0) {
      localStorage.setItem(STORAGE_KEY_LOCATIONS, JSON.stringify(locations));
    }
  }, [locations, isLoading]);

  // Persist devices to localStorage
  useEffect(() => {
    if (!isLoading && devices.length > 0) {
      localStorage.setItem(STORAGE_KEY_DEVICES, JSON.stringify(devices));
    }
  }, [devices, isLoading]);

  // Persist batches to localStorage
  useEffect(() => {
    if (!isLoading && batches.length > 0) {
      localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(batches));
    }
  }, [batches, isLoading]);

  const simulateDelay = () => new Promise<void>((resolve) => setTimeout(resolve, 300 + Math.random() * 200));

  const createHistoryEntry = (
    action: DeviceHistoryAction,
    details?: DeviceHistoryEntry['details']
  ): DeviceHistoryEntry => ({
    id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    action,
    timestamp: new Date().toISOString(),
    details,
  });

  const addDeviceHistory = (device: Device, entry: DeviceHistoryEntry): Device => ({
    ...device,
    history: [...(device.history || []), entry],
  });

  const createLocation = async (input: CreateLocationInput): Promise<Location> => {
    await simulateDelay();

    const newLocation: Location = {
      id: `loc-${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLocations((prev) => [...prev, newLocation]);
    return newLocation;
  };

  const updateLocation = async (id: string, input: UpdateLocationInput): Promise<Location> => {
    await simulateDelay();

    let updatedLocation: Location | undefined;

    setLocations((prev) =>
      prev.map((loc) => {
        if (loc.id === id) {
          updatedLocation = {
            ...loc,
            ...input,
            updatedAt: new Date().toISOString(),
          };
          return updatedLocation;
        }
        return loc;
      })
    );

    if (!updatedLocation) {
      throw new Error('Location not found');
    }

    return updatedLocation;
  };

  const deleteLocation = async (id: string): Promise<void> => {
    await simulateDelay();

    // Get all child locations recursively
    const getChildIds = (parentId: string): string[] => {
      const children = locations.filter((l) => l.parentId === parentId);
      return children.flatMap((child) => [child.id, ...getChildIds(child.id)]);
    };

    const idsToDelete = [id, ...getChildIds(id)];

    // Unassign devices from deleted locations
    setDevices((prev) =>
      prev.map((device) => {
        if (device.locationId && idsToDelete.includes(device.locationId)) {
          return {
            ...device,
            locationId: null,
            state: 'uninstalled' as DeviceState,
          };
        }
        return device;
      })
    );

    setLocations((prev) => prev.filter((loc) => !idsToDelete.includes(loc.id)));
  };

  const getLocation = (id: string): Location | undefined => {
    return locations.find((loc) => loc.id === id);
  };

  const installDevice = async (deviceId: string, locationId: string): Promise<Device> => {
    await simulateDelay();

    let updatedDevice: Device | undefined;

    setDevices((prev) =>
      prev.map((device) => {
        if (device.id === deviceId) {
          const isLocationChange = device.locationId !== null && device.locationId !== locationId;
          const historyEntry = createHistoryEntry(
            isLocationChange ? 'location_changed' : 'installed',
            isLocationChange
              ? { fromLocationId: device.locationId, toLocationId: locationId }
              : { toLocationId: locationId }
          );
          updatedDevice = addDeviceHistory(
            {
              ...device,
              locationId,
              state: 'installed',
            },
            historyEntry
          );
          return updatedDevice;
        }
        return device;
      })
    );

    if (!updatedDevice) {
      throw new Error('Device not found');
    }

    return updatedDevice;
  };

  const configureDevice = async (deviceId: string, config: DeviceConfig): Promise<Device> => {
    await simulateDelay();

    let updatedDevice: Device | undefined;

    setDevices((prev) =>
      prev.map((device) => {
        if (device.id === deviceId) {
          const historyEntry = createHistoryEntry('configured', {
            configType: config.type,
            fromState: device.state,
            toState: 'in_production',
          });
          updatedDevice = addDeviceHistory(
            {
              ...device,
              configuration: config,
              state: 'in_production',
              health: 'online',
              lastSeen: new Date().toISOString(),
            },
            historyEntry
          );
          return updatedDevice;
        }
        return device;
      })
    );

    if (!updatedDevice) {
      throw new Error('Device not found');
    }

    return updatedDevice;
  };

  const uninstallDevice = async (deviceId: string): Promise<Device> => {
    await simulateDelay();

    let updatedDevice: Device | undefined;

    setDevices((prev) =>
      prev.map((device) => {
        if (device.id === deviceId) {
          const historyEntry = createHistoryEntry('uninstalled', {
            fromLocationId: device.locationId,
            fromState: device.state,
            toState: 'uninstalled',
          });
          updatedDevice = addDeviceHistory(
            {
              ...device,
              locationId: null,
              configuration: null,
              state: 'uninstalled',
            },
            historyEntry
          );
          return updatedDevice;
        }
        return device;
      })
    );

    if (!updatedDevice) {
      throw new Error('Device not found');
    }

    return updatedDevice;
  };

  const setDeviceState = async (deviceId: string, state: DeviceState): Promise<Device> => {
    await simulateDelay();

    let updatedDevice: Device | undefined;

    setDevices((prev) =>
      prev.map((device) => {
        if (device.id === deviceId) {
          const historyEntry = createHistoryEntry('state_changed', {
            fromState: device.state,
            toState: state,
          });
          updatedDevice = addDeviceHistory(
            {
              ...device,
              state,
            },
            historyEntry
          );
          return updatedDevice;
        }
        return device;
      })
    );

    if (!updatedDevice) {
      throw new Error('Device not found');
    }

    return updatedDevice;
  };

  const getDevice = (id: string): Device | undefined => {
    return devices.find((device) => device.id === id);
  };

  const createBatch = async (input: CreateBatchInput): Promise<Batch> => {
    await simulateDelay();

    const newBatch: Batch = {
      id: `batch-${Date.now()}`,
      ...input,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBatches((prev) => [...prev, newBatch]);
    return newBatch;
  };

  const updateBatch = async (id: string, input: UpdateBatchInput): Promise<Batch> => {
    await simulateDelay();

    let updatedBatch: Batch | undefined;

    setBatches((prev) =>
      prev.map((batch) => {
        if (batch.id === id) {
          updatedBatch = {
            ...batch,
            ...input,
            updatedAt: new Date().toISOString(),
          };
          return updatedBatch;
        }
        return batch;
      })
    );

    if (!updatedBatch) {
      throw new Error('Batch not found');
    }

    return updatedBatch;
  };

  const deleteBatch = async (id: string): Promise<void> => {
    await simulateDelay();
    setBatches((prev) => prev.filter((batch) => batch.id !== id));
  };

  const getBatch = (id: string): Batch | undefined => {
    return batches.find((batch) => batch.id === id);
  };

  return (
    <DataContext.Provider
      value={{
        locations,
        devices,
        batches,
        isLoading,
        createLocation,
        updateLocation,
        deleteLocation,
        getLocation,
        installDevice,
        configureDevice,
        uninstallDevice,
        setDeviceState,
        getDevice,
        createBatch,
        updateBatch,
        deleteBatch,
        getBatch,
        simulateDelay,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
