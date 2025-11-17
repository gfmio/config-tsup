//
// Presets
//

import type { Options } from 'tsup';

import {
  analyzeConfig,
  base,
  browser,
  browserDevelopment,
  browserProduction,
  bundleAll,
  ciAnalyzeConfig,
  cjsBunCli as cjsBunCliPartial,
  cjsInterop,
  cjsNodeCli as cjsNodeCliPartial,
  cjsOnly,
  cjsStandaloneBunCli as cjsStandaloneBunCliPartial,
  cjsStandaloneNodeCli as cjsStandaloneNodeCliPartial,
  cliDevelopment,
  cliProduction,
  debugMinify,
  denoBundle,
  devAnalyzeConfig,
  development,
  dtsOnly,
  esmBunCli as esmBunCliPartial,
  esmNodeCli as esmNodeCliPartial,
  esmOnly,
  esmStandaloneBunCli as esmStandaloneBunCliPartial,
  esmStandaloneNodeCli as esmStandaloneNodeCliPartial,
  experimental,
  experimentalDts,
  iife,
  legacyBrowser,
  libraryDevelopment,
  library as libraryPartial,
  libraryProduction,
  minify,
  modernBrowser,
  neutral,
  node,
  noDts,
  noMinify,
  noShims,
  preactLibrary,
  production,
  productionMinify,
  pureESM,
  reactLibrary,
  safeMinify,
  serverlessFunction,
  shims,
  sourcemap,
  sourcemapExternal,
  sourcemapHidden,
  sourcemapInline,
  splitting,
  standaloneBunCli as standaloneBunCliPartial,
  standaloneNodeCli as standaloneNodeCliPartial,
  strictAnalyzeConfig,
  testBundle,
  vueLibrary,
  watchDevelopment,
  watchWithSuccess,
  workerBundle
} from './partials.ts';
import { config } from './utils/config.ts';
import { configs } from './utils/configs.ts';
import { merge } from './utils/merge.ts';

//
// Libraries
//

// Node library
// Libraries: NO minification (let consumers decide)
// CJS needs interop, no shims (let consumers decide), skip bundling node_modules

export const cjsNodeLibrary = config(merge(base, libraryPartial, node, cjsOnly));
export const esmNodeLibrary = config(merge(base, libraryPartial, node, esmOnly));
export const dtsOnlyNodeLibrary = config(merge(base, libraryPartial, node, dtsOnly));

export const nodeLibrary = configs(cjsNodeLibrary, esmNodeLibrary, dtsOnlyNodeLibrary);

// Environment-aware Node library presets
// Development: inline sourcemaps, no minification, __DEV__ flag
// Production: external sourcemaps, no minification (let consumers decide), __PROD__ flag

export const cjsNodeLibraryDev = config(merge(base, libraryPartial, node, cjsOnly, libraryDevelopment));
export const esmNodeLibraryDev = config(merge(base, libraryPartial, node, esmOnly, libraryDevelopment));
export const dtsOnlyNodeLibraryDev = config(merge(base, libraryPartial, node, dtsOnly));

export const nodeLibraryDev = configs(cjsNodeLibraryDev, esmNodeLibraryDev, dtsOnlyNodeLibraryDev);

export const cjsNodeLibraryProd = config(merge(base, libraryPartial, node, cjsOnly, libraryProduction));
export const esmNodeLibraryProd = config(merge(base, libraryPartial, node, esmOnly, libraryProduction));
export const dtsOnlyNodeLibraryProd = config(merge(base, libraryPartial, node, dtsOnly));

export const nodeLibraryProd = configs(cjsNodeLibraryProd, esmNodeLibraryProd, dtsOnlyNodeLibraryProd);

// Browser library
// Libraries: NO minification (let consumers decide)
// No shims in browser environment, skip bundling node_modules

export const esmBrowserLibrary = config(merge(base, libraryPartial, browser, esmOnly));
export const dtsOnlyBrowserLibrary = config(merge(base, libraryPartial, browser, dtsOnly));

export const browserLibrary = configs(esmBrowserLibrary, dtsOnlyBrowserLibrary);

// Environment-aware Browser library presets

export const esmBrowserLibraryDev = config(merge(base, libraryPartial, browser, esmOnly, libraryDevelopment));
export const dtsOnlyBrowserLibraryDev = config(merge(base, libraryPartial, browser, dtsOnly));

export const browserLibraryDev = configs(esmBrowserLibraryDev, dtsOnlyBrowserLibraryDev);

export const esmBrowserLibraryProd = config(merge(base, libraryPartial, browser, esmOnly, libraryProduction));
export const dtsOnlyBrowserLibraryProd = config(merge(base, libraryPartial, browser, dtsOnly));

export const browserLibraryProd = configs(esmBrowserLibraryProd, dtsOnlyBrowserLibraryProd);

// Neutral / isomorphic library
// Libraries: NO minification (let consumers decide)
// CJS needs interop, no shims (let consumers decide), skip bundling node_modules

export const cjsNeutralLibrary = config(merge(base, libraryPartial, neutral, cjsOnly));
export const esmNeutralLibrary = config(merge(base, libraryPartial, neutral, esmOnly));
export const dtsOnlyNeutralLibrary = config(merge(base, libraryPartial, neutral, dtsOnly));

export const neutralLibrary = configs(cjsNeutralLibrary, esmNeutralLibrary, dtsOnlyNeutralLibrary);

// Default library export points to neutral library
export const library = neutralLibrary;

// Environment-aware Neutral library presets

export const cjsNeutralLibraryDev = config(merge(base, libraryPartial, neutral, cjsOnly, libraryDevelopment));
export const esmNeutralLibraryDev = config(merge(base, libraryPartial, neutral, esmOnly, libraryDevelopment));
export const dtsOnlyNeutralLibraryDev = config(merge(base, libraryPartial, neutral, dtsOnly));

export const neutralLibraryDev = configs(cjsNeutralLibraryDev, esmNeutralLibraryDev, dtsOnlyNeutralLibraryDev);

export const cjsNeutralLibraryProd = config(merge(base, libraryPartial, neutral, cjsOnly, libraryProduction));
export const esmNeutralLibraryProd = config(merge(base, libraryPartial, neutral, esmOnly, libraryProduction));
export const dtsOnlyNeutralLibraryProd = config(merge(base, libraryPartial, neutral, dtsOnly));

export const neutralLibraryProd = configs(cjsNeutralLibraryProd, esmNeutralLibraryProd, dtsOnlyNeutralLibraryProd);

export const libraryDev = neutralLibraryDev;
export const libraryProd = neutralLibraryProd;

//
// CLIs
//

// Node CLI (regular npm distribution)
// CLIs: YES minification (size matters), YES sourcemaps (error tracking), YES shims (Node.js globals)
// Dependencies NOT bundled for npm distribution
// CJS needs interop for mixed module systems

export const cjsNodeCli = config(merge(base, cjsNodeCliPartial, minify));
export const esmNodeCli = config(merge(base, esmNodeCliPartial, minify));

export const nodeCli = esmNodeCli;

// Environment-aware Node CLI presets
// Development: inline sourcemaps, no minification, preserve names for debugging
// Production: hidden sourcemaps, full minification, optimized for size

export const cjsNodeCliDev = config(merge(base, cjsNodeCliPartial, cliDevelopment));
export const esmNodeCliDev = config(merge(base, esmNodeCliPartial, cliDevelopment));

export const nodeCliDev = esmNodeCliDev;

export const cjsNodeCliProd = config(merge(base, cjsNodeCliPartial, cliProduction));
export const esmNodeCliProd = config(merge(base, esmNodeCliPartial, cliProduction));

export const nodeCliProd = esmNodeCliProd;

// Standalone Node CLI (single-file executable)
// Dependencies ARE bundled for standalone distribution
// YES minification (size matters), YES sourcemaps (error tracking), YES shims (Node.js globals)

export const cjsStandaloneNodeCli = config(merge(base, cjsStandaloneNodeCliPartial, minify));
export const esmStandaloneNodeCli = config(merge(base, esmStandaloneNodeCliPartial, minify));

export const standaloneNodeCli = config(merge(base, standaloneNodeCliPartial, esmOnly, minify));

// Bun CLI (regular npm distribution)
// CLIs: YES minification (size matters), YES sourcemaps (error tracking), YES shims (Node.js globals)
// Dependencies NOT bundled for npm distribution
// CJS needs interop for mixed module systems

export const cjsBunCli = config(merge(base, cjsBunCliPartial, noDts, minify, sourcemap, shims, cjsInterop));
export const esmBunCli = config(merge(base, esmBunCliPartial, noDts, minify, sourcemap, shims));

export const bunCli = esmBunCli;

// Standalone Bun CLI (single-file executable)
// Dependencies ARE bundled for standalone distribution
// YES minification (size matters), YES sourcemaps (error tracking), YES shims (Node.js globals)

export const cjsStandaloneBunCli = config(
  merge(base, cjsStandaloneBunCliPartial, noDts, minify, sourcemap, shims, cjsInterop),
);
export const esmStandaloneBunCli = config(merge(base, esmStandaloneBunCliPartial, noDts, minify, sourcemap, shims));

export const standaloneBunCli = config(merge(base, standaloneBunCliPartial, esmOnly, noDts, minify, sourcemap, shims));

//
// Browser build
//

// Browser bundles: YES minification (bandwidth), External sourcemaps (upload to Sentry, not shipped to users)
// YES splitting for ESM (lazy loading), NO shims (no Node.js APIs in browser)
// IIFE doesn't support splitting

export const esmBrowserBundle = config(merge(base, browser, esmOnly, minify, sourcemapExternal, splitting, noShims));
export const iifeBrowserBundle = config(merge(base, browser, iife, minify, sourcemapExternal, noShims));

// Environment-aware browser bundles
// Development: inline sourcemaps, no minification, splitting for HMR
// Production: external sourcemaps, full minification, aggressive optimization

export const esmBrowserBundleDev = config(merge(base, browser, esmOnly, browserDevelopment));
export const iifeBrowserBundleDev = config(merge(base, browser, iife, browserDevelopment, noShims));

export const esmBrowserBundleProd = config(merge(base, browser, esmOnly, browserProduction));
export const iifeBrowserBundleProd = config(merge(base, browser, iife, browserProduction, noShims));

//
// Framework-Specific Libraries
//

// React Component Library
// Auto JSX transform for React 17+, externalize React dependencies
// Optimized for tree-shaking and modern bundlers

export const cjsReactLibrary = config(merge(base, libraryPartial, browser, cjsOnly, reactLibrary));
export const esmReactLibrary = config(merge(base, libraryPartial, browser, esmOnly, reactLibrary));
export const dtsOnlyReactLibrary = config(merge(base, libraryPartial, browser, dtsOnly));

export const reactComponentLibrary = configs(esmReactLibrary, cjsReactLibrary, dtsOnlyReactLibrary);

// Vue Component Library
// Externalize Vue and its ecosystem packages
// ESM-first for modern Vue 3 applications

export const cjsVueLibrary = config(merge(base, libraryPartial, browser, cjsOnly, vueLibrary));
export const esmVueLibrary = config(merge(base, libraryPartial, browser, esmOnly, vueLibrary));
export const dtsOnlyVueLibrary = config(merge(base, libraryPartial, browser, dtsOnly));

export const vueComponentLibrary = configs(esmVueLibrary, cjsVueLibrary, dtsOnlyVueLibrary);

// Preact Component Library
// Automatic JSX with Preact as source
// Smaller bundle size alternative to React

export const cjsPreactLibrary = config(merge(base, libraryPartial, browser, cjsOnly, preactLibrary));
export const esmPreactLibrary = config(merge(base, libraryPartial, browser, esmOnly, preactLibrary));
export const dtsOnlyPreactLibrary = config(merge(base, libraryPartial, browser, dtsOnly));

export const preactComponentLibrary = configs(esmPreactLibrary, cjsPreactLibrary, dtsOnlyPreactLibrary);

//
// Specialized Build Targets
//

// Web Worker / Service Worker Bundle
// IIFE format for worker contexts, no code splitting support
// Browser platform with self as global

export const webWorker = config(merge(base, workerBundle, browserProduction));
export const webWorkerDev = config(merge(base, workerBundle, browserDevelopment));

// Serverless Function (AWS Lambda, Vercel, Netlify)
// CJS format for compatibility, minified for cold start performance
// Externalize AWS SDK (provided by runtime)

export const lambdaFunction = config(merge(base, serverlessFunction, cliProduction));
export const lambdaFunctionDev = config(merge(base, serverlessFunction, cliDevelopment));

// Deno Bundle
// Pure ESM, no TypeScript declarations (Deno uses TS directly)
// Neutral platform, latest ES features

export const denoModule = config(merge(base, denoBundle, noMinify));
export const denoModuleProd = config(merge(base, denoBundle, minify));

// Test Bundle (for test runners like Jest, Vitest)
// No minification, inline sourcemaps, preserve all code
// NODE_ENV=test for proper test behavior

export const testSuite = config(merge(base, node, esmOnly, testBundle));
export const testSuiteCjs = config(merge(base, node, cjsOnly, testBundle));

//
// Pure ESM and Modern Presets
//

// Pure ESM Package (no CJS support)
// Modern ES2022 target, no shims or interop
// For packages targeting only modern Node.js and browsers

export const pureESMLibrary = configs(
  config(merge(base, libraryPartial, neutral, pureESM)),
  config(merge(base, libraryPartial, neutral, dtsOnly))
);

// Modern Browser Application
// ESM-only with code splitting, ES2022 features
// Optimized for modern evergreen browsers

export const modernBrowserApp = config(merge(base, modernBrowser, browserProduction, splitting));
export const modernBrowserAppDev = config(merge(base, modernBrowser, browserDevelopment));

// Legacy Browser Support
// IIFE format with ES5 target
// For applications that must support older browsers

export const legacyBrowserBundle = config(merge(base, legacyBrowser, minify, sourcemapExternal));

//
// Development-Optimized Presets
//

// Development Library with Watch Mode
// Fast rebuilds, inline sourcemaps, no tree-shaking
// Automatic rebuild on file changes

export const devLibraryWithWatch = configs(
  config(merge(base, libraryPartial, node, esmOnly, libraryDevelopment, watchDevelopment))
);

// Development CLI with Inline Sourcemaps
// Quick iteration, detailed stack traces
// No minification for readability

export const devNodeCli = config(
  merge(base, esmNodeCliPartial, cliDevelopment, sourcemapInline)
);

// Watch Mode with Custom Success Handler
// Useful for running tests or restarting server after build

export const watchWithCustomSuccess = (onSuccess: Parameters<typeof watchWithSuccess>[0]) =>
  config(merge(base, libraryPartial, neutral, esmOnly, libraryDevelopment, watchWithSuccess(onSuccess)));

//
// Granular Minification Presets
//

// Debug-Friendly Minification
// Preserves function/variable names for better stack traces
// Removes whitespace and optimizes syntax

export const debugNodeCli = config(
  merge(base, esmNodeCliPartial, debugMinify, sourcemap)
);

// Safe Production Library
// Conservative minification that preserves names
// For libraries where debugging in production is critical

export const safeProductionLibrary = configs(
  config(merge(base, libraryPartial, node, cjsOnly, safeMinify)),
  config(merge(base, libraryPartial, node, esmOnly, safeMinify)),
  config(merge(base, libraryPartial, node, dtsOnly))
);

// Aggressive Production Bundle
// Maximum minification for smallest possible size
// For production applications where size is critical

export const aggressiveProductionBundle = config(
  merge(base, browser, esmOnly, productionMinify, sourcemapHidden, splitting)
);

//
// Bundle Analysis Presets
//

// Library with Bundle Analysis
// Includes metafile generation and visualization
// Helps identify bundle size issues during development

export const analyzedLibrary = configs(
  config(merge(base, libraryPartial, neutral, cjsOnly, devAnalyzeConfig)),
  config(merge(base, libraryPartial, neutral, esmOnly, devAnalyzeConfig)),
  config(merge(base, libraryPartial, neutral, dtsOnly))
);

// Production CLI with Strict Analysis
// Fails build if bundle exceeds size threshold
// Ensures production builds stay within size budget

export const strictNodeCli = config(
  merge(base, esmNodeCliPartial, minify, cliProduction, strictAnalyzeConfig)
);

// CI-Friendly Bundle Analysis
// Minimal output, fails on large bundles
// Optimized for continuous integration pipelines

export const ciOptimizedBundle = config(
  merge(base, browser, esmOnly, browserProduction, ciAnalyzeConfig)
);

//
// Composite Presets for Common Scenarios
//

// Full-Stack TypeScript Monorepo Package
// Dual format with experimental DTS, optimized for monorepos
// Includes code splitting for better tree-shaking

export const monorepoPackage = configs(
  config(merge(base, libraryPartial, neutral, cjsOnly, libraryProduction)),
  config(merge(base, libraryPartial, neutral, esmOnly, libraryProduction, splitting)),
  config(merge(base, libraryPartial, neutral, dtsOnly, experimentalDts))
);

// Production-Ready Browser Application
// Full optimization pipeline with bundle analysis
// Code splitting, minification, and size monitoring

export const productionBrowserApp = config(
  merge(base, browser, esmOnly, browserProduction, splitting, strictAnalyzeConfig)
);

// Universal NPM Package
// Maximum compatibility with all environments
// CJS/ESM dual format with comprehensive type definitions

export const universalNpmPackage = configs(
  config(merge(base, libraryPartial, neutral, cjsOnly, cjsInterop, shims)),
  config(merge(base, libraryPartial, neutral, esmOnly)),
  config(merge(base, libraryPartial, neutral, dtsOnly, experimentalDts))
);

// Standalone Binary CLI
// Single-file executable with all dependencies bundled
// Optimized for distribution outside npm

export const standaloneBinary = config(
  merge(base, standaloneNodeCliPartial, esmOnly, bundleAll, cliProduction)
);

// Edge/Experimental Features
// Latest JavaScript features, experimental tsup options
// For cutting-edge projects and testing new capabilities

export const experimentalBundle = config(
  merge(base, neutral, esmOnly, experimental, experimentalDts, analyzeConfig)
);

//
// Preset Factories
//

/**
 * Factory for creating environment-aware preset pairs
 * Generates both development and production variants
 *
 * @param basePreset - Base configuration to extend
 * @param devOverrides - Additional development overrides
 * @param prodOverrides - Additional production overrides
 * @returns Object with development and production presets
 */
export function createEnvironmentAwarePreset(
  basePreset: Partial<Options>,
  devOverrides: Partial<Options> = {},
  prodOverrides: Partial<Options> = {}
): { development: ReturnType<typeof config>; production: ReturnType<typeof config> } {
  return {
    development: config(merge(basePreset, development, devOverrides)),
    production: config(merge(basePreset, production, prodOverrides)),
  };
}

/**
 * Factory for creating library presets with all formats
 * Generates CJS, ESM, and DTS configurations
 *
 * @param platform - Target platform (node, browser, neutral)
 * @param additionalConfig - Additional configuration to merge
 * @returns Configs with all three formats
 */
export function createLibraryPreset(
  platform: Partial<Options>,
  additionalConfig: Partial<Options> = {}
): ReturnType<typeof configs> {
  return configs(
    config(merge(base, libraryPartial, platform, cjsOnly, additionalConfig)),
    config(merge(base, libraryPartial, platform, esmOnly, additionalConfig)),
    config(merge(base, libraryPartial, platform, dtsOnly))
  );
}

/**
 * Factory for creating framework-specific library presets
 * Includes framework-specific externals and JSX configuration
 *
 * @param frameworkConfig - Framework-specific configuration
 * @param additionalConfig - Additional configuration to merge
 * @returns Configs with ESM, CJS, and DTS
 */
export function createFrameworkLibrary(
  frameworkConfig: Partial<Options>,
  additionalConfig: Partial<Options> = {}
): ReturnType<typeof configs> {
  return configs(
    config(merge(base, libraryPartial, browser, esmOnly, frameworkConfig, additionalConfig)),
    config(merge(base, libraryPartial, browser, cjsOnly, frameworkConfig, additionalConfig)),
    config(merge(base, libraryPartial, browser, dtsOnly))
  );
}

// Example usage of factories
export const nodeCliEnvironments = createEnvironmentAwarePreset(
  merge(base, esmNodeCliPartial),
  { sourcemap: 'inline' }, // dev overrides
  { minify: true, sourcemap: 'hidden' as any } // prod overrides
);

export const customReactLibrary = createFrameworkLibrary(
  reactLibrary,
  { target: 'es2020' } // custom overrides
);
