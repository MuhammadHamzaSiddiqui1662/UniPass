export const ADMIN_PAGE_SIZE = 20;

export function adminPage(value?: string | null) {
  const page = Number.parseInt(value || "1", 10);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export function adminSlice(pageParam: string | undefined | null, total: number, pageSize = ADMIN_PAGE_SIZE) {
  const totalPages = total <= 0 ? 0 : Math.ceil(total / pageSize);
  const page = totalPages === 0 ? 1 : Math.min(adminPage(pageParam), totalPages);
  return {
    page,
    totalPages,
    skip: (page - 1) * pageSize,
    limit: pageSize,
  };
}

export function clientPage<T>(items: T[], page: number, pageSize = ADMIN_PAGE_SIZE) {
  const totalPages = items.length === 0 ? 0 : Math.ceil(items.length / pageSize);
  const currentPage = totalPages === 0 ? 1 : Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * pageSize;
  return {
    page: currentPage,
    totalPages,
    items: items.slice(start, start + pageSize),
  };
}
