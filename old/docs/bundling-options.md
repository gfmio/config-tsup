# Bundling Options Strategy

This document explains the default settings for all bundling options in the preset configurations.

## Options Overview

| Option | Libraries | CLIs | Browser Bundles | Rationale |
|--------|-----------|------|-----------------|-----------|
| **minify** | ❌ `false` | ✅ `true` | ✅ `true` | Libraries: let consumers decide; CLIs/Browser: optimize size |
| **sourcemap** | ✅ `true` | ✅ `true` | ✅ `'external'` | Always generate for debugging/error tracking |
| **splitting** | ❌ `false` | ❌ `false` | ✅ `true` (ESM only) | Libraries/CLIs: single bundle; Browser: lazy loading |
| **treeshake** | ✅ `true` | ✅ `true` | ✅ `true` | Always remove dead code |
| **shims** | ❌ `false` | ✅ `true` | ❌ `false` | CLIs need Node.js globals; libraries/browser don't |
| **cjsInterop** | ✅ CJS only | ✅ CJS only | N/A | Better ESM/CJS compatibility |

## Detailed Explanations

### Code Splitting (`splitting`)

**Purpose:** Breaks code into chunks for dynamic imports and optimizes shared dependencies.

- **Libraries:** Disabled - consumers handle their own code splitting strategy
- **CLIs:** Disabled - everything needs to be in one executable file
- **Browser ESM:** Enabled - supports lazy loading and better caching
- **Browser IIFE:** N/A - IIFE format doesn't support splitting

### Tree Shaking (`treeshake`)

**Purpose:** Eliminates unused code from the bundle.

- **All presets:** Enabled - always beneficial for reducing bundle size
- **Note:** Preserves all exports in libraries, only removes internal dead code

### Shims (`shims`)

**Purpose:** Provides Node.js globals like `__dirname`, `__filename`, `import.meta.url`.

- **Libraries:** Disabled - let consumers decide on polyfills
- **CLIs:** Enabled - often rely on Node.js-specific APIs
- **Browser:** Disabled - Node.js APIs don't exist in browsers

### CommonJS Interop (`cjsInterop`)

**Purpose:** Adds helpers for better CommonJS/ESM module interoperability.

- **CJS Libraries:** Enabled - improves compatibility when imported by ESM
- **ESM Libraries:** Not needed - pure ESM doesn't need interop
- **CJS CLIs:** Enabled - handle mixed module ecosystems
- **Browser:** Not applicable - browsers use ESM natively

## Format-Specific Considerations

### CommonJS (CJS)

- Always includes `cjsInterop` for better ESM compatibility
- Adds `"use strict"` banner for safety
- Cannot use code splitting

### ESM

- Supports code splitting
- No need for `cjsInterop`
- Native browser and modern Node.js format

### IIFE

- For legacy browser support
- Cannot use code splitting
- Adds `"use strict"` banner
- Self-contained bundle

## Customization Examples

### Disable splitting for a browser bundle

```typescript
import { esmBrowserBundle } from '@gfmio/config-tsup';
import { noSplitting } from '@gfmio/config-tsup/partials';
import { merge } from '@gfmio/config-tsup/utils';

export default merge(esmBrowserBundle, noSplitting);
```

### Add shims to a library (e.g., for a Node.js-specific library)

```typescript
import { nodeLibrary } from '@gfmio/config-tsup';
import { shims } from '@gfmio/config-tsup/partials';
import { merge } from '@gfmio/config-tsup/utils';

export default nodeLibrary.map(config => merge(config, shims));
```

### Disable tree shaking for debugging

```typescript
import { base, esm, noTreeshake } from '@gfmio/config-tsup/partials';
import { merge, config } from '@gfmio/config-tsup/utils';

export default config(merge(base, esm, noTreeshake));
```

## Best Practices

1. **Don't override defaults unless necessary** - The presets are optimized for common use cases
2. **Test bundle output** - Verify that splitting, tree shaking, and minification work as expected
3. **Monitor bundle size** - Use the `analyzeConfig` partial to track bundle metrics
4. **Consider your consumers** - Libraries should be flexible, applications should be optimized

## Summary

The preset configurations provide:

- **Optimal defaults** for each project type
- **Format-aware settings** (CJS interop, splitting for ESM only)
- **Environment-appropriate options** (shims for Node.js, not for browser)
- **Performance optimizations** where beneficial
- **Flexibility** for customization when needed
