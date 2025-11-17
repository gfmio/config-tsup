# Build Strategies Guide

## Development vs Production Builds

### Recommended Approach: Environment Detection with Override

The library provides intelligent environment detection with explicit override capabilities.

### Environment Detection Priority

The library checks multiple common patterns in order:

1. **`TSUP_ENV`** - Tool-specific override (highest priority)
2. **`BUILD_ENV`** - Generic build environment override
3. **`MODE`** - Vite convention (used by Vite, Vitest, etc.)
4. **`NODE_ENV`** - Node.js standard
5. **npm lifecycle event** - `dev` or `develop` scripts
6. **Default to production** - Safest default

### Usage Examples

#### Automatic Environment Detection

```typescript
import { base, development, production } from '@gfmio/config-tsup/partials';
import { merge, config, getBuildMode } from '@gfmio/config-tsup/utils';

const mode = getBuildMode(); // Automatically detects environment

export default config(merge(
  base,
  mode === 'development' ? development : production
));
```

#### Using Helper Functions

```typescript
import { isDevelopment, isProduction, isCI } from '@gfmio/config-tsup/utils';

export default config(merge(
  base,
  isDevelopment() ? development : production,
  isCI() ? { minify: true } : {}  // Always minify in CI
));
```

#### Environment-Aware Factory

```typescript
import { createEnvConfig } from '@gfmio/config-tsup/utils';
import { base, development, production } from '@gfmio/config-tsup/partials';

// Automatically switches based on environment
export default createEnvConfig(
  merge(base, development),
  merge(base, production)
);
```

#### Adaptive Configuration

```typescript
import { createAdaptiveConfig } from '@gfmio/config-tsup/utils';
import { base } from '@gfmio/config-tsup/partials';

export default createAdaptiveConfig(base, {
  development: {
    sourcemap: 'inline',
    minify: false,
  },
  production: {
    sourcemap: 'hidden',
    minify: true,
  },
  ci: {
    silent: true,  // Quieter output in CI
  },
  watch: {
    onSuccess: 'node dist/index.js',  // Run after each build
  }
});
```

### Setting Build Mode

#### Via npm scripts

```json
{
  "scripts": {
    "build": "NODE_ENV=production tsup",
    "build:dev": "NODE_ENV=development tsup",
    "dev": "tsup --watch",  // Automatically uses development
    "build:staging": "TSUP_ENV=production NODE_ENV=development tsup"  // TSUP_ENV wins
  }
}
```

#### Via command line

```bash
# Standard approach (NODE_ENV)
NODE_ENV=production npm run build
NODE_ENV=development npm run build

# Tool-specific override (highest priority)
TSUP_ENV=production npm run dev  # Forces production even in dev script

# Vite-compatible
MODE=development npm run build

# Generic build override
BUILD_ENV=production npm run build
```

#### Compatibility with Other Tools

```bash
# Works with Vite projects
MODE=production tsup

# Works with standard Node.js
NODE_ENV=production tsup

# Explicit tsup control
TSUP_ENV=production tsup
```

## skipNodeModulesBundle Option

### What It Does

The `skipNodeModulesBundle` option tells tsup to skip bundling files from node_modules that have already been bundled (detected by presence of `.js` and `.mjs` files).

### Recommendations by Use Case

| Use Case | skipNodeModulesBundle | Reason |
|----------|----------------------|---------|
| **Libraries** | ✅ `true` | Avoid re-bundling dependencies |
| **Applications** | ❌ `false` | Bundle everything for deployment |
| **CLI Tools** | ❌ `false` | Single executable file |
| **Monorepo Packages** | ✅ `true` | Avoid double-bundling |
| **Dev Dependencies** | ✅ `true` | Skip bundling dev tools |

### When to Enable (true)

1. **Publishing libraries** - Let consumers handle their dependencies
2. **Monorepo packages** - Avoid bundling shared workspace packages
3. **Development builds** - Faster builds, rely on node_modules
4. **When using `external`** - If you're already externalizing deps

### When to Disable (false)

1. **Standalone applications** - Need all code bundled
2. **CLI tools** - Need single distributable file
3. **Browser bundles** - Can't rely on node_modules
4. **Docker deployments** - Want minimal runtime dependencies

### Usage Examples

#### For Libraries

```typescript
import { nodeLibrary } from '@gfmio/config-tsup';
import { skipNodeModulesBundle } from '@gfmio/config-tsup/partials';
import { merge } from '@gfmio/config-tsup/utils';

// Skip re-bundling already bundled dependencies
export default nodeLibrary.map(config =>
  merge(config, skipNodeModulesBundle)
);
```

#### For Applications

```typescript
import { base, noSkipNodeModulesBundle } from '@gfmio/config-tsup/partials';
import { merge, config } from '@gfmio/config-tsup/utils';

// Bundle everything for deployment
export default config(merge(
  base,
  noSkipNodeModulesBundle,  // Explicitly bundle node_modules
  { external: [] }  // Don't externalize anything
));
```

#### Environment-Based

```typescript
import { isDevelopment } from '@gfmio/config-tsup/utils';

export default config(merge(
  base,
  isDevelopment()
    ? skipNodeModulesBundle  // Skip in dev for speed
    : noSkipNodeModulesBundle  // Bundle in prod for deployment
));
```

## Performance Implications

### Development Builds

- Enable `skipNodeModulesBundle` for faster rebuilds
- Use `sourcemap: 'inline'` for better debugging
- Disable minification
- Enable watch mode

### Production Builds

- Consider `skipNodeModulesBundle: false` for applications
- Use `sourcemap: 'hidden'` or `'external'`
- Enable all minification
- Run type checking separately

### CI Builds

- Use consistent settings across environments
- Consider `silent: true` for cleaner logs
- Enable `metafile` for bundle analysis
- Use `skipNodeModulesBundle: true` for libraries

## Decision Trees

### Should I skip node_modules bundling?

```
Is it a library?
├─ Yes → skipNodeModulesBundle: true
└─ No → Is it for standalone deployment?
   ├─ Yes → skipNodeModulesBundle: false
   └─ No → Is it a monorepo package?
      ├─ Yes → skipNodeModulesBundle: true
      └─ No → skipNodeModulesBundle: false
```

### Which build mode?

```
Is CI running?
├─ Yes → Use production settings
└─ No → Is it a watch/dev script?
   ├─ Yes → Use development settings
   └─ No → Check NODE_ENV
      ├─ development → Use development settings
      └─ other → Use production settings
```

## Best Practices

1. **Default to production** - Safer to accidentally ship production builds
2. **Use BUILD_MODE for overrides** - When you need explicit control
3. **Libraries always skip** - Let consumers handle bundling
4. **Applications never skip** - Need complete bundles
5. **Test both modes** - Ensure builds work in both environments
6. **Document your choice** - Make it clear why you chose specific settings
