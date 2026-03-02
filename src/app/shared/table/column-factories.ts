import type { ICellRendererParams } from 'ag-grid-community';

import { ActionsCellComponent } from './cell-renderers/actions-cell/actions-cell.component';
import type { ActionsCellParams } from './cell-renderers/actions-cell/actions-cell.model';
import { ButtonCellComponent } from './cell-renderers/button-cell/button-cell.component';
import type { ButtonCellParams } from './cell-renderers/button-cell/button-cell.model';
import { DateCellComponent } from './cell-renderers/date-cell/date-cell.component';
import type { DateCellParams } from './cell-renderers/date-cell/date-cell.model';
import { IconCellComponent } from './cell-renderers/icon-cell/icon-cell.component';
import type { IconCellParams } from './cell-renderers/icon-cell/icon-cell.model';
import { LinkCellComponent } from './cell-renderers/link-cell/link-cell.component';
import type { LinkCellParams } from './cell-renderers/link-cell/link-cell.model';
import { ToggleCellComponent } from './cell-renderers/toggle-cell/toggle-cell.component';
import type { ToggleCellParams } from './cell-renderers/toggle-cell/toggle-cell.model';
import type { AppColDef, AppColDefNoField } from './models/column-def.model';

// ── Date ─────────────────────────────────────────────────────────

/**
 * Create a date column with the `DateCellComponent` renderer.
 *
 * Static params — the same format applies to every row.
 *
 * @example
 * ```ts
 * createDateColumn<Product>({
 *   field: 'createdAt',
 *   headerName: 'Created',
 * });
 * ```
 */
export function createDateColumn<T>(
  colDef: Omit<AppColDef<T>, 'cellRenderer' | 'cellRendererParams'>,
  params?: DateCellParams,
): AppColDef<T> {
  return {
    ...colDef,
    cellRenderer: DateCellComponent,
    ...(params ? { cellRendererParams: params as Record<string, unknown> } : {}),
  } as AppColDef<T>;
}

/**
 * Shorthand for `createDateColumn` with `format: 'dateTime'`.
 */
export function createDateTimeColumn<T>(
  colDef: Omit<AppColDef<T>, 'cellRenderer' | 'cellRendererParams'>,
): AppColDef<T> {
  return createDateColumn(colDef, { format: 'dateTime' });
}

// ── Icon ─────────────────────────────────────────────────────────

/**
 * Create an icon column with the `IconCellComponent` renderer.
 *
 * Factory params — the icon/color/tooltip can vary per row.
 *
 * @example
 * ```ts
 * createIconColumn<Product>(
 *   { field: 'status', headerName: 'Status' },
 *   (data) => ({
 *     icon: data.active ? 'check_circle' : 'cancel',
 *     color: data.active ? 'green' : 'red',
 *   }),
 * );
 * ```
 */
export function createIconColumn<T>(
  colDef: Omit<AppColDef<T>, 'cellRenderer' | 'cellRendererParams'>,
  paramsFactory: (data: T) => IconCellParams<T>,
): AppColDef<T> {
  return {
    ...colDef,
    cellRenderer: IconCellComponent,
    cellRendererParams: (p: ICellRendererParams<T>) =>
      (p.data != null ? paramsFactory(p.data) : {}) as Record<string, unknown>,
  } as AppColDef<T>;
}

// ── Button ───────────────────────────────────────────────────────

/**
 * Create a button column with the `ButtonCellComponent` renderer.
 *
 * Static params — the same label/click handler for every row
 * (row data is passed to the click callback at runtime).
 *
 * @example
 * ```ts
 * createButtonColumn<Product>(
 *   { field: 'name', headerName: 'Action' },
 *   { label: 'Edit', click: (data) => editProduct(data) },
 * );
 * ```
 */
export function createButtonColumn<T>(
  colDef: Omit<AppColDef<T>, 'cellRenderer' | 'cellRendererParams'>,
  params: ButtonCellParams<T>,
): AppColDef<T> {
  return {
    ...colDef,
    cellRenderer: ButtonCellComponent,
    cellRendererParams: params as unknown as Record<string, unknown>,
  } as AppColDef<T>;
}

// ── Link ─────────────────────────────────────────────────────────

/**
 * Create a link column with the `LinkCellComponent` renderer.
 *
 * Factory params — the route varies per row.
 *
 * @example
 * ```ts
 * createLinkColumn<Product>(
 *   { field: 'name', headerName: 'Product' },
 *   (data) => ({ routerLink: ['/products', data.id] }),
 * );
 * ```
 */
export function createLinkColumn<T>(
  colDef: Omit<AppColDef<T>, 'cellRenderer' | 'cellRendererParams'>,
  paramsFactory: (data: T) => LinkCellParams,
): AppColDef<T> {
  return {
    ...colDef,
    cellRenderer: LinkCellComponent,
    cellRendererParams: (p: ICellRendererParams<T>) =>
      (p.data != null ? paramsFactory(p.data) : {}) as Record<string, unknown>,
  } as AppColDef<T>;
}

// ── Toggle ───────────────────────────────────────────────────────

/**
 * Create a toggle column with the `ToggleCellComponent` renderer.
 *
 * Factory params — disabled/checked can vary per row.
 *
 * @example
 * ```ts
 * createToggleColumn<Product>(
 *   { field: 'inStock', headerName: 'In Stock' },
 *   (data) => ({
 *     change: (row, checked) => updateStock(row, checked),
 *   }),
 * );
 * ```
 */
export function createToggleColumn<T>(
  colDef: Omit<AppColDef<T>, 'cellRenderer' | 'cellRendererParams'>,
  paramsFactory: (data: T) => ToggleCellParams<T>,
): AppColDef<T> {
  return {
    ...colDef,
    cellRenderer: ToggleCellComponent,
    cellRendererParams: (p: ICellRendererParams<T>) =>
      (p.data != null ? paramsFactory(p.data) : {}) as Record<string, unknown>,
  } as AppColDef<T>;
}

// ── Actions ──────────────────────────────────────────────────────

/**
 * Create a fieldless actions column with the `ActionsCellComponent` renderer.
 *
 * Factory params — actions can be dynamic per row (e.g. conditionally hidden).
 *
 * @example
 * ```ts
 * createActionsColumn<Product>(
 *   { headerName: '' },
 *   (data) => ({
 *     actions: [
 *       { label: 'Edit', icon: 'edit', click: () => edit(data) },
 *       { label: 'Delete', icon: 'delete', click: () => remove(data) },
 *     ],
 *   }),
 * );
 * ```
 */
export function createActionsColumn<T>(
  colDef: Omit<AppColDefNoField<T>, 'cellRenderer' | 'cellRendererParams'>,
  paramsFactory: (data: T) => ActionsCellParams<T>,
): AppColDefNoField<T> {
  return {
    sortable: false,
    resizable: false,
    suppressSizeToFit: true,
    maxWidth: 64,
    ...colDef,
    cellRenderer: ActionsCellComponent,
    cellRendererParams: (p: ICellRendererParams<T>) =>
      (p.data != null ? paramsFactory(p.data) : {}) as Record<string, unknown>,
  };
}
