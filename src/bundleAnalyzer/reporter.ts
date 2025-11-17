/**
 * Console reporter for bundle analysis
 */

import type { AnalyzerOptions, BundleInfo, FormatStats } from './types.ts';

import { formatBytes, getSizeEmoji, getTotalSize, separator } from './utils.ts';

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
  printHeader(): void {
    console.log('\n📊 Bundle Analysis Report');
    console.log(separator('═', 60));
  }

  /**
   * Print stats for a specific format
   */
  printFormatStats(stats: FormatStats): void {
    const totalSizeStr = formatBytes(stats.totalSize);

    console.log(`\n📦 ${stats.format} Format:`);
    console.log(`   Total size: ${totalSizeStr}`);
    console.log(`   Files: ${stats.fileCount}`);

    if (this.options.detailed && stats.files.length > 0) {
      this.printFileList(stats.files);
    }
  }

  /**
   * Print detailed file list
   */
  private printFileList(files: BundleInfo[]): void {
    files.forEach((file) => {
      const emoji = getSizeEmoji(file.size, this.options.warnThreshold);
      const path = file.path.padEnd(35);
      const size = file.sizeFormatted.padStart(10);
      console.log(`   ${emoji} ${path} ${size}`);
    });
  }

  /**
   * Print warnings for large bundles
   */
  printWarnings(allFiles: BundleInfo[]): void {
    const threshold = this.options.warnThreshold || 512 * 1024;
    const largeFiles = allFiles.filter((f) => f.size > threshold * 2); // 2x threshold

    if (largeFiles.length > 0) {
      console.log(`\n⚠️  Warning: ${largeFiles.length} file(s) exceed size threshold`);
      largeFiles.forEach((file) => {
        console.log(`   ⚠️  ${file.path} (${file.sizeFormatted})`);
      });
    }
  }

  /**
   * Print summary statistics
   */
  printSummary(formats: FormatStats[]): void {
    const allFiles = formats.flatMap((f) => f.files);
    const totalSize = getTotalSize(allFiles);
    const fileCount = allFiles.length;
    const formatList = formats.map(f => f.format).join(', ');

    console.log(`\n${separator('═', 60)}`);
    console.log('📈 Summary:');
    console.log(`   Total output size: ${formatBytes(totalSize)}`);
    console.log(`   Total files: ${fileCount}`);
    console.log(`   Formats: ${formatList}`);
  }

  /**
   * Print visualization generation status
   */
  printVisualizationStatus(files: string[]): void {
    if (files.length > 0) {
      console.log('\n🎨 Visualizations generated:');
      files.forEach((file) => {
        console.log(`   ✅ ${file}`);
      });
    }
  }

  /**
   * Print completion message
   */
  printFooter(): void {
    console.log('\n✨ Bundle analysis complete!');
  }

  /**
   * Print error message
   */
  printError(message: string, error?: Error): void {
    console.error(`\n❌ Error: ${message}`);
    if (error && this.options.detailed) {
      console.error('   Details:', error.message);
      if (error.stack) {
        console.error('   Stack:', error.stack);
      }
    }
  }

  /**
   * Print info message
   */
  printInfo(message: string): void {
    console.log(`ℹ️  ${message}`);
  }
}
