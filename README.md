# @gfmio/config-tsup

Shared tsup configuration for consistent bundling across all packages. Provides pre-configured builds for libraries, CLIs, and custom setups.

## Installation

```bash
bun add -D @gfmio/config-tsup tsup
```

## Quick Start

### Library Package (Most Common)

For packages that need CommonJS, ESM, and TypeScript declarations:

```typescript
// tsup.config.ts
import { createLibraryConfig } from '@gfmio/config-tsup';

export default createLibraryConfig(['src/index.ts']);
```

This creates three builds:

- `dist/index.cjs` - CommonJS build
- `dist/index.mjs` - ESM build  
- `dist/index.d.ts` - TypeScript declarations

### CLI Tool

For command-line tools that need Node.js compatibility:

```typescript
// tsup.config.ts
import { createCliConfig } from '@gfmio/config-tsup';

export default createCliConfig('src/cli.ts', {
  // Optional: Add shebang for direct execution
  esbuildOptions: (options) => {
    options.banner = {
      js: '#!/usr/bin/env node\n"use strict";',
    };
  },
});
```

### Custom Configuration

For specific build requirements:

```typescript
// tsup.config.ts
import { createConfig } from '@gfmio/config-tsup';

export default createConfig(['src/index.ts', 'src/cli.ts'], {
  format: ['esm'],
  dts: true,
  splitting: true,
  minify: true,
});
```

## Available Configurations

### `createLibraryConfig(entry, overrides?)`

Creates a complete library setup with CJS, ESM, and DTS outputs.

**Parameters:**

- `entry` - Entry point(s) for the build (default: `['src/index.ts']`)
- `overrides` - Custom tsup options to override defaults

**Example:**

```typescript
export default createLibraryConfig(['src/index.ts', 'src/utils.ts'], {
  external: ['react', 'react-dom'],
  minify: true,
});
```

### `createCliConfig(entry, overrides?)`

Creates a CLI-optimized configuration with Node.js shims.

**Parameters:**

- `entry` - Entry point for the CLI (default: `'src/cli.ts'`)
- `overrides` - Custom tsup options to override defaults

**Features:**

- ESM format only
- Node 18+ target
- Platform-specific shims
- No type declarations (CLIs don't need them)

### `createConfig(entry, overrides?)`

Creates a custom configuration with full control.

**Parameters:**

- `entry` - Entry point(s) for the build
- `overrides` - Custom tsup options

**Example:**

```typescript
export default createConfig(['src/index.ts'], {
  format: ['iife'],
  globalName: 'MyLib',
  minify: true,
  target: 'es2015',
});
```

## Pre-configured Exports

### Individual Format Configs

```typescript
import { cjsConfig, esmConfig, dtsConfig } from '@gfmio/config-tsup';

// Use individual configs
export default [cjsConfig, esmConfig];
```

### Base Configuration

```typescript
import { baseConfig } from '@gfmio/config-tsup';

// Extend the base config
export default {
  ...baseConfig,
  entry: ['src/special.ts'],
  format: ['esm'],
};
```

## Default Settings

All configurations share these base settings:

```typescript
{
  splitting: false,        // Better tree-shaking without splitting
  sourcemap: true,        // Enable source maps
  clean: true,            // Clean output directory
  outDir: 'out/build',    // Output directory (customizable)
  target: 'es2022',       // Modern JavaScript
  treeshake: true,        // Remove unused code
  minify: false,          // No minification by default
  external: [],           // Bundle all dependencies
}
```

## Output Extensions

Files are named with clear extensions:

- `.cjs` for CommonJS
- `.mjs` for ESM
- `.js` for IIFE
- `.d.ts` for TypeScript declarations

## Common Patterns

### React Component Library

```typescript
export default createLibraryConfig(['src/index.ts'], {
  external: ['react', 'react-dom'],
  jsx: 'automatic',
  jsxImportSource: 'react',
});
```

### Node.js Library

```typescript
export default createLibraryConfig(['src/index.ts'], {
  platform: 'node',
  target: 'node18',
  external: ['node:fs', 'node:path', 'node:crypto'],
});
```

### Browser Library with IIFE

```typescript
import { createConfig } from '@gfmio/config-tsup';

export default createConfig(['src/index.ts'], {
  format: ['esm', 'iife'],
  globalName: 'MyLib',
  platform: 'browser',
  target: ['chrome91', 'firefox90', 'safari15'],
});
```

### Multiple Entry Points

```typescript
export default createLibraryConfig([
  'src/index.ts',
  'src/components/index.ts',
  'src/utils/index.ts',
], {
  splitting: true,  // Enable code splitting for shared modules
});
```

### Development vs Production

```typescript
const isDev = process.env.NODE_ENV === 'development';

export default createLibraryConfig(['src/index.ts'], {
  minify: !isDev,
  sourcemap: isDev,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
});
```

## Package.json Setup

Configure your package.json to use the built files:

```json
{
  "type": "module",
  "main": "./out/build/index.cjs",
  "module": "./out/build/index.mjs",
  "types": "./out/build/index.d.ts",
  "exports": {
    ".": {
      "types": "./out/build/index.d.ts",
      "import": "./out/build/index.mjs",
      "require": "./out/build/index.cjs"
    }
  },
  "files": [
    "out/build"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  }
}
```

## Integration with Other Configs

Works seamlessly with other @gfmio config packages:

```typescript
// tsup.config.ts
import { createLibraryConfig } from '@gfmio/config-tsup';

export default createLibraryConfig(['src/index.ts']);
```

```json
// tsconfig.json
{
  "extends": "@gfmio/config-tsconfig/library.json",
  "include": ["src/**/*"],
  "exclude": ["node_modules", "out"]
}
```

## Advanced Options

### Custom ESBuild Options

```typescript
export default createConfig(['src/index.ts'], {
  esbuildOptions: (options, context) => {
    options.banner = {
      js: '"use strict";',
      css: '/* My Library CSS */',
    };
    options.legalComments = 'inline';
    options.pure = ['console.log'];
  },
});
```

### Plugin Support

```typescript
import { myTsupPlugin } from 'some-tsup-plugin';

export default createLibraryConfig(['src/index.ts'], {
  plugins: [myTsupPlugin()],
});
```

### Environment Variables

```typescript
export default createConfig(['src/index.ts'], {
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
    __VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  env: {
    NODE_ENV: process.env.NODE_ENV || 'production',
  },
});
```

## Troubleshooting

### Build Issues

1. **Module not found errors**: Check your `external` configuration
2. **Type errors**: Ensure TypeScript is installed and configured
3. **Output issues**: Verify `outDir` matches your package.json paths

### Performance

- Use `splitting: false` for libraries (better tree-shaking)
- Use `splitting: true` for applications (better caching)
- Enable `minify` only for production builds
- Consider `treeshake: { preset: 'smallest' }` for minimal bundles

## License

[MIT](LICENSE)
