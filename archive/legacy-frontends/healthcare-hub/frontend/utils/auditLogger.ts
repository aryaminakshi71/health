interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}

class AuditLogger {
  private logs: AuditLog[] = [];

  log(userId: string, action: string, resource: string, details?: any) {
    const log: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      action,
      resource,
      timestamp: new Date(),
      ipAddress: typeof window !== 'undefined' ? 'client-side' : 'server-side',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server-side',
      details,
    };

    this.logs.push(log);
    
    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(log);
    }
  }

  private sendToLoggingService(log: AuditLog) {
    // Implementation for sending to logging service
    console.log('Audit log:', log);
  }

  getLogs(userId?: string): AuditLog[] {
    if (userId) {
      return this.logs.filter(log => log.userId === userId);
    }
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

export const auditLogger = new AuditLogger();
