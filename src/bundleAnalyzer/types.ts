/**
 * Bundle analyzer types and interfaces
 */

export interface BundleInfo {
  path: string;
  size: number;
  sizeFormatted: string;
  format?: string;
}

export interface MetafileOutput {
  bytes: number;
  inputs?: Record<string, unknown>;
  imports?: Array<{ path: string; kind: string }>;
  exports?: string[];
}

export interface Metafile {
  inputs?: Record<string, unknown>;
  outputs: Record<string, MetafileOutput>;
}

export interface AnalyzerOptions {
  /**
   * Whether to generate visualizations
   * - 'auto': Generate if esbuild-visualizer is available (default)
   * - 'off': Skip visualization generation
   * - 'required': Fail if esbuild-visualizer is not available
   */
  visualizer?: 'auto' | 'off' | 'required';

  /**
   * Visualization template type
   */
  template?: 'treemap' | 'sunburst' | 'network' | 'list' | 'raw-data';

  /**
   * Whether to show detailed console output
   */
  detailed?: boolean;

  /**
   * Custom output directory for visualization files
   */
  outputDir?: string;

  /**
   * Size threshold for warnings (in bytes)
   */
  warnThreshold?: number;

  /**
   * Whether to fail the build on large bundles
   */
  failOnLarge?: boolean;
}

export interface FormatStats {
  format: string;
  totalSize: number;
  fileCount: number;
  files: BundleInfo[];
}