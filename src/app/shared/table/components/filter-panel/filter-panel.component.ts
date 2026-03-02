import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import type {
  FilterFieldConfig,
  FilterGroupConfig,
  FilterPanelConfig,
  FilterValues,
} from '../../models/filter-config.model';

@Component({
  selector: 'app-filter-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  host: {
    class: 'filter-panel',
    role: 'dialog',
    '[attr.aria-label]': '"Filter panel"',
  },
  template: `
    <div class="filter-panel__header">
      <h3 class="filter-panel__title">Filters</h3>
      <button mat-icon-button aria-label="Clear all filters" (click)="clearAll()">
        <mat-icon>clear_all</mat-icon>
      </button>
    </div>

    <mat-divider />

    <div class="filter-panel__body">
      @for (group of config(); track group.label) {
        <section class="filter-panel__group">
          <h4 class="filter-panel__group-label">{{ group.label }}</h4>

          @for (field of group.fields; track field.key) {
            @switch (field.type) {
              @case ('select') {
                <mat-form-field appearance="outline" class="filter-panel__field">
                  <mat-label>{{ field.label }}</mat-label>
                  <mat-select
                    [formControl]="getControl(field.key)"
                    [multiple]="field.multiple ?? false"
                  >
                    @for (opt of field.options; track opt.value) {
                      <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              }
              @case ('checkbox-group') {
                <fieldset class="filter-panel__checkbox-group">
                  <legend class="filter-panel__field-label">{{ field.label }}</legend>
                  @for (opt of field.options; track opt.value) {
                    <mat-checkbox
                      [checked]="isChecked(field.key, opt.value)"
                      (change)="onCheckboxChange(field.key, opt.value, $event.checked)"
                    >
                      {{ opt.label }}
                    </mat-checkbox>
                  }
                </fieldset>
              }
            }
          }
        </section>

        @if (!$last) {
          <mat-divider />
        }
      }
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-width: 280px;
      max-width: 360px;
      max-height: 80vh;
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
      box-shadow: var(--mat-sys-level3);
      overflow: hidden;
    }

    .filter-panel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
    }

    .filter-panel__title {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .filter-panel__body {
      padding: 8px 16px 16px;
      overflow-y: auto;
    }

    .filter-panel__group {
      margin-bottom: 12px;
    }

    .filter-panel__group-label {
      margin: 0 0 8px;
      font-size: 13px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--mat-sys-on-surface-variant);
    }

    .filter-panel__field {
      width: 100%;
    }

    .filter-panel__checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      border: none;
      padding: 0;
      margin: 0;
    }

    .filter-panel__field-label {
      font-size: 13px;
      font-weight: 400;
      margin-bottom: 4px;
      padding: 0;
    }
  `,
})
export class FilterPanelComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  /** Declarative filter panel configuration. */
  readonly config = input.required<FilterPanelConfig>();

  /** Current filter values. */
  readonly values = input.required<FilterValues>();

  /** Emits updated filter values on every change. */
  readonly filterChange = output<FilterValues>();

  /** Dynamic form group built from config. */
  form!: FormGroup;

  ngOnInit(): void {
    this.buildForm();
  }

  getControl(key: string): FormControl {
    return this.form.get(key) as FormControl;
  }

  isChecked(key: string, optionValue: string): boolean {
    const current = this.values()[key];
    if (Array.isArray(current)) {
      return current.includes(optionValue);
    }
    return current === optionValue;
  }

  onCheckboxChange(key: string, optionValue: string, checked: boolean): void {
    const current = this.values()[key];
    let arr = Array.isArray(current) ? [...current] : current ? [current] : [];

    if (checked) {
      arr = [...arr, optionValue];
    } else {
      arr = arr.filter((v) => v !== optionValue);
    }

    this.filterChange.emit({
      ...this.values(),
      [key]: arr.length > 0 ? arr : undefined,
    });
  }

  clearAll(): void {
    const cleared: FilterValues = {};
    for (const group of this.config()) {
      for (const field of group.fields) {
        cleared[field.key] = undefined;
      }
    }
    // Reset form controls
    this.form.reset();
    this.filterChange.emit(cleared);
  }

  private buildForm(): void {
    const controls: Record<string, FormControl> = {};
    const currentValues = this.values();
    const fieldMap = this.getFieldMap();

    for (const group of this.config()) {
      for (const field of group.fields) {
        if (field.type === 'select') {
          controls[field.key] = new FormControl(
            this.normalizeValue(currentValues[field.key], field),
          );
        }
      }
    }

    this.form = new FormGroup(controls);

    // Listen for select changes
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((formValues) => {
      const updated: FilterValues = { ...this.values() };
      for (const [key, value] of Object.entries(formValues)) {
        updated[key] = value === null || value === '' ? undefined : (value as string | string[]);
      }
      this.filterChange.emit(updated);
    });
  }

  /**
   * Normalize a filter value for a form control.
   * Multi-selects need arrays; single-selects need strings.
   */
  private normalizeValue(
    value: string | string[] | undefined,
    field: FilterFieldConfig,
  ): string | string[] | null {
    if (value === undefined) return field.multiple ? [] : null;

    if (field.multiple) {
      // Ensure multi-select always gets an array
      return Array.isArray(value) ? value : [value];
    }

    // Single select gets a string
    return Array.isArray(value) ? (value[0] ?? null) : value;
  }

  private getFieldMap(): Map<string, FilterFieldConfig> {
    const map = new Map<string, FilterFieldConfig>();
    for (const group of this.config()) {
      for (const field of group.fields) {
        map.set(field.key, field);
      }
    }
    return map;
  }
}
