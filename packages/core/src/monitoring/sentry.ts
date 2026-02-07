import * as Sentry from '@sentry/node';

let isInitialized = false;

export function initSentry(dsn?: string) {
  if (isInitialized || !dsn) {
    return;
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development',
    beforeSend(event) {
      if (event.exception?.values) {
        for (const exception of event.exception.values) {
          if (exception.mechanism?.type === 'onunhandledrejection') {
            continue;
          }
        }
      }
      return event;
    },
  });

  isInitialized = true;
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (!isInitialized) {
    console.error('[Sentry not initialized]', error, context);
    return;
  }

  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!isInitialized) {
    console.log(`[${level.toUpperCase()}] ${message}`);
    return;
  }

  Sentry.captureMessage(message, level as any);
}

export function setUserContext(userId: string, email?: string) {
  if (!isInitialized) {
    return;
  }

  Sentry.setUser({ id: userId, email });
}

export function addBreadcrumb(category: string, message: string, data?: Record<string, any>) {
  if (!isInitialized) {
    return;
  }

  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
}

export function startSpan(name: string, op: string, callback: () => Promise<any>) {
  if (!isInitialized) {
    return callback();
  }

  return Sentry.startSpan(
    {
      name,
      op,
    },
    callback
  );
}

export function getTransaction() {
  return isInitialized ? Sentry.getActiveSpan() : null;
}

export { Sentry };
