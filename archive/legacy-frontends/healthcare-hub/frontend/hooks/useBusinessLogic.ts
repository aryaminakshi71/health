// Common business logic hook

import { useState, useEffect } from 'react';
import { useDataFetching } from './useDataFetching';

interface UseBusinessLogicOptions {
  endpoint: string;
  refreshInterval?: number;
  autoRefresh?: boolean;
}

export function useBusinessLogic<T>({
  endpoint,
  refreshInterval = 30000,
  autoRefresh = true
}: UseBusinessLogicOptions) {
  const { data, loading, error, refetch } = useDataFetching<T>({
    url: endpoint,
    method: 'GET'
  });

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch();
        setLastUpdated(new Date());
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refetch]);

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated
  };
}
