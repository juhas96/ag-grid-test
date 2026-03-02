/**
 * Params for the toggle cell renderer.
 *
 * @typeParam T - Row data type.
 */
export interface ToggleCellParams<T = unknown> {
  /** Callback when the toggle value changes. Receives row data and new value. */
  readonly change: (data: T, checked: boolean) => void;

  /**
   * Whether the toggle is disabled for this row.
   * @default () => false
   */
  readonly disabled?: (data: T) => boolean;

  /**
   * Override checked state.
   * If not provided, falls back to the cell value (truthy/falsy).
   */
  readonly checked?: (data: T) => boolean;
}
