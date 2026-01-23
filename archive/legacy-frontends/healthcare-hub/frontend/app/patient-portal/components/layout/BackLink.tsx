"use client";

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function BackLink({ href, children }: { href: string; children?: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center text-blue-600 hover:underline">
      <ChevronLeft className="w-4 h-4 mr-1" />
      {children || 'Back'}
    </Link>
  );
}


