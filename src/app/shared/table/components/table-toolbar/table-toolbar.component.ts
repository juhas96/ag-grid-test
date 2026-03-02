import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
  output,
  signal,
  inject,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { CdkOverlayOrigin, CdkConnectedOverlay } from '@angular/cdk/overlay';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';

import type {
  FilterFieldConfig,
  FilterPanelConfig,
  FilterValues,
} from '../../models/filter-config.model';

/** Lightweight column descriptor for the column chooser. */
export interface ColumnOption {
  readonly field: string;
  readonly headerName: string;
}

/** A single active filter represented as a removable chip. */
interface ActiveFilterChip {
  /** Filter field key (matches FilterFieldConfig.key / query param name). */
  readonly key: string;
  /** The specific selected value (one chip per value for multi-selects). */
  readonly value: string;
  /** Human-readable label shown in the chip, e.g. "Role: Admin". */
  readonly label: string;
}
import { FilterPanelComponent } from '../filter-panel/filter-panel.component';

@Component({
  selector: 'app-table-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    CdkOverlayOrigin,
    CdkConnectedOverlay,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatBadgeModule,
    MatChipsModule,
    FilterPanelComponent,
  ],
  host: {
    class: 'table-toolbar',
  },
  template: `
    <div class="table-toolbar__left">
      <!-- Filter button with badge showing active filter count -->
      <button
        mat-stroked-button
        cdkOverlayOrigin
        #filterOrigin="cdkOverlayOrigin"
        (click)="toggleFilterPanel()"
        [attr.aria-expanded]="filterPanelOpen()"
        aria-haspopup="dialog"
      >
        <mat-icon>filter_list</mat-icon>
        Filters
        @if (activeFilterCount() > 0) {
          <span
            class="table-toolbar__badge"
            [attr.aria-label]="activeFilterCount() + ' active filters'"
          >
            {{ activeFilterCount() }}
          </span>
        }
      </button>

      <!-- Filter panel overlay -->
      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="filterOrigin"
        [cdkConnectedOverlayOpen]="filterPanelOpen()"
        [cdkConnectedOverlayHasBackdrop]="true"
        cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
        (backdropClick)="closeFilterPanel()"
        (detach)="closeFilterPanel()"
      >
        <app-filter-panel
          [config]="filterConfig()"
          [values]="filterValues()"
          (filterChange)="filterChange.emit($event)"
          (keydown.escape)="closeFilterPanel()"
        />
      </ng-template>
    </div>

    <div class="table-toolbar__center">
      <!-- Search input -->
      <mat-form-field appearance="outline" class="table-toolbar__search" subscriptSizing="dynamic">
        <mat-icon matPrefix>search</mat-icon>
        <input
          matInput
          placeholder="Search..."
          [value]="searchText()"
          (input)="onSearchInput($event)"
          aria-label="Search table"
        />
        @if (searchText()) {
          <button matSuffix mat-icon-button aria-label="Clear search" (click)="clearSearch()">
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>

      <!-- Active filter chips -->
      @if (activeFilterChips().length > 0) {
        <mat-chip-set class="table-toolbar__chips" aria-label="Active filters">
          @for (chip of activeFilterChips(); track chip.key + ':' + chip.value) {
            <mat-chip (removed)="removeFilterChip(chip)">
              {{ chip.label }}
              <button matChipRemove [attr.aria-label]="'Remove ' + chip.label + ' filter'">
                <mat-icon>cancel</mat-icon>
              </button>
            </mat-chip>
          }
        </mat-chip-set>
      }
    </div>

    <div class="table-toolbar__right">
      <!-- Column chooser -->
      @if (allColumns().length > 0) {
        <mat-form-field
          appearance="outline"
          class="table-toolbar__columns"
          subscriptSizing="dynamic"
        >
          <mat-label>Columns</mat-label>
          <mat-select
            multiple
            [value]="visibleColumns()"
            (selectionChange)="visibleColumnsChange.emit($event.value)"
            aria-label="Select visible columns"
          >
            @for (col of allColumns(); track col.field) {
              <mat-option [value]="col.field">{{ col.headerName }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      }

      <!-- Row count -->
      <span class="table-toolbar__row-count" aria-live="polite">
        @if (totalRowCount() !== null && displayedRowCount() !== null) {
          @if (displayedRowCount() !== totalRowCount()) {
            {{ displayedRowCount() | number }} of {{ totalRowCount() | number }} rows
          } @else {
            {{ totalRowCount() | number }} rows
          }
        } @else {
          Loading...
        }
      </span>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      flex-wrap: wrap;
    }

    .table-toolbar__left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .table-toolbar__center {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 200px;
      gap: 8px;
      flex-wrap: wrap;
    }

    .table-toolbar__search {
      width: 100%;
      max-width: 400px;
      flex-shrink: 0;
    }

    .table-toolbar__chips {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
    }

    .table-toolbar__right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .table-toolbar__columns {
      width: 160px;
    }

    .table-toolbar__row-count {
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant);
      white-space: nowrap;
    }

    .table-toolbar__badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 10px;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      font-size: 11px;
      font-weight: 600;
      margin-left: 6px;
    }
  `,
})
export class TableToolbarComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();

  /** Declarative filter panel configuration. */
  readonly filterConfig = input.required<FilterPanelConfig>();

  /** Current filter values. */
  readonly filterValues = input.required<FilterValues>();

  /** Current search text. */
  readonly searchText = input.required<string>();

  /** Total row count before any filtering (null = loading). */
  readonly totalRowCount = input.required<number | null>();

  /** Displayed row count after filtering/search (null = loading). */
  readonly displayedRowCount = input.required<number | null>();

  /** All available columns for the column chooser. */
  readonly allColumns = input<ColumnOption[]>([]);

  /** Currently visible column fields. */
  readonly visibleColumns = input<string[]>([]);

  /** Emits updated filter values. */
  readonly filterChange = output<FilterValues>();

  /** Emits debounced search text. */
  readonly searchChange = output<string>();

  /** Emits when visible columns selection changes. */
  readonly visibleColumnsChange = output<string[]>();

  /** Whether the filter panel overlay is open. */
  readonly filterPanelOpen = signal(false);

  /** Count of active (non-empty) filter values. */
  readonly activeFilterCount = computed(() => {
    const values = this.filterValues();
    return Object.values(values).filter((v) => {
      if (v === undefined || v === '') return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    }).length;
  });

  /**
   * Flat list of active filters as removable chips.
   * Multi-select values produce one chip per selected option.
   */
  readonly activeFilterChips = computed<readonly ActiveFilterChip[]>(() => {
    const values = this.filterValues();
    const config = this.filterConfig();
    const chips: ActiveFilterChip[] = [];

    // Build a lookup: key → field config (for labels)
    const fieldMap = new Map<string, FilterFieldConfig>();
    for (const group of config) {
      for (const field of group.fields) {
        fieldMap.set(field.key, field);
      }
    }

    for (const [key, filterValue] of Object.entries(values)) {
      if (filterValue === undefined || filterValue === '') continue;

      const fieldConfig = fieldMap.get(key);
      const fieldLabel = fieldConfig?.label ?? key;

      if (Array.isArray(filterValue)) {
        if (filterValue.length === 0) continue;
        for (const val of filterValue) {
          const optionLabel = fieldConfig?.options.find((o) => o.value === val)?.label ?? val;
          chips.push({ key, value: val, label: `${fieldLabel}: ${optionLabel}` });
        }
      } else {
        const optionLabel =
          fieldConfig?.options.find((o) => o.value === filterValue)?.label ?? filterValue;
        chips.push({ key, value: filterValue, label: `${fieldLabel}: ${optionLabel}` });
      }
    }

    return chips;
  });

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((text) => this.searchChange.emit(text));
  }

  toggleFilterPanel(): void {
    this.filterPanelOpen.update((open) => !open);
  }

  closeFilterPanel(): void {
    this.filterPanelOpen.set(false);
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchSubject.next('');
    this.searchChange.emit('');
  }

  /**
   * Remove a single filter chip.
   * For array values the specific value is spliced out;
   * for scalar values the key is cleared entirely.
   */
  removeFilterChip(chip: ActiveFilterChip): void {
    const values = { ...this.filterValues() };
    const current = values[chip.key];

    if (Array.isArray(current)) {
      const updated = current.filter((v) => v !== chip.value);
      values[chip.key] = updated.length > 0 ? updated : undefined;
    } else {
      values[chip.key] = undefined;
    }

    this.filterChange.emit(values);
  }
}
