"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BackLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function BackLink({ href, children, className = '' }: BackLinkProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 ${className}`}
      onClick={() => window.history.back()}
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Button>
  );
}
