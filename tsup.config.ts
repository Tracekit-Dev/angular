import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    '@tracekit/browser',
    '@angular/core',
    '@angular/router',
    'rxjs',
    'rxjs/operators',
  ],
});
