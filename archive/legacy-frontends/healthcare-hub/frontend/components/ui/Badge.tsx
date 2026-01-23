"use client";

import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({ variant = "default", className = "", ...props }: BadgeProps) {
  const base = "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium leading-none";
  const styles =
    variant === "secondary"
      ? "bg-gray-100 text-gray-800 border border-gray-200"
      : variant === "destructive"
      ? "bg-red-100 text-red-800 border border-red-200"
      : variant === "outline"
      ? "bg-transparent text-gray-800 border border-gray-300"
      : "bg-blue-100 text-blue-800 border border-blue-200";
  return <span className={`${base} ${styles} ${className}`} {...props} />;
}

export default Badge;


