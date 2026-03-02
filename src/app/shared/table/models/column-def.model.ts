import type { ColDef, ICellRendererParams } from 'ag-grid-community';

/**
 * Properties from AG Grid's `ColDef` that are re-typed with stricter signatures.
 *
 * AG Grid types `cellRendererParams` as `any`. We strip it and re-add with
 * a narrowed type so that factory functions and renderers are type-safe
 * at the API boundary.
 */
type RetypedProperties = 'cellRendererParams';

/** `ColDef<T>` without the loosely-typed properties. */
type StrictColDef<T> = Omit<ColDef<T>, RetypedProperties>;

/**
 * Re-typed `cellRendererParams`.
 *
 * Accepts either:
 * - A static params object (same config for every row), or
 * - A factory function receiving AG Grid params and returning the config.
 */
type CellRendererParamsColDef<T> = {
  readonly cellRendererParams?:
    | Record<string, unknown>
    | ((params: ICellRendererParams<T>) => Record<string, unknown>);
};

/**
 * Typed column definition wrapper.
 *
 * Enforces that `field` is a key of the row data type and replaces
 * AG Grid's `any`-typed properties with stricter alternatives.
 */
export type AppColDef<T> = StrictColDef<T> &
  CellRendererParamsColDef<T> & {
    readonly field: Extract<keyof T, string>;
  };

/**
 * Column definition for fieldless columns (actions, selection, etc.).
 *
 * Identical to `AppColDef` but without the required `field` property,
 * since actions columns don't map to a data field.
 */
export type AppColDefNoField<T> = StrictColDef<T> & CellRendererParamsColDef<T>;

/**
 * Union type for all column definitions.
 * Use this when a component accepts both field-bound and fieldless columns.
 */
export type AnyAppColDef<T> = AppColDef<T> | AppColDefNoField<T>;
