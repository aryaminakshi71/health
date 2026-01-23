class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observers = [];
  }

  startTimer(name) {
    this.metrics[name] = {
      startTime: performance.now(),
      endTime: null,
      duration: null
    };
  }

  endTimer(name) {
    if (this.metrics[name]) {
      this.metrics[name].endTime = performance.now();
      this.metrics[name].duration = this.metrics[name].endTime - this.metrics[name].startTime;
    }
  }

  getMetrics() {
    return Object.keys(this.metrics).map(name => ({
      name,
      duration: this.metrics[name].duration,
      durationMs: this.metrics[name].duration?.toFixed(2) + 'ms'
    }));
  }

  measurePageLoad() {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        this.metrics.pageLoad = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
        };
      });
    }
  }

  observeLargestContentfulPaint() {
    if (typeof window !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  observeFirstInputDelay() {
    if (typeof window !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
