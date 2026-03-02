import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'client-table', pathMatch: 'full' },
  {
    path: 'client-table',
    loadComponent: () =>
      import('./features/client-table/client-table.component').then((m) => m.ClientTableComponent),
  },
  {
    path: 'server-table',
    loadComponent: () =>
      import('./features/server-table/server-table.component').then((m) => m.ServerTableComponent),
  },
];
