//
// Presets
//

import {
  base,
  browser,
  cjsBunCli as cjsBunCliPartial,
  cjsInterop,
  cjsNodeCli as cjsNodeCliPartial,
  cjsOnly,
  cjsStandaloneBunCli as cjsStandaloneBunCliPartial,
  cjsStandaloneNodeCli as cjsStandaloneNodeCliPartial,
  dtsOnly,
  esmBunCli as esmBunCliPartial,
  esmNodeCli as esmNodeCliPartial,
  esmOnly,
  esmStandaloneBunCli as esmStandaloneBunCliPartial,
  esmStandaloneNodeCli as esmStandaloneNodeCliPartial,
  iife,
  library as libraryPartial,
  minify,
  neutral,
  noDts,
  node,
  noShims,
  shims,
  sourcemap,
  sourcemapExternal,
  splitting,
  standaloneBunCli as standaloneBunCliPartial,
  standaloneNodeCli as standaloneNodeCliPartial,
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

// Browser library
// Libraries: NO minification (let consumers decide)
// No shims in browser environment, skip bundling node_modules

export const esmBrowserLibrary = config(merge(base, libraryPartial, browser, esmOnly));
export const dtsOnlyBrowserLibrary = config(merge(base, libraryPartial, browser, dtsOnly));

export const browserLibrary = configs(esmBrowserLibrary, dtsOnlyBrowserLibrary);

// Neutral / isomorphic library
// Libraries: NO minification (let consumers decide)
// CJS needs interop, no shims (let consumers decide), skip bundling node_modules

export const cjsNeutralLibrary = config(merge(base, libraryPartial, neutral, cjsOnly));
export const esmNeutralLibrary = config(merge(base, libraryPartial, neutral, esmOnly));
export const dtsOnlyNeutralLibrary = config(merge(base, libraryPartial, neutral, dtsOnly));

export const neutralLibrary = configs(cjsNeutralLibrary, esmNeutralLibrary, dtsOnlyNeutralLibrary);

export const library = neutralLibrary;

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
