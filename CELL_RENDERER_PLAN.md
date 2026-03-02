# Cell Renderer Builder System - Implementation Plan

## Architecture Overview

The system has 4 layers, built bottom-up:

```
Layer 4: Factory Functions  (createDateColumn, createLinkColumn, ...)
Layer 3: Cell Renderer Components  (DateCell, LinkCell, ButtonCell, ...)
Layer 2: Params Interfaces  (DateCellParams, LinkCellParams, ...)
Layer 1: Enhanced AppColDef<T>  (removes `any` from AG Grid's ColDef)
```

## File Structure

```
src/app/shared/table/
├── models/
│   ├── column-def.model.ts          # Enhanced AppColDef<T> (MODIFY existing)
│   └── ...existing...
├── cell-renderers/
│   ├── index.ts                     # Barrel for renderers
│   ├── base-cell-renderer.ts        # Abstract base class
│   ├── date-cell/
│   │   ├── date-cell.component.ts
│   │   ├── date-cell.model.ts       # DateCellParams
│   │   └── date-cell.component.spec.ts
│   ├── link-cell/
│   │   ├── link-cell.component.ts
│   │   ├── link-cell.model.ts       # LinkCellParams
│   │   └── link-cell.component.spec.ts
│   ├── button-cell/
│   │   ├── button-cell.component.ts
│   │   ├── button-cell.model.ts     # ButtonCellParams
│   │   └── button-cell.component.spec.ts
│   ├── icon-cell/
│   │   ├── icon-cell.component.ts
│   │   ├── icon-cell.model.ts       # IconCellParams
│   │   └── icon-cell.component.spec.ts
│   ├── toggle-cell/
│   │   ├── toggle-cell.component.ts
│   │   ├── toggle-cell.model.ts     # ToggleCellParams
│   │   └── toggle-cell.component.spec.ts
│   └── actions-cell/
│       ├── actions-cell.component.ts
│       ├── actions-cell.model.ts    # ActionsCellParams, ActionItem
│       └── actions-cell.component.spec.ts
├── column-factories.ts              # All factory functions
├── column-factories.spec.ts         # Factory tests
└── index.ts                         # Update barrel exports
```

---

## Phase 1: Foundation (Layer 1 + 2)

### 1a. Enhance `AppColDef<T>` (`column-def.model.ts`)

- [ ] Strip `any`-typed properties from AG Grid's `ColDef` (`cellRendererParams`)
- [ ] Re-add with proper types: static object or factory function
- [ ] Add `AppColDefNoField<T>` for fieldless columns (actions, selection)
- [ ] Update `GridWrapperComponent` to accept `(AppColDef<T> | AppColDefNoField<T>)[]`

```ts
type RetypedProperties = 'cellRendererParams';
type StrictColDef<T> = Omit<ColDef<T>, RetypedProperties>;

type CellRendererParamsColDef<T> = {
  readonly cellRendererParams?:
    | Record<string, unknown>
    | ((params: ICellRendererParams<T>) => Record<string, unknown>);
};

export type AppColDef<T> = StrictColDef<T> &
  CellRendererParamsColDef<T> & {
    readonly field: Extract<keyof T, string>;
  };

export type AppColDefNoField<T> = StrictColDef<T> & CellRendererParamsColDef<T>;
```

### 1b. Base Cell Renderer (`base-cell-renderer.ts`)

- [ ] Create abstract class implementing `ICellRendererAngularComp`
- [ ] Store params as signal for reactive template access
- [ ] Default `refresh()` to `false` (safe: re-create on data change)

```ts
export abstract class BaseCellRenderer<TParams = unknown> implements ICellRendererAngularComp {
  protected params = signal<(ICellRendererParams & TParams) | null>(null);

  agInit(params: ICellRendererParams & TParams): void {
    this.params.set(params);
  }

  refresh(_params: ICellRendererParams & TParams): boolean {
    return false;
  }
}
```

### 1c. Params Interfaces

- [ ] `DateCellParams` — `format?: 'date' | 'dateTime' | 'time' | string`
- [ ] `LinkCellParams<T>` — `routerLink`, `label?`
- [ ] `ButtonCellParams<T>` — `label`, `click`, `disabled?`, `variant?`
- [ ] `IconCellParams<T>` — `icon`, `color?`, `tooltip?`
- [ ] `ToggleCellParams<T>` — `change`, `disabled?`, `checked?`
- [ ] `ActionsCellParams<T>` + `ActionItem<T>` — `actions`, `label`, `icon?`, `click`, `disabled?`, `hidden?`

---

## Phase 2: Cell Renderer Components (Layer 3)

All components follow these conventions:

- `ChangeDetectionStrategy.OnPush`
- `host` metadata for host bindings (no `@HostBinding`)
- Signal-based internal state
- `@if` / `@for` control flow
- Angular Material components where appropriate
- Extend `BaseCellRenderer<XxxCellParams<T>>`
- Use `computed()` for resolving static-or-function params

### Build order:

1. - [ ] **DateCellComponent** — Simplest. Uses Angular `DatePipe`. No Material deps.
2. - [ ] **IconCellComponent** — Uses Material icon. Static or dynamic icon/color.
3. - [ ] **ButtonCellComponent** — Uses Material button. Callback pattern.
4. - [ ] **LinkCellComponent** — Uses `RouterLink`. Router integration.
5. - [ ] **ToggleCellComponent** — Uses Material slide-toggle. Two-way binding.
6. - [ ] **ActionsCellComponent** — Most complex. Uses Material menu + `ActionItem` model.

---

## Phase 3: Factory Functions (Layer 4)

**File:** `column-factories.ts`

Two param strategies:

- **Static params** — for renderers where config is the same for every row
- **Factory params** — for renderers where config depends on row data

### Factory list:

- [ ] `createDateColumn<T>` — Static (`format`). Shorthand: `createDateTimeColumn`
- [ ] `createIconColumn<T>` — Factory `(data: T) => IconCellParams`
- [ ] `createButtonColumn<T>` — Static object with `click` callback
- [ ] `createLinkColumn<T>` — Factory `(data: T) => LinkCellParams`
- [ ] `createToggleColumn<T>` — Factory `(data: T) => ToggleCellParams`
- [ ] `createActionsColumn<T>` — Factory, fieldless column

### Consumer usage example:

```ts
const colDefs: AppColDef<Product>[] = [
  { field: 'name', headerName: 'Product Name' },
  createDateColumn({ field: 'createdAt', headerName: 'Created' }),
  createLinkColumn({ field: 'name', headerName: 'Product' }, (data) => ({
    routerLink: ['/products', data.id],
  })),
  createActionsColumn({ headerName: '' }, (data) => ({
    actions: [
      { label: 'Edit', icon: 'edit', click: () => edit(data) },
      { label: 'Delete', icon: 'delete', click: () => delete data },
    ],
  })),
];
```

---

## Phase 4: Integration + Testing

- [ ] Update barrel exports (`index.ts`) — export renderers, params types, factory functions
- [ ] Update `GridWrapperComponent` — accept `(AppColDef<T> | AppColDefNoField<T>)[]`
- [ ] Update feature demo (`client-table`) — use at least one factory as demonstration
- [ ] Tests: each renderer (agInit, template, callbacks)
- [ ] Tests: `column-factories.spec.ts` (correct cellRenderer + cellRendererParams shape)
- [ ] Run full suite: `npm test -- --watch=false`

---

## Design Decisions

| Decision                | Choice                                                | Rationale                                                             |
| ----------------------- | ----------------------------------------------------- | --------------------------------------------------------------------- |
| Column ordering         | Array position (no `order` prop)                      | Simpler; consumers control order naturally                            |
| Base class vs interface | Abstract class `BaseCellRenderer<T>`                  | Signal-based `params` storage + default `refresh()`. Less boilerplate |
| `AppColDefNoField<T>`   | Separate type for fieldless columns                   | Actions/selection columns shouldn't require `field`                   |
| Param strategy          | Static for row-independent, factory for row-dependent | Right API for each use case                                           |
| Material components     | Use where they add value (button, toggle, menu, icon) | Already a dependency; consistent UI                                   |
| `host` metadata         | Always; no `@HostBinding`                             | Follows project conventions                                           |

## Risks / Open Questions

1. **`cellRendererParams` retyping:** The retyped `AppColDef<T>` no longer perfectly extends `ColDef<T>`. The grid wrapper needs one internal cast (`as ColDef<T>[]`). Tradeoff: type safety at API boundary > one internal cast.

2. **Performance:** Angular cell renderers have overhead vs plain JS renderers (Angular context switching per cell). Mitigated by OnPush + signals + minimal DOM. If perf becomes an issue, individual renderers can be swapped to JS behind the same factory API.

3. **Actions menu complexity:** Most complex renderer. Could be split across 2 implementation steps if needed.
