// `process.env.NODE_ENV` is defined in angular.json, per build configuration
// (the browser has no `process`) - harness.ts reports it to the spec
declare const process: { env: { NODE_ENV: string } };
