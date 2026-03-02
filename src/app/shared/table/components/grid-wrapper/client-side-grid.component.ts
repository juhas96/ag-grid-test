import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { GridReadyEvent, IRowNode, ModelUpdatedEvent } from 'ag-grid-community';
import {
  ClientSideRowModelModule,
  ExternalFilterModule,
  QuickFilterModule,
} from 'ag-grid-community';

import type { FilterValues } from '../../models/filter-config.model';
import { TableToolbarComponent } from '../table-toolbar/table-toolbar.component';
import { BaseGridDirective } from './base-grid.directive';

/**
 * Client-side grid variant.
 *
 * All data lives in memory; AG Grid handles sorting natively.
 * Filtering uses the external-filter API so the wrapper's `filterValues`
 * drive which rows are shown, plus `quickFilterText` for free-text search.
 *
 * Selector: `app-grid` **without** a bound `[datasource]` attribute.
 */
@Component({
  selector: 'app-grid:not([datasource])',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular, TableToolbarComponent],
  providers: [
    { provide: BaseGridDirective, useExisting: forwardRef(() => ClientSideGridComponent) },
  ],
  host: {
    class: 'grid-wrapper grid-wrapper--client-side',
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
        [rowData]="rowData()"
        [rowModelType]="'clientSide'"
        [modules]="modules"
        [theme]="theme()"
        [defaultColDef]="defaultColDef"
        [isExternalFilterPresent]="isExternalFilterPresent"
        [doesExternalFilterPass]="doesExternalFilterPass"
        [quickFilterText]="searchText()"
        [suppressNoRowsOverlay]="true"
        (gridReady)="onGridReady($event)"
        (sortChanged)="onSortChanged($event)"
        (modelUpdated)="onModelUpdated($event)"
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
export class ClientSideGridComponent<T = unknown> extends BaseGridDirective<T> {
  // ── Client-side inputs ─────────────────────────────────────────

  /** Row data for in-memory mode. */
  readonly rowData = input<T[] | null>(null);

  // ── Client-side state ──────────────────────────────────────────

  /** Displayed (filtered) row count tracked after each AG Grid model update. */
  private readonly clientDisplayedCount = signal<number | null>(null);

  /** Before the first modelUpdated event, fall back to totalRowCount. */
  override readonly displayedRowCount = computed(
    () => this.clientDisplayedCount() ?? this.totalRowCount(),
  );

  /** AG Grid modules for client-side row model + external filtering. */
  readonly modules = [
    ...this.baseModules,
    ClientSideRowModelModule,
    ExternalFilterModule,
    QuickFilterModule,
  ];

  constructor() {
    super();

    // Re-evaluate the external filter whenever filter values change.
    effect(() => {
      const _filters = this.filterValues();
      const _search = this.searchText();
      const api = this.gridApi();
      if (!api) return;

      api.onFilterChanged();
    });
  }

  // ── External filter callbacks ──────────────────────────────────

  readonly isExternalFilterPresent = (): boolean => {
    const values = this.filterValues();
    return Object.values(values).some((v) => {
      if (v === undefined || v === '') return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    });
  };

  readonly doesExternalFilterPass = (node: IRowNode<T>): boolean => {
    if (!node.data) return true;

    const values = this.filterValues();
    for (const [key, filterValue] of Object.entries(values)) {
      if (filterValue === undefined || filterValue === '') continue;
      if (Array.isArray(filterValue) && filterValue.length === 0) continue;

      const cellValue = String((node.data as Record<string, unknown>)[key] ?? '');

      if (Array.isArray(filterValue)) {
        if (!filterValue.includes(cellValue)) return false;
      } else {
        if (cellValue !== filterValue) return false;
      }
    }

    return true;
  };

  // ── AG Grid event handlers ─────────────────────────────────────

  override onGridReady(event: GridReadyEvent): void {
    super.onGridReady(event);
  }

  onModelUpdated(_event: ModelUpdatedEvent): void {
    const api = this.gridApi();
    if (api) {
      this.clientDisplayedCount.set(api.getDisplayedRowCount());
    }
  }
}
