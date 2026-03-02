import { TestBed } from '@angular/core/testing';
import type { ICellRendererParams } from 'ag-grid-community';

import { IconCellComponent } from './icon-cell.component';

interface MockRow {
  active: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeParams(
  icon: string | ((data: MockRow) => string),
  data: MockRow | undefined = { active: true },
  color?: string | ((data: MockRow) => string),
  tooltip?: string | ((data: MockRow) => string),
): any {
  return { data, icon, color, tooltip };
}

describe('IconCellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconCellComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(IconCellComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should resolve a static icon name', () => {
    const fixture = TestBed.createComponent(IconCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams('check'));

    expect(component['iconName']()).toBe('check');
  });

  it('should resolve a dynamic icon function', () => {
    const fixture = TestBed.createComponent(IconCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams((data) => (data.active ? 'check_circle' : 'cancel')));

    expect(component['iconName']()).toBe('check_circle');
  });

  it('should default color to inherit', () => {
    const fixture = TestBed.createComponent(IconCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams('check'));

    expect(component['iconColor']()).toBe('inherit');
  });

  it('should resolve a static color', () => {
    const fixture = TestBed.createComponent(IconCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams('check', { active: true }, 'green'));

    expect(component['iconColor']()).toBe('green');
  });

  it('should resolve a dynamic color function', () => {
    const fixture = TestBed.createComponent(IconCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams('check', { active: false }, (d) => (d.active ? 'green' : 'red')));

    expect(component['iconColor']()).toBe('red');
  });

  it('should resolve tooltip', () => {
    const fixture = TestBed.createComponent(IconCellComponent);
    const component = fixture.componentInstance;
    component.agInit(makeParams('check', { active: true }, undefined, 'Active'));

    expect(component['tooltipText']()).toBe('Active');
  });

  it('refresh() should return false', () => {
    const fixture = TestBed.createComponent(IconCellComponent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(fixture.componentInstance.refresh({} as any)).toBe(false);
  });
});
