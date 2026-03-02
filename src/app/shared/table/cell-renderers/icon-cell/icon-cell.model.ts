/**
 * Params for the icon cell renderer.
 *
 * Typically used with a factory function so the icon and color
 * can vary per row.
 *
 * @typeParam T - Row data type.
 */
export interface IconCellParams<T = unknown> {
  /** Material icon name. */
  readonly icon: string | ((data: T) => string);

  /**
   * Icon color.
   * Accepts any CSS color value or Material theme alias.
   * @default 'inherit'
   */
  readonly color?: string | ((data: T) => string);

  /** Optional tooltip text. */
  readonly tooltip?: string | ((data: T) => string);
}
