# Sourcemap & Minification Strategy

This library provides **sensible defaults** for sourcemaps and minification based on real-world production needs.

## Key Principles

1. **Always generate sourcemaps** - Even production builds need them for error tracking services
2. **Libraries shouldn't be minified** - Let the consumer's bundler handle optimization
3. **CLIs and browser bundles should be minified** - Reduce size for distribution

## Default Settings by Preset

### 📚 **Libraries**

- **Minification:** `false` - Let consumers' bundlers decide
- **Sourcemaps:** `true` - Essential for debugging and monorepo bundling
- Presets: `nodeLibrary`, `browserLibrary`, `neutralLibrary`
- Rationale:
  - Consumers may want readable code
  - Sourcemaps enable debugging in node_modules
  - In monorepos, sourcemaps chain together for final bundles

### 🔧 **CLI Tools**

- **Minification:** `true` - Size matters for global npm installs
- **Sourcemaps:** `true` - Error tracking and debugging
- Presets: `nodeCli`, `bunCli`
- Rationale:
  - Smaller download/install size
  - Sourcemaps help debug production issues
  - Stack traces remain useful with sourcemaps

### 🌐 **Browser Bundles**

- **Minification:** `true` - Bandwidth optimization
- **Sourcemaps:** `'external'` - Generate but don't reference in bundle
- Presets: `esmBrowserBundle`, `iifeBrowserBundle`
- Rationale:
  - Minify for production performance
  - External .map files for Sentry/Rollbar upload
  - Source maps not exposed to end users

### 🛠️ **Development/Production Partials**

Explicit environment-based settings:

- `development` partial: `sourcemap: true`
- `production` partial: `sourcemap: false`

## Customization Examples

### Override preset defaults

```typescript
import { nodeLibrary } from '@gfmio/config-tsup';
import { noSourcemap } from '@gfmio/config-tsup/partials';
import { merge } from '@gfmio/config-tsup/utils';

// Library without sourcemaps
export default nodeLibrary.map(config => merge(config, noSourcemap));
```

### Build custom configuration

```typescript
import { base, esm, sourcemap } from '@gfmio/config-tsup/partials';
import { merge, config } from '@gfmio/config-tsup/utils';

// Custom config with explicit sourcemap
export default config(merge(base, esm, sourcemap));
```

### Environment-based configuration

```typescript
import { base, production, development } from '@gfmio/config-tsup/partials';
import { merge, config } from '@gfmio/config-tsup/utils';

const isDev = process.env['NODE_ENV'] === 'development';

export default config(merge(
  base,
  isDev ? development : production
  // Automatically gets correct sourcemap setting
));
```

## Rationale

This strategy provides:

1. **Sensible defaults** - Each preset has appropriate settings for its use case
2. **Flexibility** - Easy to override when needed
3. **No surprises** - Explicit, documented behavior
4. **Performance** - Optimized for distribution size where appropriate
5. **Developer experience** - Debugging support where most valuable
