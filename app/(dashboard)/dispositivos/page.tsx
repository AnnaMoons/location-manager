'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Search, Filter, AlertTriangle, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { DeviceTable } from '@/components/devices/DeviceTable';
import { useDevices } from '@/lib/hooks/useDevices';
import { DeviceState, DeviceType } from '@/lib/types/device';

export default function DevicesPage() {
  const t = useTranslations('devices');
  const { devices, orphanDevices, stats, isLoading, filterDevices } = useDevices();

  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<DeviceState | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<DeviceType | 'all'>('all');
  const [activeTab, setActiveTab] = useState('all');

  const filteredDevices = useMemo(() => {
    let filtered = activeTab === 'orphans' ? orphanDevices : devices;

    if (stateFilter !== 'all') {
      filtered = filtered.filter((d) => d.state === stateFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((d) => d.type === typeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((d) =>
        d.serialNumber.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [devices, orphanDevices, stateFilter, typeFilter, searchQuery, activeTab]);

  if (isLoading) {
    return (
      <div>
        <PageHeader title={t('title')} />
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        actions={
          stats.orphans > 0 && (
            <Link href="/dispositivos/huerfanos">
              <Button variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                {stats.orphans} {t('orphans')}
              </Button>
            </Link>
          )
        }
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">{t('filters.all')} ({devices.length})</TabsTrigger>
          <TabsTrigger value="orphans">
            {t('orphans')} ({orphanDevices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número de serie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={stateFilter}
              onValueChange={(v) => setStateFilter(v as DeviceState | 'all')}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('filters.byState')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.all')}</SelectItem>
                <SelectItem value="available">{t('states.available')}</SelectItem>
                <SelectItem value="registered">{t('states.registered')}</SelectItem>
                <SelectItem value="production">{t('states.production')}</SelectItem>
                <SelectItem value="disabled">{t('states.disabled')}</SelectItem>
                <SelectItem value="returned">{t('states.returned')}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as DeviceType | 'all')}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('filters.byType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.all')}</SelectItem>
                <SelectItem value="pigvision">{t('types.pigvision')}</SelectItem>
                <SelectItem value="scale">{t('types.scale')}</SelectItem>
                <SelectItem value="sensor">{t('types.sensor')}</SelectItem>
                <SelectItem value="gateway">{t('types.gateway')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Device List */}
          {devices.length === 0 ? (
            <EmptyState
              icon={Cpu}
              title={t('noDevices')}
              description={t('noDevicesDesc')}
            />
          ) : filteredDevices.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Sin resultados"
              description="No se encontraron dispositivos con los filtros aplicados"
            />
          ) : (
            <DeviceTable devices={filteredDevices} />
          )}
        </TabsContent>

        <TabsContent value="orphans" className="space-y-4">
          {orphanDevices.length === 0 ? (
            <EmptyState
              icon={Cpu}
              title={t('noOrphans')}
              description={t('noOrphansDesc')}
            />
          ) : (
            <DeviceTable devices={filteredDevices} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
