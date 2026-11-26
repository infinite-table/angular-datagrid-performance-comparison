import {
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import type { EnvironmentProviders, Provider, Type } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

// Kept minimal on purpose: nothing is rendered next to the grids, and no
// grid is imported here - each page is a chunk of its own, so it loads only
// the code and the styles of its grid.
//
// /benchmark/<grid>-<size> -> src/pages/benchmark/<grid>-<size>.ts
type PageModule = {
  /** the root component of the page (selector `bench-app`) */
  default: Type<unknown>;
  /** what the grid of the page needs provided in the app - e.g. a theme */
  providers?: (Provider | EnvironmentProviders)[];
};

const pages: Record<string, () => Promise<PageModule>> = {
  'infinite-300k': () => import('./pages/benchmark/infinite-300k'),
  'infinite-1m': () => import('./pages/benchmark/infinite-1m'),
  'primeng-300k': () => import('./pages/benchmark/primeng-300k'),
  'primeng-1m': () => import('./pages/benchmark/primeng-1m'),
  'ag-grid-300k': () => import('./pages/benchmark/ag-grid-300k'),
  'ag-grid-1m': () => import('./pages/benchmark/ag-grid-1m'),
  'tanstack-300k': () => import('./pages/benchmark/tanstack-300k'),
  'tanstack-1m': () => import('./pages/benchmark/tanstack-1m'),
  'ng-zorro-300k': () => import('./pages/benchmark/ng-zorro-300k'),
  'ng-zorro-1m': () => import('./pages/benchmark/ng-zorro-1m'),
};

const path = window.location.pathname.replace(/\/+$/, '');
const match = /^\/benchmark\/([a-z0-9-]+)$/.exec(path);
const load = match ? pages[match[1]] : undefined;

const index = (): Promise<PageModule> => import('./pages/index');

(load ?? index)().then((page) =>
  bootstrapApplication(page.default, {
    providers: [
      // the default of Angular 22, written out: change detection runs when
      // signals, inputs and template events say so - no zone.js
      provideZonelessChangeDetection(),
      provideBrowserGlobalErrorListeners(),
      ...(page.providers ?? []),
    ],
  }),
);
