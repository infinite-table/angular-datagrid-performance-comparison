import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnInit,
  Signal,
  computed,
  inject,
  input,
  runInInjectionContext,
  signal,
  viewChild,
} from '@angular/core';
import {
  FlexRender,
  aggregationFn_sum,
  columnFilteringFeature,
  columnGroupingFeature,
  columnSizingFeature,
  createColumnHelper,
  createFilteredRowModel,
  createGroupedRowModel,
  createSortedRowModel,
  filterFn_greaterThanOrEqualTo,
  injectTable,
  rowAggregationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
} from '@tanstack/angular-table';
import { injectVirtualizer } from '@tanstack/angular-virtual';

import {
  BENCH_COLUMNS,
  BENCH_COLUMN_WIDTH,
  BENCH_HEADER_HEIGHT,
  BENCH_ROW_HEIGHT,
} from '../data';
import type { BenchRow } from '../data';
import {
  BENCH_AGGREGATE_FIELD,
  BENCH_FILTER_FIELD,
  BENCH_FILTER_MIN,
  BENCH_GROUP_FIELD,
  BENCH_SORT_DIR,
  BENCH_SORT_FIELD,
  applyBenchUpdates,
} from '../updates';
import type { BenchView } from '../updates';

const features = tableFeatures({
  columnSizingFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
  },
});

const columnHelper = createColumnHelper<typeof features, BenchRow>();

const columns = columnHelper.columns(
  BENCH_COLUMNS.map((c) =>
    columnHelper.accessor(c.field, {
      header: c.header,
      size: BENCH_COLUMN_WIDTH,
    }),
  ),
);

const filteringFeatures = tableFeatures({
  ...features,
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { greaterThanOrEqualTo: filterFn_greaterThanOrEqualTo },
});
const groupingFeatures = tableFeatures({
  ...features,
  columnGroupingFeature,
  rowAggregationFeature,
  groupedRowModel: createGroupedRowModel(),
  aggregationFns: { sum: aggregationFn_sum },
});

// one setup per view - the features, the columns and the state to start with
const setups: Partial<
  Record<BenchView, { features: any; columns: any; initialState?: any }>
> = {
  plain: { features, columns },
  sorted: {
    features,
    columns,
    initialState: {
      sorting: [{ id: BENCH_SORT_FIELD, desc: BENCH_SORT_DIR === -1 }],
    },
  },
  filtered: {
    features: filteringFeatures,
    columns: BENCH_COLUMNS.map((c) => ({
      accessorKey: c.field,
      header: c.header,
      size: BENCH_COLUMN_WIDTH,
      ...(c.field === BENCH_FILTER_FIELD
        ? { filterFn: 'greaterThanOrEqualTo' }
        : null),
    })),
    initialState: {
      columnFilters: [{ id: BENCH_FILTER_FIELD, value: BENCH_FILTER_MIN }],
    },
  },
  grouped: {
    features: groupingFeatures,
    // only the salary is aggregated, like in the other grid
    columns: BENCH_COLUMNS.map((c) => ({
      accessorKey: c.field,
      header: c.header,
      size: BENCH_COLUMN_WIDTH,
      aggregationFn: c.field === BENCH_AGGREGATE_FIELD ? 'sum' : undefined,
    })),
    initialState: { grouping: [BENCH_GROUP_FIELD] },
  },
};

const sortIndicators: Record<string, string> = {
  asc: ' ▲',
  desc: ' ▼',
};

/**
 * TanStack Table is headless: it has the row model and the sorting, and the
 * page renders the markup. This component follows the official Angular
 * "virtualized-columns" example (rows and columns virtualized with TanStack
 * Virtual, same overscan), with what the benchmark needs changed:
 *  - fixed row height (no measuring), header height and column widths - the
 *    same as in the other grids
 *  - no column resizing, and no column visibility feature
 *  - sortDescFirst: false - by default the first click on a number column
 *    sorts descending; in the other grids it sorts ascending
 *  - data-row-index / data-column-id on the cells, for the harness
 *
 * For the live-update scenarios (see updates.ts) the filtered view adds the
 * column filtering feature and the grouped view the grouping and aggregation
 * features, as in the official "filters" and "grouping" examples - the other
 * views keep the features above, so nothing changes for the other scenarios.
 * The groups are collapsed: the page has no row expanding. Rows are changed
 * through the `data` option: a new array, with the changed rows in it.
 */
@Component({
  selector: 'tanstack-grid',
  imports: [FlexRender],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: flex; flex-direction: column; flex: 1; min-height: 0',
  },
  templateUrl: './tanstack-grid.html',
  styleUrl: './tanstack-grid.css',
})
export class TanStackGrid implements OnInit {
  readonly data = input.required<BenchRow[]>();
  readonly view = input.required<BenchView>();
  readonly onUpdater =
    input.required<(update: (rows: BenchRow[]) => void) => void>();

  private readonly injector = inject(Injector);

  protected readonly rowHeight = BENCH_ROW_HEIGHT;
  protected readonly headerHeight = BENCH_HEADER_HEIGHT;

  // the virtualizers need to know the scrollable container element
  readonly scrollContainer =
    viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  // created in ngOnInit, when the view (an input) is known: it decides the
  // features of the table
  protected table!: ReturnType<typeof injectTable<typeof features, BenchRow>>;
  protected rows!: Signal<any[]>;
  protected columnVirtualizer!: ReturnType<
    typeof injectVirtualizer<HTMLDivElement, HTMLTableCellElement>
  >;
  protected rowVirtualizer!: ReturnType<
    typeof injectVirtualizer<HTMLDivElement, HTMLTableRowElement>
  >;
  protected virtualColumns!: Signal<any[]>;
  protected virtualRows!: Signal<any[]>;
  protected totalSize!: Signal<number>;
  protected virtualPaddingLeft!: Signal<number | undefined>;
  protected virtualPaddingRight!: Signal<number | undefined>;

  ngOnInit() {
    const setup = setups[this.view()]!;
    const data = signal(this.data());
    this.onUpdater()((changed) => {
      data.set(applyBenchUpdates(data(), changed));
    });

    runInInjectionContext(this.injector, () => {
      this.table = injectTable<typeof features, BenchRow>(() => ({
        features: setup.features as typeof features,
        columns: setup.columns,
        initialState: setup.initialState,
        data: data(),
        getRowId: (row: BenchRow) => String(row.id),
        sortDescFirst: false,
      }));

      this.rows = computed(() => this.table.getRowModel().rows);
      const leafColumns = computed(() => this.table.getAllLeafColumns());

      // we are using a slightly different virtualization strategy for
      // columns (compared to virtual rows) in order to support dynamic row
      // heights
      this.columnVirtualizer = injectVirtualizer<
        HTMLDivElement,
        HTMLTableCellElement
      >(() => ({
        count: leafColumns().length,
        scrollElement: this.scrollContainer()?.nativeElement,
        estimateSize: (index) => leafColumns()[index].getSize(),
        horizontal: true,
        overscan: 3,
      }));

      // fixed row height - nothing is measured
      this.rowVirtualizer = injectVirtualizer<
        HTMLDivElement,
        HTMLTableRowElement
      >(() => ({
        count: this.rows().length,
        scrollElement: this.scrollContainer()?.nativeElement,
        estimateSize: () => BENCH_ROW_HEIGHT,
        overscan: 5,
      }));

      this.virtualColumns = computed(() =>
        this.columnVirtualizer.getVirtualItems(),
      );
      this.virtualRows = computed(() => this.rowVirtualizer.getVirtualItems());
      this.totalSize = computed(() => this.rowVirtualizer.getTotalSize());

      // columns are virtualized with an empty cell to the left and to the
      // right
      this.virtualPaddingLeft = computed(() => {
        const items = this.virtualColumns();
        return items.length ? (items[0]?.start ?? 0) : undefined;
      });
      this.virtualPaddingRight = computed(() => {
        const items = this.virtualColumns();
        return items.length
          ? this.columnVirtualizer.getTotalSize() -
              (items[items.length - 1]?.end ?? 0)
          : undefined;
      });
    });
  }

  protected sortIndicator(sortDirection: false | 'asc' | 'desc') {
    return sortDirection ? sortIndicators[sortDirection] : null;
  }
}
