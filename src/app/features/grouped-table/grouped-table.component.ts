import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, ColGroupDef, GridReadyEvent } from 'ag-grid-community';
import {
  CellSpanModule,
  CellStyleModule,
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  RowAutoHeightModule,
  ValidationModule,
  themeQuartz,
} from 'ag-grid-community';

import { ReviewStatusCellComponent } from './review-status-cell.component';
import { MOCK_PROJECT_TASK_ROWS, type ProjectTaskRow } from './mock-grouped-data';

/**
 * Example table demonstrating:
 * - **Column groups** (multi-level headers): "Task Details" spans child columns
 * - **Row spanning**: parent columns (Project Code, Name, Status) merge
 *   across consecutive rows that share the same project
 *
 * Uses AG Grid directly (not the shared wrapper) because `enableCellSpan`
 * and `ColGroupDef` are not yet part of the wrapper's public API.
 */
@Component({
  selector: 'app-grouped-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular],
  host: {
    class: 'grouped-table',
  },
  template: `
    <h2 class="grouped-table__title">Projects & Tasks</h2>
    <p class="grouped-table__subtitle">ROWS: {{ rowData().length }} records</p>

    <div class="grouped-table__grid">
      <ag-grid-angular
        [columnDefs]="columnDefs"
        [defaultColDef]="defaultColDef"
        [rowData]="rowData()"
        [modules]="modules"
        [theme]="theme"
        [enableCellSpan]="true"
        [rowHeight]="60"
        [suppressRowTransform]="true"
        (gridReady)="onGridReady($event)"
      />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 16px;
    }

    .grouped-table__title {
      margin: 0 0 4px;
      font-size: 20px;
      font-weight: 500;
    }

    .grouped-table__subtitle {
      margin: 0 0 12px;
      font-size: 13px;
      color: #666;
    }

    .grouped-table__grid {
      flex: 1;
      min-height: 0;
    }

    .grouped-table__grid ag-grid-angular {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class GroupedTableComponent {
  protected readonly rowData = signal<ProjectTaskRow[]>([...MOCK_PROJECT_TASK_ROWS]);

  protected readonly theme = themeQuartz;

  protected readonly modules = [
    ClientSideRowModelModule,
    CellSpanModule,
    CellStyleModule,
    ColumnAutoSizeModule,
    RowAutoHeightModule,
    ValidationModule,
  ];

  protected readonly defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    sortable: false,
    resizable: true,
  };

  /**
   * Column definitions with:
   * - Top-level parent columns using `spanRows` to merge by project
   * - A "Task Details" column group spanning child-specific columns
   */
  protected readonly columnDefs: (ColDef<ProjectTaskRow> | ColGroupDef<ProjectTaskRow>)[] = [
    // ── Parent columns (span across rows sharing the same project) ──
    {
      headerName: 'Project ID',
      field: 'projectCode',
      minWidth: 110,
      maxWidth: 130,
      spanRows: true,
      sort: 'asc',
      cellStyle: { fontWeight: 500 },
    },
    {
      headerName: 'Description',
      field: 'projectName',
      minWidth: 250,
      flex: 2,
      spanRows: true,
      wrapText: true,
      autoHeight: true,
    },
    {
      headerName: 'Open Issues',
      field: 'projectStatus',
      minWidth: 110,
      maxWidth: 130,
      spanRows: true,
    },

    // ── Child column group (one row per task) ────────────────────────
    {
      headerName: 'Task Details',
      children: [
        {
          headerName: 'Task ID',
          field: 'taskCode',
          minWidth: 120,
          maxWidth: 140,
        },
        {
          headerName: 'Summary',
          field: 'taskSummary',
          minWidth: 200,
          flex: 2,
          wrapText: true,
          autoHeight: true,
        },
        {
          headerName: 'Critical',
          field: 'critical',
          minWidth: 80,
          maxWidth: 100,
        },
        {
          headerName: 'Assignee',
          field: 'assignee',
          minWidth: 160,
        },
        {
          headerName: 'Review',
          field: 'reviewStatus',
          minWidth: 150,
          cellRenderer: ReviewStatusCellComponent,
          autoHeight: true,
        },
        {
          headerName: 'Open Issues',
          field: 'openIssues',
          minWidth: 110,
          maxWidth: 130,
        },
      ],
    },
  ];

  onGridReady(event: GridReadyEvent): void {
    event.api.sizeColumnsToFit();
  }
}
