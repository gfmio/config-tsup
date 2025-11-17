/**
 * Bundle analyzer for tsup configurations
 *
 * Provides comprehensive bundle analysis with size reporting and optional visualizations
 */

import { BundleAnalyzer } from './analyzer';
import type { AnalyzerOptions } from './types';

// Export types
export type { AnalyzerOptions, BundleInfo, FormatStats, Metafile } from './types';

// Export utilities if needed externally
export { formatBytes, getSizeEmoji } from './utils';

/**
 * Create the onSuccess handler for tsup configuration
 * Note: tsup's onSuccess actually receives the build result but types don't reflect this
 */
export function createBundleAnalyzer(options: AnalyzerOptions = {}): any {
  return async function onSuccess(this: any): Promise<void> {
    // Try to get outDir from the context (this refers to tsup build context)
    const context = { outDir: this?.options?.outDir };
    const analyzer = new BundleAnalyzer(options, context);
    await analyzer.analyze();
  };
}

/**
 * Default onSuccess handler that auto-detects output directory
 */
export const onSuccess: any = async function(this: any): Promise<void> {
  // Try to get outDir from the context (this refers to tsup build context)
  const context = { outDir: this?.options?.outDir };
  const analyzer = new BundleAnalyzer({
    visualizer: 'auto',
    template: 'treemap',
    detailed: true,
    warnThreshold: 512 * 1024, // 512 KB
    failOnLarge: false,
  }, context);
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
  visualizer: 'required',
  failOnLarge: true,
  warnThreshold: 256 * 1024, // 256 KB
});

// CI-friendly analyzer
export const ciAnalyzer = analyzerWithOptions({
  detailed: false,
  visualizer: 'off',
  failOnLarge: true,
  warnThreshold: 1024 * 1024, // 1 MB
});

// Development analyzer with all features
export const devAnalyzer = analyzerWithOptions({
  detailed: true,
  visualizer: 'auto',
  template: 'treemap',
});
