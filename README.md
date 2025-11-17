# @gfmio/config-tsup

> Shared tsup configuration for consistent, optimized TypeScript bundling across projects

[![npm version](https://img.shields.io/npm/v/@gfmio/config-tsup)](https://www.npmjs.com/package/@gfmio/config-tsup)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A comprehensive tsup configuration library that provides pre-configured build setups, composable configuration partials, and advanced bundle analysis tools. Built with TypeScript-first design and full type safety.

## Features

- 🚀 **30+ Pre-configured Presets** - Ready-to-use configurations for libraries, CLIs, and browser bundles
- 🧩 **Composable Partials** - Mix and match configuration pieces for custom setups
- 🎯 **Type-Safe** - Full TypeScript support with intelligent type inference
- 📊 **Bundle Analysis** - Built-in size reporting and visualization
- 🌍 **Environment-Aware** - Automatic development/production mode detection
- 🎨 **Framework Support** - Specialized configs for React, Vue, and Preact
- ⚡ **Optimized Defaults** - Best practices baked in for each project type

## Installation

```bash
npm install --save-dev @gfmio/config-tsup tsup

# Optional: For bundle visualization
npm install --save-dev esbuild-visualizer
```

## Quick Start

### 1. Library (Most Common)

Create a dual-format library with CommonJS, ESM, and TypeScript declarations:

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';
import { library } from '@gfmio/config-tsup/presets';

export default defineConfig(library);
```

This generates:

- `dist/index.cjs` - CommonJS build
- `dist/index.mjs` - ESM build
- `dist/index.d.ts` - TypeScript declarations

### 2. CLI Tool

Build a command-line tool with Node.js compatibility:

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';
import { nodeCli } from '@gfmio/config-tsup/presets';

export default defineConfig(nodeCli);
```

### 3. Custom Configuration

Build your own configuration using partials:

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';
import { base, esm, minify, sourcemap } from '@gfmio/config-tsup/partials';
import { merge, config } from '@gfmio/config-tsup/utils';

export default defineConfig(
  config(merge(base, esm, minify, sourcemap))
);
```

## Architecture

### Presets

Pre-configured, production-ready build configurations for common use cases:

```typescript
import {
  // Libraries
  nodeLibrary,        // Node.js library with CJS + ESM + DTS
  browserLibrary,     // Browser library with ESM + DTS
  neutralLibrary,     // Universal/isomorphic library

  // CLIs
  nodeCli,            // Node.js CLI with shebang
  bunCli,             // Bun runtime CLI
  standaloneCli,      // Single-file executable

  // Browser Bundles
  esmBrowserBundle,   // Modern browser with code splitting
  iifeBrowserBundle,  // Legacy browser support

  // Framework-specific
  reactComponentLibrary,   // React with automatic JSX
  vueComponentLibrary,     // Vue 3 components
  preactComponentLibrary,  // Preact components

  // Specialized
  lambdaFunction,     // AWS Lambda/Serverless
  webWorker,          // Web Worker/Service Worker
  denoModule,         // Deno modules
} from '@gfmio/config-tsup/presets';
```

### Partials

Composable configuration fragments for building custom setups:

```typescript
import {
  // Base configurations
  base,              // Foundation settings

  // Output formats
  cjs, esm, iife,    // Format-specific configs
  dts, dtsOnly,      // TypeScript declarations

  // Platforms
  node, browser, neutral,  // Platform-specific settings

  // Optimization
  minify, noMinify,        // Minification control
  sourcemap, noSourcemap,  // Source map generation
  treeshake, noTreeshake,  // Tree shaking
  splitting, noSplitting,  // Code splitting

  // Development/Production
  development, production,      // Environment configs
  libraryDevelopment,          // Library dev mode
  libraryProduction,           // Library prod mode

  // Bundle Analysis
  analyzeConfig,         // Default analyzer
  strictAnalyzeConfig,   // Fails on large bundles
} from '@gfmio/config-tsup/partials';
```

### Utilities

Helper functions for configuration management:

```typescript
import {
  // Configuration helpers
  config,   // Type-safe config wrapper
  configs,  // Multiple configs array
  merge,    // Deep merge configs
  partial,  // Create config fragment
  entry,    // Define entry points

  // Environment detection
  isDevelopment,  // Check if dev mode
  isProduction,   // Check if prod mode
  getBuildMode,   // Get current mode
  isCI,          // Detect CI environment

  // Factories
  createEnvConfig,      // Environment-aware config
  createAdaptiveConfig, // Adaptive configuration
} from '@gfmio/config-tsup/utils';
```

## Configuration Examples

### Environment-Aware Configuration

Automatically switch between development and production settings:

```typescript
import { defineConfig } from 'tsup';
import { base, development, production } from '@gfmio/config-tsup/partials';
import { merge, config, getBuildMode } from '@gfmio/config-tsup/utils';

const mode = getBuildMode(); // Auto-detects from NODE_ENV, MODE, etc.

export default defineConfig(
  config(merge(
    base,
    mode === 'development' ? development : production
  ))
);
```

### React Component Library

```typescript
import { defineConfig } from 'tsup';
import { reactComponentLibrary } from '@gfmio/config-tsup/presets';

export default defineConfig(reactComponentLibrary);
```

Features:

- Automatic JSX transform for React 17+
- Externalized React dependencies
- Optimized for tree-shaking

### Standalone CLI

Single-file executable with all dependencies bundled:

```typescript
import { defineConfig } from 'tsup';
import { standaloneBinary } from '@gfmio/config-tsup/presets';

export default defineConfig(standaloneBinary);
```

### Multiple Entry Points

```typescript
import { defineConfig } from 'tsup';
import { library } from '@gfmio/config-tsup/presets';
import { entry } from '@gfmio/config-tsup/utils';

export default defineConfig(
  library.map(config => ({
    ...config,
    entry: {
      index: 'src/index.ts',
      cli: 'src/cli.ts',
      utils: 'src/utils/index.ts',
    }
  }))
);
```

### With Bundle Analysis

Monitor bundle sizes with detailed reporting:

```typescript
import { defineConfig } from 'tsup';
import { library } from '@gfmio/config-tsup/presets';
import { analyzeConfig } from '@gfmio/config-tsup/partials';

export default defineConfig(
  library.map(config => ({
    ...config,
    ...analyzeConfig
  }))
);
```

## Bundle Analyzer

The built-in bundle analyzer provides:

- 📊 Detailed size reporting for all output files
- 🎨 Interactive visualizations (treemap, sunburst, network)
- ⚡ Format-specific analysis (CJS, ESM, IIFE)
- 🚨 Configurable size warnings and build failures

### Basic Usage

```typescript
import { analyzeConfig } from '@gfmio/config-tsup/partials';
```

### Visualization

Install `esbuild-visualizer` to generate interactive HTML visualizations:

```bash
npm i -D esbuild-visualizer
```

Build output will include:

- `dist/bundle-analysis-cjs.html` - CommonJS visualization
- `dist/bundle-analysis-esm.html` - ESM visualization

### Custom Thresholds

```typescript
import { analyzerWithOptions } from '@gfmio/config-tsup/bundleAnalyzer';

export default defineConfig(merge(
  base,
  analyzerWithOptions({
    warnThreshold: 256 * 1024,  // Warn at 256KB
    failOnLarge: true,           // Fail if exceeds threshold
    visualizer: 'required',      // Require visualizer
    template: 'sunburst',        // Visualization type
  })
));
```

## Minification Strategies

### Granular Control

Fine-tune minification for your specific needs:

```typescript
import {
  debugMinify,       // Keep names, remove whitespace
  productionMinify,  // Maximum compression
  safeMinify,        // Conservative, compatible
} from '@gfmio/config-tsup/partials';
```

### Custom Minification

```typescript
import {
  minifyWhitespace,
  minifyIdentifiers,
  minifySyntax,
  keepNames,
} from '@gfmio/config-tsup/partials';

export default defineConfig(
  config(merge(
    base,
    minifyWhitespace,  // Remove whitespace only
    keepNames,          // Preserve function names
  ))
);
```

## Environment Variables

The library respects multiple environment variable patterns:

| Variable | Purpose | Priority |
|----------|---------|----------|
| `TSUP_ENV` | tsup-specific override | Highest |
| `BUILD_ENV` | Generic build environment | High |
| `MODE` | Vite convention | Medium |
| `NODE_ENV` | Node.js standard | Low |

Example:

```bash
# Force production mode even in dev script
TSUP_ENV=production npm run dev

# Use Vite convention
MODE=development tsup

# Standard Node.js
NODE_ENV=production npm run build
```

## Package.json Setup

Configure your package.json for dual-format publishing:

```json
{
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "prepublishOnly": "npm run build"
  }
}
```

## Advanced Usage

### Factory Functions

Create reusable configuration factories:

```typescript
import {
  createEnvironmentAwarePreset,
  createLibraryPreset,
  createFrameworkLibrary,
} from '@gfmio/config-tsup/presets';

// Environment-aware preset
const myPreset = createEnvironmentAwarePreset(
  baseConfig,
  { sourcemap: 'inline' },     // dev overrides
  { minify: true }              // prod overrides
);

// Custom library preset
const myLibrary = createLibraryPreset(
  { platform: 'node' },
  { target: 'node18' }
);
```

### Adaptive Configuration

Configuration that adapts to the environment:

```typescript
import { createAdaptiveConfig } from '@gfmio/config-tsup/utils';

export default defineConfig(
  createAdaptiveConfig(base, {
    development: {
      sourcemap: 'inline',
      minify: false,
    },
    production: {
      sourcemap: 'hidden',
      minify: true,
    },
    ci: {
      silent: true,
    },
    watch: {
      onSuccess: 'node dist/index.js',
    }
  })
);
```

### Watch Mode with Actions

```typescript
import { watchWithSuccess } from '@gfmio/config-tsup/partials';

export default defineConfig(
  config(merge(
    base,
    watchWithSuccess('npm run test')
  ))
);
```

## Type-Safe Builders

This package includes two type-safe builder implementations for creating tsup configurations with compile-time constraint validation:

### 1. Simple Builder

Minimal API with 5 generic operations for maximum composability:

```typescript
import { simpleBuilder } from '@gfmio/config-tsup/simple-builder';

const config = simpleBuilder()
  .set('entry', ['src/index.ts'])
  .merge({
    format: ['cjs', 'esm'] as const,
    dts: true,
    external: ['react', 'react-dom'],
  })
  .build();
```

### 2. Robust Builder

Comprehensive constraint validation with optional runtime checks:

```typescript
import { robustBuilder } from '@gfmio/config-tsup/robust-builder';

const config = robustBuilder()
  .set('entry', ['src/index.ts'])
  .set('format', 'esm')
  .merge({ splitting: true })  // ✅ Type-checked and runtime-validated
  .build();

// This would fail at compile-time:
// robustBuilder()
//   .set('format', 'iife')
//   .merge({ splitting: true })  // ❌ ConstraintViolation<'Cannot enable splitting with IIFE'>
```

**See [docs/builder-comparison.md](docs/builder-comparison.md) for detailed comparison and usage guide.**

## Default Settings

### Base Configuration

All configurations inherit these defaults:

```typescript
{
  clean: true,              // Clean output directory
  external: [/^[^./]/],    // Externalize dependencies
  minify: false,           // No minification by default
  outDir: 'dist',          // Output directory
  sourcemap: true,         // Generate source maps
  splitting: false,        // No code splitting
  target: 'es2022',        // Modern JavaScript
  treeshake: true,         // Remove dead code
}
```

### Project-Specific Defaults

| Project Type | Minification | Source Maps | Splitting | Shims |
|--------------|-------------|-------------|-----------|--------|
| **Libraries** | ❌ No | ✅ Yes | ❌ No | ❌ No |
| **CLIs** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Browser** | ✅ Yes | ✅ External | ✅ ESM only | ❌ No |

## Troubleshooting

### Build Issues

**Module not found errors**

- Check your `external` configuration
- Verify entry paths are correct

**Type errors**

- Ensure TypeScript is installed
- Check tsconfig.json configuration

**Large bundle warnings**

- Review bundled dependencies
- Consider externalizing large packages
- Enable code splitting for applications

### Performance Tips

**For Development**

- Use `development` or `libraryDevelopment` presets
- Enable watch mode with `--watch`
- Disable minification for faster builds

**For Production**

- Use appropriate production presets
- Enable all optimizations
- Consider bundle analysis for size monitoring

## License

[MIT](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Links

- [GitHub Repository](https://github.com/gfmio/config-tsup)
- [npm Package](https://www.npmjs.com/package/@gfmio/config-tsup)
- [tsup Documentation](https://tsup.egoist.dev)
- [esbuild Documentation](https://esbuild.github.io)
