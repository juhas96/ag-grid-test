import { signal } from '@angular/core';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

/**
 * Abstract base for all cell renderer components.
 *
 * Stores AG Grid params as a signal for reactive template access
 * and provides a safe default `refresh()` that returns `false`
 * (telling AG Grid to destroy and re-create the component on
 * data changes — the safest strategy for OnPush components).
 *
 * @typeParam TParams - Custom params interface merged with AG Grid's
 *   `ICellRendererParams`. Concrete renderers extend this with their
 *   own param shape (e.g., `DateCellParams`, `LinkCellParams`).
 */
export abstract class BaseCellRenderer<TParams = unknown> implements ICellRendererAngularComp {
  /** Combined AG Grid + custom params, set once on init. */
  protected readonly params = signal<(ICellRendererParams & TParams) | null>(null);

  agInit(params: ICellRendererParams & TParams): void {
    this.params.set(params);
  }

  /**
   * Return `false` to tell AG Grid to destroy and re-create the component.
   * Subclasses can override for performance if they handle param updates
   * reactively via the `params` signal.
   */
  refresh(_params: ICellRendererParams & TParams): boolean {
    return false;
  }
}
