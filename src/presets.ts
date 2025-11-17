//
// Presets
//

import { config } from "./lib/config";
import { config } from "./utils/config";
import { configs } from "./utils/configs";
import { merge } from "./utils/merge";

//
// Libraries
//

// Node library
// Libraries should include sourcemaps for debugging

export const cjsNodeLibrary = config(merge(base, node, cjsOnly, sourcemap));
export const esmNodeLibrary = config(merge(base, node, esmOnly, sourcemap));
export const dtsOnlyNodeLibrary = config(merge(base, node, dtsOnly));

export const nodeLibrary = configs(cjsNodeLibrary, esmNodeLibrary, dtsOnlyNodeLibrary);

// Browser library
// Libraries should include sourcemaps for debugging

export const esmBrowserLibrary = config(merge(base, browser, esmOnly, sourcemap));
export const dtsOnlyBrowserLibrary = config(merge(base, browser, dtsOnly));

export const browserLibrary = configs(esmBrowserLibrary, dtsOnlyBrowserLibrary);

// Neutral / isomorphic library
// Libraries should include sourcemaps for debugging

export const cjsNeutralLibrary = config(merge(base, neutral, cjsOnly, sourcemap));
export const esmNeutralLibrary = config(merge(base, neutral, esmOnly, sourcemap));
export const dtsOnlyNeutralLibrary = config(merge(base, neutral, dtsOnly));

export const neutralLibrary = configs(cjsNeutralLibrary, esmNeutralLibrary, dtsOnlyNeutralLibrary);

export const library = neutralLibrary;

//
// CLIs
//

// Node CLI
// CLIs typically don't need sourcemaps (minified for distribution)

export const cjsNodeCli = config(merge(base, cjsNodeCliPartial, noDts, minify, noSourcemap, shims ));
export const esmNodeCli = config(merge(base, esmNodeCliPartial, noDts, minify, noSourcemap, shims ));

export const nodeCli = esmNodeCli;

// Bun CLI
// CLIs typically don't need sourcemaps (minified for distribution)

export const cjsBunCli = config(merge(base, cjsBunCliPartial, noDts, minify, noSourcemap, shims ));
export const esmBunCli = config(merge(base, esmBunCliPartial, noDts, minify, noSourcemap, shims ));

export const bunCli = esmBunCli;

//
// Browser build
//

// Production browser bundles typically don't ship sourcemaps publicly
export const esmBrowserBundle = config(merge(base, browser, esmOnly, minify, noSourcemap, splitting, shims ));
export const iifeBrowserBundle = config(merge(base, browser, iife, minify, noSourcemap, splitting, shims ));
