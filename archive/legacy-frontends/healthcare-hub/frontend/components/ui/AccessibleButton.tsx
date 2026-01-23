"use client";

import React from 'react';
import { Button } from './Button';

interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  className?: string;
}

export function AccessibleButton({
  children,
  onClick,
  ariaLabel,
  ariaDescribedBy,
  role = 'button',
  tabIndex = 0,
  onKeyDown,
  className,
  ...props
}: AccessibleButtonProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
    onKeyDown?.(event);
  };

  return (
    <Button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}
