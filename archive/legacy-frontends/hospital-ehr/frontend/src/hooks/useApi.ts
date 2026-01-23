'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiOptions<T> {
    initialData?: T;
    enabled?: boolean;
    refetchInterval?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
}

interface UseApiReturn<T> {
    data: T | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    mutate: (newData: T | ((prev: T | undefined) => T)) => void;
}

export function useApi<T>(
    fetcher: () => Promise<T>,
    options: UseApiOptions<T> = {}
): UseApiReturn<T> {
    const { initialData, enabled = true, refetchInterval, onSuccess, onError } = options;
    
    const [data, setData] = useState<T | undefined>(initialData);
    const [isLoading, setIsLoading] = useState(enabled);
    const [error, setError] = useState<Error | null>(null);
    
    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    const fetch = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await fetcherRef.current();
            setData(result);
            onSuccess?.(result);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('An error occurred');
            setError(error);
            onError?.(error);
        } finally {
            setIsLoading(false);
        }
    }, [onSuccess, onError]);

    useEffect(() => {
        if (enabled) {
            fetch();
        }
    }, [enabled, fetch]);

    // Refetch interval
    useEffect(() => {
        if (!refetchInterval || !enabled) return;

        const interval = setInterval(fetch, refetchInterval);
        return () => clearInterval(interval);
    }, [refetchInterval, enabled, fetch]);

    const mutate = useCallback((newData: T | ((prev: T | undefined) => T)) => {
        setData(prev => typeof newData === 'function' ? (newData as (prev: T | undefined) => T)(prev) : newData);
    }, []);

    return {
        data,
        isLoading,
        error,
        refetch: fetch,
        mutate,
    };
}

// ============ MUTATION HOOK ============
interface UseMutationOptions<TData, TVariables> {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
}

interface UseMutationReturn<TData, TVariables> {
    mutate: (variables: TVariables) => Promise<TData>;
    mutateAsync: (variables: TVariables) => Promise<TData>;
    isLoading: boolean;
    error: Error | null;
    data: TData | undefined;
    reset: () => void;
}

export function useMutation<TData, TVariables>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options: UseMutationOptions<TData, TVariables> = {}
): UseMutationReturn<TData, TVariables> {
    const { onSuccess, onError, onSettled } = options;
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<TData | undefined>(undefined);

    const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await mutationFn(variables);
            setData(result);
            onSuccess?.(result, variables);
            onSettled?.(result, null, variables);
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Mutation failed');
            setError(error);
            onError?.(error, variables);
            onSettled?.(undefined, error, variables);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [mutationFn, onSuccess, onError, onSettled]);

    const mutate = useCallback((variables: TVariables) => {
        mutateAsync(variables).catch(() => {});
        return mutateAsync(variables);
    }, [mutateAsync]);

    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setData(undefined);
    }, []);

    return {
        mutate,
        mutateAsync,
        isLoading,
        error,
        data,
        reset,
    };
}

// ============ PAGINATION HOOK ============
interface UsePaginatedApiOptions<T> {
    initialPage?: number;
    pageSize?: number;
    enabled?: boolean;
}

interface PaginatedData<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export function usePaginatedApi<T>(
    fetcher: (page: number, limit: number) => Promise<PaginatedData<T>>,
    options: UsePaginatedApiOptions<T> = {}
) {
    const { initialPage = 1, pageSize = 20, enabled = true } = options;
    
    const [page, setPage] = useState(initialPage);
    const [data, setData] = useState<T[]>([]);
    const [pagination, setPagination] = useState({
        page: initialPage,
        limit: pageSize,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
    });
    const [isLoading, setIsLoading] = useState(enabled);
    const [error, setError] = useState<Error | null>(null);

    const fetch = useCallback(async (pageNum: number) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await fetcher(pageNum, pageSize);
            setData(result.data);
            setPagination(result.pagination);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch'));
        } finally {
            setIsLoading(false);
        }
    }, [fetcher, pageSize]);

    useEffect(() => {
        if (enabled) {
            fetch(page);
        }
    }, [page, enabled, fetch]);

    const goToPage = useCallback((pageNum: number) => {
        if (pageNum >= 1 && pageNum <= pagination.totalPages) {
            setPage(pageNum);
        }
    }, [pagination.totalPages]);

    const nextPage = useCallback(() => {
        if (pagination.hasNext) {
            setPage(p => p + 1);
        }
    }, [pagination.hasNext]);

    const prevPage = useCallback(() => {
        if (pagination.hasPrev) {
            setPage(p => p - 1);
        }
    }, [pagination.hasPrev]);

    return {
        data,
        pagination,
        isLoading,
        error,
        page,
        goToPage,
        nextPage,
        prevPage,
        refetch: () => fetch(page),
    };
}
