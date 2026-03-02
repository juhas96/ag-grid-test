import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BaseCellRenderer } from '../base-cell-renderer';
import type { IconCellParams } from './icon-cell.model';

/**
 * Resolve a param that can be a static value or a function of row data.
 */
function resolve<T, R>(
  value: R | ((data: T) => R) | undefined,
  data: T | undefined,
  fallback: R,
): R {
  if (value == null) return fallback;
  if (typeof value === 'function') {
    return data != null ? (value as (data: T) => R)(data) : fallback;
  }
  return value;
}

/**
 * Cell renderer that displays a Material icon.
 *
 * Supports static or row-dependent `icon`, `color`, and `tooltip` params.
 */
@Component({
  selector: 'app-icon-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatTooltipModule],
  host: {
    class: 'icon-cell',
  },
  template: `
    @if (iconName(); as icon) {
      <mat-icon [style.color]="iconColor()" [matTooltip]="tooltipText()">{{ icon }}</mat-icon>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
    }
  `,
})
export class IconCellComponent<T = unknown> extends BaseCellRenderer<IconCellParams<T>> {
  protected readonly iconName = computed(() => {
    const p = this.params();
    if (!p) return null;
    return resolve(p.icon, p.data as T | undefined, '');
  });

  protected readonly iconColor = computed(() => {
    const p = this.params();
    if (!p) return 'inherit';
    return resolve(p.color, p.data as T | undefined, 'inherit');
  });

  protected readonly tooltipText = computed(() => {
    const p = this.params();
    if (!p) return '';
    return resolve(p.tooltip, p.data as T | undefined, '');
  });
}
