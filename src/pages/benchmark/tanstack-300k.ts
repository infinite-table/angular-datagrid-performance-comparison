// TanStack Table, 300,000 rows
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BENCH_SIZES } from '../../benchmark/data';
import { TanStackBenchmark } from '../../benchmark/tanstack/tanstack-benchmark';

@Component({
  selector: 'bench-app',
  imports: [TanStackBenchmark],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<tanstack-benchmark [rowCount]="rowCount" />`,
})
export default class Page {
  protected readonly rowCount = BENCH_SIZES['300k'];
}
