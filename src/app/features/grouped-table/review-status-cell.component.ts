import { Component, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

import type { ProjectTaskRow } from './mock-grouped-data';

/**
 * Multi-line cell renderer for the "Review" column.
 *
 * Displays:
 *   Approved          (coloured status label)
 *   20 Jan 2026       (date)
 *   by Elena Torres   (reviewer)
 *
 * Mirrors the screenshot's "Rating" column pattern.
 */
@Component({
  selector: 'app-review-status-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'review-status-cell',
  },
  template: `
    @if (row(); as r) {
      <span class="review-status-cell__label" [class]="statusClass()">
        {{ r.reviewStatus }}
      </span>
      @if (r.reviewDate !== '—') {
        <span class="review-status-cell__date">{{ r.reviewDate }}</span>
        <span class="review-status-cell__reviewer">by {{ r.reviewer }}</span>
      }
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1px;
      line-height: 1.3;
      padding: 4px 0;
      font-size: 13px;
    }

    .review-status-cell__label {
      font-weight: 500;
    }

    .review-status-cell__label--approved {
      color: #2e7d32;
    }

    .review-status-cell__label--pending {
      color: #ed6c02;
    }

    .review-status-cell__label--rejected {
      color: #d32f2f;
    }

    .review-status-cell__date,
    .review-status-cell__reviewer {
      color: #666;
      font-size: 12px;
    }
  `,
})
export class ReviewStatusCellComponent implements ICellRendererAngularComp {
  private readonly params = signal<ICellRendererParams<ProjectTaskRow> | null>(null);

  protected readonly row = computed(() => this.params()?.data ?? null);

  protected readonly statusClass = computed(() => {
    const status = this.row()?.reviewStatus?.toLowerCase() ?? '';
    return `review-status-cell__label--${status}`;
  });

  agInit(params: ICellRendererParams<ProjectTaskRow>): void {
    this.params.set(params);
  }

  refresh(): boolean {
    return false;
  }
}
