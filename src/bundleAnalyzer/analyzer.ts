/**
 * Core bundle analyzer implementation
 */

import type { AnalyzerOptions, BundleInfo, FormatStats, Metafile, MetafileOutput } from './types.ts';

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

import { ConsoleReporter } from './reporter.ts';
import { extractFormat, formatBytes, getRelativePath, sortBySize } from './utils.ts';
import { Visualizer } from './visualizer.ts';

export class BundleAnalyzer {
  private readonly options: AnalyzerOptions;
  private readonly reporter: ConsoleReporter;
  private readonly visualizer: Visualizer;
  private readonly distDir: string;

  constructor(
    options: AnalyzerOptions = {},
    context?: {
      outDir?: string;
    },
  ) {
    this.options = {
      detailed: true,
      failOnLarge: false,
      template: 'treemap',
      visualizer: 'auto',
      warnThreshold: 512 * 1024, // 512 KB
      ...options,
    };

    // Use context outDir if available, otherwise fall back to options or default
    this.distDir = context?.outDir || this.options.outputDir || join(process.cwd(), 'dist');
    this.reporter = new ConsoleReporter(this.options);
    this.visualizer = new Visualizer(this.options);
  }

  /**
   * Analyze bundles from metafiles
   */
  async analyze(): Promise<void> {
    try {
      const metafiles = await this.findMetafiles();

      if (metafiles.length === 0) {
        this.reporter.printInfo('No metafiles found for bundle analysis');
        return;
      }

      // Process metafiles and collect stats
      const formatStats = await this.processMetafiles(metafiles);

      // Generate report
      this.generateReport(formatStats);

      // Generate visualizations if enabled
      await this.generateVisualizations(metafiles);

      // Check for violations if failOnLarge is enabled
      this.checkViolations(formatStats);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Find all metafiles in the dist directory
   */
  private async findMetafiles(): Promise<
    Array<{
      path: string;
      format: string;
    }>
  > {
    const files = await readdir(this.distDir);

    return files
      .filter((f) => f.startsWith('metafile-') && f.endsWith('.json'))
      .map((filename) => ({
        format: extractFormat(filename),
        path: join(this.distDir, filename),
      }));
  }

  /**
   * Process metafiles and extract statistics
   */
  private async processMetafiles(
    metafiles: Array<{
      path: string;
      format: string;
    }>,
  ): Promise<FormatStats[]> {
    const stats: FormatStats[] = [];

    for (const { path, format } of metafiles) {
      const content = await readFile(path, 'utf-8');
      const metafile: Metafile = JSON.parse(content);

      const files = this.extractBundleInfo(metafile);

      stats.push({
        fileCount: files.length,
        files: sortBySize(files),
        format,
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
      });
    }

    return stats;
  }

  /**
   * Extract bundle information from metafile
   */
  private extractBundleInfo(metafile: Metafile): BundleInfo[] {
    const outputs = Object.entries(metafile.outputs || {});

    return outputs.map(
      ([path, info]: [
        string,
        MetafileOutput,
      ]) => ({
        path: getRelativePath(path),
        size: info.bytes,
        sizeFormatted: formatBytes(info.bytes),
      }),
    );
  }

  /**
   * Generate console report
   */
  private generateReport(formatStats: FormatStats[]): void {
    this.reporter.printHeader();

    // Print stats for each format
    formatStats.forEach((stats) => {
      this.reporter.printFormatStats(stats);
    });

    // Print summary
    this.reporter.printSummary(formatStats);

    // Print warnings
    const allFiles = formatStats.flatMap((s) => s.files);
    this.reporter.printWarnings(allFiles);
  }

  /**
   * Generate visualizations
   */
  private async generateVisualizations(
    metafiles: Array<{
      path: string;
      format: string;
    }>,
  ): Promise<void> {
    if (!this.visualizer.shouldGenerate()) {
      return;
    }

    const generatedFiles = await this.visualizer.generateAll(metafiles);

    if (generatedFiles.length > 0) {
      this.reporter.printVisualizationStatus(generatedFiles);
    } else if (this.options.visualizer === 'auto') {
      this.reporter.printInfo(
        'Install esbuild-visualizer for interactive bundle visualizations:\n   npm i -D esbuild-visualizer',
      );
    }

    this.reporter.printFooter();
  }

  /**
   * Check for size violations
   */
  private checkViolations(formatStats: FormatStats[]): void {
    if (!this.options.failOnLarge) {
      return;
    }

    const threshold = this.options.warnThreshold || 512 * 1024;
    const violations = formatStats.flatMap((s) => s.files).filter((f) => f.size > threshold * 2);

    if (violations.length > 0) {
      const message = `Build failed: ${violations.length} file(s) exceed size limit of ${formatBytes(threshold * 2)}`;
      throw new Error(message);
    }
  }

  /**
   * Handle errors based on configuration
   */
  private handleError(error: Error): void {
    const isDebug = process.env['DEBUG'] === 'true';

    if (this.options.visualizer === 'required' || this.options.failOnLarge) {
      throw error;
    }

    if (isDebug) {
      this.reporter.printError('Bundle analysis failed', error);
    }
  }
}
