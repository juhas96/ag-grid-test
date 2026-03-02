# AGENTS.md

## Project Purpose
- This repo is an Angular 21 starter for a new AG Grid table wrapper.
- It currently contains scaffold-level app code plus Angular Material and AG Grid deps.
- `example/table/` is the reference implementation to recreate in modern Angular style.
- Do not copy `example/table/` literally; preserve behavior while upgrading architecture.

## Important Context For Agents
- The target is a reusable wrapper around AG Grid, not a one-off feature table.
- Keep APIs typed and composable so future tables can share primitives.
- Prefer incremental migration: recreate small features from `example/table/` in steps.

## Rule Files Check (Cursor/Copilot)
- `.cursor/rules/`: not present at time of writing.
- `.cursorrules`: not present at time of writing.
- `.github/copilot-instructions.md`: not present at time of writing.
- If any of these appear later, treat them as mandatory constraints.

## Stack Snapshot
- Angular CLI + build system: `@angular/cli` 21 + `@angular/build`.
- TypeScript: strict mode enabled in `tsconfig.json`.
- UI: Angular Material + SCSS.
- Grid: `ag-grid-angular`.
- Unit tests: Vitest via `ng test`.
- Package manager: npm (`packageManager: npm@10.9.2`).

## Core Commands
- Install deps: `npm install`
- Dev server: `npm start`
- Build (production): `npm run build`
- Build watch (development): `npm run watch`
- Run all tests: `npm test`
- Run tests once (CI style): `npm test -- --watch=false`
- Run single spec file: `npm test -- --watch=false --include=src/app/app.spec.ts`
- Run tests by name pattern: `npm test -- --watch=false --filter="App"`
- List discovered tests only: `npm test -- --list-tests`
- Coverage run: `npm test -- --watch=false --coverage`

## Single-Test Guidance
- Prefer `--include=<path-to-spec>` when iterating on one file.
- Use `--filter=<regex>` for narrowing by suite/test name across files.
- Keep `--watch=false` for deterministic output in automation.

## Linting Status
- There is no `lint` target configured in `angular.json` right now.
- `npx ng lint` currently fails: "Cannot find lint target".
- If linting is required, add ESLint first: `ng add angular-eslint`.
- After setup, run lint with: `npm run ng -- lint`.

## Repository Landmarks
- App code: `src/`
- Entry point: `src/main.ts`
- Root config: `src/app/app.config.ts`
- Root routes: `src/app/app.routes.ts`
- Current starter component: `src/app/app.ts`
- AG Grid reference material: `example/table/`

## Angular Architecture Conventions
- Use standalone Angular APIs; do not add `standalone: true` (default already).
- Use signal-first patterns for local state.
- Prefer `input()` / `output()` over decorator-based inputs/outputs.
- Default components to `ChangeDetectionStrategy.OnPush`.
- Use `inject()` for DI where it improves clarity.
- Keep feature boundaries clean; prepare for route-level lazy loading.
- Avoid monolithic modules for new wrapper implementation.

## Signals And State
- Use `signal()` for writable state.
- Use `computed()` for derived state.
- Use `linkedSignal()` where dependent state must reset when source changes.
- Use `effect()` only for side effects, not state propagation.
- Prefer immutable updates with `set`/`update`; avoid mutation patterns.

## Template Rules
- Use native control flow: `@if`, `@for`, `@switch`.
- Do not use `*ngIf`, `*ngFor`, `*ngSwitch` in new code.
- Do not use `ngClass`; use `[class]` / `[class.foo]` bindings.
- Do not use `ngStyle`; use `[style]` / `[style.prop]` bindings.
- Keep template expressions simple; move logic to TS/computed signals.
- Do not use arrow functions in templates.

## Host Bindings And Directives
- Do not use `@HostBinding` or `@HostListener` in new code.
- Put host classes/attrs/events in the `host` metadata object.
- This is important because the reference example includes legacy directive style.

## TypeScript Standards
- Keep strict compiler settings; do not relax strictness for convenience.
- Avoid `any`; use `unknown` plus narrowing.
- Prefer explicit types at module boundaries (public APIs, services, adapters).
- Use discriminated unions for grid/table state where applicable.
- Favor readonly structures for config objects and table definitions.
- Keep domain models and view models clearly separated.

## Imports And File Organization
- Import order: Angular/framework, third-party, then internal imports.
- Keep one blank line between import groups.
- Keep imports stable and predictable (alphabetize within groups when practical).
- Use named imports over namespace imports.
- Keep files focused; one primary exported symbol per file when possible.

## Naming Conventions
- Files: kebab-case.
- Components: `*.component.ts`.
- Directives: `*.directive.ts`.
- Services: `*.service.ts`.
- Tests: `*.spec.ts`.
- Types/interfaces: descriptive nouns aligned with feature domain.

## Formatting Conventions
- 2-space indentation.
- UTF-8 charset.
- Single quotes in TS.
- Prettier print width: 100.
- Trim trailing whitespace (markdown exempt by config).
- End files with a newline.

## Error Handling
- Fail fast on invalid inputs and impossible states.
- Return/propagate typed errors across data boundaries.
- Do not silently swallow exceptions.
- Add contextual error messages (feature + operation).
- Keep noisy console logging out of production code paths.

## Testing Expectations
- Update tests with every behavior change.
- Prefer behavior-driven assertions over implementation details.
- Keep tests deterministic; avoid flaky timing dependencies.
- Use file-targeted runs locally, then run full pass before handoff.
- For substantial work, run at least: `npm test -- --watch=false`.

## Accessibility And UX Baseline
- New UI must satisfy WCAG AA fundamentals.
- Ensure keyboard access for all interactive controls.
- Ensure visible focus states.
- Use semantic HTML first, ARIA second.
- Validate color contrast for text and controls.

## AG Grid Wrapper Migration Notes
- Start from core wrapper API and typed column/row contracts.
- Rebuild reusable pieces from `example/table/` as standalone units.
- Keep AG Grid-specific details behind a narrow adapter surface.
- Avoid leaking third-party specifics into feature-level components.
- Prioritize portability so wrapper can support multiple table use cases.

## Definition Of Done For Agent Changes
- Commands used are documented or updated here when workflow changes.
- Code follows Angular + TypeScript conventions above.
- Tests pass for touched behavior (file-targeted and/or full run as needed).
- No new legacy patterns imported from `example/table/`.
- Changes keep the repo aligned with the long-term wrapper goal.
