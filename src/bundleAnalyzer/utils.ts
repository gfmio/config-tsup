/**
 * Utility functions for bundle analysis
 */

import type { BundleInfo } from './types.ts';

import process from 'node:process';

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return '0 B';
  }

  const sizes = [
    'B',
    'KB',
    'MB',
    'GB',
  ];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / 1024 ** i;

  return `${value.toFixed(2)} ${sizes[i]}`;
}

/**
 * Get size emoji based on file size
 */
export function getSizeEmoji(bytes: number, warnThreshold: number = 512 * 1024): string {
  if (bytes > 1024 * 1024) {
    return '⚠️'; // > 1MB
  }
  if (bytes > warnThreshold) {
    return '⚡'; // > warning threshold
  }
  return '✅'; // OK
}

/**
 * Create a separator line
 */
export function separator(char: string = '═', length: number = 60): string {
  return char.repeat(length);
}

/**
 * Sort bundles by size (largest first)
 */
export function sortBySize(bundles: BundleInfo[]): BundleInfo[] {
  return [
    ...bundles,
  ].sort((a, b) => b.size - a.size);
}

/**
 * Calculate total size of bundles
 */
export function getTotalSize(bundles: BundleInfo[]): number {
  return bundles.reduce((sum, bundle) => sum + bundle.size, 0);
}

/**
 * Get relative path from CWD
 */
export function getRelativePath(fullPath: string): string {
  const cwd = process.cwd();
  return fullPath.startsWith(cwd) ? fullPath.replace(`${cwd}/`, '') : fullPath;
}

/**
 * Extract format from metafile name
 */
export function extractFormat(filename: string): string {
  return filename.replace('metafile-', '').replace('.json', '').toUpperCase() || 'UNKNOWN';
}
