/**
 * Environment detection utilities
 */

/**
 * Check if running in development mode
 * Checks NODE_ENV and common development indicators
 */
import process from 'node:process';
export function isDevelopment(): boolean {
  return (
    process.env['NODE_ENV'] === 'development'
    || process.env['NODE_ENV'] === 'dev'
    || (!process.env['NODE_ENV'] && process.env['npm_lifecycle_event'] === 'dev')
  );
}

/**
 * Check if running in production mode
 * Default to production if not explicitly development
 */
export function isProduction(): boolean {
  return !isDevelopment();
}

/**
 * Get build mode with override support
 * Priority: Multiple common patterns checked in order
 * 1. TSUP_ENV (tsup-specific)
 * 2. BUILD_ENV (generic build override)
 * 3. MODE (Vite convention)
 * 4. NODE_ENV (standard)
 * 5. npm lifecycle event
 * 6. default to production
 */
export function getBuildMode(): 'development' | 'production' {
  // Check various common override patterns
  const envVars = [
    process.env['TSUP_ENV'], // tsup-specific (most specific)
    process.env['BUILD_ENV'], // generic build environment
    process.env['MODE'], // Vite convention
    process.env['NODE_ENV'], // Node.js standard
  ];

  for (const value of envVars) {
    if (value === 'development' || value === 'dev') {
      return 'development';
    }
    if (value === 'production' || value === 'prod') {
      return 'production';
    }
  }

  // Check npm lifecycle event
  if (process.env['npm_lifecycle_event'] === 'dev' || process.env['npm_lifecycle_event'] === 'develop') {
    return 'development';
  }

  // Default to production (safer)
  return 'production';
}

/**
 * Check if running in CI environment
 */
export function isCI(): boolean {
  return !!(
    process.env['CI']
    || process.env['CONTINUOUS_INTEGRATION']
    || process.env['GITHUB_ACTIONS']
    || process.env['GITLAB_CI']
    || process.env['CIRCLECI']
    || process.env['TRAVIS']
    || process.env['JENKINS_URL']
  );
}

/**
 * Check if running in watch mode
 */
export function isWatchMode(): boolean {
  return !!(process.env['WATCH'] || process.argv.includes('--watch') || process.argv.includes('-w'));
}
