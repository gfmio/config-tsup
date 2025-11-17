import { defineConfig } from 'tsup';

import { analyzeConfig, base, cjs, esm } from '../src/partials.ts';
import { merge } from '../src/utils/merge.ts';

// Test configuration with bundle analysis
export default defineConfig([
  // Test default analyzer
  merge(
    base,
    esm,
    {
      entry: [
        'src/index.ts',
      ],
      outDir: 'dist/test-default',
    },
    analyzeConfig,
  ),

  // Test with CJS format
  merge(
    base,
    cjs,
    {
      entry: [
        'src/index.ts',
      ],
      outDir: 'dist/test-cjs',
    },
    analyzeConfig,
  ),
]);
