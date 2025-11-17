//
// Partials
//

import {
  ALL_EXTERNALS,
  BUN_SHEBANG,
  DIST,
  defaultOutExtensionHelper,
  ES2022,
  NODE_LTS,
  NODE_SHEBANG,
  USE_STRICT,
} from './constants.ts';
import { banner } from './utils/banner.ts';
import { merge } from './utils/merge.ts';
import { partial } from './utils/partial.ts';

// Clean options

export const clean = partial({
  clean: true,
});
export const noClean = partial({
  clean: false,
});

// Minify options

export const minify = partial({
  minify: true,
});
export const noMinify = partial({
  minify: false,
});

// Granular minification options (esbuild)

export const minifyWhitespace = partial({
  minifyWhitespace: true,
});
export const noMinifyWhitespace = partial({
  minifyWhitespace: false,
});
export const minifyIdentifiers = partial({
  minifyIdentifiers: true,
});
export const noMinifyIdentifiers = partial({
  minifyIdentifiers: false,
});
export const minifySyntax = partial({
  minifySyntax: true,
});
export const noMinifySyntax = partial({
  minifySyntax: false,
});
export const keepNames = partial({
  keepNames: true,
});
export const noKeepNames = partial({
  keepNames: false,
});

// Minification presets

export const debugMinify = merge(minify, minifyWhitespace, minifySyntax, keepNames, noMinifyIdentifiers);
export const productionMinify = merge(minify, minifyWhitespace, minifyIdentifiers, minifySyntax);
export const safeMinify = merge(minify, minifyWhitespace, keepNames, noMinifyIdentifiers, noMinifySyntax);

// Sourcemap options

export const sourcemap = partial({
  sourcemap: true,
});
export const sourcemapInline = partial({
  sourcemap: 'inline',
});
export const sourcemapExternal = partial({
  sourcemap: 'external' as any,
}); // tsup types don't include this but it works
export const sourcemapHidden = partial({
  sourcemap: 'hidden' as any,
}); // tsup types don't include this but it works
export const noSourcemap = partial({
  sourcemap: false,
});

// Splitting options

export const splitting = partial({
  splitting: true,
});
export const noSplitting = partial({
  splitting: false,
});

// Treeshake options

export const treeshake = partial({
  treeshake: true,
});
export const noTreeshake = partial({
  treeshake: false,
});

// dts options

export const dts = partial({
  dts: true,
});
export const noDts = partial({
  dts: false,
});

export const experimentalDts = partial({
  experimentalDts: true,
});
export const noExperimentalDts = partial({
  experimentalDts: false,
});

// shims options

export const shims = partial({
  shims: true,
});
export const noShims = partial({
  shims: false,
});

// cjsInterop options

export const cjsInterop = partial({
  cjsInterop: true,
});
export const noCjsInterop = partial({
  cjsInterop: false,
});

// skipNodeModulesBundle options

export const skipNodeModulesBundle = partial({
  skipNodeModulesBundle: true,
});
export const noSkipNodeModulesBundle = partial({
  skipNodeModulesBundle: false,
});

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
  shims: false,
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

//
// Development & Production - Base
//

export const development = partial({
  define: {
    'process.env.NODE_ENV': '"development"',
  },
  minify: false,
  sourcemap: true,
});

export const production = partial({
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  keepNames: false, // Maximum compression for production
  minify: true,
  sourcemap: false,
});

//
// Development & Production - Libraries
//

// Library Development: Focus on debugging and fast rebuilds
export const libraryDevelopment = partial({
  define: {
    __DEV__: 'true',
    __PROD__: 'false',
    'process.env.NODE_ENV': '"development"',
  },
  minify: false, // No minification for readability
  sourcemap: 'inline', // Inline sourcemaps for easy debugging
  treeshake: false, // Skip treeshaking for faster builds
});

// Library Production: Optimized but preserves readability for consumers
export const libraryProduction = partial({
  define: {
    __DEV__: 'false',
    __PROD__: 'true',
    'process.env.NODE_ENV': '"production"',
  },
  keepNames: true, // Preserve function names for better errors
  minify: false, // Let consumer's bundler handle minification
  sourcemap: true, // External sourcemaps for debugging
  treeshake: true, // Remove dead code
});

//
// Development & Production - CLIs
//

// CLI Development: Fast iteration with detailed debugging
export const cliDevelopment = partial({
  define: {
    __DEV__: 'true',
    __PROD__: 'false',
    'process.env.NODE_ENV': '"development"',
  },
  keepNames: true, // Preserve all names for stack traces
  minify: false, // No minification for readability
  minifyWhitespace: false,
  sourcemap: 'inline', // Inline sourcemaps for debugging
});

// CLI Production: Optimized for size and performance
export const cliProduction = partial({
  define: {
    __DEV__: 'false',
    __PROD__: 'true',
    'process.env.NODE_ENV': '"production"',
  },
  keepNames: true, // Keep function names for error reports
  minify: true, // Full minification for smaller binaries
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
  sourcemap: 'hidden' as any, // Hidden sourcemaps (available but not referenced)
  treeshake: true,
});

//
// Development & Production - Browser Bundles
//

// Browser Development: Fast refresh and debugging
export const browserDevelopment = partial({
  define: {
    __DEV__: 'true',
    __PROD__: 'false',
    'process.env.NODE_ENV': '"development"',
  },
  minify: false, // No minification for readability
  sourcemap: 'inline', // Inline sourcemaps for browser DevTools
  splitting: true, // Enable splitting for better HMR
  treeshake: false, // Skip for faster builds
});

// Browser Production: Optimized for size and performance
export const browserProduction = partial({
  define: {
    __DEV__: 'false',
    __PROD__: 'true',
    'process.env.NODE_ENV': '"production"',
  },
  keepNames: false, // Maximum compression
  minify: true, // Full minification for bandwidth
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
  pure: [
    'console.log',
    'console.debug',
  ], // Remove debug statements
  sourcemap: 'external' as any, // External sourcemaps for error tracking
  splitting: true, // Code splitting for lazy loading
  treeshake: true, // Aggressive tree shaking
});

//
// Project types
//

// Library

export const library = partial({
  external: ALL_EXTERNALS, // Libraries should externalize all dependencies
  skipNodeModulesBundle: true,
});

// CLI - Regular (npm-distributed, dependencies NOT bundled)

export const cli = partial({
  ...banner(NODE_SHEBANG),
  dts: false,
  experimentalDts: false,
  keepNames: true, // Preserve function names for stack traces
  minify: true,
  shims: true,
  skipNodeModulesBundle: true, // Don't bundle dependencies for npm distribution
  target: NODE_LTS,
});

// Standalone CLI (single-file executable, dependencies ARE bundled)

export const standaloneCli = partial({
  ...banner(NODE_SHEBANG),
  external: [], // Bundle everything except Node.js built-ins
  keepNames: true, // Preserve function names for stack traces
  minify: true,
  shims: true,
  skipNodeModulesBundle: false, // Bundle all dependencies for standalone executable
  target: NODE_LTS,
});

// Node CLI (regular npm distribution)

export const nodeCli = merge(node, cli, banner(NODE_SHEBANG));

// ESM Node CLI

export const esmNodeCli = merge(node, cli, esmOnly, banner(NODE_SHEBANG));

// CJS Node CLI

export const cjsNodeCli = merge(node, cli, cjsOnly, banner(NODE_SHEBANG + USE_STRICT));

// Standalone Node CLI (single-file executable)

export const standaloneNodeCli = merge(node, standaloneCli, banner(NODE_SHEBANG));

// ESM Standalone Node CLI

export const esmStandaloneNodeCli = merge(node, standaloneCli, esmOnly, banner(NODE_SHEBANG));

// CJS Standalone Node CLI

export const cjsStandaloneNodeCli = merge(node, standaloneCli, cjsOnly, banner(NODE_SHEBANG + USE_STRICT));

// Bun CLI (regular npm distribution)

export const bunCli = merge(node, cli, banner(BUN_SHEBANG));

// ESM Bun CLI

export const esmBunCli = merge(node, cli, esmOnly, banner(BUN_SHEBANG));

// CJS Bun CLI

export const cjsBunCli = merge(node, cli, cjsOnly, banner(BUN_SHEBANG + USE_STRICT));

// Standalone Bun CLI (single-file executable)

export const standaloneBunCli = merge(node, standaloneCli, banner(BUN_SHEBANG));

// ESM Standalone Bun CLI

export const esmStandaloneBunCli = merge(node, standaloneCli, esmOnly, banner(BUN_SHEBANG));

// CJS Standalone Bun CLI

export const cjsStandaloneBunCli = merge(node, standaloneCli, cjsOnly, banner(BUN_SHEBANG + USE_STRICT));

//
// Watch Mode
//

// Basic watch mode
export const watch = partial({
  watch: true,
});

// Watch with success callback
export const watchWithSuccess = (
  onSuccess: string | (() => Promise<void | (() => Promise<void> | void) | undefined>),
) =>
  partial({
    onSuccess,
    watch: true,
  });

// Development watch mode - optimized for fast rebuilds
export const watchDevelopment = partial({
  minify: false,
  sourcemap: 'inline',
  treeshake: false, // Skip for faster rebuilds
  watch: true,
});

//
// Bundle Analyzer
//

import { ciAnalyzer, devAnalyzer, minimalAnalyzer, onSuccess, strictAnalyzer } from './bundleAnalyzer/index.ts';

// Default analyzer configuration
export const analyzeConfig = partial({
  metafile: true, // Generate bundle analysis metadata
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
  esbuildOptions: (options) => {
    options.jsx = 'automatic'; // Use React 17+ JSX transform
    return options;
  },
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
  ],
});

// Vue library specific
export const vueLibrary = partial({
  external: [
    'vue',
    '@vue/*',
  ],
});

// Preact library specific
export const preactLibrary = partial({
  esbuildOptions: (options) => {
    options.jsx = 'automatic';
    options.jsxImportSource = 'preact';
    return options;
  },
  external: [
    'preact',
    'preact/hooks',
    'preact/compat',
  ],
});

// Worker bundle (Web Worker or Service Worker)
export const workerBundle = partial({
  format: [
    'iife',
  ],
  globalName: 'self', // Global name for IIFE bundles
  platform: 'browser' as const,
  splitting: false, // Workers don't support splitting
});

// Lambda/Serverless function
export const serverlessFunction = partial({
  external: [
    'aws-sdk',
    '@aws-sdk/*',
  ], // AWS SDK is provided by Lambda
  format: [
    'cjs',
  ], // Most serverless platforms expect CJS
  minify: true,
  platform: 'node' as const,
  target: NODE_LTS,
});

// Deno bundle
export const denoBundle = partial({
  dts: false, // Deno uses TypeScript directly
  format: [
    'esm',
  ],
  platform: 'neutral' as const,
  target: 'esnext',
});

// Test bundle (for test runners)
export const testBundle = partial({
  define: {
    'process.env.NODE_ENV': '"test"',
  },
  minify: false,
  sourcemap: 'inline',
  treeshake: false, // Keep all code for testing
});

// Legacy browser support
export const legacyBrowser = partial({
  format: [
    'iife',
  ],
  platform: 'browser' as const,
  target: 'es5',
  // Note: For Node.js polyfills, use esbuildOptions or a separate plugin
});

// Modern browser (ES modules)
export const modernBrowser = partial({
  format: [
    'esm',
  ],
  platform: 'browser' as const,
  splitting: true,
  target: 'es2022',
});

// Bundle all dependencies (for standalone distributions)
export const bundleAll = partial({
  external: [], // Bundle everything
  skipNodeModulesBundle: false,
  // To bundle all dependencies, we simply set external to empty array
});

// Pure ESM package
export const pureESM = partial({
  cjsInterop: false,
  format: [
    'esm',
  ],
  platform: 'neutral' as const,
  shims: false,
  target: 'es2022',
});

// Experimental/Edge features
export const experimental = partial({
  target: 'esnext',
  // Note: Enable experimental features via tsup CLI flags or environment variables
});
