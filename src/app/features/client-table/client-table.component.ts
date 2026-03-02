import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';

import {
  type AnyAppColDef,
  type AppColDef,
  type FilterPanelConfig,
  type FilterValues,
  ClientSideGridComponent,
  QueryParamsFilterService,
  createActionsColumn,
  createDateColumn,
  createToggleColumn,
} from '../../shared/table';
import { MOCK_PRODUCTS, type Product } from './mock-data';

@Component({
  selector: 'app-client-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [QueryParamsFilterService],
  imports: [ClientSideGridComponent],
  host: {
    class: 'client-table',
  },
  template: `
    <app-grid
      [colDefs]="colDefs"
      [rowData]="allData()"
      [filterConfig]="filterConfig"
      [filterValues]="filterValues()"
      [searchText]="searchText()"
      [totalRowCount]="totalRowCount()"
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
export class ClientTableComponent implements OnInit {
  private readonly queryParamsFilter = inject(QueryParamsFilterService);

  /** All data loaded in memory. */
  protected readonly allData = signal<Product[]>([...MOCK_PRODUCTS]);

  /** Column definitions using factory functions. */
  protected readonly colDefs: AnyAppColDef<Product>[] = [
    { field: 'name', headerName: 'Product Name', minWidth: 200 } satisfies AppColDef<Product>,
    { field: 'category', headerName: 'Category' } satisfies AppColDef<Product>,
    { field: 'status', headerName: 'Status' } satisfies AppColDef<Product>,
    {
      field: 'price',
      headerName: 'Price',
      valueFormatter: (params) => (params.value != null ? `$${params.value.toFixed(2)}` : ''),
    } satisfies AppColDef<Product>,
    createDateColumn<Product>({ field: 'createdAt', headerName: 'Created' }),
    createToggleColumn<Product>({ field: 'inStock', headerName: 'In Stock' }, () => ({
      change: (data, checked) => this.onToggleStock(data, checked),
    })),
    createActionsColumn<Product>({ headerName: '' }, (data) => ({
      actions: [
        { label: 'View', icon: 'visibility', click: () => this.onView(data) },
        { label: 'Edit', icon: 'edit', click: () => this.onEdit(data) },
        {
          label: 'Delete',
          icon: 'delete',
          click: () => this.onDelete(data),
          disabled: data.status === 'Active',
        },
      ],
    })),
  ];

  /** Declarative filter configuration. */
  protected readonly filterConfig: FilterPanelConfig = [
    {
      label: 'Status',
      fields: [
        {
          key: 'status',
          label: 'Status',
          type: 'checkbox-group',
          options: [
            { value: 'Active', label: 'Active' },
            { value: 'Discontinued', label: 'Discontinued' },
            { value: 'Draft', label: 'Draft' },
          ],
        },
      ],
    },
    {
      label: 'Category',
      fields: [
        {
          key: 'category',
          label: 'Category',
          type: 'select',
          options: [
            { value: 'Electronics', label: 'Electronics' },
            { value: 'Clothing', label: 'Clothing' },
            { value: 'Food', label: 'Food' },
            { value: 'Tools', label: 'Tools' },
          ],
        },
      ],
    },
  ];

  /** Filter state from query params. */
  protected readonly filterValues = this.queryParamsFilter.filterValues;
  protected readonly searchText = this.queryParamsFilter.searchText;

  /** Total row count (all data, before filtering). */
  protected readonly totalRowCount = signal<number | null>(MOCK_PRODUCTS.length);

  ngOnInit(): void {
    this.queryParamsFilter.registerFilterKeys(['status', 'category']);
  }

  onFilterChange(values: FilterValues): void {
    this.queryParamsFilter.updateFilters(values);
  }

  onSearchChange(text: string): void {
    this.queryParamsFilter.updateSearch(text);
  }

  // ── Demo action handlers ─────────────────────────────────────

  private onView(data: Product): void {
    console.log('View product:', data.name);
  }

  private onEdit(data: Product): void {
    console.log('Edit product:', data.name);
  }

  private onDelete(data: Product): void {
    this.allData.update((items) => items.filter((p) => p.id !== data.id));
  }

  private onToggleStock(data: Product, checked: boolean): void {
    this.allData.update((items) =>
      items.map((p) => (p.id === data.id ? { ...p, inStock: checked } : p)),
    );
  }
}
