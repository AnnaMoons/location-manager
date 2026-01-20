'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  iconOnly?: boolean;
}

export function LanguageSwitcher({ className, iconOnly = false }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('es');

  useEffect(() => {
    setMounted(true);
    const locale = document.cookie
      .split('; ')
      .find((row) => row.startsWith('locale='))
      ?.split('=')[1] || 'es';
    setCurrentLocale(locale);
  }, []);

  const toggleLanguage = () => {
    startTransition(() => {
      const newLocale = currentLocale === 'es' ? 'en' : 'es';
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
      window.location.reload();
    });
  };

  // Show consistent content during SSR and initial hydration
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size={iconOnly ? 'icon' : 'sm'}
        disabled
        className={cn('flex items-center gap-2', className)}
        title={iconOnly ? 'Language' : undefined}
      >
        <Globe className="h-4 w-4" />
        {!iconOnly && <span className="uppercase font-medium w-6">--</span>}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size={iconOnly ? 'icon' : 'sm'}
      onClick={toggleLanguage}
      disabled={isPending}
      className={cn('flex items-center gap-2', className)}
      title={iconOnly ? (currentLocale === 'es' ? 'Switch to English' : 'Cambiar a Español') : undefined}
    >
      <Globe className="h-4 w-4" />
      {!iconOnly && (
        <span className="uppercase font-medium">
          {currentLocale === 'es' ? 'EN' : 'ES'}
        </span>
      )}
    </Button>
  );
}
