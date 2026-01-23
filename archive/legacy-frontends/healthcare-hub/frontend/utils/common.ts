// Common utility functions used across all applications

export const CommonUtils = {
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getStatusColor: (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'healthy':
      case 'completed':
        return 'text-green-600';
      case 'warning':
      case 'maintenance':
        return 'text-yellow-600';
      case 'critical':
      case 'failed':
      case 'inactive':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  },

  getIconForType: (type: string): string => {
    switch (type.toLowerCase()) {
      case 'document':
        return 'FileText';
      case 'image':
        return 'Image';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Music';
      case 'archive':
        return 'Archive';
      default:
        return 'File';
    }
  },

  calculateProgress: (current: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
  },

  formatCurrency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  generateId: (): string => {
    return Math.random().toString(36).substr(2, 9);
  },

  formatDate: (date: string | Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  formatDateTime: (date: string | Date): string => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};
