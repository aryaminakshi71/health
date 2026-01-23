// Code splitting utilities for better performance

import { lazy, Suspense } from 'react';

// Lazy load components
export const lazyLoad = (importFunc: () => Promise<any>, fallback?: React.ReactNode) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: any) => (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Preload components
export const preloadComponent = (importFunc: () => Promise<any>) => {
  return () => {
    importFunc();
  };
};

// Dynamic imports for better performance
export const dynamicImport = async (module: string) => {
  try {
    const result = await import(module);
    return result.default || result;
  } catch (error) {
    console.error(`Failed to load module: ${module}`, error);
    throw error;
  }
};

// Bundle analyzer
export const analyzeBundle = () => {
  if (typeof window !== 'undefined') {
    const scripts = document.querySelectorAll('script[src]');
    const totalSize = Array.from(scripts).reduce((size, script) => {
      const src = script.getAttribute('src');
      if (src && src.includes('chunk')) {
        return size + 1; // Count chunks
      }
      return size;
    }, 0);
    
    console.log(`Bundle contains ${totalSize} chunks`);
    return totalSize;
  }
  return 0;
};
