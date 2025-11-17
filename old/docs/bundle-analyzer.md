# Bundle Analyzer

The `@gfmio/config-tsup` package includes a comprehensive bundle analyzer that provides detailed insights into your build output.

## Features

- 📊 **Detailed size reporting** - View sizes for all output files
- 🎨 **Interactive visualizations** - Generate treemaps using esbuild-visualizer
- ⚡ **Format-specific analysis** - Analyze CJS, ESM, and other formats separately
- 🚨 **Size warnings** - Get alerts for large bundles
- 🔧 **Configurable thresholds** - Customize warning and failure limits
- 🎯 **CI/CD integration** - Fail builds when bundles exceed limits

## Basic Usage

```typescript
import { defineConfig } from 'tsup';
import { analyzeConfig } from '@gfmio/config-tsup/partials';
import { merge } from '@gfmio/config-tsup/utils';
import { base, esm } from '@gfmio/config-tsup/partials';

export default defineConfig(
  merge(base, esm, analyzeConfig)
);
```

## Pre-configured Analyzers

The package provides several pre-configured analyzer variants:

### Default Analyzer

```typescript
import { analyzeConfig } from '@gfmio/config-tsup/partials';
```

- Shows detailed console output
- Generates visualizations if esbuild-visualizer is installed
- Warns on bundles > 512KB

### Minimal Analyzer

```typescript
import { minimalAnalyzeConfig } from '@gfmio/config-tsup/partials';
```

- Simplified console output
- No visualizations
- Ideal for quick checks

### Strict Analyzer

```typescript
import { strictAnalyzeConfig } from '@gfmio/config-tsup/partials';
```

- Fails build on large bundles (> 256KB)
- Requires esbuild-visualizer
- Maximum validation

### CI Analyzer

```typescript
import { ciAnalyzeConfig } from '@gfmio/config-tsup/partials';
```

- Optimized for CI/CD environments
- No visualizations
- Fails on bundles > 1MB
- Minimal console output

### Development Analyzer

```typescript
import { devAnalyzeConfig } from '@gfmio/config-tsup/partials';
```

- Full detailed output
- Interactive visualizations
- All features enabled

## Custom Configuration

Create a custom analyzer with specific options:

```typescript
import { analyzerWithOptions } from '@gfmio/config-tsup/bundleAnalyzer';
import { partial } from '@gfmio/config-tsup/utils';

const customAnalyzer = partial(analyzerWithOptions({
  // Visualization options
  visualizer: 'required',     // 'auto' | 'off' | 'required'
  template: 'sunburst',        // 'treemap' | 'sunburst' | 'network' | 'list'

  // Console output
  detailed: true,              // Show detailed file list

  // Thresholds
  warnThreshold: 256 * 1024,  // Warn at 256KB
  failOnLarge: true,           // Fail build on large bundles

  // Output location
  outputDir: 'dist/analysis',  // Custom output directory
}));
```

## Environment Variables

Control analyzer behavior via environment variables:

- `TSUP_VISUALIZER` - Set visualization mode ('auto', 'off', 'required')
- `DEBUG` - Show detailed error messages

Example:

```bash
TSUP_VISUALIZER=off npm run build  # Disable visualizations
DEBUG=true npm run build           # Show detailed errors
```

## Visualizations

To enable interactive bundle visualizations, install `esbuild-visualizer`:

```bash
npm i -D esbuild-visualizer
```

The analyzer will automatically generate HTML visualization files:

- `dist/bundle-analysis-cjs.html` - CommonJS bundle visualization
- `dist/bundle-analysis-esm.html` - ES Module bundle visualization

Open these files in a browser to explore your bundle composition interactively.

## Console Output

The analyzer provides detailed console output:

```
📊 Bundle Analysis Report
════════════════════════════════════════════════════════════

📦 CJS Format:
   Total size: 172.37 KB
   Files: 10
   ✅ dist/index.cjs             16.57 KB
   ✅ dist/utils.cjs              3.00 KB
   ⚡ dist/partials.cjs          14.68 KB

📦 ESM Format:
   Total size: 172.28 KB
   Files: 10
   ✅ dist/index.mjs             16.56 KB
   ✅ dist/utils.mjs              2.98 KB
   ⚡ dist/partials.mjs          14.67 KB

════════════════════════════════════════════════════════════
📈 Summary:
   Total output size: 344.65 KB
   Total files: 20
   Formats: CJS, ESM

✨ Bundle analysis complete!
```

## Size Indicators

- ✅ **Green check** - File is under warning threshold
- ⚡ **Lightning** - File exceeds warning threshold
- ⚠️ **Warning** - File exceeds 1MB

## Integration Examples

### With Library Preset

```typescript
import { defineConfig } from 'tsup';
import { neutralLibrary } from '@gfmio/config-tsup/presets';
import { analyzeConfig } from '@gfmio/config-tsup/partials';

export default defineConfig(
  neutralLibrary.map(config => ({
    ...config,
    ...analyzeConfig,
  }))
);
```

### With Multiple Entries

```typescript
import { defineConfig } from 'tsup';
import { merge } from '@gfmio/config-tsup/utils';
import { base, analyzeConfig } from '@gfmio/config-tsup/partials';

export default defineConfig(
  merge(
    base,
    {
      entry: {
        index: 'src/index.ts',
        cli: 'src/cli.ts',
      },
    },
    analyzeConfig
  )
);
```

## Troubleshooting

### Visualizations not generated

- Ensure `esbuild-visualizer` is installed: `npm i -D esbuild-visualizer`
- Check that metafiles are being generated (look for `metafile-*.json` in dist)
- Set `TSUP_VISUALIZER=required` to fail if visualizer is missing

### Analysis not appearing

- Verify that `metafile: true` is set in your config
- Check that the build completes successfully
- Enable debug mode: `DEBUG=true npm run build`

### Large bundle warnings

- Review the files listed in the warning
- Consider externalizing large dependencies
- Enable code splitting for ESM builds
- Use tree-shaking to remove unused code
