// AG Grid, 1,000,000 rows
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BENCH_SIZES } from '../../benchmark/data';
import { AgGridBenchmark } from '../../benchmark/ag-grid/ag-grid-benchmark';

@Component({
  selector: 'bench-app',
  imports: [AgGridBenchmark],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ag-grid-benchmark [rowCount]="rowCount" />`,
})
export default class Page {
  protected readonly rowCount = BENCH_SIZES['1m'];
}
