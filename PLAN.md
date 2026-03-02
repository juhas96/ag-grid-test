# AG Grid Table Wrapper - Implementation Plan

## Architecture Overview

```
src/app/
├── shared/
│   └── table/                          # Reusable table wrapper library
│       ├── components/
│       │   ├── grid-wrapper/           # Core <app-grid> wrapping ag-grid-angular
│       │   ├── table-toolbar/          # Toolbar: filter button + search + row count
│       │   └── filter-panel/           # Overlay panel rendered from declarative config
│       ├── datasource/
│       │   └── http-datasource.ts      # Abstract HTTP datasource (IDatasource)
│       ├── services/
│       │   └── query-params-filter.service.ts  # Sync filters+search <-> queryParams
│       ├── models/
│       │   ├── filter-config.model.ts  # Declarative filter definitions
│       │   ├── column-def.model.ts     # Typed ColDef wrapper
│       │   ├── table-request.model.ts  # { filter, page, sort } for server-side
│       │   └── table-state.model.ts    # Combined table state types
│       └── index.ts                    # Barrel export
├── features/
│   ├── client-table/                   # /client-table route
│   │   ├── client-table.component.ts
│   │   ├── client-table.routes.ts
│   │   └── mock-data.ts
│   └── server-table/                   # /server-table route
│       ├── server-table.component.ts
│       ├── server-table.routes.ts
│       ├── server-table.datasource.ts  # Extends HttpDatasource
│       └── mock-api.service.ts         # Fake delay + filtering/sorting/paging
└── app.routes.ts                       # Lazy-load feature routes
```

---

## Phase 1: Foundation - Models & Types

### 1.1 Filter Config Model (`shared/table/models/filter-config.model.ts`)

The declarative filter system. No AG Grid built-in filters are used; everything is external.

```ts
// Filter control types
type FilterControlType = 'select' | 'checkbox-group';

// Single option for select/checkbox controls
interface FilterOption {
  readonly value: string;
  readonly label: string;
}

// A single filter definition
interface FilterFieldConfig {
  readonly key: string; // maps to query param name + filter object key
  readonly label: string; // display label
  readonly type: FilterControlType;
  readonly options: readonly FilterOption[];
  readonly multiple?: boolean; // for select: single vs multi
}

// A group of filters (rendered as a section in the overlay)
interface FilterGroupConfig {
  readonly label: string;
  readonly fields: readonly FilterFieldConfig[];
}

// Top-level: the entire filter panel config
type FilterPanelConfig = readonly FilterGroupConfig[];

// The resulting filter value (generic, keyed by filter field keys)
type FilterValues = Record<string, string | string[] | undefined>;
```

### 1.2 Table Request Model (`shared/table/models/table-request.model.ts`)

Used by the server-side table's HTTP datasource:

```ts
interface TablePage {
  readonly index: number; // 0-based page index
  readonly size: number; // rows per page/block
}

interface TableSort {
  readonly colId: string;
  readonly direction: 'asc' | 'desc';
}

interface TableRequest<F = FilterValues> {
  readonly filter: F;
  readonly search: string;
  readonly page: TablePage;
  readonly sort: TableSort | undefined;
}

interface TableResponse<T> {
  readonly data: readonly T[];
  readonly totalCount: number; // -1 if unknown
}
```

### 1.3 Column Def Wrapper (`shared/table/models/column-def.model.ts`)

Thin typed layer over AG Grid's `ColDef<T>`. Keeps AG Grid specifics contained:

```ts
import { ColDef } from 'ag-grid-community';

// Re-export ColDef with our defaults baked in
type AppColDef<T> = ColDef<T> & {
  readonly field: keyof T & string; // enforce field comes from data type
};
```

---

## Phase 2: Query Params Service

### 2.1 `QueryParamsFilterService` (`shared/table/services/query-params-filter.service.ts`)

A service that:

- Reads current `ActivatedRoute.queryParams` on init
- Exposes a `signal<FilterValues>` for current filter state
- Exposes a `signal<string>` for current search text
- Provides `updateFilters(partial)` and `updateSearch(text)` methods
- Writes changes back to `Router.navigate([], { queryParams, queryParamsHandling: 'merge' })`
- Query params are the **source of truth**: on page load, initial filter/search state comes from URL

**Key design decisions:**

- Injected at the **component level** (not root), so each table page gets its own instance
- Uses `linkedSignal` or `computed` to derive state from route
- Checkbox-group values serialized as comma-separated strings in URL: `?status=active,pending`
- Select values as plain strings: `?country=US`
- Search as `?q=searchterm`

---

## Phase 3: Core Grid Wrapper Component

### 3.1 `GridWrapperComponent` (`shared/table/components/grid-wrapper/`)

The main reusable component: `<app-grid>`. Wraps `<ag-grid-angular>` with the toolbar.

**Inputs (signal-based):**

| Input          | Type                | Purpose                                          |
| -------------- | ------------------- | ------------------------------------------------ |
| `colDefs`      | `AppColDef<T>[]`    | Column definitions                               |
| `rowData`      | `T[] \| null`       | For client-side mode                             |
| `datasource`   | `IDatasource`       | For server-side/infinite mode                    |
| `filterConfig` | `FilterPanelConfig` | Declarative filter panel definition              |
| `filterValues` | `FilterValues`      | Current filter state (from query params service) |
| `searchText`   | `string`            | Current search text                              |
| `rowCount`     | `number \| null`    | Total row count to display                       |
| `theme`        | `Theme`             | AG Grid theme (default: `themeQuartz`)           |

**Outputs:**

| Output         | Type           | Purpose                              |
| -------------- | -------------- | ------------------------------------ |
| `filterChange` | `FilterValues` | When user changes filters in overlay |
| `searchChange` | `string`       | When user types in search box        |

**Template structure:**

```html
<div class="app-grid-container">
  <!-- Toolbar -->
  <app-table-toolbar
    [filterConfig]="filterConfig()"
    [filterValues]="filterValues()"
    [searchText]="searchText()"
    [rowCount]="rowCount()"
    (filterChange)="filterChange.emit($event)"
    (searchChange)="searchChange.emit($event)"
  />

  <!-- AG Grid -->
  <ag-grid-angular
    [columnDefs]="colDefs()"
    [rowData]="rowData()"
    [datasource]="datasource()"
    [rowModelType]="rowModelType()"
    [theme]="theme()"
    [defaultColDef]="defaultColDef"
    [isExternalFilterPresent]="isExternalFilterPresent"
    [doesExternalFilterPass]="doesExternalFilterPass"
    [quickFilterText]="searchText()"
    (gridReady)="onGridReady($event)"
    (sortChanged)="onSortChanged()"
  />
</div>
```

**AG Grid modules registered (Community only):**

- `ClientSideRowModelModule` (client-side table)
- `InfiniteRowModelModule` (server-side table)
- `ExternalFilterModule` (client-side external filtering)
- `QuickFilterModule` (client-side full-text search)
- `SortModule` (column header sorting)
- `ValidationModule` (dev only)

**Client-side filtering logic:**

- `isExternalFilterPresent()` returns `true` if any filter value is non-empty
- `doesExternalFilterPass(node)` checks the node's data against active `filterValues`
- When `filterValues` signal changes, call `api.onFilterChanged()`
- `quickFilterText` binding handles the full-text search natively

**Server-side mode:**

- When `datasource` input is provided, `rowModelType = 'infinite'`
- Filtering/sorting/search are handled by the datasource (not AG Grid)
- The grid just calls `getRows()` on scroll

---

## Phase 4: Table Toolbar Component

### 4.1 `TableToolbarComponent` (`shared/table/components/table-toolbar/`)

Renders the bar above the grid:

```
┌─────────────────────────────────────────────────┐
│  [Filters (3)]    [Search...          ]  247 rows │
└─────────────────────────────────────────────────┘
```

**Elements:**

1. **Filter button** (Material button) - shows active filter count badge
   - Click opens `FilterPanelComponent` via `CdkOverlayOrigin` + `CdkConnectedOverlay`
2. **Search input** (Material form field with `matInput`)
   - Debounced (300ms) text input
   - Emits via `searchChange` output
3. **Row counter** - displays `"{count} rows"` or `"Loading..."`

---

## Phase 5: Filter Panel Overlay

### 5.1 `FilterPanelComponent` (`shared/table/components/filter-panel/`)

Rendered inside a `CdkConnectedOverlay` attached to the filter button.

**Behavior:**

- Takes `FilterPanelConfig` (the schema) and `FilterValues` (current state) as inputs
- Renders filter groups as sections with headers
- Each `FilterFieldConfig` renders as:
  - `'select'` -> `<mat-select>` (single or multi via `multiple` flag)
  - `'checkbox-group'` -> group of `<mat-checkbox>` elements
- Uses reactive forms (`FormGroup` built dynamically from config)
- Emits updated `FilterValues` on every change (live filtering, no "Apply" button)
- "Clear all" button resets all filters
- Panel closes on backdrop click or Escape

**Accessibility:**

- Focus trap inside overlay
- Proper ARIA labels on all controls
- Escape to close
- Tab navigation through filter controls

---

## Phase 6: HTTP Datasource (Server-Side)

### 6.1 `HttpDatasource<F, T>` (`shared/table/datasource/http-datasource.ts`)

Abstract class implementing AG Grid's `IDatasource` interface for infinite scroll.

```ts
abstract class HttpDatasource<F, T> implements IDatasource {
  // Signals for external state
  readonly filter = signal<F>({} as F);
  readonly search = signal<string>('');

  // Row count signal (exposed for toolbar)
  readonly totalCount = signal<number | null>(null);

  // Abstract: subclasses implement the actual HTTP call
  abstract fetchData(request: TableRequest<F>): Observable<TableResponse<T>>;

  // IDatasource implementation
  getRows(params: IGetRowsParams): void {
    const page: TablePage = {
      index: Math.floor(params.startRow / this.blockSize),
      size: this.blockSize,
    };
    const sort = this.extractSort(params.sortModel);
    const request: TableRequest<F> = {
      filter: this.filter(),
      search: this.search(),
      page,
      sort,
    };

    this.fetchData(request).subscribe({
      next: (response) => {
        this.totalCount.set(response.totalCount);
        const lastRow = response.totalCount >= 0 ? response.totalCount : -1;
        params.successCallback(response.data as T[], lastRow);
      },
      error: () => params.failCallback(),
    });
  }
}
```

**When filter/search changes:**

- The feature component calls `api.purgeInfiniteCache()` to reset and refetch from page 0

---

## Phase 7: Feature Tables

### 7.1 Client-Side Table (`features/client-table/`)

**Route:** `/client-table` (lazy-loaded)

**Data:** Mock array of ~200 items loaded synchronously from a local file. Example domain: "Products" with fields like `name`, `category`, `status`, `price`, `inStock`.

**Filter config:**

- Group "Status": checkbox-group with `['Active', 'Discontinued', 'Draft']`
- Group "Category": select (single) with `['Electronics', 'Clothing', 'Food', 'Tools']`

**Component wiring:**

```ts
@Component({...})
class ClientTableComponent implements OnInit {
  private queryParamsFilter = inject(QueryParamsFilterService);

  // Data
  protected allData = signal(MOCK_PRODUCTS);

  // Filter config (declarative)
  protected filterConfig: FilterPanelConfig = [
    { label: 'Status', fields: [
      { key: 'status', label: 'Status', type: 'checkbox-group',
        options: [...] }
    ]},
    { label: 'Category', fields: [
      { key: 'category', label: 'Category', type: 'select',
        options: [...] }
    ]},
  ];

  // State from query params
  protected filterValues = this.queryParamsFilter.filterValues;
  protected searchText = this.queryParamsFilter.searchText;

  // Row count (computed after filtering)
  protected rowCount = signal<number | null>(null);

  // Event handlers update query params (source of truth)
  onFilterChange(values: FilterValues) {
    this.queryParamsFilter.updateFilters(values);
  }
  onSearchChange(text: string) {
    this.queryParamsFilter.updateSearch(text);
  }
}
```

**AG Grid config:**

- `rowModelType: 'clientSide'`
- `quickFilterText` bound to search signal
- `isExternalFilterPresent` / `doesExternalFilterPass` for filter overlay values
- Sorting via AG Grid's native column header sort (client-side model handles it)
- `(modelUpdated)` event to update `rowCount` from `api.getDisplayedRowCount()`

### 7.2 Server-Side Table (`features/server-table/`)

**Route:** `/server-table` (lazy-loaded)

**Data:** Mock API service that simulates server-side filtering, sorting, and pagination with artificial delay (`delay(300)`). Domain: "Users" with fields like `id`, `name`, `email`, `role`, `department`, `createdAt`.

**Filter config:**

- Group "Role": checkbox-group with `['Admin', 'Editor', 'Viewer']`
- Group "Department": select (multi) with `['Engineering', 'Marketing', 'Sales', 'HR']`

**Datasource:**

```ts
class ServerTableDatasource extends HttpDatasource<UserFilter, User> {
  private mockApi = inject(MockApiService);

  fetchData(request: TableRequest<UserFilter>): Observable<TableResponse<User>> {
    return this.mockApi.getUsers(request);
  }
}
```

**Component wiring:**

- Infinite scroll via `InfiniteRowModelModule`
- `cacheBlockSize: 50` (fetch 50 rows per block)
- `blockLoadDebounceMillis: 200`
- When filter/search changes -> `api.purgeInfiniteCache()` to refetch from page 0
- Row count from `datasource.totalCount` signal

---

## Phase 8: App Shell & Routing

### 8.1 Routes (`app.routes.ts`)

```ts
export const routes: Routes = [
  { path: '', redirectTo: 'client-table', pathMatch: 'full' },
  {
    path: 'client-table',
    loadComponent: () =>
      import('./features/client-table/client-table.component').then((m) => m.ClientTableComponent),
  },
  {
    path: 'server-table',
    loadComponent: () =>
      import('./features/server-table/server-table.component').then((m) => m.ServerTableComponent),
  },
];
```

### 8.2 Root Component

Simple nav with links to both routes + `<router-outlet>`.

---

## Implementation Order

| #   | Step                                             | Depends on                                      | Status |
| --- | ------------------------------------------------ | ----------------------------------------------- | ------ |
| 1   | Models & types                                   | --                                              | [ ]    |
| 2   | `QueryParamsFilterService`                       | Models                                          | [ ]    |
| 3   | `FilterPanelComponent`                           | Models                                          | [ ]    |
| 4   | `TableToolbarComponent`                          | FilterPanel, Models                             | [ ]    |
| 5   | `GridWrapperComponent`                           | Toolbar, Models                                 | [ ]    |
| 6   | `HttpDatasource` abstract class                  | Models                                          | [ ]    |
| 7   | Mock data + `MockApiService`                     | Models                                          | [ ]    |
| 8   | `ClientTableComponent` (feature)                 | GridWrapper, QueryParams, mocks                 | [ ]    |
| 9   | `ServerTableDatasource` + `ServerTableComponent` | HttpDatasource, GridWrapper, QueryParams, mocks | [ ]    |
| 10  | Routing + app shell                              | Features                                        | [ ]    |
| 11  | Theming + styling polish                         | Everything                                      | [ ]    |

---

## Key Technical Decisions

| Decision                           | Choice                                                                   | Rationale                                              |
| ---------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------ |
| AG Grid row model (client)         | `clientSide`                                                             | All data in memory, AG Grid handles sort natively      |
| AG Grid row model (server)         | `infinite`                                                               | Community edition, block-based loading on scroll       |
| External filter mechanism (client) | `isExternalFilterPresent` + `doesExternalFilterPass` + `quickFilterText` | AG Grid's official external filter API                 |
| External filter mechanism (server) | Passed via datasource                                                    | Server does filtering, not AG Grid                     |
| Filter overlay                     | CDK `ConnectedOverlay`                                                   | Lightweight, no dialog overhead, positions near button |
| Filter state management            | Signals everywhere                                                       | Angular 21, no RxJS BehaviorSubjects needed            |
| Query param sync                   | `inject(ActivatedRoute)` + `Router.navigate`                             | Standard Angular, no extra deps                        |
| State flow                         | URL -> signals -> grid                                                   | Query params are single source of truth                |
| Module registration                | Per-grid `[modules]` input                                               | Smaller bundle, each table only loads what it needs    |
| Theme                              | `themeQuartz` (default)                                                  | Clean, modern default; customizable later              |

---

## What We Are NOT Building (scope boundaries)

- No custom cell renderers (per requirements)
- No AG Grid built-in column filters (all external)
- No pagination component (client: shows all; server: infinite scroll)
- No NgRx/store (signals are sufficient)
- No Transloco/i18n (plain strings)
- No Moment.js (native `Date` / `Intl`)
- Nothing imported from `example/` -- clean-room reimplementation
