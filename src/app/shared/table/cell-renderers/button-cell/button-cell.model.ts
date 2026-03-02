/**
 * Visual variant for the button cell renderer.
 */
export type ButtonVariant = 'flat' | 'stroked' | 'basic';

/**
 * Params for the button cell renderer.
 *
 * @typeParam T - Row data type.
 */
export interface ButtonCellParams<T = unknown> {
  /** Button label text. */
  readonly label: string;

  /** Click handler receiving the row data. */
  readonly click: (data: T) => void;

  /**
   * Optional callback to disable the button for specific rows.
   * @default () => false
   */
  readonly disabled?: (data: T) => boolean;

  /**
   * Material button variant.
   * @default 'stroked'
   */
  readonly variant?: ButtonVariant;
}
