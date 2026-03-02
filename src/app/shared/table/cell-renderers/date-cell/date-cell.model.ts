/**
 * Built-in date format presets.
 * A custom Angular `DatePipe` format string is also accepted.
 */
export type DateFormat = 'date' | 'dateTime' | 'time';

/**
 * Params for the date cell renderer.
 *
 * Static per-column — the same format applies to every row.
 */
export interface DateCellParams {
  /**
   * Date format to use.
   *
   * Presets:
   * - `'date'`     → `'mediumDate'`    (e.g. "Jan 1, 2025")
   * - `'dateTime'` → `'medium'`        (e.g. "Jan 1, 2025, 12:00:00 AM")
   * - `'time'`     → `'mediumTime'`    (e.g. "12:00:00 AM")
   *
   * Any valid Angular `DatePipe` format string is also accepted.
   *
   * @default 'date'
   */
  readonly format?: DateFormat | string;
}
