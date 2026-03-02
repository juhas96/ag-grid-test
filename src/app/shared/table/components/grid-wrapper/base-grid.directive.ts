import { Directive, computed, input, output, signal } from '@angular/core';
import type {
  ColDef,
  ColGroupDef,
  GridApi,
  GridReadyEvent,
  Module,
  SortChangedEvent,
  Theme,
} from 'ag-grid-community';
import {
  ColumnApiModule,
  ColumnAutoSizeModule,
  RowApiModule,
  ScrollApiModule,
  ValidationModule,
  themeQuartz,
} from 'ag-grid-community';

import type { FilterPanelConfig, FilterValues } from '../../models/filter-config.model';
import type { AnyAppColDef } from '../../models/column-def.model';

/**
 * Abstract base for all grid variants (client-side, infinite scroll, etc.).
 *
 * Provides shared inputs, outputs, column management, grid defaults,
 * and visibility toggling.  Concrete subclasses add their own row-model
 * configuration, template, and data-flow logic.
 */
@Directive()
export abstract class BaseGridDirective<T = unknown> {
  // ── Shared inputs ──────────────────────────────────────────────

  /** Column definitions. */
  readonly colDefs = input.required<AnyAppColDef<T>[]>();

  /** Declarative filter panel definition. */
  readonly filterConfig = input<FilterPanelConfig>([]);

  /** Current filter state (from query params service). */
  readonly filterValues = input<FilterValues>({});

  /** Current search text. */
  readonly searchText = input('');

  /** Total row count before any filtering. */
  readonly totalRowCount = input<number | null>(null);

  /** AG Grid theme. */
  readonly theme = input<Theme>(themeQuartz);

  // ── Shared outputs ─────────────────────────────────────────────

  /** Emitted when user changes filters in overlay. */
  readonly filterChange = output<FilterValues>();

  /** Emitted when user types in search box. */
  readonly searchChange = output<string>();

  // ── Shared internal state ──────────────────────────────────────

  protected readonly gridApi = signal<GridApi | null>(null);

  /**
   * All column options derived from colDefs for the column chooser.
   * Only includes columns that have a `field` (fieldless columns like
   * actions are excluded from the chooser).
   */
  readonly allColumns = computed(() =>
    this.colDefs()
      .filter((col): col is AnyAppColDef<T> & { field: string } => col.field != null)
      .map((col) => ({
        field: col.field,
        headerName: col.headerName ?? col.field,
      })),
  );

  /**
   * Column defs cast to AG Grid's expected type for template binding.
   *
   * `AnyAppColDef<T>` uses `Omit<ColDef<T>, ...>` to re-type loosely-typed
   * properties, which breaks direct structural assignability with `ColDef<T>`.
   * This computed provides the type-bridge for the `[columnDefs]` binding.
   */
  protected readonly agColumnDefs = computed(
    () => this.colDefs() as (ColDef<T> | ColGroupDef<T>)[],
  );

  /** Currently visible column field names. Starts with all visible. */
  readonly visibleColumns = signal<string[]>([]);

  /**
   * Resolved displayed row count.
   * Each subclass defines how this is calculated.
   */
  abstract readonly displayedRowCount: ReturnType<typeof computed<number | null>>;

  // ── Shared constants ───────────────────────────────────────────

  /** Modules common to all row model types. */
  protected readonly baseModules: Module[] = [
    ColumnApiModule,
    ColumnAutoSizeModule,
    RowApiModule,
    ScrollApiModule,
    ValidationModule,
  ];

  /** Default column definition. */
  readonly defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    resizable: true,
  };

  // ── Shared AG Grid callbacks ───────────────────────────────────

  onGridReady(event: GridReadyEvent): void {
    this.gridApi.set(event.api);
    this.visibleColumns.set(this.fieldNames());
    event.api.sizeColumnsToFit();
  }

  onVisibleColumnsChange(fields: string[]): void {
    const api = this.gridApi();
    if (!api) return;

    this.visibleColumns.set(fields);
    const allFields = this.fieldNames();
    const toHide = allFields.filter((f) => !fields.includes(f));
    const toShow = allFields.filter((f) => fields.includes(f));
    api.setColumnsVisible(toHide, false);
    api.setColumnsVisible(toShow, true);
    api.sizeColumnsToFit();
  }

  /** Extract field names from columns that have a `field` property. */
  private fieldNames(): string[] {
    const fields: string[] = [];
    for (const col of this.colDefs()) {
      if (col.field != null) {
        fields.push(String(col.field));
      }
    }
    return fields;
  }

  onSortChanged(_event: SortChangedEvent): void {
    // Subclasses can override if needed.
    // Client-side: AG Grid handles sorting natively.
    // Infinite: datasource handles sorting via sort model in IGetRowsParams.
  }
}
