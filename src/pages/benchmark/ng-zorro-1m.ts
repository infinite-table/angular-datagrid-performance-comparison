// NG-ZORRO Table, 1,000,000 rows
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BENCH_SIZES } from '../../benchmark/data';
import { NgZorroBenchmark } from '../../benchmark/ng-zorro/ng-zorro-benchmark';
import { ngZorroProviders } from '../../benchmark/ng-zorro/ng-zorro';

export const providers = ngZorroProviders;

@Component({
  selector: 'bench-app',
  imports: [NgZorroBenchmark],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-zorro-benchmark [rowCount]="rowCount" />`,
})
export default class Page {
  protected readonly rowCount = BENCH_SIZES['1m'];
}
