import { TestBed } from '@angular/core/testing';
import type { ICellRendererParams } from 'ag-grid-community';

import { DateCellComponent } from './date-cell.component';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeParams(value: unknown, format?: string): any {
  return { value, format };
}

describe('DateCellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateCellComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DateCellComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should format a date with default format (mediumDate)', () => {
    const fixture = TestBed.createComponent(DateCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams(new Date(2025, 0, 15)));

    const formatted = component['formattedValue']();
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2025');
  });

  it('should format a date with dateTime format', () => {
    const fixture = TestBed.createComponent(DateCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams(new Date(2025, 5, 1, 14, 30, 0), 'dateTime'));

    const formatted = component['formattedValue']();
    expect(formatted).toContain('Jun');
    expect(formatted).toContain('2025');
  });

  it('should format a date with time format', () => {
    const fixture = TestBed.createComponent(DateCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams(new Date(2025, 0, 1, 9, 15, 0), 'time'));

    const formatted = component['formattedValue']();
    expect(formatted).toBeTruthy();
    // Should contain time but not a full date
    expect(formatted).toContain(':');
  });

  it('should handle null value gracefully', () => {
    const fixture = TestBed.createComponent(DateCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams(null));

    expect(component['formattedValue']()).toBeNull();
  });

  it('should handle undefined value gracefully', () => {
    const fixture = TestBed.createComponent(DateCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams(undefined));

    expect(component['formattedValue']()).toBeNull();
  });

  it('should accept a custom DatePipe format string', () => {
    const fixture = TestBed.createComponent(DateCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams(new Date(2025, 0, 15), 'yyyy-MM-dd'));

    expect(component['formattedValue']()).toBe('2025-01-15');
  });

  it('refresh() should return false', () => {
    const fixture = TestBed.createComponent(DateCellComponent);
    const component = fixture.componentInstance;
    expect(component.refresh(makeParams(new Date()))).toBe(false);
  });
});
