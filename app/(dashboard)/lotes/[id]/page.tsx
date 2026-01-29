'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Edit,
  Trash2,
  Building2,
  Cpu,
  Scale,
  Thermometer,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingState';
import { CloseBatchDialog } from '@/components/batches/CloseBatchDialog';
import { useBatches } from '@/lib/hooks/useBatches';
import { CloseBatchInput } from '@/lib/types/batch';

export default function BatchDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const t = useTranslations('batches');
  const tSpecies = useTranslations('locations.species');
  const tTypes = useTranslations('locations.types');
  const tDevices = useTranslations('devices');
  const router = useRouter();
  const {
    getBatchWithFullDetails,
    updateBatch,
    deleteBatch,
    closeBatch,
    isLoading,
  } = useBatches();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const batchDetails = getBatchWithFullDetails(id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!batchDetails) {
    return (
      <EmptyState
        title={t('notFound')}
        description={t('notFoundDesc')}
        actionLabel={t('backToList')}
        actionHref="/lotes"
      />
    );
  }

  const { locations, devices: batchDevices } = batchDetails;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBatch(id);
      router.push('/lotes');
    } catch (error) {
      console.error('Error deleting batch:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseBatch = async (input: CloseBatchInput) => {
    setIsUpdating(true);
    try {
      await closeBatch(id, input);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReactivate = async () => {
    setIsUpdating(true);
    try {
      await updateBatch(id, { status: 'active', closedDate: undefined, closeReason: undefined });
    } catch (error) {
      console.error('Error reactivating batch:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={batchDetails.name}
        subtitle={tSpecies(batchDetails.species)}
        showBack
        backHref="/lotes"
        actions={
          <div className="flex gap-2">
            <Link href={`/lotes/${id}/editar`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                {t('edit')}
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('delete')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('deleteConfirmDesc')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? t('deleting') : t('confirmDelete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('details')}</CardTitle>
              <Badge className={getStatusColor(batchDetails.status)}>
                {t(`status.${batchDetails.status}`)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Animal Count */}
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{t('animalCount')}</p>
                <p className="text-sm text-muted-foreground">
                  {batchDetails.animalCount.toLocaleString()} {t('animals')}
                </p>
              </div>
            </div>

            {/* Current Age */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{t('currentAge')}</p>
                <p className="text-sm text-muted-foreground">
                  {batchDetails.currentAge} {t('days')}
                </p>
              </div>
            </div>

            {/* Start Date */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{t('startDate')}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(batchDetails.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Initial Age */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{t('initialAge')}</p>
                <p className="text-sm text-muted-foreground">
                  {batchDetails.averageAgeAtStart} {t('days')}
                </p>
              </div>
            </div>

            {/* Estimated End Date */}
            {batchDetails.estimatedEndDate && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{t('estimatedEndDate')}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(batchDetails.estimatedEndDate).toLocaleDateString()}
                    {batchDetails.daysRemaining !== null && batchDetails.status === 'active' && (
                      <span className="ml-2">
                        ({batchDetails.daysRemaining} {t('daysRemaining')})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Closure Info (if closed) */}
            {batchDetails.closedDate && (
              <div className="pt-4 border-t space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{t('closedDate')}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(batchDetails.closedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {batchDetails.closeReason && (
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{t('closeReason')}</p>
                      <p className="text-sm text-muted-foreground">
                        {batchDetails.closeReason}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribution Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('distribution')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Farm */}
            {locations.farm && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {tTypes('farm')}
                </p>
                <Badge variant="outline" className="text-base py-1 px-3">
                  {locations.farm.name}
                </Badge>
              </div>
            )}

            {/* Barns */}
            {locations.barns.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t('barns')} ({locations.barns.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {locations.barns.map((barn) => (
                    <Badge key={barn.id} variant="secondary">
                      {barn.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Pens */}
            {locations.pens.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t('pens')} ({locations.pens.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {locations.pens.map((pen) => (
                    <Badge key={pen.id} variant="secondary">
                      {pen.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Devices Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              {t('devices')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Weight Devices */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Scale className="h-4 w-4" />
                {t('weightDevices')}
              </p>
              {batchDevices.weightDevices.length > 0 ? (
                <div className="space-y-2">
                  {batchDevices.weightDevices.map((device) => (
                    <Link
                      key={device.id}
                      href={`/dispositivos/${device.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <Badge variant="outline">
                        {tDevices(`types.${device.type}`)}
                      </Badge>
                      <span className="text-sm">{device.serialNumber}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('noDevices')}</p>
              )}
            </div>

            {/* Environment Devices */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                {t('environmentDevices')}
              </p>
              {batchDevices.environmentDevices.length > 0 ? (
                <div className="space-y-2">
                  {batchDevices.environmentDevices.map((device) => (
                    <Link
                      key={device.id}
                      href={`/dispositivos/${device.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <Badge variant="outline">
                        {tDevices(`types.${device.type}`)}
                      </Badge>
                      <span className="text-sm">{device.serialNumber}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('noDevices')}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('actions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {batchDetails.status === 'active' && (
              <CloseBatchDialog
                batch={batchDetails}
                onClose={handleCloseBatch}
                trigger={
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={isUpdating}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {t('closeBatch')}
                  </Button>
                }
              />
            )}
            {(batchDetails.status === 'completed' || batchDetails.status === 'cancelled') && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleReactivate}
                disabled={isUpdating}
              >
                <Clock className="h-4 w-4 mr-2" />
                {t('reactivate')}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
