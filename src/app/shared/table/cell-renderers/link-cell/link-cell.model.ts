import type { RouterLink } from '@angular/router';

/**
 * Params for the link cell renderer.
 *
 * Typically used with a factory function that receives row data
 * so the `routerLink` can include dynamic segments.
 */
export interface LinkCellParams {
  /** Route commands passed to `[routerLink]`. */
  readonly routerLink: RouterLink['routerLink'];

  /**
   * Display text for the link.
   * Falls back to the cell value if not provided.
   */
  readonly label?: string;
}
