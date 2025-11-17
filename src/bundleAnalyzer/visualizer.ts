/**
 * Visualization generator using esbuild-visualizer
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import type { AnalyzerOptions } from './types';

const execAsync = promisify(exec);

export class Visualizer {
  private options: AnalyzerOptions;
  private outputDir: string;

  constructor(options: AnalyzerOptions = {}) {
    this.options = {
      visualizer: 'auto',
      template: 'treemap',
      ...options,
    };
    this.outputDir = options.outputDir || join(process.cwd(), 'dist');
  }

  /**
   * Check if visualization should be generated
   */
  shouldGenerate(): boolean {
    return this.options.visualizer !== 'off';
  }

  /**
   * Generate visualization for a metafile
   */
  async generate(metafilePath: string, format: string): Promise<string | null> {
    if (!this.shouldGenerate()) {
      return null;
    }

    const outputName = `bundle-analysis-${format.toLowerCase()}.html`;
    const outputPath = join(this.outputDir, outputName);

    try {
      // Build the command with proper escaping
      const command = this.buildCommand(metafilePath, outputPath);

      // Execute the visualization command
      await execAsync(command, { cwd: process.cwd() });

      return outputName;
    } catch (error) {
      if (this.options.visualizer === 'required') {
        throw new Error(`Failed to generate visualization for ${format}: ${error}`);
      }

      // Silent failure in auto mode
      return null;
    }
  }

  /**
   * Generate visualizations for multiple metafiles
   */
  async generateAll(metafiles: Array<{ path: string; format: string }>): Promise<string[]> {
    if (!this.shouldGenerate()) {
      return [];
    }

    const results = await Promise.allSettled(
      metafiles.map(({ path, format }) => this.generate(path, format))
    );

    return results
      .filter((r): r is PromiseFulfilledResult<string | null> =>
        r.status === 'fulfilled' && r.value !== null
      )
      .map(r => r.value as string);
  }

  /**
   * Build the esbuild-visualizer command
   */
  private buildCommand(metafilePath: string, outputPath: string): string {
    const template = this.options.template || 'treemap';

    // Using proper escaping for paths that might contain spaces
    return [
      'esbuild-visualizer',
      '--metadata', `"${metafilePath}"`,
      '--filename', `"${outputPath}"`,
      '--template', template,
    ].join(' ');
  }

  /**
   * Check if esbuild-visualizer is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await execAsync('esbuild-visualizer --version', { cwd: process.cwd() });
      return true;
    } catch {
      return false;
    }
  }
}