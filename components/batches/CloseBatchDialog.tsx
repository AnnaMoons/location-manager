'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Batch, CloseBatchInput, requiresCloseReason } from '@/lib/types/batch';
import { validateCloseBatchInput } from '@/lib/utils/validation';
import { cn } from '@/lib/utils';

interface CloseBatchDialogProps {
  batch: Batch;
  onClose: (input: CloseBatchInput) => Promise<void>;
  trigger?: React.ReactNode;
}

export function CloseBatchDialog({ batch, onClose, trigger }: CloseBatchDialogProps) {
  const t = useTranslations('batches.close');
  const tCommon = useTranslations('common');

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [closeType, setCloseType] = useState<'completed' | 'cancelled'>('completed');
  const [closedDate, setClosedDate] = useState(new Date().toISOString().split('T')[0]);
  const [closeReason, setCloseReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate if reason is required based on current date selection
  const reasonRequired = closedDate
    ? requiresCloseReason(batch, new Date(closedDate).toISOString())
    : false;

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setCloseType('completed');
      setClosedDate(new Date().toISOString().split('T')[0]);
      setCloseReason('');
      setErrors({});
    }
  }, [open]);

  const handleSubmit = async () => {
    const input: CloseBatchInput = {
      closeType,
      closedDate: new Date(closedDate).toISOString(),
      closeReason: closeReason.trim() || undefined,
    };

    const validation = validateCloseBatchInput(input, batch);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onClose(input);
      setOpen(false);
    } catch (error) {
      setErrors({ submit: 'Error al cerrar el lote. Intenta de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <XCircle className="h-4 w-4 mr-2" />
            {t('title')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Close Type Selection */}
          <div className="space-y-3">
            <Label>{t('closeType')}</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCloseType('completed')}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border transition-colors',
                  closeType === 'completed'
                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                    : 'border-border hover:bg-accent/50'
                )}
              >
                <CheckCircle
                  className={cn(
                    'h-5 w-5',
                    closeType === 'completed' ? 'text-green-600' : 'text-muted-foreground'
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    closeType === 'completed' && 'text-green-700 dark:text-green-300'
                  )}
                >
                  {t('completed')}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setCloseType('cancelled')}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border transition-colors',
                  closeType === 'cancelled'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950'
                    : 'border-border hover:bg-accent/50'
                )}
              >
                <XCircle
                  className={cn(
                    'h-5 w-5',
                    closeType === 'cancelled' ? 'text-red-600' : 'text-muted-foreground'
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    closeType === 'cancelled' && 'text-red-700 dark:text-red-300'
                  )}
                >
                  {t('cancelled')}
                </span>
              </button>
            </div>
            {errors.closeType && (
              <p className="text-sm text-destructive">{errors.closeType}</p>
            )}
          </div>

          {/* Closed Date */}
          <div className="space-y-2">
            <Label htmlFor="closedDate">{t('closedDate')} (*)</Label>
            <Input
              id="closedDate"
              type="date"
              value={closedDate}
              onChange={(e) => setClosedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.closedDate && (
              <p className="text-sm text-destructive">{errors.closedDate}</p>
            )}
          </div>

          {/* Close Reason */}
          <div className="space-y-2">
            <Label htmlFor="closeReason">
              {t('closeReason')} {reasonRequired && '(*)'}
            </Label>
            {reasonRequired && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                <p className="text-xs">{t('reasonRequiredHint')}</p>
              </div>
            )}
            <textarea
              id="closeReason"
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              placeholder={reasonRequired ? t('reasonRequired') : ''}
              rows={3}
              className={cn(
                'flex min-h-[80px] w-full rounded-md border border-input bg-background',
                'px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              )}
            />
            {errors.closeReason && (
              <p className="text-sm text-destructive">{errors.closeReason}</p>
            )}
          </div>
        </div>

        {errors.submit && (
          <p className="text-sm text-destructive text-center">{errors.submit}</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? tCommon('loading') : tCommon('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
