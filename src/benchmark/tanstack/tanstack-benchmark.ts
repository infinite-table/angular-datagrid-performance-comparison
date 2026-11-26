import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { VERSIONS } from '../../env.generated';
import { BenchmarkPage } from '../benchmark-page';
import type { BenchAdapter } from '../harness';
// TanStack Table is headless - the markup is in tanstack-grid.html
import { TanStackGrid } from './tanstack-grid';

const root = () =>
  document.querySelector<HTMLElement>('[data-benchmark-grid="tanstack"] table');

const scroller = () => root()?.parentElement ?? null;

const body = () => root()?.querySelector<HTMLElement>('tbody') ?? null;

const adapter: BenchAdapter = {
  grid: 'tanstack',
  version: VERSIONS.tanstackTable,
  getRoot: () => scroller(),
  getVerticalScroller: scroller,
  getHorizontalScroller: scroller,
  getBodyRect: () => {
    const el = scroller();
    const header = root()?.querySelector<HTMLElement>('thead');
    if (!el || !header) {
      return null;
    }
    const rect = el.getBoundingClientRect();
    const top = header.getBoundingClientRect().bottom;
    return {
      left: rect.left + el.clientLeft,
      top,
      width: el.clientWidth,
      height: rect.top + el.clientTop + el.clientHeight - top,
    };
  },
  getRenderedColumnCells: (field) =>
    Array.from(
      body()?.querySelectorAll<HTMLElement>(`td[data-column-id="${field}"]`) ??
        [],
    ),
  getRenderedRowCells: (rowIndex) =>
    Array.from(
      body()?.querySelectorAll<HTMLElement>(
        `td[data-row-index="${rowIndex}"]`,
      ) ?? [],
    ),
  getCellRowIndex: (cell) => Number(cell.getAttribute('data-row-index') ?? -1),
  getCellColumnId: (cell) => cell.getAttribute('data-column-id') ?? '',
  getCell: (rowIndex, field) =>
    body()?.querySelector<HTMLElement>(
      `td[data-row-index="${rowIndex}"][data-column-id="${field}"]`,
    ) ?? null,
  getHeaderCell: (field) =>
    root()?.querySelector<HTMLElement>(`th[data-column-id="${field}"]`) ?? null,
};

@Component({
  selector: 'tanstack-benchmark',
  imports: [BenchmarkPage, TanStackGrid],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <bench-page [title]="title" [rowCount]="rowCount()" [adapter]="adapter">
      <ng-template let-ctx>
        <tanstack-grid
          [data]="ctx.data"
          [view]="ctx.view"
          [onUpdater]="ctx.onUpdater"
        />
      </ng-template>
    </bench-page>
  `,
})
export class TanStackBenchmark {
  readonly rowCount = input.required<number>();

  protected readonly title = `TanStack Table ${VERSIONS.tanstackTable} + TanStack Virtual ${VERSIONS.tanstackVirtual}`;
  protected readonly adapter = adapter;
}
