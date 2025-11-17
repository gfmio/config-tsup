/**
 * Configuration validation using Zod
 *
 * Provides runtime validation for tsup configurations with incompatibility checking
 */

import type { Options } from 'tsup';
import { z } from 'zod';

/**
 * Custom Zod schemas for tsup-specific types
 */
const FormatSchema = z.enum(['cjs', 'esm', 'iife']);
const PlatformSchema = z.enum(['node', 'browser', 'neutral']);

const EntrySchema = z.union([
  z.string(),
  z.array(z.string()),
  z.record(z.string(), z.string()),
]);

const SourcemapSchema = z.union([
  z.boolean(),
  z.literal('inline'),
  z.literal('external'),
  z.literal('hidden'),
]);

const DtsSchema = z.union([
  z.boolean(),
  z.object({
    entry: z.union([z.string(), z.array(z.string()), z.record(z.string(), z.string())]).optional(),
    resolve: z.boolean().optional(),
    only: z.boolean().optional(),
  }),
]);

const BannerSchema = z.object({
  js: z.string().optional(),
  css: z.string().optional(),
});

/**
 * Main tsup configuration schema with refinements for incompatible options
 */
export const TsupOptionsSchema = z.object({
  // Entry points
  entry: EntrySchema.optional(),

  // Output options
  format: z.array(FormatSchema).optional(),
  outDir: z.string().optional(),
  outExtension: z.function().optional(),

  // Platform and target
  platform: PlatformSchema.optional(),
  target: z.union([z.string(), z.array(z.string())]).optional(),

  // Bundling options
  bundle: z.boolean().optional(),
  splitting: z.boolean().optional(),
  treeshake: z.union([
    z.boolean(),
    z.object({
      preset: z.enum(['smallest', 'safest', 'recommended']).optional(),
      moduleSideEffects: z.union([z.boolean(), z.string(), z.array(z.string())]).optional(),
    }),
  ]).optional(),

  // Minification
  minify: z.union([z.boolean(), z.literal('terser')]).optional(),
  minifyWhitespace: z.boolean().optional(),
  minifyIdentifiers: z.boolean().optional(),
  minifySyntax: z.boolean().optional(),
  keepNames: z.boolean().optional(),

  // TypeScript
  dts: DtsSchema.optional(),
  experimentalDts: z.boolean().optional(),
  tsconfig: z.string().optional(),

  // Source maps
  sourcemap: SourcemapSchema.optional(),

  // Dependencies
  external: z.array(z.union([z.string(), z.instanceof(RegExp)])).optional(),
  noExternal: z.array(z.union([z.string(), z.instanceof(RegExp)])).optional(),
  skipNodeModulesBundle: z.boolean().optional(),

  // Node.js specific
  shims: z.boolean().optional(),
  cjsInterop: z.boolean().optional(),

  // Build options
  clean: z.boolean().optional(),
  watch: z.union([z.boolean(), z.string(), z.array(z.string())]).optional(),
  silent: z.boolean().optional(),
  logLevel: z.enum(['info', 'warn', 'error']).optional(),

  // Metadata
  metafile: z.boolean().optional(),

  // Hooks
  onSuccess: z.union([z.string(), z.function()]).optional(),

  // esbuild options
  esbuildOptions: z.function().optional(),
  esbuildPlugins: z.array(z.any()).optional(),

  // Environment
  env: z.record(z.string(), z.string()).optional(),
  define: z.record(z.string(), z.string()).optional(),
  pure: z.array(z.string()).optional(),

  // Other options
  globalName: z.string().optional(),
  footer: BannerSchema.optional(),
  banner: BannerSchema.optional(),
  loader: z.record(z.string(), z.string()).optional(),
  ignoreWatch: z.array(z.string()).optional(),
  publicPath: z.string().optional(),
  plugins: z.array(z.any()).optional(),
}).superRefine((config, ctx) => {
  // Check for incompatible format combinations
  if (config.format) {
    // IIFE cannot be combined with code splitting
    if (config.format.includes('iife') && config.splitting) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Code splitting is not supported with IIFE format',
        path: ['splitting'],
      });
    }

    // CJS doesn't support code splitting
    if (config.format.includes('cjs') && !config.format.includes('esm') && config.splitting) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Code splitting requires ESM format',
        path: ['splitting'],
      });
    }
  }

  // DTS-only mode incompatibilities
  if (config.dts && typeof config.dts === 'object' && config.dts.only) {
    if (config.minify) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Minification is not applicable in dts-only mode',
        path: ['minify'],
      });
    }

    if (config.splitting) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Code splitting is not applicable in dts-only mode',
        path: ['splitting'],
      });
    }

    if (config.bundle !== false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bundling should be disabled in dts-only mode',
        path: ['bundle'],
      });
    }
  }

  // Platform-specific incompatibilities
  if (config.platform === 'browser') {
    if (config.shims) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Node.js shims are not applicable for browser platform',
        path: ['shims'],
      });
    }
  }

  // Target validation warnings are handled in getConfigWarnings function

  // External and noExternal conflict
  if (config.external && config.noExternal) {
    // Check for conflicts
    const externalStrings = config.external.filter(e => typeof e === 'string');
    const noExternalStrings = config.noExternal.filter(e => typeof e === 'string');

    const conflicts = externalStrings.filter(e => noExternalStrings.includes(e as string));
    if (conflicts.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Packages cannot be both external and not external: ${conflicts.join(', ')}`,
        path: ['external'],
      });
    }
  }

  // Minification sub-options without main minify flag
  if (!config.minify) {
    if (config.minifyWhitespace || config.minifyIdentifiers || config.minifySyntax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Minification sub-options require minify to be enabled',
        path: ['minify'],
      });
    }
  }

  // Global name only makes sense with IIFE
  if (config.globalName && (!config.format || !config.format.includes('iife'))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'globalName is only applicable when using IIFE format',
      path: ['globalName'],
    });
  }

  // Watch mode with onSuccess string requires actual command
  if (config.watch && config.onSuccess && typeof config.onSuccess === 'string') {
    if (config.onSuccess.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'onSuccess command cannot be empty',
        path: ['onSuccess'],
      });
    }
  }
});

/**
 * Validation result type
 */
export interface ValidationResult {
  success: boolean;
  data?: Options;
  errors?: Array<{
    path: string;
    message: string;
  }>;
  warnings?: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * Check for configuration warnings that don't fail validation
 */
function getConfigWarnings(config: any): Array<{ path: string; message: string }> {
  const warnings: Array<{ path: string; message: string }> = [];

  // Check for ES target with Node platform
  if (config.platform === 'node' && config.target) {
    const nodeTargets = ['node14', 'node16', 'node18', 'node20'];
    const targetStr = Array.isArray(config.target) ? config.target[0] : config.target;

    if (targetStr && targetStr.startsWith('es') && !nodeTargets.includes(targetStr)) {
      warnings.push({
        path: 'target',
        message: `Consider using a Node.js-specific target (e.g., 'node18') instead of '${targetStr}' for Node.js platform`,
      });
    }
  }

  return warnings;
}

/**
 * Validate a tsup configuration
 */
export function validateConfig(config: unknown): ValidationResult {
  try {
    const result = TsupOptionsSchema.parse(config);
    const warnings = getConfigWarnings(config);

    const validResult: ValidationResult = {
      success: true,
      data: result as Options,
    };
    if (warnings.length > 0) {
      validResult.warnings = warnings;
    }
    return validResult;
  } catch (error: any) {
    if (error && error.errors && Array.isArray(error.errors)) {
      // Zod error - all issues are errors in strict mode
      const errors = error.errors.map((err: any) => ({
        path: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
        message: err.message,
      }));

      // Also check for warnings
      const warnings = getConfigWarnings(config);

      const errorResult: ValidationResult = {
        success: false,
        errors,
      };
      if (warnings.length > 0) {
        errorResult.warnings = warnings;
      }
      return errorResult;
    }
    return {
      success: false,
      errors: [{
        path: '',
        message: error?.message || 'Unknown validation error',
      }],
    };
  }
}

/**
 * Create a validated config (throws on validation error)
 */
export function createValidatedConfig(config: Partial<Options>): Options {
  const result = validateConfig(config);

  if (!result.success) {
    const errorMessage = result.errors
      ?.map(err => `  - ${err.path}: ${err.message}`)
      .join('\n');
    throw new Error(`Invalid tsup configuration:\n${errorMessage}`);
  }

  // Log warnings if any
  if (result.warnings && result.warnings.length > 0) {
    console.warn('⚠️  Configuration warnings:');
    result.warnings.forEach(warn => {
      console.warn(`  - ${warn.path}: ${warn.message}`);
    });
  }

  return result.data!;
}

/**
 * Wrap a configuration with validation
 */
export function withValidation<T extends Partial<Options>>(config: T): T {
  if (process.env.NODE_ENV === 'production' && process.env['VALIDATE_CONFIG'] !== 'true') {
    // Skip validation in production unless explicitly requested
    return config;
  }

  const result = validateConfig(config);

  if (!result.success && result.errors) {
    const errorMessage = result.errors
      .map(err => `  - ${err.path}: ${err.message}`)
      .join('\n');
    throw new Error(`Invalid tsup configuration:\n${errorMessage}`);
  }

  if (result.warnings && result.warnings.length > 0) {
    console.warn('⚠️  Configuration warnings:');
    result.warnings.forEach(warn => {
      console.warn(`  - ${warn.path}: ${warn.message}`);
    });
  }

  return config;
}

/**
 * Check specific incompatibilities
 */
export function checkIncompatibilities(config: Partial<Options>): string[] {
  const issues: string[] = [];

  // Check format-specific incompatibilities
  if (config.format?.includes('iife') && config.splitting) {
    issues.push('IIFE format does not support code splitting');
  }

  if (config.platform === 'browser' && config.shims) {
    issues.push('Node.js shims should not be used with browser platform');
  }

  // Check for DTS-only mode issues
  const dtsOnly = config.dts && typeof config.dts === 'object' && config.dts.only;

  if (dtsOnly) {
    if (config.minify) issues.push('Minification not needed in dts-only mode');
    if (config.splitting) issues.push('Code splitting not applicable in dts-only mode');
  }

  return issues;
}
