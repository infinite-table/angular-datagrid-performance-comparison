import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import {
  DataSource,
  GroupRowsState,
  InfiniteTable,
} from '@infinite-table/infinite-angular';
import type {
  DataSourceApi,
  DataSourcePropAggregationReducers,
  DataSourcePropFilterValue,
  DataSourcePropGroupBy,
  DataSourcePropSortInfo,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

import { INFINITE_LICENSE_KEY, VERSIONS } from '../../env.generated';
import { BenchmarkPage } from '../benchmark-page';
import type { BenchGridContext } from '../benchmark-page';
import {
  BENCH_COLUMNS,
  BENCH_COLUMN_WIDTH,
  BENCH_HEADER_HEIGHT,
  BENCH_ROW_HEIGHT,
} from '../data';
import type { BenchRow } from '../data';
import type { BenchAdapter } from '../harness';
import {
  BENCH_AGGREGATE_FIELD,
  BENCH_FILTER_FIELD,
  BENCH_FILTER_MIN,
  BENCH_GROUP_FIELD,
  BENCH_SORT_DIR,
  BENCH_SORT_FIELD,
} from '../updates';

// Set here, so the pages of the other grids don't load Infinite Table.
// Without a license key the grid works the same, but shows a footer - see
// "License key" in the README.
if (INFINITE_LICENSE_KEY) {
  InfiniteTable.licenseKey = INFINITE_LICENSE_KEY;
}

const columns: InfiniteTablePropColumns<BenchRow> = Object.fromEntries(
  BENCH_COLUMNS.map((c) => [
    c.field,
    {
      field: c.field,
      header: c.header,
      type: c.type === 'number' ? 'number' : 'string',
    },
  ]),
);

const CELL = '.InfiniteColumnCell:not(.InfiniteDetachedCell)';

const root = () =>
  document.querySelector<HTMLElement>(
    '[data-benchmark-grid="infinite"] .Infinite',
  );

const scroller = () =>
  root()?.querySelector<HTMLElement>('.InfiniteVirtualScrollContainer') ?? null;

const adapter: BenchAdapter = {
  grid: 'infinite',
  version: VERSIONS.infinite,
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
      root()?.querySelectorAll<HTMLElement>(
        `${CELL}[data-column-id="${field}"]`,
      ) ?? [],
    ),
  getRenderedRowCells: (rowIndex) =>
    Array.from(
      root()?.querySelectorAll<HTMLElement>(
        `${CELL}[data-row-index="${rowIndex}"]`,
      ) ?? [],
    ),
  getCellRowIndex: (cell) => Number(cell.getAttribute('data-row-index') ?? -1),
  getCellColumnId: (cell) => cell.getAttribute('data-column-id') ?? '',
  getCell: (rowIndex, field) =>
    root()?.querySelector<HTMLElement>(
      `${CELL}[data-row-index="${rowIndex}"][data-column-id="${field}"]`,
    ) ?? null,
  getHeaderCell: (field) =>
    root()?.querySelector<HTMLElement>(
      `.InfiniteHeaderCell[data-column-id="${field}"]`,
    ) ?? null,
};

const domProps = { style: { flex: 1, minHeight: 0 } };

// the views of the live-update scenarios - see updates.ts
const sortInfo: DataSourcePropSortInfo<BenchRow> = {
  field: BENCH_SORT_FIELD,
  dir: BENCH_SORT_DIR,
  // a sortInfo for a field (not a column) compares strings by default
  type: 'number',
};
const filterValue: DataSourcePropFilterValue<BenchRow> = [
  {
    field: BENCH_FILTER_FIELD,
    filter: { type: 'number', operator: 'gte', value: BENCH_FILTER_MIN },
  },
];
const groupBy: DataSourcePropGroupBy<BenchRow> = [{ field: BENCH_GROUP_FIELD }];
const aggregationReducers: DataSourcePropAggregationReducers<BenchRow> = {
  [BENCH_AGGREGATE_FIELD]: {
    field: BENCH_AGGREGATE_FIELD,
    initialValue: 0,
    reducer: (sum: number, value: number) => sum + value,
  },
};
const collapsedGroups = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

/**
 * Infinite Table with defaults - only row height / header height / column
 * widths are set, to match the other grids.
 *
 * Rows are changed with `dataSourceApi.updateDataArray`, the API Infinite
 * Table documents for live updates. In the filtered view the column filters
 * are not shown in the header (`showColumnFilters: false`), so the header has
 * the same height as in the other grids.
 */
@Component({
  selector: 'infinite-benchmark',
  imports: [BenchmarkPage, DataSource, InfiniteTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './infinite.css',
  template: `
    <bench-page [title]="title" [rowCount]="rowCount()" [adapter]="adapter">
      <ng-template let-ctx>
        <infinite-data-source
          [data]="ctx.data"
          primaryKey="id"
          (ready)="onReady(ctx, $event)"
          [defaultSortInfo]="ctx.view === 'sorted' ? sortInfo : undefined"
          [defaultFilterValue]="
            ctx.view === 'filtered' ? filterValue : undefined
          "
          [groupBy]="ctx.view === 'grouped' ? groupBy : undefined"
          [aggregationReducers]="
            ctx.view === 'grouped' ? aggregationReducers : undefined
          "
          [defaultGroupRowsState]="
            ctx.view === 'grouped' ? collapsedGroups : undefined
          "
        >
          <infinite-table
            [columns]="columns"
            [rowHeight]="rowHeight"
            [columnHeaderHeight]="headerHeight"
            [columnDefaultWidth]="columnWidth"
            [domProps]="domProps"
            [showColumnFilters]="ctx.view === 'filtered' ? false : undefined"
          />
        </infinite-data-source>
      </ng-template>
    </bench-page>
  `,
})
export class InfiniteBenchmark {
  readonly rowCount = input.required<number>();

  protected readonly title = `Infinite Table ${adapter.version}`;
  protected readonly adapter = adapter;
  protected readonly columns = columns;
  protected readonly rowHeight = BENCH_ROW_HEIGHT;
  protected readonly headerHeight = BENCH_HEADER_HEIGHT;
  protected readonly columnWidth = BENCH_COLUMN_WIDTH;
  protected readonly domProps = domProps;
  protected readonly sortInfo = sortInfo;
  protected readonly filterValue = filterValue;
  protected readonly groupBy = groupBy;
  protected readonly aggregationReducers = aggregationReducers;
  protected readonly collapsedGroups = collapsedGroups;

  protected onReady(ctx: BenchGridContext, api: DataSourceApi<BenchRow>) {
    ctx.onUpdater((rows) => {
      api.updateDataArray(rows);
    });
  }
}
