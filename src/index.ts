import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

/**
 * Base tsup configuration
 */
export const baseConfig: Partial<Options> = {
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'out/build',
  target: 'es2022',
  external: [],
  treeshake: true,
  minify: false,
  esbuildOptions: (options) => {
    options.banner = {
      js: '"use strict";',
    };
  },
  outExtension: ({ format }) => ({
    js: {
      cjs: '.cjs',
      esm: '.mjs',
      iife: '.js',
    }[format] ?? '.js',
    dts: '.d.ts',
  }),
};

/**
 * CommonJS-only configuration
 */
export const cjsConfig: Options = defineConfig({
  ...baseConfig,
  dts: false,
  format: ['cjs'],
}) as Options;

/**
 * ESM-only configuration
 */
export const esmConfig: Options = defineConfig({
  ...baseConfig,
  dts: false,
  format: ['esm'],
}) as Options;

/**
 * IIFE-only configuration
 */
export const iifeConfig: Options = defineConfig({
  ...baseConfig,
  dts: false,
  format: ['iife'],
}) as Options;

/**
 * TypeScript declarations only configuration
 */
export const dtsConfig: Options = defineConfig({
  ...baseConfig,
  dts: { only: true },
  format: ['esm'],
}) as Options;

/**
 * Default combined configuration (CJS + ESM + DTS)
 */
export const defaultConfig: Options[] = [cjsConfig, esmConfig, dtsConfig];

/**
 * Create a custom tsup configuration
 * @param entry Entry points for the build
 * @param overrides Custom configuration overrides
 */
export function createConfig(
  entry: string | string[] = ['src/index.ts'],
  overrides?: Partial<Options>
): Options {
  return defineConfig({
    ...baseConfig,
    entry: Array.isArray(entry) ? entry : [entry],
    ...overrides,
  }) as Options;
}

/**
 * Create a library configuration with CJS, ESM, and DTS
 * @param entry Entry points for the build
 * @param overrides Custom configuration overrides
 */
export function createLibraryConfig(
  entry: string | string[] = ['src/index.ts'],
  overrides?: Partial<Options>
): Options[] {
  const base = {
    ...baseConfig,
    entry: Array.isArray(entry) ? entry : [entry],
    ...overrides,
  };

  return [
    defineConfig({ ...base, dts: false, format: ['cjs'] }) as Options,
    defineConfig({ ...base, dts: false, format: ['esm'] }) as Options,
    defineConfig({ ...base, dts: { only: true }, format: ['esm'] }) as Options,
  ];
}

/**
 * Create a CLI configuration
 * @param entry Entry point for the CLI
 * @param overrides Custom configuration overrides
 */
export function createCliConfig(
  entry: string = 'src/cli.ts',
  overrides?: Partial<Options>
): Options {
  return defineConfig({
    ...baseConfig,
    entry: [entry],
    format: ['esm'],
    dts: false,
    target: 'node18',
    platform: 'node',
    shims: true,
    ...overrides,
  }) as Options;
}

export default defaultConfig;
