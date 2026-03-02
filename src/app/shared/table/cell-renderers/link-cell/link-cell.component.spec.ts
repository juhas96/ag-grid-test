import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { ICellRendererParams } from 'ag-grid-community';

import { LinkCellComponent } from './link-cell.component';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeParams(routerLink: unknown[] | string, label?: string, value?: string): any {
  return { routerLink, label, value };
}

describe('LinkCellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkCellComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LinkCellComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should resolve routerLink', () => {
    const fixture = TestBed.createComponent(LinkCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams(['/products', '123']));

    expect(component['route']()).toEqual(['/products', '123']);
  });

  it('should use label when provided', () => {
    const fixture = TestBed.createComponent(LinkCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams(['/products'], 'View Product', 'cell-value'));

    expect(component['displayLabel']()).toBe('View Product');
  });

  it('should fall back to cell value when label is not provided', () => {
    const fixture = TestBed.createComponent(LinkCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams(['/products'], undefined, 'Product Name'));

    expect(component['displayLabel']()).toBe('Product Name');
  });

  it('should handle null routerLink', () => {
    const fixture = TestBed.createComponent(LinkCellComponent);
    const component = fixture.componentInstance;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component.agInit({ value: 'test' } as any);

    expect(component['route']()).toBeNull();
  });

  it('refresh() should return false', () => {
    const fixture = TestBed.createComponent(LinkCellComponent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(fixture.componentInstance.refresh({} as any)).toBe(false);
  });
});
