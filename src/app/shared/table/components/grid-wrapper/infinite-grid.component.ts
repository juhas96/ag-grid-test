import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  forwardRef,
  input,
} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type {
  CellRendererSelectorResult,
  ColDef,
  GridReadyEvent,
  ICellRendererParams,
  IDatasource,
} from 'ag-grid-community';
import { InfiniteRowModelModule } from 'ag-grid-community';

import { TableToolbarComponent } from '../table-toolbar/table-toolbar.component';
import { SkeletonCellComponent } from '../skeleton-cell/skeleton-cell.component';
import { BaseGridDirective } from './base-grid.directive';

/**
 * Infinite-scroll (server-side) grid variant.
 *
 * Data is fetched on demand via an AG Grid `IDatasource`.
 * When filters or search text change the infinite cache is purged,
 * triggering a fresh `getRows()` call from block 0.
 *
 * Selector: `app-grid` **with** a bound `[datasource]` attribute.
 */
@Component({
  selector: 'app-grid[datasource]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular, TableToolbarComponent],
  providers: [{ provide: BaseGridDirective, useExisting: forwardRef(() => InfiniteGridComponent) }],
  host: {
    class: 'grid-wrapper grid-wrapper--infinite',
  },
  template: `
    <app-table-toolbar
      [filterConfig]="filterConfig()"
      [filterValues]="filterValues()"
      [searchText]="searchText()"
      [totalRowCount]="totalRowCount()"
      [displayedRowCount]="displayedRowCount()"
      [allColumns]="allColumns()"
      [visibleColumns]="visibleColumns()"
      (filterChange)="filterChange.emit($event)"
      (searchChange)="searchChange.emit($event)"
      (visibleColumnsChange)="onVisibleColumnsChange($event)"
    />

    <div class="grid-wrapper__grid">
      <ag-grid-angular
        [columnDefs]="agColumnDefs()"
        [datasource]="datasource()"
        [rowModelType]="'infinite'"
        [modules]="modules"
        [theme]="theme()"
        [defaultColDef]="infiniteDefaultColDef"
        [cacheBlockSize]="cacheBlockSize()"
        [maxBlocksInCache]="maxBlocksInCache()"
        [blockLoadDebounceMillis]="blockLoadDebounceMillis()"
        [suppressNoRowsOverlay]="true"
        (gridReady)="onGridReady($event)"
        (sortChanged)="onSortChanged($event)"
      />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }

    .grid-wrapper__grid {
      flex: 1;
      min-height: 0;
    }

    .grid-wrapper__grid ag-grid-angular {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class InfiniteGridComponent<T = unknown> extends BaseGridDirective<T> {
  // ── Infinite-scroll inputs ─────────────────────────────────────

  /** AG Grid `IDatasource` for infinite row model. */
  readonly datasource = input.required<IDatasource>();

  /** Cache block size for infinite scroll. */
  readonly cacheBlockSize = input(50);

  /** Max blocks kept in cache. Older blocks are discarded and refetched on scroll-back. */
  readonly maxBlocksInCache = input<number | undefined>(10);

  /** Debounce time before loading a block (prevents rapid fetches while scrolling). */
  readonly blockLoadDebounceMillis = input(200);

  /** Displayed (filtered) row count — provided externally from the datasource. */
  readonly filteredRowCount = input<number | null>(null);

  // ── Infinite-scroll state ──────────────────────────────────────

  /** For infinite mode the consumer provides the displayed count from the datasource. */
  override readonly displayedRowCount = computed(() => this.filteredRowCount());

  /** AG Grid modules for infinite row model. */
  readonly modules = [...this.baseModules, InfiniteRowModelModule];

  /**
   * Extends the base `defaultColDef` with a `cellRendererSelector` that shows
   * a skeleton shimmer bar while a row is still loading.
   *
   * AG Grid's `loadingCellRenderer` property (both grid-level and column-level)
   * only applies to the Server-Side Row Model — the Infinite Row Model renders
   * empty cells for unloaded rows without invoking any loading renderer.
   *
   * The selector checks `params.data`: when `undefined` the row has not been
   * fetched yet, so the `SkeletonCellComponent` is returned.  Once data
   * arrives the selector returns `undefined`, falling through to the column's
   * normal `cellRenderer` / default text rendering.
   */
  readonly infiniteDefaultColDef: ColDef = {
    ...this.defaultColDef,
    cellRendererSelector: (params: ICellRendererParams): CellRendererSelectorResult | undefined => {
      if (params.data === undefined) {
        return { component: SkeletonCellComponent };
      }
      return undefined;
    },
  };

  /**
   * Tracks how many times the filter/search effect has run so
   * the initial load is skipped (the grid fetches block 0 on its own).
   */
  private filterChangeCount = 0;

  constructor() {
    super();

    // When filter or search changes, purge the infinite cache so the
    // datasource refetches from block 0 with the new criteria.
    effect(() => {
      const _filters = this.filterValues();
      const _search = this.searchText();
      const api = this.gridApi();
      if (!api) return;

      this.filterChangeCount++;
      if (this.filterChangeCount > 1) {
        api.purgeInfiniteCache();
        api.ensureIndexVisible(0);
      }
    });
  }

  // ── AG Grid event handlers ─────────────────────────────────────

  override onGridReady(event: GridReadyEvent): void {
    super.onGridReady(event);
  }
}
