"use client";

import React from 'react';

interface TextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  rows?: number;
}

export function Textarea({
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false,
  required = false,
  name,
  id,
  rows = 4,
  ...props
}: TextareaProps) {
  const baseClasses = 'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`${baseClasses} ${className}`}
      disabled={disabled}
      required={required}
      name={name}
      id={id}
      rows={rows}
      {...props}
    />
  );
} 