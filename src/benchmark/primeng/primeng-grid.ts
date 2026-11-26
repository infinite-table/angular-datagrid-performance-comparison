import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  input,
  signal,
} from '@angular/core';
import { TableModule } from 'primeng/table';

import {
  BENCH_COLUMNS,
  BENCH_COLUMN_WIDTH,
  BENCH_GRID_WIDTH,
  BENCH_HEADER_HEIGHT,
  BENCH_ROW_HEIGHT,
} from '../data';
import type { BenchRow } from '../data';
import {
  BENCH_FILTER_FIELD,
  BENCH_FILTER_MIN,
  BENCH_SORT_DIR,
  BENCH_SORT_FIELD,
  applyBenchUpdates,
} from '../updates';
import type { BenchView } from '../updates';

const cellStyle = {
  width: `${BENCH_COLUMN_WIDTH}px`,
  height: `${BENCH_ROW_HEIGHT}px`,
  padding: '0 1rem',
  'box-sizing': 'border-box',
  'white-space': 'nowrap',
  overflow: 'hidden',
};

/**
 * PrimeNG Table (`p-table`) with defaults (the Aura theme preset), except for
 * what makes the setup match the other grids:
 *  - `scrollable` + `scrollHeight="flex"` + `virtualScroll` with
 *    `virtualScrollItemSize`: its virtual scroller mode, with the row height
 *    as the item size
 *  - same row height / header height / column widths (the columns get their
 *    width and the cells their height through `style`, as in the "Virtual
 *    Scroll" example of its documentation)
 *  - a `data-row-index` attribute on the rows, for the harness
 *
 * For the live-update scenarios (see updates.ts): the sorted view sets
 * `sortField` / `sortOrder`, the filtered view `filters` (with no filter UI in
 * the header). PrimeNG groups rows only for display - the aggregations are
 * left to the page - so it has no `grouped` view. Rows are changed through
 * `value`: a new array, with the changed rows in it.
 *
 * PrimeNG Table sorts the array it is given in place (it sorts `value`, then
 * keeps a copy of it). In the sorted view the page gives it a copy of its
 * rows, so that its own array stays in the order of the data - see the
 * README.
 */
@Component({
  selector: 'primeng-grid',
  imports: [TableModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: `display: flex; flex-direction: column; flex: 1; min-height: 0; width: ${BENCH_GRID_WIDTH}px`,
  },
  template: `
    <p-table
      [value]="rows()"
      dataKey="id"
      [sortField]="view() === 'sorted' ? sortField : undefined"
      [sortOrder]="view() === 'sorted' ? sortOrder : 1"
      [filters]="filters"
      [scrollable]="true"
      scrollHeight="flex"
      [virtualScroll]="true"
      [virtualScrollItemSize]="rowHeight"
      [tableStyle]="tableStyle"
      [style]="{ flex: '1', 'min-height': '0', width: gridWidth + 'px' }"
    >
      <ng-template #header>
        <tr>
          @for (column of columns; track column.field) {
            <th [pSortableColumn]="column.field" [style]="headerStyle">
              {{ column.header }} <p-sortIcon [field]="column.field" />
            </th>
          }
        </tr>
      </ng-template>
      <ng-template #body let-row let-rowIndex="rowIndex">
        <tr [attr.data-row-index]="rowIndex">
          @for (column of columns; track column.field) {
            <td [style]="cellStyle">{{ row[column.field] }}</td>
          }
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class PrimeNgGrid implements OnInit {
  readonly data = input.required<BenchRow[]>();
  readonly view = input.required<BenchView>();
  readonly onUpdater =
    input.required<(update: (rows: BenchRow[]) => void) => void>();

  protected readonly columns = BENCH_COLUMNS;
  protected readonly rowHeight = BENCH_ROW_HEIGHT;
  protected readonly gridWidth = BENCH_GRID_WIDTH;
  protected readonly sortField = BENCH_SORT_FIELD;
  protected readonly sortOrder = BENCH_SORT_DIR;
  protected readonly tableStyle = {
    'table-layout': 'fixed',
    width: `${BENCH_COLUMNS.length * BENCH_COLUMN_WIDTH}px`,
  };
  protected readonly cellStyle = cellStyle;
  protected readonly headerStyle = {
    ...cellStyle,
    height: `${BENCH_HEADER_HEIGHT}px`,
  };

  protected filters: Record<string, { value: unknown; matchMode: string }> =
    {};
  protected readonly rows = signal<BenchRow[]>([]);

  ngOnInit() {
    const view = this.view();
    if (view === 'grouped') {
      throw new Error('PrimeNG Table does not aggregate rows');
    }
    if (view === 'filtered') {
      this.filters = {
        [BENCH_FILTER_FIELD]: { value: BENCH_FILTER_MIN, matchMode: 'gte' },
      };
    }
    // the rows in the order of the data - what the updates are applied to
    let data = this.data();
    // the table sorts what it gets in place: in the sorted view, a copy
    const forTable = (rows: BenchRow[]) =>
      view === 'sorted' ? rows.slice() : rows;
    this.rows.set(forTable(data));
    this.onUpdater()((changed) => {
      data = applyBenchUpdates(data, changed);
      this.rows.set(forTable(data));
    });
  }
}
