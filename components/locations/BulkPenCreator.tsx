'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Location } from '@/lib/types/location';

interface BulkPenCreatorProps {
  parentBarn: Location;
  onCreatePens: (names: string[]) => Promise<void>;
  trigger?: React.ReactNode;
}

/**
 * H-025: Allows creating multiple pens at once for a barn.
 * User specifies a count and optional prefix, and pens are generated.
 */
export function BulkPenCreator({ parentBarn, onCreatePens, trigger }: BulkPenCreatorProps) {
  const t = useTranslations('locations.bulkCreate');

  const [open, setOpen] = useState(false);
  const [penCount, setPenCount] = useState(4);
  const [prefix, setPrefix] = useState('Corral');
  const [isCreating, setIsCreating] = useState(false);

  const generatedNames = Array.from({ length: penCount }, (_, i) => `${prefix} ${i + 1}`);

  const handleCreate = async () => {
    if (penCount < 1) return;
    setIsCreating(true);
    try {
      await onCreatePens(generatedNames);
      setOpen(false);
    } catch {
      // Error handled by parent
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            {t('createMultiple')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description', { barn: parentBarn.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('count')}</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={penCount}
                onChange={(e) => setPenCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('prefix')}</Label>
              <Input
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="Corral"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-xs text-fg-tertiary">{t('preview')}</Label>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border bg-surface-2/30 max-h-32 overflow-y-auto">
              {generatedNames.map((name, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface border text-xs"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isCreating}>
            {t('cancel')}
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || penCount < 1}>
            {isCreating ? t('creating') : t('create', { count: penCount })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
