import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import type { ICellRendererParams } from 'ag-grid-community';

import { ToggleCellComponent } from './toggle-cell.component';

interface MockRow {
  id: number;
  active: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeParams(
  value: boolean,
  change: (data: MockRow, checked: boolean) => void,
  data: MockRow = { id: 1, active: true },
  options: {
    disabled?: (data: MockRow) => boolean;
    checked?: (data: MockRow) => boolean;
  } = {},
): any {
  return { value, data, change, ...options };
}

describe('ToggleCellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleCellComponent],
      providers: [provideAnimationsAsync()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ToggleCellComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should use cell value for checked state by default', () => {
    const fixture = TestBed.createComponent(ToggleCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams(true, () => {}));

    expect(component['isChecked']()).toBe(true);
  });

  it('should use checked callback when provided', () => {
    const fixture = TestBed.createComponent(ToggleCellComponent);
    const component = fixture.componentInstance;
    component.agInit(
      makeParams(false, () => {}, { id: 1, active: true }, { checked: (d) => d.active }),
    );

    expect(component['isChecked']()).toBe(true);
  });

  it('should call change handler on toggle', () => {
    const changeSpy = vi.fn();
    const row: MockRow = { id: 1, active: false };

    const fixture = TestBed.createComponent(ToggleCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams(false, changeSpy, row));

    component['onChange'](true);

    expect(changeSpy).toHaveBeenCalledWith(row, true);
  });

  it('should resolve disabled state', () => {
    const fixture = TestBed.createComponent(ToggleCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams(true, () => {}, { id: 1, active: true }, { disabled: () => true }));

    expect(component['isDisabled']()).toBe(true);
  });

  it('should default to not disabled', () => {
    const fixture = TestBed.createComponent(ToggleCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams(true, () => {}));

    expect(component['isDisabled']()).toBe(false);
  });

  it('refresh() should return false', () => {
    const fixture = TestBed.createComponent(ToggleCellComponent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(fixture.componentInstance.refresh({} as any)).toBe(false);
  });
});
