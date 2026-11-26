import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { VERSIONS } from '../../env.generated';
import { BenchmarkPage } from '../benchmark-page';
import { BENCH_COLUMNS } from '../data';
import type { BenchAdapter } from '../harness';
import { PrimeNgGrid } from './primeng-grid';

const root = () =>
  document.querySelector<HTMLElement>(
    '[data-benchmark-grid="primeng"] .p-datatable',
  );

// one native scroller for both axes, with the (sticky) header inside it
const scroller = () =>
  root()?.querySelector<HTMLElement>('.p-virtualscroller') ?? null;

const body = () =>
  root()?.querySelector<HTMLElement>('tbody.p-datatable-tbody') ?? null;

// the columns are not virtualized: a row always has a cell for each of them,
// in order
const columnIndex = (field: string) =>
  BENCH_COLUMNS.findIndex((c) => c.field === field);

const adapter: BenchAdapter = {
  grid: 'primeng',
  version: VERSIONS.primeng,
  getRoot: root,
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
      body()?.querySelectorAll<HTMLElement>(
        `tr > td:nth-child(${columnIndex(field) + 1})`,
      ) ?? [],
    ),
  getRenderedRowCells: (rowIndex) =>
    Array.from(
      body()?.querySelectorAll<HTMLElement>(
        `tr[data-row-index="${rowIndex}"] > td`,
      ) ?? [],
    ),
  getCellRowIndex: (cell) =>
    Number(cell.closest('tr')?.getAttribute('data-row-index') ?? -1),
  getCellColumnId: (cell) =>
    BENCH_COLUMNS[(cell as HTMLTableCellElement).cellIndex]?.field ?? '',
  getCell: (rowIndex, field) =>
    body()?.querySelector<HTMLElement>(
      `tr[data-row-index="${rowIndex}"] > td:nth-child(${columnIndex(field) + 1})`,
    ) ?? null,
  getHeaderCell: (field) =>
    root()?.querySelector<HTMLElement>(
      `thead th:nth-child(${columnIndex(field) + 1})`,
    ) ?? null,
};

@Component({
  selector: 'primeng-benchmark',
  imports: [BenchmarkPage, PrimeNgGrid],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <bench-page [title]="title" [rowCount]="rowCount()" [adapter]="adapter">
      <ng-template let-ctx>
        <primeng-grid
          [data]="ctx.data"
          [view]="ctx.view"
          [onUpdater]="ctx.onUpdater"
        />
      </ng-template>
    </bench-page>
  `,
})
export class PrimeNgBenchmark {
  readonly rowCount = input.required<number>();

  protected readonly title = `PrimeNG Table ${adapter.version}`;
  protected readonly adapter = adapter;
}
