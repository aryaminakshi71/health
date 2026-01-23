"use client";

import React, { ReactNode } from 'react';
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
}

export function CommonLayout({ 
  children, 
  showSidebar = true, 
  showNavigation = true,
  appName = "ERP Application",
  appDescription = "Enterprise Resource Planning System"
}: CommonLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header appName={appName} appDescription={appDescription} />
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main className="flex-1">
          {showNavigation && <Navigation />}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
} 