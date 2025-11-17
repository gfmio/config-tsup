/**
 * Factory functions for common configuration patterns
 */

import type { Options } from 'tsup';
import { getBuildMode, isCI, isWatchMode } from './env';
import { merge } from './merge';
import { config } from './config';

/**
 * Create environment-aware configuration
 * Automatically selects development or production settings
 */
export function createEnvConfig(
  developmentConfig: Partial<Options>,
  productionConfig: Partial<Options>
): Options {
  const mode = getBuildMode();
  return config(mode === 'development' ? developmentConfig : productionConfig) as Options;
}

/**
 * Create configuration with environment-based overrides
 */
export function createAdaptiveConfig(
  baseConfig: Partial<Options>,
  overrides?: {
    development?: Partial<Options>;
    production?: Partial<Options>;
    ci?: Partial<Options>;
    watch?: Partial<Options>;
  }
): Options {
  let result = { ...baseConfig };

  // Apply environment overrides
  const mode = getBuildMode();
  if (mode === 'development' && overrides?.development) {
    result = merge(result, overrides.development);
  }
  if (mode === 'production' && overrides?.production) {
    result = merge(result, overrides.production);
  }

  // Apply CI overrides
  if (isCI() && overrides?.ci) {
    result = merge(result, overrides.ci);
  }

  // Apply watch mode overrides
  if (isWatchMode() && overrides?.watch) {
    result = merge(result, overrides.watch);
  }

  return config(result) as Options;
}