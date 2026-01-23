"use client";

import * as React from "react";

export function Select({ children, value, onValueChange, className }: { children: React.ReactNode; value?: string; onValueChange?: (v: string)=>void; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function SelectTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  return <button type="button" className={className}>{children}</button>;
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span>{placeholder || ''}</span>;
}

export function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function SelectItem({ children, value, onSelect, className }: { children: React.ReactNode; value: string; onSelect?: (v: string)=>void; className?: string }) {
  return <div className={className} onClick={() => onSelect?.(value)}>{children}</div>;
}


