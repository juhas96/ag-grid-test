import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { BaseCellRenderer } from '../base-cell-renderer';
import type { ButtonCellParams } from './button-cell.model';

/**
 * Cell renderer that displays a Material button.
 *
 * Supports `label`, `click`, `disabled`, and `variant` params.
 */
@Component({
  selector: 'app-button-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule],
  host: {
    class: 'button-cell',
  },
  template: `
    @switch (variant()) {
      @case ('flat') {
        <button mat-flat-button [disabled]="isDisabled()" (click)="onClick($event)">
          {{ label() }}
        </button>
      }
      @case ('basic') {
        <button mat-button [disabled]="isDisabled()" (click)="onClick($event)">
          {{ label() }}
        </button>
      }
      @default {
        <button mat-stroked-button [disabled]="isDisabled()" (click)="onClick($event)">
          {{ label() }}
        </button>
      }
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
    }
  `,
})
export class ButtonCellComponent<T = unknown> extends BaseCellRenderer<ButtonCellParams<T>> {
  protected readonly label = computed(() => this.params()?.label ?? '');

  protected readonly variant = computed(() => this.params()?.variant ?? 'stroked');

  protected readonly isDisabled = computed(() => {
    const p = this.params();
    if (!p?.disabled || !p.data) return false;
    return p.disabled(p.data as T);
  });

  protected onClick(event: Event): void {
    event.stopPropagation();
    const p = this.params();
    if (p?.click && p.data) {
      p.click(p.data as T);
    }
  }
}
