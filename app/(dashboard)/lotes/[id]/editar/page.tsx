'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingState';
import { BatchForm } from '@/components/batches/BatchForm';
import { useBatches } from '@/lib/hooks/useBatches';
import { CreateBatchInput, UpdateBatchInput } from '@/lib/types/batch';
import { validateBatchInput } from '@/lib/utils/validation';

export default function EditBatchPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const t = useTranslations('batches');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { getBatch, updateBatch, isLoading } = useBatches();

  const batch = getBatch(id);

  const [formData, setFormData] = useState<Partial<CreateBatchInput>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (batch) {
      setFormData({
        name: batch.name,
        species: batch.species,
        farmId: batch.farmId,
        barnIds: batch.barnIds || [],
        penIds: batch.penIds || [],
        animalCount: batch.animalCount,
        averageAgeAtStart: batch.averageAgeAtStart,
        startDate: batch.startDate,
        estimatedEndDate: batch.estimatedEndDate,
      });
    }
  }, [batch]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!batch) {
    return (
      <EmptyState
        title={t('notFound')}
        description={t('notFoundDesc')}
        actionLabel={t('backToList')}
        actionHref="/lotes"
      />
    );
  }

  const handleSubmit = async () => {
    const validation = validateBatchInput(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await updateBatch(id, formData as UpdateBatchInput);
      router.push(`/lotes/${id}`);
    } catch (error) {
      setErrors({ submit: t('updateError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title={t('editBatch')}
        subtitle={batch.name}
        showBack
        backHref={`/lotes/${id}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('batchInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <BatchForm
            initialData={formData}
            onChange={setFormData}
            errors={errors}
          />
        </CardContent>
      </Card>

      {errors.submit && (
        <p className="text-sm text-destructive text-center mt-4">
          {errors.submit}
        </p>
      )}

      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
          disabled={isSubmitting}
        >
          {tCommon('cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? <LoadingSpinner className="py-0" /> : tCommon('save')}
        </Button>
      </div>
    </div>
  );
}
