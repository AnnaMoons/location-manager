'use client';

import { FormEvent, KeyboardEvent, ReactNode } from 'react';

interface SafeFormProps {
  children: ReactNode;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  className?: string;
}

/**
 * H-040: Form wrapper that prevents accidental submission via Enter key.
 * Only allows submission from button clicks, not from pressing Enter in input fields.
 */
export function SafeForm({ children, onSubmit, className }: SafeFormProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (
      e.key === 'Enter' &&
      (e.target as HTMLElement).tagName !== 'BUTTON' &&
      (e.target as HTMLElement).tagName !== 'TEXTAREA'
    ) {
      e.preventDefault();
    }
  };

  return (
    <form onSubmit={onSubmit} onKeyDown={handleKeyDown} className={className}>
      {children}
    </form>
  );
}
