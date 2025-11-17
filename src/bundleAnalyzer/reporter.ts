/**
 * Console reporter for bundle analysis
 */

import type { AnalyzerOptions, BundleInfo, FormatStats } from './types.ts';

import { formatBytes, getSizeEmoji, getTotalSize } from './utils.ts';

export class ConsoleReporter {
  private readonly options: AnalyzerOptions;

  constructor(options: AnalyzerOptions = {}) {
    this.options = {
      detailed: true,
      warnThreshold: 512 * 1024, // 512 KB
      ...options,
    };
  }

  /**
   * Print the main report header
   */
  printHeader(): void {}

  /**
   * Print stats for a specific format
   */
  printFormatStats(stats: FormatStats): void {
    const _totalSizeStr = formatBytes(stats.totalSize);

    if (this.options.detailed && stats.files.length > 0) {
      this.printFileList(stats.files);
    }
  }

  /**
   * Print detailed file list
   */
  private printFileList(files: BundleInfo[]): void {
    files.forEach((file) => {
      const _emoji = getSizeEmoji(file.size, this.options.warnThreshold);
      const _path = file.path.padEnd(35);
      const _size = file.sizeFormatted.padStart(10);
    });
  }

  /**
   * Print warnings for large bundles
   */
  printWarnings(allFiles: BundleInfo[]): void {
    const threshold = this.options.warnThreshold || 512 * 1024;
    const largeFiles = allFiles.filter((f) => f.size > threshold * 2); // 2x threshold

    if (largeFiles.length > 0) {
      largeFiles.forEach((_file) => {});
    }
  }

  /**
   * Print summary statistics
   */
  printSummary(formats: FormatStats[]): void {
    const allFiles = formats.flatMap((f) => f.files);
    const _totalSize = getTotalSize(allFiles);
    const _fileCount = allFiles.length;
  }

  /**
   * Print visualization generation status
   */
  printVisualizationStatus(files: string[]): void {
    if (files.length > 0) {
      files.forEach((_file) => {});
    }
  }

  /**
   * Print completion message
   */
  printFooter(): void {}

  /**
   * Print error message
   */
  printError(_message: string, error?: Error): void {
    if (error && this.options.detailed) {
    }
  }

  /**
   * Print info message
   */
  printInfo(_message: string): void {}
}
