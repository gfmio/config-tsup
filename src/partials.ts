//
// Partials
//

import { ALL_EXTERNALS, BUN_SHEBANG, defaultOutExtensionHelper, DIST, ES2022, NODE_LTS, NODE_SHEBANG, USE_STRICT } from "./constants";
import { banner } from "./utils/banner";
import { merge } from "./utils/merge";
import { partial } from "./utils/partial";

// Clean options

export const clean = partial({ clean: true });
export const noClean = partial({ clean: false });

// Minify options

export const minify = partial({ minify: true });
export const noMinify = partial({ minify: false });

// Granular minification options (esbuild)

export const minifyWhitespace = partial({ minifyWhitespace: true });
export const noMinifyWhitespace = partial({ minifyWhitespace: false });
export const minifyIdentifiers = partial({ minifyIdentifiers: true });
export const noMinifyIdentifiers = partial({ minifyIdentifiers: false });
export const minifySyntax = partial({ minifySyntax: true });
export const noMinifySyntax = partial({ minifySyntax: false });
export const keepNames = partial({ keepNames: true });
export const noKeepNames = partial({ keepNames: false });

// Minification presets

export const debugMinify = merge(minify, minifyWhitespace, minifySyntax, keepNames, noMinifyIdentifiers);
export const productionMinify = merge(minify, minifyWhitespace, minifyIdentifiers, minifySyntax);
export const safeMinify = merge(minify, minifyWhitespace, keepNames, noMinifyIdentifiers, noMinifySyntax);

// Sourcemap options

export const sourcemap = partial({ sourcemap: true });
export const sourcemapInline = partial({ sourcemap: 'inline' });
export const sourcemapExternal = partial({ sourcemap: 'external' as any });  // tsup types don't include this but it works
export const sourcemapHidden = partial({ sourcemap: 'hidden' as any });  // tsup types don't include this but it works
export const noSourcemap = partial({ sourcemap: false });

// Splitting options

export const splitting = partial({ splitting: true });
export const noSplitting = partial({ splitting: false });

// Treeshake options

export const treeshake = partial({ treeshake: true });
export const noTreeshake = partial({ treeshake: false });

// dts options

export const dts = partial({ dts: true });
export const noDts = partial({ dts: false });

// shims options

export const shims = partial({ shims: true });
export const noShims = partial({ shims: false });

// cjsInterop options

export const cjsInterop = partial({ cjsInterop: true });
export const noCjsInterop = partial({ cjsInterop: false });

// skipNodeModulesBundle options

export const skipNodeModulesBundle = partial({ skipNodeModulesBundle: true });
export const noSkipNodeModulesBundle = partial({ skipNodeModulesBundle: false });

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
  sourcemap: true,
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
  cjsInterop: true,
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
  sourcemap: false,
});

//
// Platform
//

// Browser

export const browser = partial({
  platform: 'browser' as const,
  target: ES2022, // Wide browser support
  shims: false,
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
  keepNames: false,  // Maximum compression for production
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
  external: ALL_EXTERNALS,  // Libraries should externalize all dependencies
  skipNodeModulesBundle: true,
});

// CLI - Regular (npm-distributed, dependencies NOT bundled)

export const cli = partial({
  ...banner(NODE_SHEBANG),
  minify: true,
  keepNames: true,  // Preserve function names for stack traces
  shims: true,
  target: NODE_LTS,
  skipNodeModulesBundle: true,  // Don't bundle dependencies for npm distribution
});

// Standalone CLI (single-file executable, dependencies ARE bundled)

export const standaloneCli = partial({
  ...banner(NODE_SHEBANG),
  minify: true,
  keepNames: true,  // Preserve function names for stack traces
  shims: true,
  target: NODE_LTS,
  skipNodeModulesBundle: false,  // Bundle all dependencies for standalone executable
  external: [],  // Bundle everything except Node.js built-ins
});

// Node CLI (regular npm distribution)

export const nodeCli = merge(node, cli, banner(NODE_SHEBANG));

// ESM Node CLI

export const esmNodeCli = merge(node, cli, esmOnly, banner(NODE_SHEBANG));

// CJS Node CLI

export const cjsNodeCli = merge(node, cli, cjsOnly, banner(NODE_SHEBANG+USE_STRICT));

// Standalone Node CLI (single-file executable)

export const standaloneNodeCli = merge(node, standaloneCli, banner(NODE_SHEBANG));

// ESM Standalone Node CLI

export const esmStandaloneNodeCli = merge(node, standaloneCli, esmOnly, banner(NODE_SHEBANG));

// CJS Standalone Node CLI

export const cjsStandaloneNodeCli = merge(node, standaloneCli, cjsOnly, banner(NODE_SHEBANG+USE_STRICT));

// Bun CLI (regular npm distribution)

export const bunCli = merge(neutral, cli, banner(BUN_SHEBANG));

// ESM Bun CLI

export const esmBunCli = merge(neutral, cli, esmOnly, banner(BUN_SHEBANG));

// CJS Bun CLI

export const cjsBunCli = merge(neutral, cli, cjsOnly, banner(BUN_SHEBANG+USE_STRICT));

// Standalone Bun CLI (single-file executable)

export const standaloneBunCli = merge(neutral, standaloneCli, banner(BUN_SHEBANG));

// ESM Standalone Bun CLI

export const esmStandaloneBunCli = merge(neutral, standaloneCli, esmOnly, banner(BUN_SHEBANG));

// CJS Standalone Bun CLI

export const cjsStandaloneBunCli = merge(neutral, standaloneCli, cjsOnly, banner(BUN_SHEBANG+USE_STRICT));


//
// Bundle Analyzer
//

import {
  ciAnalyzer,
  devAnalyzer,
  minimalAnalyzer,
  onSuccess,
  strictAnalyzer,
} from "./bundleAnalyzer/index";

// Default analyzer configuration
export const analyzeConfig = partial({
  metafile: true,  // Generate bundle analysis metadata
  onSuccess,
});

// Minimal bundle analysis (no visualizations)
export const minimalAnalyzeConfig = partial(minimalAnalyzer);

// Strict bundle analysis (fails on large bundles)
export const strictAnalyzeConfig = partial(strictAnalyzer);

// CI-friendly bundle analysis
export const ciAnalyzeConfig = partial(ciAnalyzer);

// Development bundle analysis with all features
export const devAnalyzeConfig = partial(devAnalyzer);

  onSuccess: onSuccess,
});
});
