import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

import type { ICellRendererAngularComp, ILoadingCellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams, ILoadingCellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-skeleton-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'skeleton-cell',
  },
  template: `
    @if (failed()) {
      <span class="skeleton-cell__error">Failed to load</span>
    } @else {
      <div class="skeleton-cell__bar"></div>
    }
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
      padding: 0 4px;
    }

    .skeleton-cell__bar {
      height: 14px;
      width: 70%;
      border-radius: 4px;
      background: linear-gradient(
        90deg,
        var(--mat-sys-surface-container, #e0e0e0) 25%,
        var(--mat-sys-surface-container-high, #eeeeee) 50%,
        var(--mat-sys-surface-container, #e0e0e0) 75%
      );
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.5s ease-in-out infinite;
    }

    .skeleton-cell__error {
      font-size: 12px;
      color: var(--mat-sys-error, #b00020);
    }

    @keyframes skeleton-shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `,
})
export class SkeletonCellComponent
  implements ICellRendererAngularComp, ILoadingCellRendererAngularComp
{
  readonly failed = signal(false);

  agInit(params: ICellRendererParams | ILoadingCellRendererParams): void {
    this.failed.set(params.node.failedLoad ?? false);
  }

  refresh(): boolean {
    // Returning false tells AG Grid to destroy and recreate the component
    // when the cell's data changes (e.g. loading → loaded).
    return false;
  }
}
