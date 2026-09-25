/** Paging helpers shared by server and client lists. */

export const TABLE_PAGE_SIZE = 25;
export const CARD_PAGE_SIZE = 12;

/** Page number from a query-string value (1-based, defaults to 1) */
export function parsePage(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export function pageInfo(total: number, page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return { page: current, totalPages, start, end: Math.min(start + pageSize, total), total, pageSize };
}

/** One page of an in-memory list */
export function slicePage<T>(items: T[], page: number, pageSize: number) {
  const info = pageInfo(items.length, page, pageSize);
  return { ...info, items: items.slice(info.start, info.end) };
}

/** Page numbers to show, with gaps: 1 … 4 5 6 … 20 */
export function pageNumbers(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = Array.from(pages).filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}
