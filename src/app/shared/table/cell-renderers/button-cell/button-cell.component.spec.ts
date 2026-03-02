import { TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import type { ICellRendererParams } from 'ag-grid-community';

import { ButtonCellComponent } from './button-cell.component';

interface MockRow {
  id: number;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeParams(
  label: string,
  click: (data: MockRow) => void,
  data: MockRow = { id: 1, name: 'Test' },
  options: { disabled?: (data: MockRow) => boolean; variant?: 'flat' | 'stroked' | 'basic' } = {},
): any {
  return { data, label, click, ...options };
}

describe('ButtonCellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonCellComponent],
      providers: [provideAnimationsAsync()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ButtonCellComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display the label', () => {
    const fixture = TestBed.createComponent(ButtonCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams('Edit', () => {}));

    expect(component['label']()).toBe('Edit');
  });

  it('should call click handler with row data', () => {
    const clickSpy = vi.fn();
    const row: MockRow = { id: 42, name: 'Product' };

    const fixture = TestBed.createComponent(ButtonCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams('Edit', clickSpy, row));

    const event = new MouseEvent('click');
    vi.spyOn(event, 'stopPropagation');
    component['onClick'](event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalledWith(row);
  });

  it('should resolve disabled state from callback', () => {
    const fixture = TestBed.createComponent(ButtonCellComponent);
    const component = fixture.componentInstance;
    component.agInit(
      makeParams('Edit', () => {}, { id: 1, name: 'Test' }, { disabled: () => true }),
    );

    expect(component['isDisabled']()).toBe(true);
  });

  it('should default to not disabled', () => {
    const fixture = TestBed.createComponent(ButtonCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams('Edit', () => {}));

    expect(component['isDisabled']()).toBe(false);
  });

  it('should default variant to stroked', () => {
    const fixture = TestBed.createComponent(ButtonCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams('Edit', () => {}));

    expect(component['variant']()).toBe('stroked');
  });

  it('should use specified variant', () => {
    const fixture = TestBed.createComponent(ButtonCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams('Edit', () => {}, { id: 1, name: 'Test' }, { variant: 'flat' }));

    expect(component['variant']()).toBe('flat');
  });

  it('refresh() should return false', () => {
    const fixture = TestBed.createComponent(ButtonCellComponent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(fixture.componentInstance.refresh({} as any)).toBe(false);
  });
});
