/**
 * Fluent configuration builder for tsup
 *
 * Provides a chainable API for building tsup configurations with full type safety
 */

import type { Options } from 'tsup';

import {
  ALL_EXTERNALS,
  DIST,
  ES2022,
  NODE_LTS,
  NODE_SHEBANG,
  BUN_SHEBANG,
  USE_STRICT
} from './constants.ts';
import { config } from './utils/config.ts';
import { merge } from './utils/merge.ts';

export class TsupConfigBuilder {
  private config: Partial<Options> = {
    clean: true,
    outDir: DIST,
    sourcemap: true,
    target: ES2022,
    treeshake: true,
  };

  /**
   * Set output format(s)
   */
  format(format: 'cjs' | 'esm' | 'iife' | Array<'cjs' | 'esm' | 'iife'>): this {
    this.config.format = Array.isArray(format) ? format : [format];

    // Auto-apply CJS interop for CJS format
    if (this.config.format.includes('cjs')) {
      this.config.cjsInterop = true;
    }

    return this;
  }

  /**
   * Shorthand for common format combinations
   */
  dualFormat(): this {
    return this.format(['cjs', 'esm']);
  }

  /**
   * Add TypeScript declarations
   */
  withTypes(enabled = true): this {
    this.config.dts = enabled;
    return this;
  }

  /**
   * Set platform target
   */
  platform(platform: 'node' | 'browser' | 'neutral'): this {
    this.config.platform = platform;

    // Apply platform-specific defaults
    if (platform === 'node') {
      this.config.target = NODE_LTS;
    } else if (platform === 'browser') {
      this.config.target = ES2022;
      this.config.shims = false;
    }

    return this;
  }

  /**
   * Set entry point(s)
   */
  entry(entry: string | string[] | Record<string, string>): this {
    if (typeof entry === 'string') {
      this.config.entry = [entry];
    } else {
      this.config.entry = entry;
    }
    return this;
  }

  /**
   * Configure for library (externalizes dependencies)
   */
  asLibrary(): this {
    this.config.external = ALL_EXTERNALS;
    this.config.skipNodeModulesBundle = true;
    this.config.minify = false; // Let consumers decide
    return this;
  }

  /**
   * Configure for CLI tool
   */
  asCli(runtime: 'node' | 'bun' = 'node'): this {
    const shebang = runtime === 'bun' ? BUN_SHEBANG : NODE_SHEBANG;

    this.config.format = ['esm'];
    this.config.dts = false;
    this.config.minify = true;
    this.config.keepNames = true;
    this.config.shims = true;
    this.config.platform = runtime === 'bun' ? 'neutral' : 'node';

    // Add shebang
    this.config.esbuildOptions = (options) => {
      options.banner = {
        js: shebang + (this.config.format?.includes('cjs') ? USE_STRICT : ''),
      };
      return options;
    };

    return this;
  }

  /**
   * Configure for standalone executable (bundles all dependencies)
   */
  asStandalone(): this {
    this.config.external = [];
    this.config.skipNodeModulesBundle = false;
    this.config.minify = true;
    return this;
  }

  /**
   * Configure for browser bundle
   */
  asBrowserBundle(): this {
    this.config.platform = 'browser';
    this.config.format = ['esm'];
    this.config.minify = true;
    this.config.sourcemap = 'external' as any;
    this.config.splitting = true;
    this.config.shims = false;
    return this;
  }

  /**
   * Enable/disable minification with options
   */
  minify(options?: boolean | {
    whitespace?: boolean;
    identifiers?: boolean;
    syntax?: boolean;
    keepNames?: boolean;
  }): this {
    if (typeof options === 'boolean') {
      this.config.minify = options;
    } else if (options) {
      this.config.minify = true;
      if (options.whitespace !== undefined) this.config.minifyWhitespace = options.whitespace;
      if (options.identifiers !== undefined) this.config.minifyIdentifiers = options.identifiers;
      if (options.syntax !== undefined) this.config.minifySyntax = options.syntax;
      if (options.keepNames !== undefined) this.config.keepNames = options.keepNames;
    }
    return this;
  }

  /**
   * Configure source maps
   */
  sourcemap(type: boolean | 'inline' | 'external' | 'hidden'): this {
    this.config.sourcemap = type as any;
    return this;
  }

  /**
   * Enable code splitting (ESM only)
   */
  withSplitting(enabled = true): this {
    this.config.splitting = enabled;
    return this;
  }

  /**
   * Set output directory
   */
  outDir(dir: string): this {
    this.config.outDir = dir;
    return this;
  }

  /**
   * Set ECMAScript target
   */
  target(target: string): this {
    this.config.target = target;
    return this;
  }

  /**
   * Configure externals
   */
  external(patterns: Array<string | RegExp>): this {
    this.config.external = patterns;
    return this;
  }

  /**
   * Add specific external packages
   */
  externalize(...packages: string[]): this {
    const current = this.config.external || [];
    this.config.external = [...current, ...packages];
    return this;
  }

  /**
   * Configure for React
   */
  forReact(): this {
    this.config.external = [...(this.config.external || []), 'react', 'react-dom', 'react/jsx-runtime'];
    this.config.esbuildOptions = (options) => {
      options.jsx = 'automatic';
      return options;
    };
    return this;
  }

  /**
   * Configure for Vue
   */
  forVue(): this {
    this.config.external = [...(this.config.external || []), 'vue', '@vue/*'];
    return this;
  }

  /**
   * Configure for Preact
   */
  forPreact(): this {
    this.config.external = [...(this.config.external || []), 'preact', 'preact/hooks', 'preact/compat'];
    this.config.esbuildOptions = (options) => {
      options.jsx = 'automatic';
      options.jsxImportSource = 'preact';
      return options;
    };
    return this;
  }

  /**
   * Apply environment-specific settings
   */
  env(mode: 'development' | 'production'): this {
    if (mode === 'development') {
      this.config.minify = false;
      this.config.sourcemap = 'inline';
      this.config.define = {
        ...this.config.define,
        'process.env.NODE_ENV': '"development"',
        '__DEV__': 'true',
        '__PROD__': 'false',
      };
    } else {
      this.config.minify = true;
      this.config.sourcemap = 'hidden' as any;
      this.config.define = {
        ...this.config.define,
        'process.env.NODE_ENV': '"production"',
        '__DEV__': 'false',
        '__PROD__': 'true',
      };
    }
    return this;
  }

  /**
   * Enable bundle analysis
   */
  withBundleAnalysis(options?: {
    warnThreshold?: number;
    failOnLarge?: boolean;
    visualizer?: 'auto' | 'off' | 'required';
  }): this {
    this.config.metafile = true;

    // Import dynamically to avoid circular dependency
    import('./bundleAnalyzer/index.ts').then(({ createBundleAnalyzer }) => {
      this.config.onSuccess = createBundleAnalyzer(options);
    });

    return this;
  }

  /**
   * Enable watch mode
   */
  watch(onSuccess?: string | (() => void)): this {
    this.config.watch = true;
    if (onSuccess) {
      this.config.onSuccess = onSuccess as any;
    }
    return this;
  }

  /**
   * Add custom configuration
   */
  configure(customConfig: Partial<Options>): this {
    this.config = merge(this.config, customConfig);
    return this;
  }

  /**
   * Build the final configuration
   */
  build(): Options {
    // Optionally validate if available
    if (process.env.VALIDATE_CONFIG === 'true') {
      import('./validation.ts').then(({ validateConfig }) => {
        const result = validateConfig(this.config);
        if (!result.success) {
          console.warn('Configuration validation warnings:', result.errors);
        }
      }).catch(() => {
        // Validation module not available
      });
    }

    return config(this.config) as Options;
  }

  /**
   * Build with validation (throws on invalid config)
   */
  async buildValidated(): Promise<Options> {
    const { createValidatedConfig } = await import('./validation.ts');
    return createValidatedConfig(this.config);
  }

  /**
   * Build as array (for multiple configs)
   */
  buildArray(): Options[] {
    return [this.build()];
  }

  /**
   * Static factory method
   */
  static create(): TsupConfigBuilder {
    return new TsupConfigBuilder();
  }
}

/**
 * Shorthand function to create a new builder
 */
export function tsupBuilder(): TsupConfigBuilder {
  return TsupConfigBuilder.create();
}

/**
 * Quick presets using the builder
 */
export const quickPresets = {
  library: () => tsupBuilder()
    .asLibrary()
    .dualFormat()
    .withTypes()
    .build(),

  nodeCli: () => tsupBuilder()
    .asCli('node')
    .build(),

  browserApp: () => tsupBuilder()
    .asBrowserBundle()
    .build(),

  reactLibrary: () => tsupBuilder()
    .asLibrary()
    .dualFormat()
    .withTypes()
    .forReact()
    .build(),

  standalone: () => tsupBuilder()
    .asCli('node')
    .asStandalone()
    .build(),
};