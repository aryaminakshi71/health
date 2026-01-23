"use client";

import React, { useEffect, useState } from 'react';
import { performanceMonitor } from '@/utils/performanceMonitor';

interface PerformanceMetrics {
  pageLoad?: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint?: number;
    firstContentfulPaint?: number;
  };
  lcp?: number;
  fid?: number;
  customMetrics: Array<{ name: string; duration: number; durationMs: string }>;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({ customMetrics: [] });

  useEffect(() => {
    // Start monitoring
    performanceMonitor.measurePageLoad();
    performanceMonitor.observeLargestContentfulPaint();
    performanceMonitor.observeFirstInputDelay();

    // Update metrics periodically
    const interval = setInterval(() => {
      setMetrics({
        pageLoad: performanceMonitor.metrics.pageLoad,
        lcp: performanceMonitor.metrics.lcp,
        fid: performanceMonitor.metrics.fid,
        customMetrics: [],
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50">
      <h3 className="font-bold mb-2">Performance Metrics</h3>
      {metrics.pageLoad && (
        <div className="mb-2">
          <div>DOM Content Loaded: {metrics.pageLoad.domContentLoaded.toFixed(2)}ms</div>
          <div>Load Complete: {metrics.pageLoad.loadComplete.toFixed(2)}ms</div>
          {metrics.pageLoad.firstPaint && (
            <div>First Paint: {metrics.pageLoad.firstPaint.toFixed(2)}ms</div>
          )}
          {metrics.pageLoad.firstContentfulPaint && (
            <div>FCP: {metrics.pageLoad.firstContentfulPaint.toFixed(2)}ms</div>
          )}
        </div>
      )}
      {metrics.lcp && <div>LCP: {metrics.lcp.toFixed(2)}ms</div>}
      {metrics.fid && <div>FID: {metrics.fid.toFixed(2)}ms</div>}
      {metrics.customMetrics.length > 0 && (
        <div className="mt-2">
          <div className="font-bold">Custom Metrics:</div>
          {metrics.customMetrics.map((metric) => (
            <div key={metric.name}>
              {metric.name}: {metric.durationMs}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
