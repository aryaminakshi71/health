"use client";

import React, { createContext, useContext, useMemo } from "react";

type TabsContextValue = {
  value: string;
  onValueChange?: (v: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({ value, onValueChange, children, className }: { value: string; onValueChange?: (v: string) => void; children: React.ReactNode; className?: string; }) {
  const ctx = useMemo(() => ({ value, onValueChange }), [value, onValueChange]);
  return (
    <TabsContext.Provider value={ctx}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = useContext(TabsContext);
  if (!ctx) return null;
  const isActive = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx.onValueChange?.(value)}
      className={className || (isActive ? "px-3 py-2 border-b-2 border-blue-600" : "px-3 py-2 text-gray-600")}
      aria-pressed={isActive}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = useContext(TabsContext);
  if (!ctx) return null;
  if (ctx.value !== value) return null;
  return <div className={className}>{children}</div>;
}


