//
// Constants
//

// outDir conventions

export const DIST = 'dist';

export const OUT_BUILD = 'out/build';
export const OUT_LIB = 'out/lib';
export const OUT_DIST = 'out/dist';

// entry conventions

export const INDEX_TS = 'index.ts';
export const SRC_INDEX_TS = 'src/index.ts';
export const INDEX_CTS = 'index.cts';
export const SRC_INDEX_CTS = 'src/index.cts';
export const INDEX_MTS = 'index.mts';
export const SRC_INDEX_MTS = 'src/index.mts';

export const INDEX_JS = 'index.js';
export const SRC_INDEX_JS = 'src/index.js';
export const INDEX_CJS = 'index.cjs';
export const SRC_INDEX_CJS = 'src/index.cjs';
export const INDEX_MJS = 'index.mjs';
export const SRC_INDEX_MJS = 'src/index.mjs';

// use strict

export const USE_STRICT = '"use strict";\n';

// Shebangs

export const NODE_SHEBANG = '#!/usr/bin/env node\n';
export const BUN_SHEBANG = '#!/usr/bin/env bun\n';

// Node LTS

export const NODE_LTS = 'node20'; // Current node LTS

// ES2022 (widely supported browser target)

export const ES2022 = 'es2022';

// Platforms

export const NODE_PLATFORM = 'node';
export const BROWSER_PLATFORM = 'browser';
export const NEUTRAL_PLATFORM = 'neutral';

// File extensions

export const JS_EXTENSION = '.js';
export const CJS_EXTENSION = '.cjs';
export const MJS_EXTENSION = '.mjs';
export const DTS_EXTENSION = '.d.ts';

export const EXTENSION_MAP = {
  cjs: CJS_EXTENSION,
  esm: MJS_EXTENSION,
  iife: JS_EXTENSION,
} as const;

export const defaultOutExtensionHelper = ({ format }: { format: 'cjs' | 'esm' | 'iife' }) => ({
  dts: DTS_EXTENSION,
  js: EXTENSION_MAP[format] ?? JS_EXTENSION,
});

// Externals

export const NOT_LOCAL_FILES_REGEX = /^[^./]/;
export const NODE_PROTOCOL_REGEX = /^node:/;
export const BUN_PROTOCOL_REGEX = /^bun:/;

export const ALL_EXTERNALS = [
  NOT_LOCAL_FILES_REGEX,
  NODE_PROTOCOL_REGEX,
  BUN_PROTOCOL_REGEX,
];
export const NODE_BUILTINS_EXTERNAL = [
  NODE_PROTOCOL_REGEX,
] as const;
export const BUN_BUILTINS_EXTERNAL = [
  'bun',
  BUN_PROTOCOL_REGEX,
  NODE_PROTOCOL_REGEX,
] as const;
export const REACT_EXTERNALS = [
  'react',
  'react-dom',
] as const;
export const VUE_EXTERNALS = [
  'vue',
  '@vue/*',
] as const;
