import type { FilterValues } from './filter-config.model';
import type { TableSort } from './table-request.model';

/** Combined table state used by feature components. */
export interface TableState {
  readonly filterValues: FilterValues;
  readonly searchText: string;
  readonly sort: TableSort | undefined;
}
