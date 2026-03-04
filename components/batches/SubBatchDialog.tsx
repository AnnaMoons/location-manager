'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Batch, CreateSubBatchInput, SubBatch, SubBatchPenAssignment } from '@/lib/types/batch';
import { Location } from '@/lib/types/location';
import { useLocations } from '@/lib/hooks/useLocations';
import { useData } from '@/lib/context/DataContext';

interface SubBatchDialogProps {
  batch: Batch;
  availablePens: Location[];
  onSubmit: (input: CreateSubBatchInput) => Promise<void>;
  onUpdate?: (id: string, input: Partial<CreateSubBatchInput>) => Promise<void>;
  editSubBatch?: SubBatch;
  trigger?: React.ReactNode;
}

export function SubBatchDialog({ 
  batch, 
  availablePens, 
  onSubmit, 
  onUpdate, 
  editSubBatch, 
  trigger 
}: SubBatchDialogProps) {
  const isEditMode = !!editSubBatch;
  const t = useTranslations('batches');
  const tForm = useTranslations('batches.form');
  const { getChildren } = useLocations();
  const { subBatches } = useData();

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    sex: 'male' | 'female';
    penAssignments: SubBatchPenAssignment[];
  }>({
    name: '',
    sex: 'male',
    penAssignments: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get pens already assigned to other sub-batches (excluding current batch's sub-batches)
  // In edit mode, exclude the current sub-batch's pens
  const usedPenIds = useMemo(() => {
    const used = new Set<string>();
    const otherSubBatches = subBatches.filter(sb => 
      sb.parentBatchId === batch.id && 
      (!isEditMode || sb.id !== editSubBatch?.id)
    );
    otherSubBatches.forEach(sb => {
      sb.penAssignments?.forEach(pa => used.add(pa.penId));
    });
    return used;
  }, [subBatches, batch.id, isEditMode, editSubBatch]);

  // Get available pens not yet assigned
  const unusedPens = useMemo(() => {
    return availablePens.filter(pen => !usedPenIds.has(pen.id));
  }, [availablePens, usedPenIds]);

  // Get pens grouped by barn
  const pensGroupedByBarn = useMemo(() => {
    const grouped: Record<string, Location[]> = {};
    unusedPens.forEach((pen) => {
      const barnId = pen.parentId || '';
      if (!grouped[barnId]) {
        grouped[barnId] = [];
      }
      grouped[barnId].push(pen);
    });
    return grouped;
  }, [unusedPens]);

  const usedPensGroupedByBarn = useMemo(() => {
    const grouped: Record<string, Location[]> = {};
    availablePens.forEach((pen) => {
      if (usedPenIds.has(pen.id)) {
        const barnId = pen.parentId || '';
        if (!grouped[barnId]) {
          grouped[barnId] = [];
        }
        grouped[barnId].push(pen);
      }
    });
    return grouped;
  }, [availablePens, usedPenIds]);

  useEffect(() => {
    if (open) {
      if (isEditMode && editSubBatch) {
        setFormData({
          name: editSubBatch.name,
          sex: editSubBatch.sex,
          penAssignments: editSubBatch.penAssignments || [],
        });
      } else {
        setFormData({
          name: `${batch.name} - `,
          sex: 'male',
          penAssignments: [],
        });
      }
      setErrors({});
    }
  }, [open, batch.name, isEditMode, editSubBatch]);

  const getBarnName = (barnId: string): string => {
    const barn = getChildren(barnId).find(l => l.type === 'barn');
    return barn?.name || 'Galpón';
  };

  const handlePenToggle = (penId: string, isSelected: boolean) => {
    if (isSelected) {
      // Add pen with default count of 1
      setFormData(prev => ({
        ...prev,
        penAssignments: [...prev.penAssignments, { penId, animalCount: 1 }],
      }));
    } else {
      // Remove pen
      setFormData(prev => ({
        ...prev,
        penAssignments: prev.penAssignments.filter(pa => pa.penId !== penId),
      }));
    }
  };

  const handleCountChange = (penId: string, count: number) => {
    setFormData(prev => ({
      ...prev,
      penAssignments: prev.penAssignments.map(pa =>
        pa.penId === penId ? { ...pa, animalCount: Math.max(0, count) } : pa
      ),
    }));
  };

  const totalAssigned = formData.penAssignments.reduce((sum, pa) => sum + pa.animalCount, 0);
  const remainingAnimals = batch.animalCount - totalAssigned;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('nameRequired');
    }

    if (formData.penAssignments.length === 0) {
      newErrors.penIds = t('selectAtLeastOnePen');
    }

    if (formData.penAssignments.some(pa => !pa.animalCount || pa.animalCount <= 0)) {
      newErrors.animalCount = t('animalCountRequired');
    }

    if (totalAssigned > batch.animalCount) {
      newErrors.animalCount = t('exceedsBatchCount');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode && editSubBatch && onUpdate) {
        await onUpdate(editSubBatch.id, {
          name: formData.name,
          sex: formData.sex,
          penAssignments: formData.penAssignments,
          animalCount: totalAssigned,
        });
      } else {
        await onSubmit({
          parentBatchId: batch.id,
          name: formData.name,
          sex: formData.sex,
          penAssignments: formData.penAssignments,
          animalCount: totalAssigned,
        });
      }
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPenSelected = (penId: string) => formData.penAssignments.some(pa => pa.penId === penId);
  const getPenCount = (penId: string) => formData.penAssignments.find(pa => pa.penId === penId)?.animalCount || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Crear sublote</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('editSubBatch') : t('createSubBatch')}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t('editSubBatchDesc') : t('createSubBatchDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Batch Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">{batch.name}</p>
            <p className="text-xs text-muted-foreground">
              {batch.animalCount} {t('animals')} disponibles
            </p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="subBatchName">{tForm('name')}</Label>
            <Input
              id="subBatchName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={tForm('namePlaceholder')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Sex */}
          <div className="space-y-2">
            <Label>{tForm('sex')}</Label>
            <Select
              value={formData.sex}
              onValueChange={(value: 'male' | 'female') => setFormData({ ...formData, sex: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{tForm('sexMale')}</SelectItem>
                <SelectItem value="female">{tForm('sexFemale')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pens Selection with Count */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t('selectPens')}</Label>
              <Badge variant={remainingAnimals >= 0 ? 'outline' : 'destructive'}>
                {remainingAnimals} / {batch.animalCount}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('selectPensWithCount')}
            </p>
            
            {/* Used Pens */}
            {Object.keys(usedPensGroupedByBarn).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{t('usedPens')}</p>
                {Object.entries(usedPensGroupedByBarn).map(([barnId, pens]) => (
                  <div key={barnId} className="space-y-1">
                    <p className="text-xs text-muted-foreground">{getBarnName(barnId)}</p>
                    <div className="flex flex-wrap gap-1">
                      {pens.map(pen => (
                        <Badge key={pen.id} variant="secondary" className="text-xs opacity-60">
                          {pen.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Available Pens */}
            {Object.keys(pensGroupedByBarn).length > 0 ? (
              Object.entries(pensGroupedByBarn).map(([barnId, pens]) => (
                <div key={barnId} className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {getBarnName(barnId)}
                  </p>
                  <div className="space-y-2">
                    {pens.map((pen) => {
                      const isSelected = isPenSelected(pen.id);
                      return (
                        <div
                          key={pen.id}
                          className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
                            isSelected ? 'border-primary bg-primary/5' : 'border-muted'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handlePenToggle(pen.id, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span className="flex-1 text-sm">{pen.name}</span>
                          {isSelected && (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="1"
                                value={getPenCount(pen.id)}
                                onChange={(e) => handleCountChange(pen.id, parseInt(e.target.value) || 0)}
                                className="w-16 h-8 text-center"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{t('noAvailablePens')}</p>
            )}
            
            {errors.penIds && (
              <p className="text-sm text-destructive">{errors.penIds}</p>
            )}
            {errors.animalCount && (
              <p className="text-sm text-destructive">{errors.animalCount}</p>
            )}
          </div>

          {/* Summary */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between text-sm">
              <span>{t('totalAssigned')}:</span>
              <span className={totalAssigned > batch.animalCount ? 'text-destructive font-medium' : 'font-medium'}>
                {totalAssigned} / {batch.animalCount}
              </span>
            </div>
            {remainingAnimals > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {remainingAnimals} {t('remaining')}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting 
              ? (isEditMode ? t('saving') : t('creating')) 
              : (isEditMode ? t('save') : t('create'))
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
