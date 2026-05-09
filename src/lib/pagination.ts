export const DEFAULT_PAGE_SIZE = 10;

export type ListQueryParams = {
  page: number;
  pageSize?: number;
  search?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  search: string;
};

export function buildListQueryString(params: ListQueryParams) {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize ?? DEFAULT_PAGE_SIZE));

  const search = params.search?.trim();

  if (search) {
    query.set("search", search);
  }

  return query.toString();
}
