/**
 * A single action item in the actions cell menu.
 *
 * @typeParam T - Row data type.
 */
export interface ActionItem<T = unknown> {
  /** Display text for the action. */
  readonly label: string;

  /** Optional Material icon name. */
  readonly icon?: string;

  /** Click handler receiving the row data. */
  readonly click: (data: T) => void;

  /**
   * Whether the action is disabled for this row.
   * @default false
   */
  readonly disabled?: boolean;

  /**
   * Whether the action is hidden for this row.
   * @default false
   */
  readonly hidden?: boolean;
}

/**
 * Params for the actions cell renderer.
 *
 * @typeParam T - Row data type.
 */
export interface ActionsCellParams<T = unknown> {
  /** Actions to display in the menu. */
  readonly actions: readonly ActionItem<T>[];
}
