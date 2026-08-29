/**
 * Standard pagination helper.
 * Extracts `page` and `limit` from query params with safe defaults.
 */
export function parsePagination(query: Record<string, any>): { skip: number; take: number; page: number; limit: number } {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 20)); // max 50

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

/**
 * Standard paginated response shape.
 */
export function paginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
  return {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
