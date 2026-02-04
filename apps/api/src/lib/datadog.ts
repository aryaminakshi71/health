/**
 * Datadog APM Integration
 * 
 * Provides application performance monitoring with Datadog.
 * Gracefully degrades if DATADOG_API_KEY is not configured.
 */

// Lazy load tracer to avoid bundling issues in web context
let tracer: any = null;
let tracerPromise: Promise<any> | null = null;

async function loadTracer() {
  if (tracer) return tracer;
  if (tracerPromise) return tracerPromise;
  
  tracerPromise = (async () => {
    try {
      // Only import in Node.js/API context, not in Cloudflare Workers/web context
      if (typeof process !== 'undefined' && process.versions?.node) {
        const ddTrace = await import("dd-trace");
        tracer = ddTrace;
        return ddTrace;
      }
    } catch {
      // dd-trace not available (e.g., in web/Cloudflare context)
    }
    return null;
  })();
  
  return tracerPromise;
}

const isConfigured = !!process.env.DATADOG_API_KEY;

if (!isConfigured) {
  console.warn("DATADOG_API_KEY not set - APM disabled");
}

/**
 * Initialize Datadog APM
 * Call this early in your application startup
 */
export async function initDatadog() {
  if (!isConfigured) return;
  
  const loadedTracer = await loadTracer();
  if (!loadedTracer) return; // Skip if tracer not loaded (e.g., in web context)

  try {
    loadedTracer.init({
    service: process.env.DATADOG_SERVICE_NAME || "health-api",
    env: process.env.DATADOG_ENV || process.env.NODE_ENV || "development",
    version: process.env.DATADOG_VERSION || "1.0.0",
    logInjection: true,
    runtimeMetrics: true,
    profiling: true,
    appsec: true,
    plugins: {
      http: {
        enabled: true,
        blocklist: ["/health", "/metrics"],
      },
      fetch: {
        enabled: true,
      },
    },
  });
  } catch (error) {
    console.warn("Datadog tracer.init() failed (this is OK in dev):", error);
  }
}

/**
 * Create a span for tracing
 */
export async function createSpan<T>(
  name: string,
  operation: string,
  callback: () => T | Promise<T>
): Promise<T> {
  if (!isConfigured) {
    return callback();
  }

  const loadedTracer = await loadTracer();
  if (!loadedTracer) {
    return callback();
  }

  return loadedTracer.trace(name, { type: operation }, callback);
}

/**
 * Add tags to current span
 */
export function addTags(tags: Record<string, string | number | boolean>): void {
  if (!isConfigured) return;
  // Tags are added via span.setTag() in trace callbacks
  // This is a no-op for compatibility
}

/**
 * Set error on current span
 */
export function setError(error: Error): void {
  if (!isConfigured) return;
  // Errors are set via span.setError() in trace callbacks
  // This is a no-op for compatibility
}

export { tracer };
