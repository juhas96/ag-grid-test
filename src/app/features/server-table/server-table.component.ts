import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  inject,
  Injector,
  OnInit,
  runInInjectionContext,
} from '@angular/core';

import {
  type AppColDef,
  type FilterPanelConfig,
  type FilterValues,
  InfiniteGridComponent,
  QueryParamsFilterService,
} from '../../shared/table';
import { ServerTableDatasource } from './server-table.datasource';
import type { User } from './mock-api.service';

@Component({
  selector: 'app-server-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [QueryParamsFilterService],
  imports: [InfiniteGridComponent],
  host: {
    class: 'server-table',
  },
  template: `
    <app-grid
      [colDefs]="colDefs"
      [datasource]="datasource"
      [filterConfig]="filterConfig"
      [filterValues]="filterValues()"
      [searchText]="searchText()"
      [totalRowCount]="totalRowCount()"
      [filteredRowCount]="filteredRowCount()"
      [cacheBlockSize]="50"
      (filterChange)="onFilterChange($event)"
      (searchChange)="onSearchChange($event)"
    />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 16px;
    }
  `,
})
export class ServerTableComponent implements OnInit {
  private readonly injector = inject(Injector);
  private readonly queryParamsFilter = inject(QueryParamsFilterService);

  /** Create datasource within injection context so it can use inject(). */
  protected readonly datasource = runInInjectionContext(this.injector, () => {
    return new ServerTableDatasource();
  });

  /** Column definitions. */
  protected readonly colDefs: AppColDef<User>[] = [
    { field: 'id', headerName: 'ID', maxWidth: 80 },
    { field: 'name', headerName: 'Name', minWidth: 180 },
    { field: 'email', headerName: 'Email', minWidth: 220 },
    { field: 'role', headerName: 'Role' },
    { field: 'department', headerName: 'Department' },
    { field: 'createdAt', headerName: 'Created' },
  ];

  /** Declarative filter configuration. */
  protected readonly filterConfig: FilterPanelConfig = [
    {
      label: 'Role',
      fields: [
        {
          key: 'role',
          label: 'Role',
          type: 'checkbox-group',
          options: [
            { value: 'Admin', label: 'Admin' },
            { value: 'Editor', label: 'Editor' },
            { value: 'Viewer', label: 'Viewer' },
          ],
        },
      ],
    },
    {
      label: 'Department',
      fields: [
        {
          key: 'department',
          label: 'Department',
          type: 'select',
          multiple: true,
          options: [
            { value: 'Engineering', label: 'Engineering' },
            { value: 'Marketing', label: 'Marketing' },
            { value: 'Sales', label: 'Sales' },
            { value: 'HR', label: 'HR' },
          ],
        },
      ],
    },
  ];

  /** State from query params. */
  protected readonly filterValues = this.queryParamsFilter.filterValues;
  protected readonly searchText = this.queryParamsFilter.searchText;

  /** Total unfiltered row count from datasource. */
  protected readonly totalRowCount = computed(() => this.datasource.unfilteredTotalCount());

  /** Filtered row count from datasource. */
  protected readonly filteredRowCount = computed(() => this.datasource.totalCount());

  constructor() {
    // Sync filter/search signals into the datasource.
    // The grid wrapper handles purging the infinite cache when these change.
    effect(() => {
      this.datasource.filter.set(this.filterValues());
      this.datasource.search.set(this.searchText());
    });
  }

  ngOnInit(): void {
    this.queryParamsFilter.registerFilterKeys(['role', 'department']);
  }

  onFilterChange(values: FilterValues): void {
    this.queryParamsFilter.updateFilters(values);
  }

  onSearchChange(text: string): void {
    this.queryParamsFilter.updateSearch(text);
  }
}
