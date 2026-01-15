import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Responsive Inputs with proper keyboard types (section 8)

export function PhoneInput({ value, onChange, ...props }) {
  return (
    <Input
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

export function EmailInput({ value, onChange, ...props }) {
  return (
    <Input
      type="email"
      inputMode="email"
      autoComplete="email"
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

export function NumberInput({ value, onChange, ...props }) {
  return (
    <Input
      type="number"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

export function PriceInput({ value, onChange, ...props }) {
  return (
    <Input
      type="number"
      inputMode="decimal"
      step="0.01"
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

export function URLInput({ value, onChange, ...props }) {
  return (
    <Input
      type="url"
      inputMode="url"
      autoComplete="url"
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

export function SearchInput({ value, onChange, ...props }) {
  return (
    <Input
      type="search"
      inputMode="search"
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

export function DateInput({ value, onChange, ...props }) {
  return (
    <Input
      type="date"
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

export function TextAreaInput({ value, onChange, ...props }) {
  return (
    <Textarea
      value={value}
      onChange={onChange}
      className="min-h-[100px] touch-manipulation"
      {...props}
    />
  );
}