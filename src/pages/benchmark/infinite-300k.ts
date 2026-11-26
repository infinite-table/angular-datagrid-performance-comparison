// Infinite Table, 300,000 rows
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BENCH_SIZES } from '../../benchmark/data';
import { InfiniteBenchmark } from '../../benchmark/infinite/infinite-benchmark';

@Component({
  selector: 'bench-app',
  imports: [InfiniteBenchmark],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<infinite-benchmark [rowCount]="rowCount" />`,
})
export default class Page {
  protected readonly rowCount = BENCH_SIZES['300k'];
}
