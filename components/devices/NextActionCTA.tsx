'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MapPin, Settings, CheckCircle, Wrench, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Device, getNextAction } from '@/lib/types/device';

interface NextActionCTAProps {
  device: Device;
  variant?: 'button' | 'inline' | 'tertiary';
}

const actionConfig = {
  install: {
    icon: MapPin,
    href: (id: string) => `/dispositivos/${id}/registrar`,
    labelKey: 'install',
  },
  configure: {
    icon: Settings,
    href: (id: string) => `/dispositivos/${id}/configurar`,
    labelKey: 'configure',
  },
  activate: {
    icon: CheckCircle,
    href: (id: string) => `/dispositivos/${id}/activar`,
    labelKey: 'activate',
  },
  reactivate: {
    icon: MapPin,
    href: (id: string) => `/dispositivos/${id}/registrar`,
    labelKey: 'reactivate',
  },
  check: {
    icon: Wrench,
    href: (id: string) => `/dispositivos/${id}`,
    labelKey: 'check',
  },
  view: {
    icon: ChevronRight,
    href: (id: string) => `/dispositivos/${id}`,
    labelKey: 'view',
  },
};

export function NextActionCTA({ device, variant = 'button' }: NextActionCTAProps) {
  const t = useTranslations('devices.nextActions');
  const action = getNextAction(device);

  if (!action) return null;

  const config = actionConfig[action];
  const Icon = config.icon;
  const href = config.href(device.id);

  if (variant === 'inline') {
    return (
      <Link href={href} className="flex items-center text-sm text-primary hover:underline">
        <Icon className="h-4 w-4 mr-1" />
        {t(config.labelKey)}
        <ChevronRight className="h-4 w-4" />
      </Link>
    );
  }

  if (variant === 'tertiary') {
    return (
      <Link 
        href={href}
        className="text-[#005980] hover:underline font-roboto text-xs leading-[20px] whitespace-nowrap"
        style={{ fontFeatureSettings: '"liga" off, "clig" off' }}
      >
        {t(config.labelKey)}
      </Link>
    );
  }

  return (
    <Link href={href}>
      <Button size="sm" variant={action === 'activate' ? 'secondary' : 'default'}>
        <Icon className="h-4 w-4 mr-2" />
        {t(config.labelKey)}
      </Button>
    </Link>
  );
}
