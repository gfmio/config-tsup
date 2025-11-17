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

//
// Development & Production - Base
//

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
// Development & Production - Libraries
//

// Library Development: Focus on debugging and fast rebuilds
export const libraryDevelopment = partial({
  minify: false,                    // No minification for readability
  sourcemap: 'inline',               // Inline sourcemaps for easy debugging
  treeshake: false,                  // Skip treeshaking for faster builds
  define: {
    'process.env.NODE_ENV': '"development"',
    __DEV__: 'true',
    __PROD__: 'false',
  }
});

// Library Production: Optimized but preserves readability for consumers
export const libraryProduction = partial({
  minify: false,                     // Let consumer's bundler handle minification
  keepNames: true,                   // Preserve function names for better errors
  sourcemap: true,                   // External sourcemaps for debugging
  treeshake: true,                   // Remove dead code
  define: {
    'process.env.NODE_ENV': '"production"',
    __DEV__: 'false',
    __PROD__: 'true',
  }
});

//
// Development & Production - CLIs
//

// CLI Development: Fast iteration with detailed debugging
export const cliDevelopment = partial({
  minify: false,                     // No minification for readability
  minifyWhitespace: false,
  keepNames: true,                   // Preserve all names for stack traces
  sourcemap: 'inline',               // Inline sourcemaps for debugging
  define: {
    'process.env.NODE_ENV': '"development"',
    __DEV__: 'true',
    __PROD__: 'false',
  }
});

// CLI Production: Optimized for size and performance
export const cliProduction = partial({
  minify: true,                      // Full minification for smaller binaries
  minifyWhitespace: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  keepNames: true,                   // Keep function names for error reports
  sourcemap: 'hidden' as any,        // Hidden sourcemaps (available but not referenced)
  treeshake: true,
  define: {
    'process.env.NODE_ENV': '"production"',
    __DEV__: 'false',
    __PROD__: 'true',
  }
});

//
// Development & Production - Browser Bundles
//

// Browser Development: Fast refresh and debugging
export const browserDevelopment = partial({
  minify: false,                     // No minification for readability
  sourcemap: 'inline',               // Inline sourcemaps for browser DevTools
  splitting: true,                   // Enable splitting for better HMR
  treeshake: false,                  // Skip for faster builds
  define: {
    'process.env.NODE_ENV': '"development"',
    __DEV__: 'true',
    __PROD__: 'false',
  }
});

// Browser Production: Optimized for size and performance
export const browserProduction = partial({
  minify: true,                      // Full minification for bandwidth
  minifyWhitespace: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  keepNames: false,                  // Maximum compression
  sourcemap: 'external' as any,      // External sourcemaps for error tracking
  splitting: true,                   // Code splitting for lazy loading
  treeshake: true,                   // Aggressive tree shaking
  pure: ['console.log', 'console.debug'],  // Remove debug statements
  define: {
    'process.env.NODE_ENV': '"production"',
    __DEV__: 'false',
    __PROD__: 'true',
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
// Watch Mode
//

// Basic watch mode
export const watch = partial({
  watch: true,
});

// Watch with success callback
export const watchWithSuccess = (onSuccess: string | (() => Promise<void | (() => Promise<void> | void) | undefined>)) => partial({
  watch: true,
  onSuccess,
});

// Development watch mode - optimized for fast rebuilds
export const watchDevelopment = partial({
  watch: true,
  minify: false,
  sourcemap: 'inline',
  treeshake: false,  // Skip for faster rebuilds
});

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

//
// Additional Specialized Partials
//

// React library specific
export const reactLibrary = partial({
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  esbuildOptions: (options) => {
    options.jsx = 'automatic';  // Use React 17+ JSX transform
    return options;
  },
});

// Vue library specific
export const vueLibrary = partial({
  external: ['vue', '@vue/*'],
});

// Preact library specific
export const preactLibrary = partial({
  external: ['preact', 'preact/hooks', 'preact/compat'],
  esbuildOptions: (options) => {
    options.jsx = 'automatic';
    options.jsxImportSource = 'preact';
    return options;
  },
});

// Worker bundle (Web Worker or Service Worker)
export const workerBundle = partial({
  platform: 'browser' as const,
  format: ['iife'],
  splitting: false,  // Workers don't support splitting
  globalName: 'self',  // Global name for IIFE bundles
});

// Lambda/Serverless function
export const serverlessFunction = partial({
  platform: 'node' as const,
  format: ['cjs'],  // Most serverless platforms expect CJS
  minify: true,
  external: ['aws-sdk', '@aws-sdk/*'],  // AWS SDK is provided by Lambda
  target: NODE_LTS,
});

// Deno bundle
export const denoBundle = partial({
  platform: 'neutral' as const,
  format: ['esm'],
  target: 'esnext',
  dts: false,  // Deno uses TypeScript directly
});

// Test bundle (for test runners)
export const testBundle = partial({
  minify: false,
  sourcemap: 'inline',
  treeshake: false,  // Keep all code for testing
  define: {
    'process.env.NODE_ENV': '"test"',
  }
});

// Legacy browser support
export const legacyBrowser = partial({
  platform: 'browser' as const,
  target: 'es5',
  format: ['iife'],
  // Note: For Node.js polyfills, use esbuildOptions or a separate plugin
});

// Modern browser (ES modules)
export const modernBrowser = partial({
  platform: 'browser' as const,
  target: 'es2022',
  format: ['esm'],
  splitting: true,
});

// Bundle all dependencies (for standalone distributions)
export const bundleAll = partial({
  external: [],  // Bundle everything
  skipNodeModulesBundle: false,
  // To bundle all dependencies, we simply set external to empty array
});

// Pure ESM package
export const pureESM = partial({
  format: ['esm'],
  target: 'es2022',
  platform: 'neutral' as const,
  cjsInterop: false,
  shims: false,
});

// Experimental/Edge features
export const experimental = partial({
  target: 'esnext',
  // Note: Enable experimental features via tsup CLI flags or environment variables
});
