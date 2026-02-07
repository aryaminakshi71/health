export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
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

export function getPaginationParams(params: PaginationParams): { page: number; limit: number; offset: number } {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function getSearchParams(searchParams: URLSearchParams): PaginationParams {
  return {
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined,
  };
}

export function createPaginationLinks(
  baseUrl: string,
  page: number,
  totalPages: number,
  params: Record<string, string> = {}
): { first: string; prev: string | null; next: string | null; last: string } {
  const searchParams = new URLSearchParams(params);
  
  const firstParams = new URLSearchParams(searchParams);
  firstParams.set('page', '1');
  
  const prevParams = new URLSearchParams(searchParams);
  prevParams.set('page', String(Math.max(1, page - 1)));
  
  const nextParams = new URLSearchParams(searchParams);
  nextParams.set('page', String(Math.min(totalPages, page + 1)));
  
  const lastParams = new URLSearchParams(searchParams);
  lastParams.set('page', String(totalPages));

  return {
    first: `${baseUrl}?${firstParams.toString()}`,
    prev: page > 1 ? `${baseUrl}?${prevParams.toString()}` : null,
    next: page < totalPages ? `${baseUrl}?${nextParams.toString()}` : null,
    last: `${baseUrl}?${lastParams.toString()}`,
  };
}

export function cursorPaginate<T>(
  items: T[],
  cursor: string | null,
  limit: number,
  getCursorId: (item: T) => string
): { data: T[]; nextCursor: string | null } {
  let startIndex = 0;
  
  if (cursor) {
    const index = items.findIndex(item => getCursorId(item) === cursor);
    startIndex = index >= 0 ? index + 1 : items.length;
  }

  const sliced = items.slice(startIndex, startIndex + limit + 1);
  const hasMore = sliced.length > limit;
  const data = hasMore ? sliced.slice(0, -1) : sliced;
  const nextCursor = hasMore ? getCursorId(data[data.length - 1]) : null;

  return { data, nextCursor };
}
