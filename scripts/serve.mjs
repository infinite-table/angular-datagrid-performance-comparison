/**
 * Serves the production build (dist/browser, made by
 * `npm run benchmark:build`) - what the benchmark measures. Every path that
 * is not a file gets index.html, which loads the page of the URL
 * (/benchmark/<grid>-<size>, see src/main.ts).
 *
 *   node scripts/serve.mjs [--port 5580]
 *
 * Fails if the port is taken (no other port is tried).
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', 'dist', 'browser');
const portArg = process.argv.indexOf('--port');
const port = Number(
  portArg >= 0 ? process.argv[portArg + 1] : process.env.PORT || 5580,
);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

if (!fs.existsSync(path.join(ROOT, 'index.html'))) {
  console.error(`No build in ${ROOT} - run "npm run benchmark:build" first`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let file = path.join(ROOT, path.normalize(decodeURIComponent(url.pathname)));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end();
    return;
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(ROOT, 'index.html');
  }
  res.writeHead(200, {
    'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(file).pipe(res);
});

server.on('error', (err) => {
  console.error(err.message);
  process.exit(1);
});
server.listen(port, () => {
  console.log(`Serving ${ROOT} on http://localhost:${port}/`);
});
