/**
 * Console reporter for bundle analysis
 */

import type { BundleInfo, FormatStats, AnalyzerOptions } from './types';
import { formatBytes, getSizeEmoji, separator, getTotalSize } from './utils';

export class ConsoleReporter {
  private options: AnalyzerOptions;

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
    console.log(separator());
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
    files.forEach(file => {
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
    const largeFiles = allFiles.filter(f => f.size > threshold * 2); // 2x threshold

    if (largeFiles.length > 0) {
      console.log(`\n⚠️  Warning: The following files exceed ${formatBytes(threshold * 2)}:`);
      largeFiles.forEach(file => {
        console.log(`   - ${file.path} (${file.sizeFormatted})`);
      });
      console.log('   Consider code splitting or externalizing large dependencies.');
    }
  }

  /**
   * Print summary statistics
   */
  printSummary(formats: FormatStats[]): void {
    const allFiles = formats.flatMap(f => f.files);
    const totalSize = getTotalSize(allFiles);
    const fileCount = allFiles.length;

    console.log('\n' + separator());
    console.log(`📈 Summary:`);
    console.log(`   Total output size: ${formatBytes(totalSize)}`);
    console.log(`   Total files: ${fileCount}`);
    console.log(`   Formats: ${formats.map(f => f.format).join(', ')}`);
  }

  /**
   * Print visualization generation status
   */
  printVisualizationStatus(files: string[]): void {
    if (files.length > 0) {
      console.log('\n🎨 Generated interactive bundle visualizations:');
      files.forEach(file => {
        console.log(`   ✅ ${file}`);
      });
      console.log('\n💡 Tip: Open the HTML files in your browser to explore the interactive bundle visualization');
    }
  }

  /**
   * Print completion message
   */
  printFooter(): void {
    console.log('\n✨ Bundle analysis complete!\n');
  }

  /**
   * Print error message
   */
  printError(message: string, error?: Error): void {
    console.error(`\n❌ ${message}`);
    if (error && this.options.detailed) {
      console.error('   Details:', error.message);
    }
  }

  /**
   * Print info message
   */
  printInfo(message: string): void {
    console.log(`\n💡 ${message}`);
  }
}