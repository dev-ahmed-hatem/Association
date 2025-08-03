export type PaginatedResponse<T> = {
  total_pages: number;
  page: number;
  count: number;
  next: string | null;
  previous: string | null;
  data: Array<T>;
};
