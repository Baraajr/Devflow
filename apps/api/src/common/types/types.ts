export type QueryString = {
  page?: string;
  sort?: string;
  limit?: string;
  order?: string;
  [key: string]: string | undefined;
};

export type PaginationResult = {
  currentPage: number;
  limit: number;
  numberOfPages: number;
  total: number;
  next?: number;
  prev?: number;
};
