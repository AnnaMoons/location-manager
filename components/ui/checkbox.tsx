'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          ref={ref}
          onChange={handleChange}
          className={cn(
            'peer h-4 w-4 shrink-0 rounded-sm border border-primary',
            'ring-offset-background focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'appearance-none cursor-pointer',
            'checked:bg-primary checked:border-primary',
            className
          )}
          {...props}
        />
        <Check
          className={cn(
            'absolute h-3 w-3 text-primary-foreground pointer-events-none',
            'opacity-0 peer-checked:opacity-100',
            'left-0.5 top-0.5'
          )}
        />
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export interface CheckboxGroupProps {
  options: { value: string; label: string; disabled?: boolean }[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  disabled?: boolean;
}

const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  ({ options, value, onChange, className, disabled }, ref) => {
    const handleToggle = (optionValue: string) => {
      if (value.includes(optionValue)) {
        onChange(value.filter((v) => v !== optionValue));
      } else {
        onChange([...value, optionValue]);
      }
    };

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border cursor-pointer',
              'hover:bg-accent/50 transition-colors',
              value.includes(option.value) && 'border-primary bg-accent/30',
              (disabled || option.disabled) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Checkbox
              checked={value.includes(option.value)}
              onCheckedChange={() => handleToggle(option.value)}
              disabled={disabled || option.disabled}
            />
            <span className="text-sm font-medium">{option.label}</span>
          </label>
        ))}
      </div>
    );
  }
);
CheckboxGroup.displayName = 'CheckboxGroup';

export { Checkbox, CheckboxGroup };
