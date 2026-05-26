export type ResponseDataType<Data, Error> =
  | { error: false; data: Data }
  | { error: true; data: Error };

export type DataWithLoading<D> = { data: D; loading: boolean };

export type PaginatedData<D> = {
  records: D[];
  skip: number;
  take: number;
  count: number;
};

export type PaginatedDataWithLoading<D> = PaginatedData<D> & {
  loading: boolean;
};

export type IGenericQueryParam = {
  skip?: number;
  take?: number;
  searchQuery?: string;
};
