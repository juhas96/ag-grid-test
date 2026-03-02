import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BaseCellRenderer } from '../base-cell-renderer';
import type { LinkCellParams } from './link-cell.model';

/**
 * Cell renderer that displays a router link.
 *
 * Uses Angular's `RouterLink` directive for SPA navigation.
 * Falls back to the cell value for display text when `label` is not set.
 */
@Component({
  selector: 'app-link-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: {
    class: 'link-cell',
  },
  template: `
    @if (route(); as link) {
      <a [routerLink]="link">{{ displayLabel() }}</a>
    }
  `,
  styles: `
    :host {
      display: inline;
    }

    a {
      color: var(--mat-sys-primary);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  `,
})
export class LinkCellComponent extends BaseCellRenderer<LinkCellParams> {
  protected readonly route = computed(() => this.params()?.routerLink ?? null);

  protected readonly displayLabel = computed(() => {
    const p = this.params();
    return p?.label ?? p?.value ?? '';
  });
}
