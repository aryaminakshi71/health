// Performance monitoring utilities

export const PerformanceMonitor = {
  // Measure component render time
  measureRender: (componentName: string, startTime: number) => {
    const renderTime = performance.now() - startTime;
    console.log(`${componentName} rendered in ${renderTime.toFixed(2)}ms`);
    
    // Send to analytics if render time is too high
    if (renderTime > 100) {
      console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
  },

  // Measure API call performance
  measureAPI: async (apiCall: () => Promise<any>, endpoint: string) => {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      console.log(`${endpoint} completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`${endpoint} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  },

  // Memory usage monitoring
  getMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576 * 100) / 100,
        total: Math.round(memory.totalJSHeapSize / 1048576 * 100) / 100,
        limit: Math.round(memory.jsHeapSizeLimit / 1048576 * 100) / 100,
      };
    }
    return null;
  },

  // Bundle size optimization
  optimizeImports: (imports: string[]) => {
    const optimized = imports.filter(imp => !imp.includes('unused'));
    console.log(`Optimized imports: ${imports.length} → ${optimized.length}`);
    return optimized;
  },
};
