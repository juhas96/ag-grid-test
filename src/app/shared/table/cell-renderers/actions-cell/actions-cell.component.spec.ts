import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import type { ICellRendererParams } from 'ag-grid-community';

import { ActionsCellComponent } from './actions-cell.component';
import type { ActionItem } from './actions-cell.model';

interface MockRow {
  id: number;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeParams(actions: ActionItem<MockRow>[], data: MockRow = { id: 1, name: 'Test' }): any {
  return { data, actions };
}

describe('ActionsCellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionsCellComponent],
      providers: [provideAnimationsAsync()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ActionsCellComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should filter out hidden actions', () => {
    const fixture = TestBed.createComponent(ActionsCellComponent);
    const component = fixture.componentInstance;

    component.agInit(
      makeParams([
        { label: 'Edit', click: () => {} },
        { label: 'Delete', click: () => {}, hidden: true },
        { label: 'View', click: () => {} },
      ]),
    );

    const visible = component['visibleActions']();
    expect(visible.length).toBe(2);
    expect(visible.map((a) => a.label)).toEqual(['Edit', 'View']);
  });

  it('should include all actions when none are hidden', () => {
    const fixture = TestBed.createComponent(ActionsCellComponent);
    const component = fixture.componentInstance;

    component.agInit(
      makeParams([
        { label: 'Edit', click: () => {} },
        { label: 'Delete', click: () => {} },
      ]),
    );

    expect(component['visibleActions']().length).toBe(2);
  });

  it('should call action click with row data', () => {
    const clickSpy = vi.fn();
    const row: MockRow = { id: 42, name: 'Product' };

    const fixture = TestBed.createComponent(ActionsCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams([{ label: 'Edit', click: clickSpy }], row));

    const action = component['visibleActions']()[0];
    component['onActionClick'](action);

    expect(clickSpy).toHaveBeenCalledWith(row);
  });

  it('should return empty array when no actions', () => {
    const fixture = TestBed.createComponent(ActionsCellComponent);
    const component = fixture.componentInstance;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component.agInit({ data: { id: 1, name: 'Test' } } as any);

    expect(component['visibleActions']()).toEqual([]);
  });

  it('refresh() should return false', () => {
    const fixture = TestBed.createComponent(ActionsCellComponent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(fixture.componentInstance.refresh({} as any)).toBe(false);
  });
});
