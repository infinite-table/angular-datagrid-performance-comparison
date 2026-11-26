// PrimeNG Table, 300,000 rows
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BENCH_SIZES } from '../../benchmark/data';
import { PrimeNgBenchmark } from '../../benchmark/primeng/primeng-benchmark';
import { primeNgProviders } from '../../benchmark/primeng/primeng';

export const providers = primeNgProviders;

@Component({
  selector: 'bench-app',
  imports: [PrimeNgBenchmark],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<primeng-benchmark [rowCount]="rowCount" />`,
})
export default class Page {
  protected readonly rowCount = BENCH_SIZES['300k'];
}
