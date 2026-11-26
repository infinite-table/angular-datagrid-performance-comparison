import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  computed,
  contentChild,
  input,
  signal,
} from '@angular/core';

import {
  BENCH_GRID_HEIGHT,
  BENCH_GRID_WIDTH,
  generateBenchData,
} from './data';
import type { BenchRow } from './data';
import { installBenchmark } from './harness';
import type { BenchAdapter } from './harness';
import { getBenchView } from './updates';
import type { BenchView } from './updates';

/** what the grid of a page gets - the context of its template */
export type BenchGridContext = {
  /** the rows, in the order of the data (by id) */
  data: BenchRow[];
  width: number;
  height: number;
  /** sorting / filter / grouping to mount with - see updates.ts */
  view: BenchView;
  /**
   * the grid gives the page the function that hands it changed rows (new
   * objects, in place of the ones with the same id), once it can take them
   */
  onUpdater: (update: (rows: BenchRow[]) => void) => void;
};

/**
 * Identical shell for every grid: generates the data (outside of any
 * measurement), installs `window.__bench` and renders the grid (the
 * `<ng-template let-ctx>` it is given) in a fixed size box only when asked
 * to.
 *
 * `?autoMount=0` - used by the benchmark spec, which calls
 * `window.__bench.mount()` itself, so mounting is measured. Without it the
 * grid mounts right away, for looking at the demo in the browser.
 *
 * `?extraHeight=N` - makes the box N px taller. The spec uses it to give
 * all the grids a body of the same height (so they render the same number of
 * rows) when one of them shows something the others don't - e.g. the footer
 * Infinite Table renders when it has no license key.
 *
 * `?view=sorted` (`filtered`, `grouped`) - the grid mounts with that
 * sorting / filter / grouping, for the scenarios with live updates. The grid
 * gets the view in the template context, and gives the page the function
 * that hands it changed rows with `onUpdater`.
 */
@Component({
  selector: 'bench-page',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      [attr.data-benchmark-grid]="adapter().grid"
      [style.position]="'fixed'"
      [style.top.px]="0"
      [style.left.px]="0"
      [style.width.px]="width"
      [style.height.px]="height()"
      [style.display]="'flex'"
      [style.flex-direction]="'column'"
      [style.background]="'white'"
      [style.color]="'black'"
    >
      @if (context(); as ctx) {
        <ng-container
          [ngTemplateOutlet]="grid()"
          [ngTemplateOutletContext]="{ $implicit: ctx }"
        />
      }
    </div>
    <div
      [style.position]="'fixed'"
      [style.top.px]="height() + 8"
      [style.left.px]="8"
      [style.font]="'13px system-ui, sans-serif'"
      [style.color]="'gray'"
    >
      {{ info() }}
    </div>
  `,
})
export class BenchmarkPage implements OnInit, OnDestroy {
  readonly title = input.required<string>();
  readonly rowCount = input.required<number>();
  readonly adapter = input.required<BenchAdapter>();

  /** the grid: `<ng-template let-ctx>`, rendered when the page mounts it */
  protected readonly grid =
    contentChild.required<TemplateRef<{ $implicit: BenchGridContext }>>(
      TemplateRef,
    );

  protected readonly width = BENCH_GRID_WIDTH;
  private readonly extraHeight = signal(0);
  protected readonly height = computed(
    () => BENCH_GRID_HEIGHT + this.extraHeight(),
  );
  protected readonly info = signal('generating data...');

  private readonly mounted = signal(false);
  private isMounted = false;
  // the rows are plain objects, and stay that way: only the array is in a
  // signal, and it is never written again
  private readonly data = signal<BenchRow[] | null>(null);
  private view: BenchView = 'plain';
  private updater: ((rows: BenchRow[]) => void) | null = null;
  private uninstall: (() => void) | null = null;

  protected readonly context = computed<BenchGridContext | null>(() => {
    const data = this.data();
    if (!this.mounted() || !data) {
      return null;
    }
    return {
      data,
      width: BENCH_GRID_WIDTH,
      height: this.height(),
      view: this.view,
      onUpdater: (update) => {
        this.updater = update;
      },
    };
  });

  ngOnInit() {
    const start = performance.now();
    const rows = generateBenchData(this.rowCount());
    const dataGenerationTime = performance.now() - start;
    const params = new URLSearchParams(window.location.search);
    this.view = getBenchView(window.location.search);

    this.uninstall = installBenchmark(
      this.adapter(),
      {
        mount: () => {
          this.isMounted = true;
          this.mounted.set(true);
        },
        isMounted: () => this.isMounted,
        view: this.view,
        update: (rows) => {
          if (!this.updater) {
            throw new Error('The grid cannot take updates yet');
          }
          this.updater(rows);
        },
      },
      rows,
      dataGenerationTime,
    );

    this.info.set(
      `${this.title()} · ${rows.length.toLocaleString('en-US')} rows${
        this.view === 'plain' ? '' : ` · ${this.view}`
      } · data generated in ${Math.round(dataGenerationTime)}ms · ${
        process.env.NODE_ENV
      } build${__DEV__ ? ' · __DEV__ on' : ''}`,
    );
    // set before the grid mounts, so mounting is not followed by a resize
    this.extraHeight.set(Math.max(0, Number(params.get('extraHeight')) || 0));
    this.data.set(rows);

    const autoMount = params.get('autoMount') !== '0';
    if (autoMount) {
      this.isMounted = true;
      this.mounted.set(true);
    }
  }

  ngOnDestroy() {
    this.uninstall?.();
  }
}
