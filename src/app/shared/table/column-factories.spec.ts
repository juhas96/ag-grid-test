import type { ICellRendererParams } from 'ag-grid-community';

import { ActionsCellComponent } from './cell-renderers/actions-cell/actions-cell.component';
import { ButtonCellComponent } from './cell-renderers/button-cell/button-cell.component';
import { DateCellComponent } from './cell-renderers/date-cell/date-cell.component';
import { IconCellComponent } from './cell-renderers/icon-cell/icon-cell.component';
import { LinkCellComponent } from './cell-renderers/link-cell/link-cell.component';
import { ToggleCellComponent } from './cell-renderers/toggle-cell/toggle-cell.component';
import {
  createActionsColumn,
  createButtonColumn,
  createDateColumn,
  createDateTimeColumn,
  createIconColumn,
  createLinkColumn,
  createToggleColumn,
} from './column-factories';

interface TestRow {
  id: number;
  name: string;
  status: string;
  active: boolean;
  createdAt: Date;
}

describe('Column Factories', () => {
  describe('createDateColumn', () => {
    it('should set cellRenderer to DateCellComponent', () => {
      const col = createDateColumn<TestRow>({ field: 'createdAt', headerName: 'Created' });
      expect(col.cellRenderer).toBe(DateCellComponent);
    });

    it('should pass format params when provided', () => {
      const col = createDateColumn<TestRow>(
        { field: 'createdAt', headerName: 'Created' },
        { format: 'dateTime' },
      );
      expect(col.cellRendererParams).toEqual({ format: 'dateTime' });
    });

    it('should not set cellRendererParams when no params provided', () => {
      const col = createDateColumn<TestRow>({ field: 'createdAt', headerName: 'Created' });
      expect(col.cellRendererParams).toBeUndefined();
    });

    it('should preserve original colDef properties', () => {
      const col = createDateColumn<TestRow>({
        field: 'createdAt',
        headerName: 'Created',
        sortable: false,
        minWidth: 150,
      });
      expect(col.headerName).toBe('Created');
      expect(col.sortable).toBe(false);
      expect(col.minWidth).toBe(150);
    });
  });

  describe('createDateTimeColumn', () => {
    it('should set format to dateTime', () => {
      const col = createDateTimeColumn<TestRow>({ field: 'createdAt', headerName: 'Created' });
      expect(col.cellRenderer).toBe(DateCellComponent);
      expect(col.cellRendererParams).toEqual({ format: 'dateTime' });
    });
  });

  describe('createIconColumn', () => {
    it('should set cellRenderer to IconCellComponent', () => {
      const col = createIconColumn<TestRow>({ field: 'status', headerName: 'Status' }, () => ({
        icon: 'check',
      }));
      expect(col.cellRenderer).toBe(IconCellComponent);
    });

    it('should create a factory function for cellRendererParams', () => {
      const paramsFactory = vi.fn(() => ({ icon: 'check', color: 'green' }));
      const col = createIconColumn<TestRow>(
        { field: 'status', headerName: 'Status' },
        paramsFactory,
      );

      const row: TestRow = {
        id: 1,
        name: 'Test',
        status: 'active',
        active: true,
        createdAt: new Date(),
      };
      const result = (col.cellRendererParams as (p: ICellRendererParams) => unknown)({
        data: row,
      } as ICellRendererParams);

      expect(paramsFactory).toHaveBeenCalledWith(row);
      expect(result).toEqual({ icon: 'check', color: 'green' });
    });

    it('should return empty object when data is null', () => {
      const col = createIconColumn<TestRow>({ field: 'status', headerName: 'Status' }, () => ({
        icon: 'check',
      }));

      const result = (col.cellRendererParams as (p: ICellRendererParams) => unknown)({
        data: null,
      } as ICellRendererParams);

      expect(result).toEqual({});
    });
  });

  describe('createButtonColumn', () => {
    it('should set cellRenderer to ButtonCellComponent', () => {
      const col = createButtonColumn<TestRow>(
        { field: 'name', headerName: 'Action' },
        { label: 'Edit', click: () => {} },
      );
      expect(col.cellRenderer).toBe(ButtonCellComponent);
    });

    it('should pass static params', () => {
      const click = vi.fn();
      const col = createButtonColumn<TestRow>(
        { field: 'name', headerName: 'Action' },
        { label: 'Edit', click },
      );

      const params = col.cellRendererParams as Record<string, unknown>;
      expect(params['label']).toBe('Edit');
      expect(params['click']).toBe(click);
    });
  });

  describe('createLinkColumn', () => {
    it('should set cellRenderer to LinkCellComponent', () => {
      const col = createLinkColumn<TestRow>({ field: 'name', headerName: 'Product' }, (data) => ({
        routerLink: ['/products', data.id],
      }));
      expect(col.cellRenderer).toBe(LinkCellComponent);
    });

    it('should resolve factory params with row data', () => {
      const col = createLinkColumn<TestRow>({ field: 'name', headerName: 'Product' }, (data) => ({
        routerLink: ['/products', data.id],
        label: data.name,
      }));

      const row: TestRow = {
        id: 42,
        name: 'Widget',
        status: 'active',
        active: true,
        createdAt: new Date(),
      };
      const result = (col.cellRendererParams as (p: ICellRendererParams) => unknown)({
        data: row,
      } as ICellRendererParams);

      expect(result).toEqual({ routerLink: ['/products', 42], label: 'Widget' });
    });
  });

  describe('createToggleColumn', () => {
    it('should set cellRenderer to ToggleCellComponent', () => {
      const col = createToggleColumn<TestRow>({ field: 'active', headerName: 'Active' }, () => ({
        change: () => {},
      }));
      expect(col.cellRenderer).toBe(ToggleCellComponent);
    });

    it('should resolve factory params', () => {
      const change = vi.fn();
      const col = createToggleColumn<TestRow>(
        { field: 'active', headerName: 'Active' },
        (data) => ({ change, disabled: () => !data.active }),
      );

      const row: TestRow = {
        id: 1,
        name: 'Test',
        status: 'active',
        active: false,
        createdAt: new Date(),
      };
      const result = (
        col.cellRendererParams as (p: ICellRendererParams) => Record<string, unknown>
      )({ data: row } as ICellRendererParams);

      expect(result['change']).toBe(change);
      expect(typeof result['disabled']).toBe('function');
    });
  });

  describe('createActionsColumn', () => {
    it('should set cellRenderer to ActionsCellComponent', () => {
      const col = createActionsColumn<TestRow>({ headerName: '' }, () => ({
        actions: [],
      }));
      expect(col.cellRenderer).toBe(ActionsCellComponent);
    });

    it('should be a fieldless column (no field property required)', () => {
      const col = createActionsColumn<TestRow>({ headerName: '' }, () => ({
        actions: [{ label: 'Edit', click: () => {} }],
      }));
      expect(col.field).toBeUndefined();
    });

    it('should set sensible defaults', () => {
      const col = createActionsColumn<TestRow>({ headerName: '' }, () => ({
        actions: [],
      }));
      expect(col.sortable).toBe(false);
      expect(col.resizable).toBe(false);
      expect(col.maxWidth).toBe(64);
    });

    it('should resolve factory params with row data', () => {
      const editClick = vi.fn();
      const col = createActionsColumn<TestRow>({ headerName: '' }, (data) => ({
        actions: [{ label: 'Edit', icon: 'edit', click: () => editClick(data) }],
      }));

      const row: TestRow = {
        id: 1,
        name: 'Test',
        status: 'active',
        active: true,
        createdAt: new Date(),
      };
      const result = (
        col.cellRendererParams as (p: ICellRendererParams) => Record<string, unknown>
      )({ data: row } as ICellRendererParams);

      const actions = result['actions'] as Array<{ label: string }>;
      expect(actions.length).toBe(1);
      expect(actions[0].label).toBe('Edit');
    });

    it('should allow colDef overrides', () => {
      const col = createActionsColumn<TestRow>({ headerName: 'Actions', maxWidth: 100 }, () => ({
        actions: [],
      }));
      expect(col.headerName).toBe('Actions');
      expect(col.maxWidth).toBe(100);
    });
  });
});
