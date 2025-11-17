/**
 * Bundle analyzer for tsup configurations
 *
 * Provides comprehensive bundle analysis with size reporting and optional visualizations
 */

import type { AnalyzerOptions } from './types.ts';

import { BundleAnalyzer } from './analyzer.ts';

// Export types
export type { AnalyzerOptions, BundleInfo, FormatStats, Metafile } from './types.ts';

// Export utilities if needed externally
export { formatBytes, getSizeEmoji } from './utils.ts';

/**
 * Create the onSuccess handler for tsup configuration
 * Note: tsup's onSuccess actually receives the build result but types don't reflect this
 */
export function createBundleAnalyzer(options: AnalyzerOptions = {}): any {
  return async function onSuccess(this: any): Promise<void> {
    // Try to get outDir from the context (this refers to tsup build context)
    const context = {
      outDir: this?.options?.outDir,
    };
    const analyzer = new BundleAnalyzer(options, context);
    await analyzer.analyze();
  };
}

/**
 * Default onSuccess handler that auto-detects output directory
 */
export const onSuccess: any = async function (this: any): Promise<void> {
  // Try to get outDir from the context (this refers to tsup build context)
  const context = {
    outDir: this?.options?.outDir,
  };
  const analyzer = new BundleAnalyzer(
    {
      detailed: true,
      failOnLarge: false,
      template: 'treemap',
      visualizer: 'auto',
      warnThreshold: 512 * 1024, // 512 KB
    },
    context,
  );
  await analyzer.analyze();
};

/**
 * Factory function for custom configurations
 */
export function analyzerWithOptions(options: AnalyzerOptions = {}) {
  return {
    metafile: true,
    onSuccess: createBundleAnalyzer(options),
  };
}

/**
 * Pre-configured analyzer variants
 */

// Minimal output, no visualizations
export const minimalAnalyzer = analyzerWithOptions({
  detailed: false,
  visualizer: 'off',
});

// Strict analyzer that fails on large bundles
export const strictAnalyzer = analyzerWithOptions({
  detailed: true,
  failOnLarge: true,
  visualizer: 'required',
  warnThreshold: 256 * 1024, // 256 KB
});

// CI-friendly analyzer
export const ciAnalyzer = analyzerWithOptions({
  detailed: false,
  failOnLarge: true,
  visualizer: 'off',
  warnThreshold: 1024 * 1024, // 1 MB
});

// Development analyzer with all features
export const devAnalyzer = analyzerWithOptions({
  detailed: true,
  template: 'treemap',
  visualizer: 'auto',
});
