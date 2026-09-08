'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Calendar, MapPin, Users, Clock, Edit, Trash2, Cpu,
  XCircle, Plus, CheckCircle, RotateCcw, EyeOff, Eye,
  MoreHorizontal, ChevronRight, Scale, Thermometer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Popover, { POPOVER_ITEM, POPOVER_ITEM_DANGER, POPOVER_SECTION } from '@/components/ui/popover';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingState';
import { DeviceStateChip } from '@/components/devices/DeviceStateChip';
import { CloseBatchDialog } from '@/components/batches/CloseBatchDialog';
import { SubBatchDialog } from '@/components/batches/SubBatchDialog';
import { useBatches } from '@/lib/hooks/useBatches';
import { CloseBatchInput, CreateSubBatchInput } from '@/lib/types/batch';
import { SENSOR_PROFILE_SHORT_LABELS, SensorConfig } from '@/lib/types/device';
import { cn } from '@/lib/utils';

const SPECIES_BORDER: Record<string, string> = {
  pigs: 'border-l-product-pigvision',
  broilers: 'border-l-surface-blue-2',
  layers: 'border-l-primitive-mint-500',
};

/**
 * Single source of truth for what a batch status means: badge color + which actions are
 * available. Adding a status is one entry here instead of hunting down every `status === '...'`
 * check across the page.
 */
interface BatchStatusConfig {
  variant: 'success' | 'secondary' | 'destructive' | 'default';
  canClose: boolean;
  canReactivate: boolean;
  canToggleExclusion: boolean;
  showDaysRemaining: boolean;
}

const BATCH_STATUS_CONFIG: Record<string, BatchStatusConfig> = {
  active: { variant: 'success', canClose: true, canReactivate: false, canToggleExclusion: true, showDaysRemaining: true },
  completed: { variant: 'secondary', canClose: false, canReactivate: true, canToggleExclusion: false, showDaysRemaining: false },
  cancelled: { variant: 'destructive', canClose: false, canReactivate: true, canToggleExclusion: false, showDaysRemaining: false },
};
const DEFAULT_BATCH_STATUS_CONFIG: BatchStatusConfig = {
  variant: 'default', canClose: false, canReactivate: false, canToggleExclusion: false, showDaysRemaining: false,
};

function getBatchStatusConfig(status: string): BatchStatusConfig {
  return BATCH_STATUS_CONFIG[status] ?? DEFAULT_BATCH_STATUS_CONFIG;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function BatchDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const t = useTranslations('batches');
  const tSpecies = useTranslations('locations.species');
  const tTypes = useTranslations('locations.types');
  const tDevices = useTranslations('devices');
  const tBatchForm = useTranslations('batches.form');
  const router = useRouter();

  const {
    getBatchWithFullDetails, updateBatch, deleteBatch,
    closeBatch, createSubBatch, updateSubBatch, deleteSubBatch, isLoading,
  } = useBatches();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSubBatchId, setDeleteSubBatchId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingSubBatch, setIsDeletingSubBatch] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const batchDetails = getBatchWithFullDetails(id);

  if (isLoading) return <LoadingSpinner />;
  if (!batchDetails) {
    return (
      <EmptyState
        title={t('notFound')} description={t('notFoundDesc')}
        actionLabel={t('backToList')} actionHref="/lotes"
      />
    );
  }

  const { locations, devices: batchDevices } = batchDetails;
  const borderColor = SPECIES_BORDER[batchDetails.species] ?? 'border-l-line';
  const statusConfig = getBatchStatusConfig(batchDetails.status);

  const handleDelete = async () => {
    setIsDeleting(true);
    try { await deleteBatch(id); router.push('/lotes'); }
    catch (e) { console.error(e); }
    finally { setIsDeleting(false); }
  };

  const handleCloseBatch = async (input: CloseBatchInput) => {
    setIsUpdating(true);
    try { await closeBatch(id, input); } finally { setIsUpdating(false); }
  };

  const handleReactivate = async () => {
    setIsUpdating(true);
    try { await updateBatch(id, { status: 'active', closedDate: undefined, closeReason: undefined }); }
    catch (e) { console.error(e); } finally { setIsUpdating(false); }
  };

  const handleCloseSubBatch = async (subBatchId: string) => {
    setIsUpdating(true);
    try { await updateSubBatch(subBatchId, { status: 'completed' }); }
    catch (e) { console.error(e); } finally { setIsUpdating(false); }
  };

  const handleReactivateSubBatch = async (subBatchId: string) => {
    setIsUpdating(true);
    try { await updateSubBatch(subBatchId, { status: 'active' }); }
    catch (e) { console.error(e); } finally { setIsUpdating(false); }
  };

  const handleTogglePenExclusion = async (penId: string, currentlyExcluded: boolean) => {
    setIsUpdating(true);
    try {
      const current = batchDetails.excludedPenIds || [];
      const excludedPenIds = currentlyExcluded
        ? current.filter((pid) => pid !== penId)
        : [...current, penId];
      await updateBatch(id, { excludedPenIds });
    } catch (e) { console.error(e); } finally { setIsUpdating(false); }
  };

  const handleDeleteSubBatch = async (subBatchId: string) => {
    setIsDeletingSubBatch(subBatchId);
    try { await deleteSubBatch(subBatchId); }
    catch (e) { console.error(e); } finally { setIsDeletingSubBatch(null); }
  };

  const getDeviceTypeLabel = (device: typeof batchDevices.weightDevices[0]) => {
    if (device.type === 'sensor') {
      const config = device.configuration as Partial<SensorConfig> | undefined;
      const profile = config?.sensorProfile;
      if (profile) return `Sensor · ${SENSOR_PROFILE_SHORT_LABELS[profile]}`;
    }
    return tDevices(`types.${device.type}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={batchDetails.name}
        subtitle={tSpecies(batchDetails.species)}
        showBack
        backHref="/lotes"
        actions={
          <div className="flex items-center gap-2">
            {statusConfig.canClose && (
              <CloseBatchDialog
                batch={batchDetails}
                onClose={handleCloseBatch}
                trigger={
                  <Button variant="outline" disabled={isUpdating}>
                    <XCircle className="h-4 w-4 mr-2" />
                    {t('closeBatch')}
                  </Button>
                }
              />
            )}
            {statusConfig.canReactivate && (
              <Button variant="outline" onClick={handleReactivate} disabled={isUpdating}>
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('reactivate')}
              </Button>
            )}
            <Link href={`/lotes/${id}/editar`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                {t('edit')}
              </Button>
            </Link>
            <Popover
              trigger={
                <button className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-button-neutral-border bg-transparent hover:bg-surface-2 transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              }
              position="bottom"
            >
              <div className={POPOVER_SECTION}>
                <button className={cn(POPOVER_ITEM, POPOVER_ITEM_DANGER)} onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4" />
                  {t('delete')}
                </button>
              </div>
            </Popover>
          </div>
        }
      />

      {/* Info card */}
      <div className={cn('rounded-lg border border-l-4 p-5', borderColor)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant={statusConfig.variant}>
              {t(`status.${batchDetails.status}`)}
            </Badge>
            {batchDetails.daysRemaining !== null && statusConfig.showDaysRemaining && (
              <span className="text-xs text-fg-tertiary">
                {batchDetails.daysRemaining > 0
                  ? `${batchDetails.daysRemaining} ${t('daysRemaining')}`
                  : t('endDatePassed')}
              </span>
            )}
          </div>
          {batchDetails.sex && batchDetails.sex !== 'mixed' && (
            <Badge variant="outline">
              {tBatchForm(`sex${batchDetails.sex.charAt(0).toUpperCase() + batchDetails.sex.slice(1)}`)}
            </Badge>
          )}
        </div>

        <div className="divide-y">
          {/* Animal count */}
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-fg-tertiary flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />{t('animalCount')}
            </span>
            <span className="text-sm font-medium">{batchDetails.animalCount.toLocaleString()} {t('animals')}</span>
          </div>

          {/* Sex breakdown */}
          {(batchDetails.maleCount != null || batchDetails.femaleCount != null) && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-fg-tertiary">{t('sexBreakdown')}</span>
              <span className="text-sm font-medium">
                {[
                  batchDetails.maleCount != null && `${batchDetails.maleCount} ${tBatchForm('sexMale').toLowerCase()}`,
                  batchDetails.femaleCount != null && `${batchDetails.femaleCount} ${tBatchForm('sexFemale').toLowerCase()}`,
                ].filter(Boolean).join(' · ')}
              </span>
            </div>
          )}

          {/* Initial weight */}
          {batchDetails.initialWeight && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-fg-tertiary flex items-center gap-2">
                <Scale className="h-3.5 w-3.5" />{t('initialWeight')}
              </span>
              <span className="text-sm font-medium">{batchDetails.initialWeight} kg</span>
            </div>
          )}

          {/* Current age */}
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-fg-tertiary flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />{t('currentAge')}
            </span>
            <span className="text-sm font-medium">{batchDetails.currentAge} {t('days')}</span>
          </div>

          {/* Arrival date (poultry only) */}
          {(batchDetails.species === 'broilers' || batchDetails.species === 'layers') && batchDetails.arrivalDate && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-fg-tertiary flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />{t('arrivalDate')}
              </span>
              <span className="text-sm font-medium">{formatDate(batchDetails.arrivalDate)}</span>
            </div>
          )}

          {/* Start date / Day 1 */}
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm text-fg-tertiary flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              {(batchDetails.species === 'broilers' || batchDetails.species === 'layers')
                ? t('dayOneDate')
                : t('startDate')}
            </span>
            <span className="text-sm font-medium">{formatDate(batchDetails.startDate)}</span>
          </div>

          {/* Initial age (only for non-poultry) */}
          {batchDetails.species !== 'broilers' && batchDetails.species !== 'layers' && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-fg-tertiary">{t('initialAge')}</span>
              <span className="text-sm font-medium">{batchDetails.averageAgeAtStart} {t('days')}</span>
            </div>
          )}

          {/* Estimated end date */}
          {batchDetails.estimatedEndDate && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-fg-tertiary">{t('estimatedEndDate')}</span>
              <span className="text-sm font-medium">{formatDate(batchDetails.estimatedEndDate)}</span>
            </div>
          )}
        </div>

        {/* Closure info */}
        {batchDetails.closedDate && (
          <div className="mt-3 pt-3 border-t space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-tertiary">{t('closedDate')}</span>
              <span className="text-sm font-medium">{formatDate(batchDetails.closedDate)}</span>
            </div>
            {batchDetails.closeReason && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-fg-tertiary shrink-0">{t('closeReason')}</span>
                <span className="text-sm font-medium text-right">{batchDetails.closeReason}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Distribution + Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-fg-tertiary uppercase tracking-wide">
            {t('distribution')}
          </h2>

          {/* Farms */}
          {locations.farms && locations.farms.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-fg-tertiary font-medium">
                {tTypes('farm')}{locations.farms.length > 1 && ` (${locations.farms.length})`}
              </p>
              <div className="space-y-1.5">
                {locations.farms.map((farm) => (
                  <Link key={farm.id} href={`/ubicaciones/${farm.id}`} className="block px-4 py-3 rounded-lg border hover:bg-surface-2/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-fg-tertiary" />
                        <span className="text-sm font-medium">{farm.name}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-fg-tertiary" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Barns */}
          {locations.barns.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-fg-tertiary font-medium">
                {t('barns')} ({locations.barns.length})
              </p>
              <div className="space-y-1.5">
                {locations.barns.map((barn) => (
                  <Link key={barn.id} href={`/ubicaciones/${barn.id}`} className="block px-4 py-3 rounded-lg border hover:bg-surface-2/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{barn.name}</span>
                      <ChevronRight className="h-4 w-4 text-fg-tertiary" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Pens */}
          {locations.pens.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-fg-tertiary font-medium">
                {t('pens')} ({locations.pens.length})
                {batchDetails.excludedPenIds && batchDetails.excludedPenIds.length > 0 && (
                  <span className="ml-1 text-warning-dark">
                    — {batchDetails.excludedPenIds.length} {t('pensExcluded')}
                  </span>
                )}
              </p>
              <div className="space-y-1.5">
                {locations.pens.map((pen) => {
                  const dist = batchDetails.penDistribution?.find((pd) => pd.penId === pen.id);
                  const isExcluded = batchDetails.excludedPenIds?.includes(pen.id) ?? false;
                  return (
                    <div
                      key={pen.id}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 rounded-lg border transition-colors',
                        isExcluded ? 'opacity-50 bg-surface-2/30' : 'hover:bg-surface-2/50'
                      )}
                    >
                      <Link href={`/ubicaciones/${pen.id}`} className="flex-1 min-w-0">
                        <span className={cn('text-sm font-medium', isExcluded && 'line-through')}>
                          {pen.name}
                        </span>
                        {dist && (
                          <p className="text-xs text-fg-tertiary mt-0.5">
                            <span className="font-medium">{dist.animalCount}</span> {t('animals')}
                            {dist.sex && (
                              <span className="ml-1">
                                · {tBatchForm(`sex${dist.sex.charAt(0).toUpperCase() + dist.sex.slice(1)}`).toLowerCase()}
                              </span>
                            )}
                            {dist.initialWeight && (
                              <span className="ml-1">
                                · <span className="font-medium">{dist.initialWeight} kg</span> promedio
                              </span>
                            )}
                          </p>
                        )}
                      </Link>
                      {statusConfig.canToggleExclusion && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn('shrink-0 h-8 w-8 p-0', isExcluded ? 'text-warning-dark hover:text-warning-dark' : 'text-fg-tertiary hover:text-fg')}
                          onClick={() => handleTogglePenExclusion(pen.id, isExcluded)}
                          disabled={isUpdating}
                          title={isExcluded ? t('includePen') : t('excludePen')}
                        >
                          {isExcluded ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Devices */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-fg-tertiary uppercase tracking-wide">
            {t('devices')}
          </h2>

          {/* Weight devices */}
          <div className="space-y-2">
            <p className="text-xs text-fg-tertiary font-medium flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5" />{t('weightDevices')}
            </p>
            {batchDevices.weightDevices.length > 0 ? (
              <div className="space-y-1.5">
                {batchDevices.weightDevices.map((device) => (
                  <Link key={device.id} href={`/dispositivos/${device.id}`} className="block px-4 py-3 rounded-lg border hover:bg-surface-2/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium font-mono">{device.serialNumber}</p>
                        <p className="text-xs text-fg-tertiary mt-0.5">{getDeviceTypeLabel(device)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <DeviceStateChip state={device.state} size="sm" />
                        <ChevronRight className="h-4 w-4 text-fg-tertiary" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-fg-tertiary px-1">{t('noDevices')}</p>
            )}
          </div>

          {/* Environment devices */}
          <div className="space-y-2">
            <p className="text-xs text-fg-tertiary font-medium flex items-center gap-1.5">
              <Thermometer className="h-3.5 w-3.5" />{t('environmentDevices')}
            </p>
            {batchDevices.environmentDevices.length > 0 ? (
              <div className="space-y-1.5">
                {batchDevices.environmentDevices.map((device) => (
                  <Link key={device.id} href={`/dispositivos/${device.id}`} className="block px-4 py-3 rounded-lg border hover:bg-surface-2/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium font-mono">{device.serialNumber}</p>
                        <p className="text-xs text-fg-tertiary mt-0.5">{getDeviceTypeLabel(device)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <DeviceStateChip state={device.state} size="sm" />
                        <ChevronRight className="h-4 w-4 text-fg-tertiary" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-fg-tertiary px-1">{t('noDevices')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Sub-batches (mixed sex only) */}
      {batchDetails.sex === 'mixed' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-fg-tertiary uppercase tracking-wide">
              {t('subBatches')}
            </h2>
            <SubBatchDialog
              batch={batchDetails}
              availablePens={locations.pens}
              onSubmit={async (input: CreateSubBatchInput) => { await createSubBatch(input); }}
              trigger={
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  {t('createSubBatch')}
                </Button>
              }
            />
          </div>

          {batchDetails.subBatches && batchDetails.subBatches.length > 0 ? (
            <div className="space-y-1.5">
              {batchDetails.subBatches.map((subBatch) => (
                <div
                  key={subBatch.id}
                  className={cn(
                    'px-4 py-3 rounded-lg border',
                    subBatch.status === 'completed' && 'opacity-60 bg-surface-2/30'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{subBatch.name}</p>
                      <p className="text-xs text-fg-tertiary mt-0.5">
                        {subBatch.penAssignments && subBatch.penAssignments.length > 0
                          ? subBatch.penAssignments
                              .map((pa) => locations.pens.find((p) => p.id === pa.penId)?.name)
                              .filter(Boolean)
                              .join(' · ')
                          : '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant={subBatch.sex === 'male' ? 'default' : 'secondary'} className="text-xs">
                        {subBatch.sex === 'male' ? tBatchForm('sexMale') : tBatchForm('sexFemale')}
                      </Badge>
                      {subBatch.status === 'completed' && (
                        <Badge variant="secondary" className="text-xs">{t('status.completed')}</Badge>
                      )}
                      {subBatch.status === 'active' ? (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-fg-tertiary"
                          onClick={() => handleCloseSubBatch(subBatch.id)} disabled={isUpdating}
                          title={t('closeSubBatch')}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-fg-tertiary"
                          onClick={() => handleReactivateSubBatch(subBatch.id)} disabled={isUpdating}
                          title={t('reactivateSubBatch')}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      <SubBatchDialog
                        batch={batchDetails}
                        availablePens={locations.pens}
                        editSubBatch={subBatch}
                        onSubmit={async (input: CreateSubBatchInput) => { await createSubBatch(input); }}
                        onUpdate={async (sid: string, input: Partial<CreateSubBatchInput>) => { await updateSubBatch(sid, input); }}
                        trigger={
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-fg-tertiary">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost" size="sm"
                        className="h-8 w-8 p-0 text-error hover:text-error"
                        onClick={() => setDeleteSubBatchId(subBatch.id)}
                        disabled={isDeletingSubBatch === subBatch.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-fg-tertiary">{t('noSubBatches')}</p>
          )}
        </div>
      )}

      {/* Delete sub-batch confirmation dialog */}
      <AlertDialog open={deleteSubBatchId !== null} onOpenChange={(open) => { if (!open) setDeleteSubBatchId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteSubBatch')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteSubBatchConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteSubBatchId(null)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteSubBatchId) handleDeleteSubBatch(deleteSubBatchId); setDeleteSubBatchId(null); }}
              className="bg-error text-button-destructive-fg hover:bg-error/90"
            >
              {t('confirmDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete batch confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteConfirmDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-error text-button-destructive-fg hover:bg-error/90"
            >
              {isDeleting ? t('deleting') : t('confirmDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
