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
  CheckCircle,
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
import { useBatches } from '@/lib/hooks/useBatches';
import { useLocations } from '@/lib/hooks/useLocations';
import { getLocationPath } from '@/lib/types/location';

export default function BatchDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const t = useTranslations('batches');
  const tSpecies = useTranslations('locations.species');
  const router = useRouter();
  const { getBatchWithDetails, updateBatch, deleteBatch, isLoading } =
    useBatches();
  const { locations } = useLocations();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const batchDetails = getBatchWithDetails(id);

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

  const locationPath = batchDetails.location
    ? getLocationPath(locations, batchDetails.locationId)
    : [];

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

  const handleStatusChange = async (
    newStatus: 'active' | 'completed' | 'cancelled'
  ) => {
    setIsUpdating(true);
    try {
      await updateBatch(id, { status: newStatus });
    } catch (error) {
      console.error('Error updating batch:', error);
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
            {/* Location Path */}
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{t('location')}</p>
                <p className="text-sm text-muted-foreground">
                  {locationPath.map((l) => l.name).join(' → ')}
                </p>
              </div>
            </div>

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
                    {batchDetails.daysRemaining !== null && (
                      <span className="ml-2">
                        ({batchDetails.daysRemaining} {t('daysRemaining')})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('actions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {batchDetails.status === 'active' && (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange('completed')}
                  disabled={isUpdating}
                >
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  {t('markCompleted')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={isUpdating}
                >
                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                  {t('markCancelled')}
                </Button>
              </>
            )}
            {batchDetails.status === 'completed' && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleStatusChange('active')}
                disabled={isUpdating}
              >
                <Clock className="h-4 w-4 mr-2" />
                {t('reactivate')}
              </Button>
            )}
            {batchDetails.status === 'cancelled' && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleStatusChange('active')}
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
