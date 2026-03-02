import { DatePipe } from '@angular/common';
import { Component, ChangeDetectionStrategy, computed } from '@angular/core';

import { BaseCellRenderer } from '../base-cell-renderer';
import type { DateCellParams, DateFormat } from './date-cell.model';

/** Maps preset format names to Angular `DatePipe` format strings. */
const FORMAT_MAP: Record<DateFormat, string> = {
  date: 'mediumDate',
  dateTime: 'medium',
  time: 'mediumTime',
};

/**
 * Cell renderer that formats date values using Angular's `DatePipe`.
 *
 * Accepts a `format` param — either a preset name (`'date'`, `'dateTime'`,
 * `'time'`) or any valid `DatePipe` format string.
 */
@Component({
  selector: 'app-date-cell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'date-cell',
  },
  template: `
    @if (formattedValue(); as value) {
      {{ value }}
    }
  `,
  styles: `
    :host {
      display: inline;
    }
  `,
})
export class DateCellComponent extends BaseCellRenderer<DateCellParams> {
  /** Resolved date pipe format string. */
  protected readonly dateFormat = computed(() => {
    const p = this.params();
    const raw = p?.format ?? 'date';
    return FORMAT_MAP[raw as DateFormat] ?? raw;
  });

  /** Formatted date string for the template. */
  protected readonly formattedValue = computed(() => {
    const p = this.params();
    if (!p?.value) return null;

    const pipe = new DatePipe('en-US');
    return pipe.transform(p.value, this.dateFormat());
  });
}
