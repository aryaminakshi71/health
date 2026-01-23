"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { Navigation } from './Navigation';

interface CommonLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showNavigation?: boolean;
  appName?: string;
  appDescription?: string;
  sidebarAppType?: string;
  sidebarModules?: any[];
  onSidebarModuleClick?: (module: any) => void;
}

export function CommonLayout({ 
  children, 
  showSidebar = true, 
  showNavigation = true,
  appName = "ERP Application",
  appDescription = "Enterprise Resource Planning System",
  sidebarAppType,
  sidebarModules,
  onSidebarModuleClick
}: CommonLayoutProps) {
  const [density, setDensity] = useState<'comfortable'|'compact'|'ultra'>(() => {
    if (typeof window === 'undefined') return 'compact';
    return (localStorage.getItem('ui-density') as any) || 'compact';
  });
  useEffect(() => { try { localStorage.setItem('ui-density', density); } catch {} }, [density]);
  const densityClass = density === 'ultra' ? 'text-xs' : density === 'compact' ? 'text-sm' : 'text-base';
  return (
    <div className="min-h-screen bg-background">
      <Header appName={appName} appDescription={appDescription} />
      <div className="flex min-w-0">
        {showSidebar && (
          <Sidebar 
            appType={sidebarAppType}
            modules={sidebarModules}
            onModuleClick={onSidebarModuleClick}
          />
        )}
        <main className="flex-1 min-w-0">
          {showNavigation && <Navigation />}
          <div className={`p-4 md:p-4 lg:p-4 xl:p-6 max-w-[1600px] mx-auto w-full ${densityClass}`}>
            <div className="flex items-center justify-end mb-2">
              <label className="text-xs text-gray-600 mr-2">Density</label>
              <select value={density} onChange={(e)=> setDensity(e.target.value as any)} className="border rounded px-2 py-1 text-xs">
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
                <option value="ultra">Ultra</option>
              </select>
            </div>
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
} 