'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Cpu, Activity, AlertTriangle, Package, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AlertBanner } from '@/components/dashboard/AlertBanner';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { useDevices } from '@/lib/hooks/useDevices';
import { LoadingSpinner } from '@/components/shared/LoadingState';
import { PageHeader } from '@/components/shared/PageHeader';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { stats, isLoading } = useDevices();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} subtitle={t('welcome')} />

      {/* Alerts */}
      {stats.orphans > 0 && (
        <AlertBanner
          variant="warning"
          message={t('alerts.orphanDevices', { count: stats.orphans })}
          actionLabel={t('quickActions')}
          actionHref="/dispositivos/huerfanos"
        />
      )}

      {stats.offline > 0 && (
        <AlertBanner
          variant="error"
          message={t('alerts.offlineDevices', { count: stats.offline })}
          actionHref="/dispositivos"
        />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title={t('totalDevices')}
          value={stats.total}
          icon={Cpu}
          variant="default"
        />
        <StatsCard
          title={t('inProduction')}
          value={stats.inProduction}
          icon={Activity}
          variant="success"
        />
        <StatsCard
          title={t('pendingConfig')}
          value={stats.pending}
          icon={Package}
          variant="warning"
        />
        <StatsCard
          title={t('orphanDevices')}
          value={stats.orphans}
          icon={AlertTriangle}
          variant={stats.orphans > 0 ? 'destructive' : 'default'}
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">{t('quickActions')}</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dispositivos">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('installDevice')}
            </Button>
          </Link>
          <Link href="/ubicaciones/nueva">
            <Button variant="outline">
              <MapPin className="mr-2 h-4 w-4" />
              {t('createLocation')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Onboarding Checklist */}
      <OnboardingChecklist />
    </div>
  );
}
