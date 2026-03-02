import type { FilterValues } from './filter-config.model';

export interface TablePage {
  /** 0-based page index. */
  readonly index: number;
  /** Rows per page/block. */
  readonly size: number;
}

export interface TableSort {
  readonly colId: string;
  readonly direction: 'asc' | 'desc';
}

export interface TableRequest<F = FilterValues> {
  readonly filter: F;
  readonly search: string;
  readonly page: TablePage;
  readonly sort: TableSort | undefined;
}

export interface TableResponse<T> {
  readonly data: readonly T[];
  /** Total matching row count (after filters/search). Use -1 if unknown. */
  readonly totalCount: number;
  /** Total row count before any filtering. Omit if same as totalCount. */
  readonly unfilteredTotalCount?: number;
}
