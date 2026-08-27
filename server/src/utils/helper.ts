export interface PaginationQuery {
  page?: string;
  limit?: string;
  [key: string]:
    | undefined
    | string
    | string[]
    | PaginationQuery
    | PaginationQuery[];
}

const firstQueryValue = (value: unknown, fallback: string): string => {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === 'string' && value[0]) {
    return value[0];
  }

  return fallback;
};

export const parsePagination = (page?: unknown, limit?: unknown) => {
  const currentPage = Math.max(
    1,
    Number.parseInt(firstQueryValue(page, '1'), 10) || 1,
  );

  const pageSize = Math.min(
    100,
    Math.max(1, Number.parseInt(firstQueryValue(limit, '12'), 10) || 12),
  );

  return {
    currentPage,
    pageSize,
    skip: (currentPage - 1) * pageSize,
  };
};

export const buildPagination = (
  totalItems: number,
  currentPage: number,
  pageSize: number,
) => ({
  totalItems,
  totalPages: Math.ceil(totalItems / pageSize) || 0,
  currentPage,
  pageSize,
});
