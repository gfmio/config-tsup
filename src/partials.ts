//
// Partials
//

import { ALL_EXTERNALS, BUN_SHEBANG, defaultOutExtensionHelper, DIST, ES2022, NODE_LTS, NODE_SHEBANG, USE_STRICT } from "./constants";
import { banner } from "./utils/banner";
import { merge } from "./utils/merge";
import { partial } from "./utils/partial";

export const clean = partial({ clean: true });
export const noClean = partial({ clean: false });

export const minify = partial({ minify: true });
export const noMinify = partial({ minify: false });

export const sourcemap = partial({ sourcemap: true });
export const noSourcemap = partial({ sourcemap: false });

export const splitting = partial({ splitting: true });
export const noSplitting = partial({ splitting: false });

export const treeshake = partial({ treeshake: true });
export const noTreeshake = partial({ treeshake: false });

export const dts = partial({ dts: true });
export const noDts = partial({ dts: false });

export const shims = partial({ shims: true });
export const noShims = partial({ shims: false });

export const cjsInterop = partial({ cjsInterop: true });
export const noCjsInterop = partial({ cjsInterop: false });

//
// Base
//

/**
 * Base tsup configuration
 * Note: sourcemap intentionally omitted - should be set by context (library/cli/dev/prod)
 */
export const base = partial({
  clean: true,
  external: ALL_EXTERNALS, // Externalize all deps by default
  minify: false,
  outDir: DIST,
  outExtension: defaultOutExtensionHelper,
  // sourcemap: omitted - let presets/context decide
  splitting: false,
  target: ES2022,
  treeshake: true,
});

//
// Format
//

// CJS

export const cjs = partial({
  ...banner(USE_STRICT),
  format: [
    'cjs',
  ],
});

export const cjsOnly = merge(cjs, noDts);

// ESM

export const esm = partial({
  format: [
    'esm',
  ],
});

export const esmOnly = merge(esm, noDts);

// IIFE

export const iife = partial({
  ...banner(USE_STRICT),
  dts: false,
  format: [
    'iife',
  ],
});

// DTS only

export const dtsOnly = partial({
  dts: {
    only: true,
  },
  format: [
    'esm',
  ],
});

//
// Platform
//

// Browser

export const browser = partial({
  platform: 'browser' as const,
  target: ES2022, // Wide browser support
});

// Node

export const node = partial({
  platform: 'node' as const,
  target: NODE_LTS, // Node LTS
});

// Neutral

export const neutral = partial({
  platform: 'neutral' as const,
});

// Isomorphic (alias of neutral)

export const isomorphic = neutral;

// Development & Production

export const development = partial({
  minify: false,
  sourcemap: true,
  define: {
    'process.env.NODE_ENV': '"development"'
  }
});

export const production = partial({
  minify: true,
  sourcemap: false,
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});

//
// Project types
//

// Library

export const library = partial({
  external: []
});

// CLI

export const cli = partial({
  ...banner(NODE_SHEBANG),
  shims: true,
  target: NODE_LTS,
});

// Node CLI

export const nodeCli = merge(cli);

// ESM Node CLI

export const esmNodeCli = merge(cli);

// CJS Node CLI

export const cjsNodeCli = merge(cli, banner(NODE_SHEBANG+USE_STRICT));

// Bun CLI

export const bunCli = merge(cli, banner(BUN_SHEBANG));

// ESM Bun CLI

export const esmBunCli = merge(bunCli);

// CJS Bun CLI

export const cjsBunCli = merge(bunCli, banner(BUN_SHEBANG+USE_STRICT));

//
// Bundle Analyzer
//

export const analyzeConfig = partial({
  metafile: true,  // Generate bundle analysis metadata
  onSuccess: async () => {
    // Could add bundle size reporting here
  },
});
