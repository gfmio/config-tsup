/**
 * Configuration validation using Zod
 *
 * Provides runtime validation for tsup configurations with incompatibility checking
 */

import type { Options } from 'tsup';
import { z } from 'zod';

/**
 * Zod schema for tsup configuration
 */
const createTsupSchema = () => {
  if (!z) return null;

  const FormatSchema = z.enum(['cjs', 'esm', 'iife']);

  const PlatformSchema = z.enum(['node', 'browser', 'neutral']);

  const EntrySchema = z.union([
    z.string(),
    z.array(z.string()),
    z.record(z.string()),
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
      entry: z.union([z.string(), z.array(z.string()), z.record(z.string())]).optional(),
      resolve: z.boolean().optional(),
      only: z.boolean().optional(),
    }),
  ]);

  const BannerSchema = z.object({
    js: z.string().optional(),
    css: z.string().optional(),
  });

  const TsupOptionsSchema = z.object({
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
    env: z.record(z.string()).optional(),
    define: z.record(z.string()).optional(),
    pure: z.array(z.string()).optional(),

    // Other options
    globalName: z.string().optional(),
    footer: BannerSchema.optional(),
    banner: BannerSchema.optional(),
    loader: z.record(z.string()).optional(),
    ignoreWatch: z.array(z.string()).optional(),
    publicPath: z.string().optional(),
    plugins: z.array(z.any()).optional(),
  });

  return TsupOptionsSchema;
};

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
}

/**
 * Validate a tsup configuration
 */
export function validateConfig(config: unknown): ValidationResult {
  if (!z) {
    // Zod not installed - skip validation
    return {
      success: true,
      data: config as Options,
    };
  }

  const schema = createTsupSchema();
  if (!schema) {
    return {
      success: true,
      data: config as Options,
    };
  }

  try {
    const result = schema.parse(config);
    return {
      success: true,
      data: result as Options,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{
        path: '',
        message: error.message || 'Unknown validation error',
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

  return result.data!;
}

/**
 * Wrap a configuration with validation
 */
export function withValidation<T extends Partial<Options>>(config: T): T {
  if (process.env.NODE_ENV === 'production' && process.env.SKIP_VALIDATION !== 'false') {
    // Skip validation in production for performance
    return config;
  }

  const result = validateConfig(config);

  if (!result.success && process.env.STRICT_VALIDATION === 'true') {
    const errorMessage = result.errors
      ?.map(err => `  - ${err.path}: ${err.message}`)
      .join('\n');
    throw new Error(`Invalid tsup configuration:\n${errorMessage}`);
  }

  if (!result.success) {
    // Log warnings but don't throw
    console.warn('⚠️  Configuration validation warnings:');
    result.errors?.forEach(err => {
      console.warn(`  - ${err.path}: ${err.message}`);
    });
  }

  return config;
}

/**
 * Check if Zod is available for validation
 */
export function isValidationAvailable(): boolean {
  return !!z;
}

/**
 * Install instruction for Zod
 */
export function getValidationInstallCommand(): string {
  return 'npm install --save-dev zod';
}