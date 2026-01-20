'use client';

import { useMemo } from 'react';
import { useLocations } from './useLocations';
import { useDevices } from './useDevices';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  href: string;
}

export function useOnboarding() {
  const { locations, farms } = useLocations();
  const { devices, stats } = useDevices();

  const steps = useMemo((): OnboardingStep[] => {
    const hasFarm = farms.length > 0;
    const hasBarn = locations.some((l) => l.type === 'barn');
    const hasInstalledDevice = devices.some(
      (d) => d.state === 'installed' || d.state === 'configured' || d.state === 'in_production'
    );
    const hasConfiguredDevice = devices.some(
      (d) => d.state === 'configured' || d.state === 'in_production'
    );

    return [
      {
        id: 'create-farm',
        title: 'Crear tu primera granja',
        description: 'Define tu primera ubicación de nivel superior',
        completed: hasFarm,
        href: '/ubicaciones/nueva',
      },
      {
        id: 'create-barn',
        title: 'Añadir un galpón',
        description: 'Agrega una sub-ubicación dentro de tu granja',
        completed: hasBarn,
        href: '/ubicaciones/nueva',
      },
      {
        id: 'install-device',
        title: 'Instalar tu primer dispositivo',
        description: 'Asigna un dispositivo a una ubicación',
        completed: hasInstalledDevice,
        href: '/dispositivos',
      },
      {
        id: 'configure-device',
        title: 'Configurar un dispositivo',
        description: 'Completa la configuración de un dispositivo instalado',
        completed: hasConfiguredDevice,
        href: '/dispositivos',
      },
    ];
  }, [locations, farms, devices]);

  const completedSteps = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const progress = Math.round((completedSteps / totalSteps) * 100);
  const isComplete = completedSteps === totalSteps;

  const nextStep = steps.find((s) => !s.completed);

  return {
    steps,
    completedSteps,
    totalSteps,
    progress,
    isComplete,
    nextStep,
  };
}
