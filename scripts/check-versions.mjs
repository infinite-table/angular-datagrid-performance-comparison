/**
 * Used by .github/workflows/benchmark.yml: decides which versions of the
 * grids to measure, and whether there is anything to do.
 *
 * A scheduled run looks for a new version of any of the five grids.
 *
 * Env:
 *   EVENT_NAME      schedule | workflow_dispatch | repository_dispatch
 *   INFINITE        version of @infinite-table/infinite-angular ("" or "latest" = latest on npm)
 *   PRIMENG         version of primeng ("" or "latest" = latest 21.x on npm,
 *                   its `v21-stable` tag - see "License keys" in the README)
 *   AG_GRID         version of ag-grid-angular + ag-grid-community (same as INFINITE)
 *   TANSTACK        version of @tanstack/angular-table (same)
 *   NG_ZORRO        version of ng-zorro-antd (same)
 *   GH_TOKEN        to look for an open "benchmark failed" issue
 *
 * Outputs (GITHUB_OUTPUT): run, infinite, primeng, ag_grid, tanstack,
 * ng_zorro, newest, branch, title
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const pkg = JSON.parse(
  fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);
const current = {
  infinite: pkg.dependencies['@infinite-table/infinite-angular'],
  primeng: pkg.dependencies['primeng'],
  agGrid: pkg.dependencies['ag-grid-angular'],
  tanstack: pkg.dependencies['@tanstack/angular-table'],
  ngZorro: pkg.dependencies['ng-zorro-antd'],
};

const scheduled = process.env.EVENT_NAME === 'schedule';

async function published(name, version) {
  const res = await fetch(
    `https://registry.npmjs.org/${name.replace('/', '%2f')}/${version}`,
  );
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`npm registry: ${res.status} for ${name}@${version}`);
  }
  return (await res.json()).version;
}

async function resolve(name, wanted) {
  const version = await published(name, wanted || 'latest');
  if (!version) {
    throw new Error(`${name}@${wanted} is not on npm`);
  }
  return version;
}

function output(values) {
  const lines = Object.entries(values).map(([key, value]) => `${key}=${value}`);
  console.log(lines.join('\n'));
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, lines.join('\n') + '\n');
  }
}

// numeric, so 10.10.0 is newer than 10.9.0
const compare = (a, b) => a.localeCompare(b, 'en', { numeric: true });

// what a run is called: in its commit message and in its "failed" issue
const describe = (v) =>
  `Infinite Table ${v.infinite}, PrimeNG ${v.primeng}, AG Grid ${v.agGrid}, TanStack Table ${v.tanstack}, NG-ZORRO ${v.ngZorro}`;
const failureTitle = (versions) => `Benchmark failed: ${describe(versions)}`;

function hasOpenFailureIssue(title) {
  if (!process.env.GH_TOKEN) {
    return false;
  }
  const titles = execFileSync(
    'gh',
    [
      'issue',
      'list',
      '--state',
      'open',
      '--label',
      'benchmark-failed',
      '--limit',
      '200',
      '--json',
      'title',
      '--jq',
      '.[].title',
    ],
    { encoding: 'utf8' },
  );
  return titles.split('\n').includes(title);
}

const infinite = await resolve(
  '@infinite-table/infinite-angular',
  process.env.INFINITE,
);
// PrimeNG 22 asks for a license key, so the benchmark stays on the newest
// 21.x, the last MIT-licensed major version
const PRIMENG_TAG = 'v21-stable';
const wantedPrimeng = process.env.PRIMENG;
const primeng = await resolve(
  'primeng',
  !wantedPrimeng || wantedPrimeng === 'latest' ? PRIMENG_TAG : wantedPrimeng,
);
const agGrid = await resolve('ag-grid-angular', process.env.AG_GRID);
const tanstack = await resolve('@tanstack/angular-table', process.env.TANSTACK);
const ngZorro = await resolve('ng-zorro-antd', process.env.NG_ZORRO);
const versions = { infinite, primeng, agGrid, tanstack, ngZorro };
const names = Object.keys(versions);
let run = true;
let reason = 'asked for';

// the two AG Grid packages are published one after the other
if (!(await published('ag-grid-community', agGrid))) {
  if (!scheduled) {
    throw new Error(`ag-grid-community@${agGrid} is not on npm`);
  }
  run = false;
  reason = `ag-grid-community@${agGrid} is not on npm yet`;
} else if (scheduled) {
  if (names.every((name) => versions[name] === current[name])) {
    run = false;
    reason = 'no new versions';
  } else if (hasOpenFailureIssue(failureTitle(versions))) {
    run = false;
    reason = 'these versions failed before - close the issue to try again';
  } else {
    reason = 'new versions';
  }
}

// only the newest versions go to results/latest on master; older ones get
// their branch and their rows in the history table
const newest = names.every(
  (name) => compare(versions[name], current[name]) >= 0,
);

console.log(
  `installed: ${describe(current)}\n` +
    `to measure: ${describe(versions)}\n` +
    `${run ? 'running' : 'not running'}: ${reason}\n`,
);
output({
  run,
  infinite,
  primeng,
  ag_grid: agGrid,
  tanstack,
  ng_zorro: ngZorro,
  newest,
  // the same name as versionBranch() in scripts/update-results.ts
  branch: `versions/infinite-${infinite}_primeng-${primeng}_ag-grid-${agGrid}_tanstack-${tanstack}_ng-zorro-${ngZorro}`,
  title: describe(versions),
});
