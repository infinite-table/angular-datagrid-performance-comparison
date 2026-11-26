import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
  input,
  signal,
} from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import type {
  NzTableFilterFn,
  NzTableFilterList,
  NzTableSortFn,
  NzTableSortOrder,
} from 'ng-zorro-antd/table';

import {
  BENCH_COLUMNS,
  BENCH_COLUMN_WIDTH,
  BENCH_HEADER_HEIGHT,
  BENCH_ROW_HEIGHT,
} from '../data';
import type { BenchColumn, BenchRow } from '../data';
import {
  BENCH_FILTER_FIELD,
  BENCH_FILTER_MIN,
  BENCH_SORT_DIR,
  BENCH_SORT_FIELD,
  applyBenchUpdates,
} from '../updates';
import type { BenchView } from '../updates';

// The comparators of the sortable columns: NG-ZORRO sorts the rows, with the
// compare function the page gives each column (`nzSortFn`) - these are the
// ones of the "Sort" examples of its documentation
const sortFns: Record<string, NzTableSortFn<BenchRow>> = Object.fromEntries(
  BENCH_COLUMNS.map((c) => {
    const field = c.field;
    const fn: NzTableSortFn<BenchRow> =
      c.type === 'number'
        ? (a, b) => (a[field] as number) - (b[field] as number)
        : (a, b) => String(a[field]).localeCompare(String(b[field]));
    return [field, fn];
  }),
);

// the filtered view: a filter on the salary column, selected from the start
const salaryFilters: NzTableFilterList = [
  {
    text: `≥ ${BENCH_FILTER_MIN.toLocaleString('en-US')}`,
    value: BENCH_FILTER_MIN,
    byDefault: true,
  },
];
const salaryFilterFn: NzTableFilterFn<BenchRow> = (min: number, row) =>
  row[BENCH_FILTER_FIELD] >= min;

/**
 * NG-ZORRO Table (`nz-table`) with its virtual scroll, with defaults except
 * for what makes the setup match the other grids:
 *  - `nzVirtualItemSize` (the row height), no pagination
 *    (`nzFrontPagination` / `nzShowPagination` false) and `nzScroll` - the
 *    width of all the columns and the height of the body in px, which the
 *    virtual scroll requires - as in the "Virtual" example of its
 *    documentation
 *  - same row height / header height / column widths
 *  - a `data-row-index` attribute on the rows, for the harness
 *
 * Every column is sortable, with the compare function of its documentation
 * (`nzSortFn`): NG-ZORRO keeps the sort state and sorts the rows itself, but
 * the comparator comes from the page.
 *
 * For the live-update scenarios (see updates.ts): the sorted view sets the
 * `nzSortOrder` of the salary column, the filtered view gives it a filter
 * (`nzFilters`, selected by default, and `nzFilterFn`) - which shows the
 * filter icon in its header. NG-ZORRO Table has no row grouping, so there is
 * no `grouped` view. Rows are changed through `nzData`: a new array.
 */
@Component({
  selector: 'ng-zorro-grid',
  imports: [NzTableModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './ng-zorro.css',
  host: {
    style: 'display: flex; flex-direction: column; flex: 1; min-height: 0',
  },
  template: `
    <nz-table
      [nzData]="rows()"
      [nzVirtualItemSize]="rowHeight"
      [nzVirtualForTrackBy]="trackById"
      [nzFrontPagination]="false"
      [nzShowPagination]="false"
      [nzScroll]="scroll"
      [nzWidthConfig]="widthConfig"
    >
      <thead>
        <tr>
          @for (column of columns; track column.field) {
            <th
              [style.height.px]="headerHeight"
              [nzSortFn]="sortFns[column.field]"
              [nzSortOrder]="sortOrder(column)"
              [nzFilters]="filters(column)"
              [nzFilterFn]="filterFn(column)"
              [nzFilterMultiple]="false"
              [nzShowFilter]="filters(column).length > 0"
            >
              {{ column.header }}
            </th>
          }
        </tr>
      </thead>
      <tbody>
        <ng-template nz-virtual-scroll let-row let-index="index">
          <tr [attr.data-row-index]="index" [style.height.px]="rowHeight">
            @for (column of columns; track column.field) {
              <td>{{ row[column.field] }}</td>
            }
          </tr>
        </ng-template>
      </tbody>
    </nz-table>
  `,
  styles: `
    ng-zorro-grid .ant-table-thead > tr > th,
    ng-zorro-grid .ant-table-tbody > tr > td {
      padding-top: 0;
      padding-bottom: 0;
      box-sizing: border-box;
      white-space: nowrap;
      overflow: hidden;
    }
  `,
})
export class NgZorroGrid implements OnInit {
  readonly data = input.required<BenchRow[]>();
  readonly height = input.required<number>();
  readonly view = input.required<BenchView>();
  readonly onUpdater =
    input.required<(update: (rows: BenchRow[]) => void) => void>();

  protected readonly columns = BENCH_COLUMNS;
  protected readonly rowHeight = BENCH_ROW_HEIGHT;
  protected readonly headerHeight = BENCH_HEADER_HEIGHT;
  protected readonly sortFns = sortFns;
  protected readonly widthConfig = BENCH_COLUMNS.map(
    () => `${BENCH_COLUMN_WIDTH}px`,
  );
  protected scroll = { x: '0px', y: '0px' };
  protected readonly rows = signal<BenchRow[]>([]);
  protected readonly trackById = (_: number, row: BenchRow) => row.id;

  ngOnInit() {
    if (this.view() === 'grouped') {
      throw new Error('NG-ZORRO Table has no row grouping');
    }
    this.scroll = {
      x: `${BENCH_COLUMNS.length * BENCH_COLUMN_WIDTH}px`,
      // the body: the box, without the header
      y: `${this.height() - BENCH_HEADER_HEIGHT}px`,
    };
    let data = this.data();
    this.rows.set(data);
    this.onUpdater()((changed) => {
      data = applyBenchUpdates(data, changed);
      this.rows.set(data);
    });
  }

  protected sortOrder(column: BenchColumn): NzTableSortOrder {
    return this.view() === 'sorted' && column.field === BENCH_SORT_FIELD
      ? BENCH_SORT_DIR === -1
        ? 'descend'
        : 'ascend'
      : null;
  }

  protected filters(column: BenchColumn) {
    return this.view() === 'filtered' && column.field === BENCH_FILTER_FIELD
      ? salaryFilters
      : [];
  }

  protected filterFn(column: BenchColumn) {
    return this.view() === 'filtered' && column.field === BENCH_FILTER_FIELD
      ? salaryFilterFn
      : null;
  }
}
