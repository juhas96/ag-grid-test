import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { BaseCellRenderer } from '../base-cell-renderer';
import type { ActionItem, ActionsCellParams } from './actions-cell.model';

/**
 * Cell renderer that displays an actions menu (three-dot button + dropdown).
 *
 * Supports dynamic visibility/disabled per action via `hidden` and `disabled`.
 * Each action receives the row data on click.
 */
@Component({
  selector: 'app-actions-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
  host: {
    class: 'actions-cell',
  },
  template: `
    @if (visibleActions().length > 0) {
      <button
        mat-icon-button
        [matMenuTriggerFor]="menu"
        aria-label="Row actions"
        (click)="$event.stopPropagation()"
      >
        <mat-icon>more_vert</mat-icon>
      </button>

      <mat-menu #menu="matMenu">
        @for (action of visibleActions(); track action.label) {
          <button
            mat-menu-item
            [disabled]="action.disabled ?? false"
            (click)="onActionClick(action)"
          >
            @if (action.icon) {
              <mat-icon>{{ action.icon }}</mat-icon>
            }
            <span>{{ action.label }}</span>
          </button>
        }
      </mat-menu>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      width: 100%;
    }
  `,
})
export class ActionsCellComponent<T = unknown> extends BaseCellRenderer<ActionsCellParams<T>> {
  /** Actions filtered by visibility. */
  protected readonly visibleActions = computed(() => {
    const p = this.params();
    if (!p?.actions) return [];
    return p.actions.filter((a) => !a.hidden);
  });

  protected onActionClick(action: ActionItem<T>): void {
    const p = this.params();
    if (p?.data) {
      action.click(p.data as T);
    }
  }
}
