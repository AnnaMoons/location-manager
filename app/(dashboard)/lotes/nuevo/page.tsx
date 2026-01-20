'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingState';
import { BatchForm } from '@/components/batches/BatchForm';
import { useBatches } from '@/lib/hooks/useBatches';
import { CreateBatchInput } from '@/lib/types/batch';
import { validateBatchInput } from '@/lib/utils/validation';

export default function NewBatchPage() {
  const t = useTranslations('batches');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { createBatch } = useBatches();

  const [formData, setFormData] = useState<Partial<CreateBatchInput>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const validation = validateBatchInput(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const newBatch = await createBatch(formData as CreateBatchInput);
      router.push(`/lotes/${newBatch.id}`);
    } catch (error) {
      setErrors({ submit: t('createError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title={t('newBatch')}
        subtitle={t('newBatchDesc')}
        showBack
        backHref="/lotes"
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
