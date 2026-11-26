import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BENCH_SIZES } from '../benchmark/data';
import type { BenchSize } from '../benchmark/data';
import { VERSIONS } from '../env.generated';

// the installed versions - see scripts/write-env.mjs
const GRIDS = [
  { id: 'infinite', name: 'Infinite Table', version: VERSIONS.infinite },
  { id: 'primeng', name: 'PrimeNG Table', version: VERSIONS.primeng },
  { id: 'ag-grid', name: 'AG Grid', version: VERSIONS.agGrid },
  { id: 'tanstack', name: 'TanStack Table', version: VERSIONS.tanstackTable },
  { id: 'ng-zorro', name: 'NG-ZORRO Table', version: VERSIONS.ngZorro },
];

/** the pages the benchmark measures - open them to scroll the grids yourself */
@Component({
  selector: 'bench-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main
      style="padding: 32px; font: 16px/1.6 system-ui, sans-serif; color: #1b1b1b"
    >
      <h1 style="font-size: 24px">
        Infinite Table, PrimeNG Table, AG Grid, TanStack Table and NG-ZORRO
        Table for Angular - benchmark pages
      </h1>
      <p>
        Each page renders one grid with the same generated data. The benchmark
        measures exactly these pages - see the README.
      </p>
      <ul>
        @for (size of sizes; track size) {
          @for (grid of grids; track grid.id) {
            <li>
              <a [href]="'/benchmark/' + grid.id + '-' + size">
                {{ grid.name }} {{ grid.version }} -
                {{ rowCount(size) }} rows
              </a>
            </li>
          }
        }
      </ul>
    </main>
  `,
})
export default class IndexPage {
  protected readonly grids = GRIDS;
  protected readonly sizes = Object.keys(BENCH_SIZES) as BenchSize[];
  protected rowCount(size: BenchSize) {
    return BENCH_SIZES[size].toLocaleString('en-US');
  }
}
