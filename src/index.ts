import type { Options } from 'tsup';

import { defineConfig } from 'tsup';

/**
 * Base tsup configuration
 */
export const baseConfig: Partial<Options> = {
  clean: true,
  esbuildOptions: (options: import('esbuild').BuildOptions) => {
    options.banner = {
      js: '"use strict";',
    };
  },
  external: [],
  minify: false,
  outDir: 'out/build',
  outExtension: ({ format }: { format: 'cjs' | 'esm' | 'iife' }) => ({
    dts: '.d.ts',
    js:
      {
        cjs: '.cjs',
        esm: '.mjs',
        iife: '.js',
      }[format] ?? '.js',
  }),
  sourcemap: true,
  splitting: false,
  target: 'es2022',
  treeshake: true,
};

/**
 * CommonJS-only configuration
 */
export const cjsConfig: Options = defineConfig({
  ...baseConfig,
  dts: false,
  format: [
    'cjs',
  ],
}) as Options;

/**
 * ESM-only configuration
 */
export const esmConfig: Options = defineConfig({
  ...baseConfig,
  dts: false,
  format: [
    'esm',
  ],
}) as Options;

/**
 * IIFE-only configuration
 */
export const iifeConfig: Options = defineConfig({
  ...baseConfig,
  dts: false,
  format: [
    'iife',
  ],
}) as Options;

/**
 * TypeScript declarations only configuration
 */
export const dtsConfig: Options = defineConfig({
  ...baseConfig,
  dts: {
    only: true,
  },
  format: [
    'esm',
  ],
}) as Options;

/**
 * Default combined configuration (CJS + ESM + DTS)
 */
export const defaultConfig: Options[] = [
  cjsConfig,
  esmConfig,
  dtsConfig,
];

/**
 * Create a custom tsup configuration
 * @param entry Entry points for the build
 * @param overrides Custom configuration overrides
 */
export function createConfig(
  entry: string | string[] = [
    'src/index.ts',
  ],
  overrides?: Partial<Options>,
): Options {
  return defineConfig({
    ...baseConfig,
    entry: Array.isArray(entry)
      ? entry
      : [
          entry,
        ],
    ...overrides,
  }) as Options;
}

/**
 * Create a library configuration with CJS, ESM, and DTS
 * @param entry Entry points for the build
 * @param overrides Custom configuration overrides
 */
export function createLibraryConfig(
  entry: string | string[] = [
    'src/index.ts',
  ],
  overrides?: Partial<Options>,
): Options[] {
  const base = {
    ...baseConfig,
    entry: Array.isArray(entry)
      ? entry
      : [
          entry,
        ],
    ...overrides,
  };

  return [
    defineConfig({
      ...base,
      dts: false,
      format: [
        'cjs',
      ],
    }) as Options,
    defineConfig({
      ...base,
      dts: false,
      format: [
        'esm',
      ],
    }) as Options,
    defineConfig({
      ...base,
      dts: {
        only: true,
      },
      format: [
        'esm',
      ],
    }) as Options,
  ];
}

/**
 * Create a CLI configuration
 * @param entry Entry point for the CLI
 * @param overrides Custom configuration overrides
 */
export function createCliConfig(entry: string = 'src/cli.ts', overrides?: Partial<Options>): Options {
  return defineConfig({
    ...baseConfig,
    dts: false,
    entry: [
      entry,
    ],
    format: [
      'esm',
    ],
    platform: 'node',
    shims: true,
    target: 'node18',
    ...overrides,
  }) as Options;
}

// Export the default config as a named export instead of default export
export default defaultConfig;
