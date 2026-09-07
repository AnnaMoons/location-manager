'use client';

import * as React from 'react';
import DsCheckboxRaw from '@ds/components/atoms/Checkbox';
import DsCheckboxGroupRaw from '@ds/components/molecules/CheckboxGroup';

const DsCheckbox = DsCheckboxRaw as React.ComponentType<any>;
const DsCheckboxGroup = DsCheckboxGroupRaw as React.ComponentType<any>;

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  onCheckedChange?: (checked: boolean) => void;
}

function Checkbox({ onCheckedChange, className, ...props }: CheckboxProps) {
  return <DsCheckbox onChange={onCheckedChange} className={className} {...props} />;
}

export interface CheckboxGroupProps {
  options: { value: string; label: string; disabled?: boolean }[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  disabled?: boolean;
}

function CheckboxGroup({ options, value, onChange, disabled }: CheckboxGroupProps) {
  return (
    <DsCheckboxGroup
      options={options}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}

export { Checkbox, CheckboxGroup };
