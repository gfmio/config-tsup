# tsup Configuration Cookbook

Common recipes and patterns for tsup configurations using @gfmio/config-tsup.

## Table of Contents

- [Using the Config Builder](#using-the-config-builder)
- [Library Configurations](#library-configurations)
- [CLI Tool Configurations](#cli-tool-configurations)
- [Browser Bundle Configurations](#browser-bundle-configurations)
- [Framework-Specific Configurations](#framework-specific-configurations)
- [Advanced Patterns](#advanced-patterns)
- [Migration Guide](#migration-guide)

## Using the Config Builder

The new config builder provides a fluent, chainable API for creating configurations:

### Basic Library

```typescript
// tsup.config.ts
import { tsupBuilder } from '@gfmio/config-tsup/builder';

export default tsupBuilder()
  .asLibrary()
  .dualFormat()
  .withTypes()
  .build();
```

### CLI with Custom Entry

```typescript
export default tsupBuilder()
  .entry('src/cli.ts')
  .asCli('node')
  .minify({ keepNames: true })
  .build();
```

### Browser App with Code Splitting

```typescript
export default tsupBuilder()
  .entry({
    app: 'src/app.ts',
    worker: 'src/worker.ts'
  })
  .asBrowserBundle()
  .withSplitting()
  .env('production')
  .build();
```

## Library Configurations

### Dual Format Library with Development Mode

```typescript
import { tsupBuilder } from '@gfmio/config-tsup/builder';
import { getBuildMode } from '@gfmio/config-tsup/utils';

export default tsupBuilder()
  .asLibrary()
  .dualFormat()
  .withTypes()
  .env(getBuildMode())
  .build();
```

### ESM-Only Modern Library

```typescript
import { tsupBuilder } from '@gfmio/config-tsup/builder';

export default tsupBuilder()
  .asLibrary()
  .format('esm')
  .withTypes()
  .target('es2022')
  .external([/^node:/])
  .build();
```

### Library with Multiple Entry Points

```typescript
export default tsupBuilder()
  .entry({
    index: 'src/index.ts',
    utils: 'src/utils/index.ts',
    plugins: 'src/plugins/index.ts'
  })
  .asLibrary()
  .dualFormat()
  .withTypes()
  .build();
```

### Monorepo Package

```typescript
import { library } from '@gfmio/config-tsup/presets';
import { config, merge } from '@gfmio/config-tsup/utils';

export default library.map(preset =>
  config(merge(preset, {
    external: [
      /^@mycompany\//,  // Externalize all workspace packages
      /^node:/
    ],
    tsconfig: './tsconfig.build.json'  // Use build-specific tsconfig
  }))
);
```

## CLI Tool Configurations

### Node.js CLI with Auto-restart in Watch Mode

```typescript
export default tsupBuilder()
  .entry('src/cli.ts')
  .asCli('node')
  .watch('node dist/cli.js')
  .build();
```

### Standalone Binary with All Dependencies

```typescript
export default tsupBuilder()
  .entry('src/cli.ts')
  .asCli('node')
  .asStandalone()
  .minify()
  .build();
```

### CLI with Subcommands

```typescript
export default tsupBuilder()
  .entry({
    'cli': 'src/cli.ts',
    'cli-init': 'src/commands/init.ts',
    'cli-build': 'src/commands/build.ts',
    'cli-serve': 'src/commands/serve.ts'
  })
  .asCli('node')
  .build();
```

## Browser Bundle Configurations

### Production Browser App with Bundle Analysis

```typescript
export default tsupBuilder()
  .entry('src/app.ts')
  .asBrowserBundle()
  .env('production')
  .withBundleAnalysis({
    warnThreshold: 500 * 1024,  // Warn at 500KB
    failOnLarge: true
  })
  .build();
```

### Progressive Web App with Service Worker

```typescript
import { config, configs } from '@gfmio/config-tsup/utils';

// Main app bundle
const app = tsupBuilder()
  .entry('src/app.ts')
  .asBrowserBundle()
  .withSplitting()
  .build();

// Service worker (separate bundle)
const sw = tsupBuilder()
  .entry('src/service-worker.ts')
  .format('iife')
  .platform('browser')
  .minify()
  .build();

export default configs(app, sw);
```

### Legacy Browser Support

```typescript
export default tsupBuilder()
  .entry('src/app.ts')
  .format('iife')
  .platform('browser')
  .target('es5')
  .configure({
    globalName: 'MyApp',
    footer: {
      js: '// Compatible with IE11+'
    }
  })
  .build();
```

## Framework-Specific Configurations

### React Component Library with CSS

```typescript
export default tsupBuilder()
  .asLibrary()
  .dualFormat()
  .withTypes()
  .forReact()
  .configure({
    // Extract CSS to separate files
    esbuildOptions: (options) => {
      options.loader = {
        '.css': 'css',
        '.module.css': 'local-css'
      };
      return options;
    }
  })
  .build();
```

### Vue 3 Composition API Library

```typescript
export default tsupBuilder()
  .entry('src/index.ts')
  .asLibrary()
  .format('esm')  // Vue 3 is ESM-first
  .withTypes()
  .forVue()
  .external(['@vue/reactivity', '@vue/runtime-core'])
  .build();
```

### Next.js Custom Server

```typescript
export default tsupBuilder()
  .entry('server.ts')
  .platform('node')
  .format('cjs')  // Next.js server needs CJS
  .target('node18')
  .external(['next', 'react', 'react-dom'])
  .minify(false)  // Keep readable for debugging
  .build();
```

## Advanced Patterns

### Conditional Configuration Based on Environment

```typescript
import { tsupBuilder } from '@gfmio/config-tsup/builder';

const isDev = process.env.NODE_ENV === 'development';
const isCI = process.env.CI === 'true';

export default tsupBuilder()
  .asLibrary()
  .dualFormat()
  .withTypes(!isDev)  // Skip types in development
  .minify(!isDev)
  .sourcemap(isDev ? 'inline' : 'hidden')
  .configure(isCI ? {
    silent: true,
    logLevel: 'error'
  } : {})
  .build();
```

### Multi-Config with Shared Base

```typescript
import { tsupBuilder } from '@gfmio/config-tsup/builder';
import { configs } from '@gfmio/config-tsup/utils';

// Shared base configuration
const createBase = () => tsupBuilder()
  .platform('node')
  .target('node18')
  .sourcemap('hidden');

// Main library
const lib = createBase()
  .entry('src/index.ts')
  .asLibrary()
  .dualFormat()
  .withTypes()
  .build();

// CLI tool
const cli = createBase()
  .entry('src/cli.ts')
  .asCli('node')
  .build();

// Test utilities (not minified)
const testUtils = createBase()
  .entry('src/test-utils.ts')
  .format('cjs')
  .minify(false)
  .build();

export default configs(lib, cli, testUtils);
```

### Dynamic Entry Points

```typescript
import { readdirSync } from 'fs';
import { tsupBuilder } from '@gfmio/config-tsup/builder';

// Find all plugin files
const plugins = readdirSync('src/plugins')
  .filter(f => f.endsWith('.ts'))
  .reduce((acc, file) => {
    const name = file.replace('.ts', '');
    acc[`plugins/${name}`] = `src/plugins/${file}`;
    return acc;
  }, {} as Record<string, string>);

export default tsupBuilder()
  .entry({
    index: 'src/index.ts',
    ...plugins
  })
  .asLibrary()
  .format('esm')
  .withTypes()
  .build();
```

### Custom Output Names

```typescript
export default tsupBuilder()
  .asLibrary()
  .dualFormat()
  .configure({
    outExtension: ({ format }) => ({
      js: format === 'cjs' ? '.cjs' : '.mjs',
      dts: '.d.ts'
    })
  })
  .build();
```

### Serverless Function with Tree Shaking

```typescript
export default tsupBuilder()
  .entry('src/handler.ts')
  .format('cjs')  // AWS Lambda expects CJS
  .platform('node')
  .target('node18')
  .external(['aws-sdk', '@aws-sdk/*'])  // AWS SDK provided by Lambda
  .minify()
  .configure({
    treeshake: {
      preset: 'smallest',
      moduleSideEffects: false
    },
    pure: ['console.log', 'console.debug'],  // Remove debug logs
    define: {
      'process.env.IS_LAMBDA': 'true'
    }
  })
  .build();
```

### Library with Peer Dependency Warnings

```typescript
const peerDeps = Object.keys(
  require('./package.json').peerDependencies || {}
);

export default tsupBuilder()
  .asLibrary()
  .dualFormat()
  .withTypes()
  .external(peerDeps)
  .configure({
    onSuccess: async () => {
      console.log('✨ Build complete!');
      console.log(`📦 Peer dependencies externalized: ${peerDeps.join(', ')}`);
    }
  })
  .build();
```

## Migration Guide

### From Vanilla tsup

```typescript
// Before (vanilla tsup)
export default {
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  minify: false
};

// After (with builder)
import { tsupBuilder } from '@gfmio/config-tsup/builder';

export default tsupBuilder()
  .entry('src/index.ts')
  .asLibrary()
  .dualFormat()
  .withTypes()
  .externalize('react', 'react-dom')
  .build();
```

### From Preset-based Config

```typescript
// Before (using presets)
import { library } from '@gfmio/config-tsup/presets';
import { merge } from '@gfmio/config-tsup/utils';

export default library.map(config =>
  merge(config, {
    external: ['react', 'react-dom']
  })
);

// After (with builder)
export default tsupBuilder()
  .asLibrary()
  .dualFormat()
  .withTypes()
  .externalize('react', 'react-dom')
  .build();
```

### From Partials Composition

```typescript
// Before (using partials)
import { base, esm, minify, sourcemap } from '@gfmio/config-tsup/partials';
import { merge, config } from '@gfmio/config-tsup/utils';

export default config(merge(base, esm, minify, sourcemap));

// After (with builder)
export default tsupBuilder()
  .format('esm')
  .minify()
  .sourcemap(true)
  .build();
```

## Best Practices

### 1. Start Simple, Add Complexity as Needed

Start with a preset or basic builder configuration, then add customizations:

```typescript
// Start here
export default tsupBuilder().asLibrary().build();

// Then add what you need
export default tsupBuilder()
  .asLibrary()
  .dualFormat()
  .withTypes()
  .forReact()
  .env(process.env.NODE_ENV)
  .withBundleAnalysis()
  .build();
```

### 2. Use Environment Detection

```typescript
import { getBuildMode } from '@gfmio/config-tsup/utils';

export default tsupBuilder()
  .asLibrary()
  .env(getBuildMode())  // Automatically detects development/production
  .build();
```

### 3. Validate Configuration in CI

```typescript
export default tsupBuilder()
  .asLibrary()
  .configure(process.env.CI ? {
    // Strict settings for CI
    logLevel: 'error',
    failOnWarning: true
  } : {})
  .withBundleAnalysis({
    failOnLarge: process.env.CI === 'true'
  })
  .build();
```

### 4. Document Custom Configurations

```typescript
export default tsupBuilder()
  .asLibrary()
  // We need to support Node 14 for legacy systems
  .target('node14')
  // Marketing site uses global builds
  .configure({
    globalName: 'OurSDK'
  })
  .build();
```

### 5. Test Your Builds

After changing configuration, always test:

```bash
# Build and check output
npm run build
ls -la dist/

# Test in a consuming project
npm link
cd ../test-project
npm link @your/package
```

## Troubleshooting

### Issue: Bundle Size Too Large

```typescript
// Add bundle analysis to identify issues
export default tsupBuilder()
  .asLibrary()
  .withBundleAnalysis({
    visualizer: 'required'
  })
  .build();

// Then check dist/bundle-analysis-*.html
```

### Issue: Types Not Generated

```typescript
// Ensure TypeScript can find your files
export default tsupBuilder()
  .asLibrary()
  .withTypes()
  .configure({
    tsconfig: './tsconfig.build.json',  // Use specific tsconfig
    dts: {
      resolve: true,  // Resolve external types
      entry: './src/index.ts'  // Specify entry for types
    }
  })
  .build();
```

### Issue: Module Resolution Errors

```typescript
// Be explicit about externals
export default tsupBuilder()
  .asLibrary()
  .external([
    /^node:/,    // Node built-ins
    /^[^./]/,    // All npm packages
  ])
  .build();
```
