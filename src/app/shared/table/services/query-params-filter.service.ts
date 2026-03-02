import { Injectable, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import type { FilterValues } from '../models/filter-config.model';

/**
 * Syncs filter and search state with URL query params.
 * Injected at the component level so each table page gets its own instance.
 *
 * Query params are the single source of truth:
 * - Checkbox-group values serialized as comma-separated: `?status=active,pending`
 * - Select values as plain strings: `?country=US`
 * - Search as `?q=searchterm`
 */
@Injectable()
export class QueryParamsFilterService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly queryParams = toSignal(this.route.queryParams, {
    initialValue: {} as Record<string, string>,
  });

  /** All filter keys registered by the feature component. */
  private readonly filterKeys = signal<readonly string[]>([]);

  /** Current filter state derived from query params. */
  readonly filterValues = computed<FilterValues>(() => {
    const params = this.queryParams();
    const keys = this.filterKeys();
    const values: FilterValues = {};

    for (const key of keys) {
      const raw = params[key];
      if (raw === undefined || raw === '') {
        values[key] = undefined;
      } else if (raw.includes(',')) {
        values[key] = raw.split(',');
      } else {
        values[key] = raw;
      }
    }

    return values;
  });

  /** Current search text derived from query params. */
  readonly searchText = computed(() => {
    const params = this.queryParams();
    return params['q'] ?? '';
  });

  /** Register filter keys so the service knows which query params to read. */
  registerFilterKeys(keys: readonly string[]): void {
    this.filterKeys.set(keys);
  }

  /** Update filter values and write back to query params. */
  updateFilters(partial: FilterValues): void {
    const queryParams: Record<string, string | null> = {};

    for (const [key, value] of Object.entries(partial)) {
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        queryParams[key] = null; // remove from URL
      } else if (Array.isArray(value)) {
        queryParams[key] = value.join(',');
      } else {
        queryParams[key] = value;
      }
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  /** Update search text and write back to query params. */
  updateSearch(text: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: text || null },
      queryParamsHandling: 'merge',
    });
  }
}
