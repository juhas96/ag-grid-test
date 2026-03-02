import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { BaseCellRenderer } from '../base-cell-renderer';
import type { ToggleCellParams } from './toggle-cell.model';

/**
 * Cell renderer that displays a Material slide toggle.
 *
 * Supports `change`, `disabled`, and optional `checked` override.
 * Falls back to the cell value (truthy/falsy) for checked state.
 */
@Component({
  selector: 'app-toggle-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatSlideToggleModule],
  host: {
    class: 'toggle-cell',
  },
  template: `
    <mat-slide-toggle
      [checked]="isChecked()"
      [disabled]="isDisabled()"
      (change)="onChange($event.checked)"
    />
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
    }
  `,
})
export class ToggleCellComponent<T = unknown> extends BaseCellRenderer<ToggleCellParams<T>> {
  protected readonly isChecked = computed(() => {
    const p = this.params();
    if (!p) return false;
    if (p.checked && p.data) return p.checked(p.data as T);
    return !!p.value;
  });

  protected readonly isDisabled = computed(() => {
    const p = this.params();
    if (!p?.disabled || !p.data) return false;
    return p.disabled(p.data as T);
  });

  protected onChange(checked: boolean): void {
    const p = this.params();
    if (p?.change && p.data) {
      p.change(p.data as T, checked);
    }
  }
}
