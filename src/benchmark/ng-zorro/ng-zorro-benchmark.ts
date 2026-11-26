import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { VERSIONS } from '../../env.generated';
import { BenchmarkPage } from '../benchmark-page';
import { BENCH_COLUMNS } from '../data';
import type { BenchAdapter } from '../harness';
import { NgZorroGrid } from './ng-zorro-grid';

const root = () =>
  document.querySelector<HTMLElement>(
    '[data-benchmark-grid="ng-zorro"] .ant-table',
  );

// the body is a CDK virtual scroll viewport, the native scroller of both
// axes; the header is a table of its own above it, which NG-ZORRO scrolls
// horizontally along with the body
const scroller = () =>
  root()?.querySelector<HTMLElement>('cdk-virtual-scroll-viewport') ?? null;

const body = () =>
  scroller()?.querySelector<HTMLElement>('tbody') ?? null;

// the columns are not virtualized: a row always has a cell for each of them,
// in order
const columnIndex = (field: string) =>
  BENCH_COLUMNS.findIndex((c) => c.field === field);

const ROW = 'tr[data-row-index]';

const adapter: BenchAdapter = {
  grid: 'ng-zorro',
  version: VERSIONS.ngZorro,
  getRoot: root,
  getVerticalScroller: scroller,
  getHorizontalScroller: scroller,
  getBodyRect: () => {
    const el = scroller();
    if (!el) {
      return null;
    }
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + el.clientLeft,
      top: rect.top + el.clientTop,
      width: el.clientWidth,
      height: el.clientHeight,
    };
  },
  getRenderedColumnCells: (field) =>
    Array.from(
      body()?.querySelectorAll<HTMLElement>(
        `${ROW} > td:nth-child(${columnIndex(field) + 1})`,
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
      `.ant-table-thead th:nth-child(${columnIndex(field) + 1})`,
    ) ?? null,
};

@Component({
  selector: 'ng-zorro-benchmark',
  imports: [BenchmarkPage, NgZorroGrid],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <bench-page [title]="title" [rowCount]="rowCount()" [adapter]="adapter">
      <ng-template let-ctx>
        <ng-zorro-grid
          [data]="ctx.data"
          [height]="ctx.height"
          [view]="ctx.view"
          [onUpdater]="ctx.onUpdater"
        />
      </ng-template>
    </bench-page>
  `,
})
export class NgZorroBenchmark {
  readonly rowCount = input.required<number>();

  protected readonly title = `NG-ZORRO Table ${adapter.version}`;
  protected readonly adapter = adapter;
}
