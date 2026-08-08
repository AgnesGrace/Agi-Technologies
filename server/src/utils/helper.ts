export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export const parsePagination = (page = '1', limit = '12') => {
  const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);

  const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 12));

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
  totalPages: Math.ceil(totalItems / pageSize),
  currentPage,
  pageSize,
});
