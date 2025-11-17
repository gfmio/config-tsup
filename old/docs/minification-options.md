# Minification Options Guide

This document explains the granular minification options and their recommended usage.

## Minification Options Overview

tsup (via esbuild) provides fine-grained control over minification:

| Option | What It Does | Impact |
|--------|--------------|---------|
| **`minify`** | Enables all minification | Full compression |
| **`minifyWhitespace`** | Removes whitespace/newlines | ~20-30% size reduction |
| **`minifyIdentifiers`** | Renames variables (a,b,c) | ~10-20% size reduction |
| **`minifySyntax`** | Simplifies code syntax | ~5-10% size reduction |
| **`keepNames`** | Preserves function/class names | Better debugging, ~5% size increase |

## Recommended Defaults

### For Libraries

```typescript
// Libraries should NOT be minified at all (default)
minify: false
// Let the consumer's bundler handle optimization
```

### For CLI Tools

```typescript
minify: true,
keepNames: true,  // Preserve names for stack traces
// Other options use esbuild defaults when minify: true
```

### For Browser Production

```typescript
minify: true,
keepNames: false,  // Maximum compression
// Other options use esbuild defaults when minify: true
```

### For Browser Development

```typescript
minify: false,  // Or use debugMinify preset
// If minifying in dev:
minifyWhitespace: true,
minifyIdentifiers: false,  // Keep variable names
minifySyntax: true,
keepNames: true,  // Essential for debugging
```

## Pre-built Minification Presets

The library provides convenient presets in `@gfmio/config-tsup/partials`:

### `debugMinify`

Minification suitable for development/debugging:

- ✅ Whitespace removal
- ❌ Identifier renaming (keep original names)
- ✅ Syntax optimization
- ✅ Keep function/class names

### `productionMinify`

Maximum compression for production:

- ✅ Whitespace removal
- ✅ Identifier renaming
- ✅ Syntax optimization
- ❌ Don't keep names (maximum compression)

### `safeMinify`

Conservative minification (safest for compatibility):

- ✅ Whitespace removal (safe, just formatting)
- ❌ No identifier renaming (preserve original names)
- ❌ No syntax optimization (avoid any code transformation)
- ✅ Keep all names

## Usage Examples

### Using a preset

```typescript
import { base, debugMinify } from '@gfmio/config-tsup/partials';
import { merge, config } from '@gfmio/config-tsup/utils';

export default config(merge(base, debugMinify));
```

### Custom minification

```typescript
import { base, minify, keepNames, noMinifyIdentifiers } from '@gfmio/config-tsup/partials';
import { merge, config } from '@gfmio/config-tsup/utils';

export default config(merge(
  base,
  minify,
  keepNames,           // Keep function names
  noMinifyIdentifiers  // Don't rename variables
));
```

### Override CLI defaults

```typescript
import { nodeCli } from '@gfmio/config-tsup';
import { noKeepNames } from '@gfmio/config-tsup/partials';
import { merge } from '@gfmio/config-tsup/utils';

// CLI with maximum compression (no preserved names)
export default merge(nodeCli, noKeepNames);
```

## Why `keepNames` Matters

### With `keepNames: true`

```javascript
Error: Cannot read property 'foo' of undefined
  at UserService.getUserData (user-service.js:42)
  at AuthController.login (auth-controller.js:15)
```

### With `keepNames: false`

```javascript
Error: Cannot read property 'foo' of undefined
  at a.b (app.min.js:1)
  at c.d (app.min.js:1)
```

The difference is critical for:

- Production error tracking (Sentry, Rollbar)
- Development debugging
- Performance profiling
- React/Vue DevTools

## Best Practices

1. **Libraries**: Never minify - let consumers decide
2. **CLIs**: Always use `keepNames: true` for helpful error messages
3. **Browser Production**: Use `keepNames: false` for maximum compression
4. **Browser with Error Tracking**: Consider `keepNames: true` even in production
5. **Development**: Either no minification or use `debugMinify` preset

## Size Impact

Typical impact on a medium-sized bundle (~100KB):

- `minifyWhitespace`: -25KB (75KB)
- `minifyIdentifiers`: -15KB (60KB)
- `minifySyntax`: -5KB (55KB)
- All three: -40KB (60KB)
- `keepNames`: +3-5KB

## Decision Tree

```
Is it a library?
├─ Yes → Don't minify at all
└─ No → Is it for production?
   ├─ No → Use debugMinify or no minification
   └─ Yes → Is error tracking important?
      ├─ Yes → Use minify + keepNames
      └─ No → Use productionMinify (maximum compression)
```
