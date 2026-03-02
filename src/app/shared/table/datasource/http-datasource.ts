import { signal } from '@angular/core';
import type { IDatasource, IGetRowsParams, SortModelItem } from 'ag-grid-community';
import type { Observable } from 'rxjs';

import type { FilterValues } from '../models/filter-config.model';
import type {
  TablePage,
  TableRequest,
  TableResponse,
  TableSort,
} from '../models/table-request.model';

/**
 * Abstract HTTP datasource implementing AG Grid's `IDatasource` for infinite scroll.
 *
 * Subclasses implement `fetchData()` with the actual HTTP call.
 * Filter/search state is managed via signals so feature components
 * can react to changes and call `api.purgeInfiniteCache()`.
 */
export abstract class HttpDatasource<F = FilterValues, T = unknown> implements IDatasource {
  /** Block size for infinite scroll (rows per request). */
  readonly blockSize: number;

  /** External filter state. */
  readonly filter = signal<F>({} as F);

  /** External search state. */
  readonly search = signal<string>('');

  /** Filtered row count (after filters/search). `null` means unknown/loading. */
  readonly totalCount = signal<number | null>(null);

  /** Unfiltered total row count. `null` means unknown/loading. */
  readonly unfilteredTotalCount = signal<number | null>(null);

  constructor(blockSize = 50) {
    this.blockSize = blockSize;
  }

  /** Subclasses implement the actual HTTP call. */
  abstract fetchData(request: TableRequest<F>): Observable<TableResponse<T>>;

  /** IDatasource implementation. Called by AG Grid on each block load. */
  getRows(params: IGetRowsParams): void {
    const page: TablePage = {
      index: Math.floor(params.startRow / this.blockSize),
      size: this.blockSize,
    };
    const sort = this.extractSort(params.sortModel);
    const request: TableRequest<F> = {
      filter: this.filter(),
      search: this.search(),
      page,
      sort,
    };

    this.fetchData(request).subscribe({
      next: (response) => {
        this.totalCount.set(response.totalCount);
        if (response.unfilteredTotalCount != null) {
          this.unfilteredTotalCount.set(response.unfilteredTotalCount);
        } else if (this.unfilteredTotalCount() === null) {
          // First response with no unfiltered count — assume it IS the unfiltered total.
          this.unfilteredTotalCount.set(response.totalCount);
        }
        const lastRow = response.totalCount >= 0 ? response.totalCount : -1;
        params.successCallback(response.data as T[], lastRow);
      },
      error: () => params.failCallback(),
    });
  }

  private extractSort(sortModel: SortModelItem[]): TableSort | undefined {
    if (sortModel.length === 0) {
      return undefined;
    }
    const first = sortModel[0];
    return {
      colId: first.colId,
      direction: first.sort as 'asc' | 'desc',
    };
  }
}
