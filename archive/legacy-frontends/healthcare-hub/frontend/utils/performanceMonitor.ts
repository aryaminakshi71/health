// Performance monitoring utilities
export const performanceMonitor = {
  // Metrics storage
  metrics: {
    pageLoad: null as any,
    lcp: null as any,
    fid: null as any,
    customMetrics: {} as any
  },

  // Monitor page load performance
  monitorPageLoad: () => {
    if (typeof window !== 'undefined') {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const pageLoadData = {
        pageLoad: {
          totalTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        }
      };
      performanceMonitor.metrics.pageLoad = pageLoadData;
      return pageLoadData;
    }
    return null;
  },

  // Measure page load (alias for monitorPageLoad)
  measurePageLoad: () => {
    return performanceMonitor.monitorPageLoad();
  },

  // Observe Largest Contentful Paint
  observeLargestContentfulPaint: () => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        performanceMonitor.metrics.lcp = lastEntry.startTime;
        console.log('LCP:', lastEntry.startTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  },

  // Observe First Input Delay
  observeFirstInputDelay: () => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const firstInputEntry = entry as PerformanceEventTiming;
          performanceMonitor.metrics.fid = firstInputEntry.processingStart - firstInputEntry.startTime;
          console.log('FID:', firstInputEntry.processingStart - firstInputEntry.startTime);
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    }
  },

  // Get all metrics
  getMetrics: () => {
    return performanceMonitor.metrics;
  },

  // Monitor API call performance
  monitorApiCall: async (apiCall: () => Promise<any>) => {
    const start = performance.now();
    try {
      const result = await apiCall();
      const end = performance.now();
      return {
        success: true,
        duration: end - start,
        result
      };
    } catch (error) {
      const end = performance.now();
      return {
        success: false,
        duration: end - start,
        error
      };
    }
  },

  // Monitor component render performance
  monitorComponentRender: (componentName: string) => {
    const start = performance.now();
    return {
      componentName,
      startTime: start,
      end: () => performance.now() - start
    };
  }
}; 