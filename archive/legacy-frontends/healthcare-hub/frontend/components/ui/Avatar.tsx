"use client";

import * as React from "react";
import { cn } from "./lib/utils";

export function Avatar({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-gray-600",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt, className }: { src?: string; alt?: string; className?: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt || "avatar"} className={cn("h-full w-full object-cover", className)} />
  ) : null;
}

export function AvatarFallback({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("text-xs font-medium", className)}>
      {children}
    </span>
  );
}


