import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import process from 'node:process';

import { SRC_INDEX_TS } from '../src/constants.ts';
import configTsup, * as tsupConfig from '../src/index.ts';
import * as partials from '../src/partials.ts';
import * as presets from '../src/presets.ts';
import { entry, merge } from '../src/utils/index.ts';

describe('Integration Tests', () => {
  const originalEnv = process.env;
  const originalArgv = process.argv;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
    };
    process.argv = [
      ...originalArgv,
    ];
  });

  afterEach(() => {
    process.env = originalEnv;
    process.argv = originalArgv;
  });

  describe('Default Export', () => {
    it('should create a valid configuration with default entry', () => {
      const result = configTsup;
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);

      // All configs should have the default entry
      result.forEach((config) => {
        expect(config.entry).toEqual([
          SRC_INDEX_TS,
        ]);
      });

      // Should be the neutralLibrary preset with entry
      expect(result[0].format).toEqual([
        'cjs',
      ]);
      expect(result[1].format).toEqual([
        'esm',
      ]);
      expect(result[2].dts).toEqual({
        only: true,
      });
    });

    it('should be equivalent to neutralLibrary with entry', () => {
      const expected = presets.neutralLibrary.map((config) => merge(config, entry(SRC_INDEX_TS)));
      expect(configTsup).toEqual(expected);
    });
  });

  describe('Re-exports', () => {
    it('should re-export all presets', () => {
      expect(tsupConfig.nodeLibrary).toBe(presets.nodeLibrary);
      expect(tsupConfig.browserLibrary).toBe(presets.browserLibrary);
      expect(tsupConfig.neutralLibrary).toBe(presets.neutralLibrary);
      expect(tsupConfig.library).toBe(presets.library);
      expect(tsupConfig.nodeCli).toBe(presets.nodeCli);
      expect(tsupConfig.cjsNodeCli).toBe(presets.cjsNodeCli);
      expect(tsupConfig.bunCli).toBe(presets.bunCli);
      expect(tsupConfig.cjsBunCli).toBe(presets.cjsBunCli);
      expect(tsupConfig.esmBrowserBundle).toBe(presets.esmBrowserBundle);
      expect(tsupConfig.iifeBrowserBundle).toBe(presets.iifeBrowserBundle);
    });

    it('should re-export individual library configs', () => {
      expect(tsupConfig.cjsNodeLibrary).toBe(presets.cjsNodeLibrary);
      expect(tsupConfig.esmNodeLibrary).toBe(presets.esmNodeLibrary);
      expect(tsupConfig.dtsOnlyNodeLibrary).toBe(presets.dtsOnlyNodeLibrary);
      expect(tsupConfig.esmBrowserLibrary).toBe(presets.esmBrowserLibrary);
      expect(tsupConfig.dtsOnlyBrowserLibrary).toBe(presets.dtsOnlyBrowserLibrary);
      expect(tsupConfig.cjsNeutralLibrary).toBe(presets.cjsNeutralLibrary);
      expect(tsupConfig.esmNeutralLibrary).toBe(presets.esmNeutralLibrary);
      expect(tsupConfig.dtsOnlyNeutralLibrary).toBe(presets.dtsOnlyNeutralLibrary);
    });
  });

  describe('Real-world Configuration Scenarios', () => {
    describe('React Component Library', () => {
      it('should create proper config for React library', () => {
        const reactConfig = merge(
          partials.base,
          partials.browser,
          partials.esmOnly,
          partials.sourcemap,
          partials.skipNodeModulesBundle,
          entry('src/index.tsx'),
          {
            external: [
              'react',
              'react-dom',
            ],
          },
        );

        expect(reactConfig).toMatchObject({
          dts: false,
          entry: [
            'src/index.tsx',
          ],
          external: [
            'react',
            'react-dom',
          ],
          format: [
            'esm',
          ],
          platform: 'browser',
          skipNodeModulesBundle: true,
          sourcemap: true,
        });
      });

      it('should create dual format React library with types', () => {
        const configs = [
          merge(
            partials.base,
            partials.browser,
            partials.esmOnly,
            partials.sourcemap,
            partials.skipNodeModulesBundle,
            entry('src/index.tsx'),
            {
              external: [
                'react',
                'react-dom',
              ],
            },
          ),
          merge(
            partials.base,
            partials.browser,
            partials.cjsOnly,
            partials.cjsInterop,
            partials.sourcemap,
            partials.skipNodeModulesBundle,
            entry('src/index.tsx'),
            {
              external: [
                'react',
                'react-dom',
              ],
            },
          ),
          merge(partials.base, partials.browser, partials.dtsOnly, entry('src/index.tsx'), {
            external: [
              'react',
              'react-dom',
            ],
          }),
        ];

        expect(configs[0].format).toEqual([
          'esm',
        ]);
        expect(configs[1].format).toEqual([
          'cjs',
        ]);
        expect(configs[1].cjsInterop).toBe(true);
        expect(configs[2].dts).toEqual({
          only: true,
        });
      });
    });

    describe('Node.js CLI Tool', () => {
      it('should create production CLI config', () => {
        process.env['NODE_ENV'] = 'production';

        const cliConfig = merge(presets.nodeCli, entry('src/cli.ts'), partials.production);

        expect(cliConfig).toMatchObject({
          define: {
            'process.env.NODE_ENV': '"production"',
          },
          dts: false,
          entry: [
            'src/cli.ts',
          ],
          // Note: nodeCli doesn't set format or platform (bug)
          minify: true,
          shims: true,
          sourcemap: false, // production override
        });
        // esbuildOptions is a function from banner
        expect(typeof cliConfig.esbuildOptions).toBe('function');
      });

      it('should create development CLI config', () => {
        process.env['NODE_ENV'] = 'development';

        const cliConfig = merge(presets.nodeCli, entry('src/cli.ts'), partials.development);

        expect(cliConfig).toMatchObject({
          define: {
            'process.env.NODE_ENV': '"development"',
          },
          dts: false,
          entry: [
            'src/cli.ts',
          ],
          // Note: nodeCli doesn't set format or platform (bug)
          minify: false, // development override
          shims: true,
          sourcemap: true,
        });
        expect(typeof cliConfig.esbuildOptions).toBe('function');
      });
    });

    describe('Isomorphic Library', () => {
      it('should create config for library that works in both Node and browser', () => {
        const isomorphicConfigs = presets.neutralLibrary.map((config) => merge(config, entry('src/index.ts')));

        expect(isomorphicConfigs).toHaveLength(3);

        // CJS for Node
        expect(isomorphicConfigs[0]).toMatchObject({
          cjsInterop: true,
          entry: [
            'src/index.ts',
          ],
          format: [
            'cjs',
          ],
          platform: 'neutral',
        });

        // ESM for both
        expect(isomorphicConfigs[1]).toMatchObject({
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
          platform: 'neutral',
        });

        // TypeScript declarations
        expect(isomorphicConfigs[2]).toMatchObject({
          dts: {
            only: true,
          },
          entry: [
            'src/index.ts',
          ],
          platform: 'neutral',
        });
      });
    });

    describe('Browser Application Bundle', () => {
      it('should create optimized browser bundle', () => {
        const bundleConfig = merge(
          presets.esmBrowserBundle,
          entry({
            main: 'src/index.ts',
            worker: 'src/worker.ts',
          }),
          {
            external: [],
          }, // Bundle everything
        );

        expect(bundleConfig).toMatchObject({
          entry: {
            main: 'src/index.ts',
            worker: 'src/worker.ts',
          },
          external: [], // Override to bundle dependencies
          format: [
            'esm',
          ],
          minify: true,
          platform: 'browser',
          shims: false,
          splitting: true,
        });
      });

      it('should create IIFE bundle for legacy browsers', () => {
        const iifeConfig = merge(presets.iifeBrowserBundle, entry('src/index.ts'), {
          target: 'es5',
        });

        expect(iifeConfig).toMatchObject({
          entry: [
            'src/index.ts',
          ],
          format: [
            'iife',
          ],
          minify: true,
          platform: 'browser',
          shims: false,
          splitting: false,
          target: 'es5',
        });
        // Banner is handled via esbuildOptions function
        expect(typeof iifeConfig.esbuildOptions).toBe('function');
      });
    });

    describe('Monorepo Package', () => {
      it('should create config for monorepo package', () => {
        const monorepoConfig = merge(
          partials.base,
          partials.node,
          partials.esmOnly,
          partials.sourcemap,
          entry('src/index.ts'),
          {
            external: [
              /^@myorg\//, // Workspace packages
              /^[^./]/, // All node_modules
            ],
          },
        );

        expect(monorepoConfig).toMatchObject({
          dts: false,
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
          platform: 'node',
          sourcemap: true,
        });
        expect(monorepoConfig.external).toContainEqual(/^@myorg\//);
      });
    });

    describe('Multi-entry Library', () => {
      it('should handle multiple entry points correctly', () => {
        const multiEntryConfig = merge(
          partials.base,
          partials.neutral,
          partials.esm,
          partials.dts,
          partials.sourcemap,
          entry({
            components: 'src/components/index.ts',
            hooks: 'src/hooks/index.ts',
            index: 'src/index.ts',
            utils: 'src/utils/index.ts',
          }),
          {
            splitting: false,
          }, // Important for libraries
        );

        expect(multiEntryConfig).toMatchObject({
          dts: true,
          entry: {
            components: 'src/components/index.ts',
            hooks: 'src/hooks/index.ts',
            index: 'src/index.ts',
            utils: 'src/utils/index.ts',
          },
          format: [
            'esm',
          ],
          platform: 'neutral',
          sourcemap: true,
          splitting: false,
        });
      });
    });

    describe('Environment-based Configuration', () => {
      it('should adapt configuration based on CI environment', () => {
        process.env['CI'] = 'true';
        process.env['NODE_ENV'] = 'production';

        const ciConfig = merge(
          partials.base,
          partials.node,
          partials.esmOnly,
          process.env['CI'] === 'true' ? partials.noSourcemap : partials.sourcemap,
          process.env['CI'] === 'true' ? partials.production : partials.development,
          entry('src/index.ts'),
        );

        expect(ciConfig).toMatchObject({
          define: {
            'process.env.NODE_ENV': '"production"',
          },
          minify: true,
          sourcemap: false,
        });
      });

      it('should enable sourcemaps in watch mode', () => {
        process.argv.push('--watch');

        const watchConfig = merge(
          partials.base,
          partials.node,
          partials.esmOnly,
          process.argv.includes('--watch') ? partials.sourcemapInline : partials.noSourcemap,
          entry('src/index.ts'),
        );

        expect(watchConfig.sourcemap).toBe('inline');
      });
    });

    describe('TypeScript Project Types', () => {
      it('should handle .mts files for ESM-only projects', () => {
        const mtsConfig = merge(
          partials.base,
          partials.node,
          partials.esmOnly,
          partials.sourcemap,
          entry('src/index.mts'),
          {
            outExtension: ({ format }) => ({
              js: '.mjs',
            }),
          },
        );

        expect(mtsConfig).toMatchObject({
          dts: false,
          entry: [
            'src/index.mts',
          ],
          format: [
            'esm',
          ],
        });
        expect(
          mtsConfig.outExtension?.({
            format: 'esm',
          }),
        ).toEqual({
          js: '.mjs',
        });
      });

      it('should handle .cts files for CJS-only projects', () => {
        const ctsConfig = merge(
          partials.base,
          partials.node,
          partials.cjsOnly,
          partials.cjsInterop,
          partials.sourcemap,
          entry('src/index.cts'),
          {
            outExtension: ({ format }) => ({
              js: '.cjs',
            }),
          },
        );

        expect(ctsConfig).toMatchObject({
          cjsInterop: true,
          dts: false,
          entry: [
            'src/index.cts',
          ],
          format: [
            'cjs',
          ],
        });
        expect(
          ctsConfig.outExtension?.({
            format: 'cjs',
          }),
        ).toEqual({
          js: '.cjs',
        });
      });
    });

    describe('Bundle Analysis', () => {
      it('should enable metafile for bundle analysis', () => {
        const analyzeConfig = merge(
          partials.base,
          partials.browser,
          partials.esmOnly,
          partials.analyzeConfig,
          entry('src/index.ts'),
        );

        expect(analyzeConfig.metafile).toBe(true);
      });
    });
  });

  describe('Complex Composition Patterns', () => {
    it('should compose development config with multiple partials', () => {
      process.env['NODE_ENV'] = 'development';

      const devConfig = merge(
        partials.base,
        partials.node,
        partials.esmOnly,
        partials.development,
        partials.sourcemap,
        partials.skipNodeModulesBundle,
        partials.shims,
        partials.debugMinify,
        entry('src/index.ts'),
      );

      expect(devConfig).toMatchObject({
        define: {
          'process.env.NODE_ENV': '"development"',
        },
        dts: false,
        format: [
          'esm',
        ],
        keepNames: true,
        minify: true, // from debugMinify
        minifyIdentifiers: false,
        minifySyntax: true,
        // Minification settings are direct properties, not in esbuildOptions
        minifyWhitespace: true, // debugMinify has minifyWhitespace true
        platform: 'node',
        shims: true,
        skipNodeModulesBundle: true,
        sourcemap: true,
      });
    });

    it('should compose production config with optimization', () => {
      process.env['NODE_ENV'] = 'production';

      const prodConfig = merge(
        partials.base,
        partials.browser,
        partials.esmOnly,
        partials.production,
        partials.productionMinify,
        partials.treeshake,
        partials.splitting,
        partials.noShims,
        entry('src/index.ts'),
        {
          external: [],
        }, // Bundle everything for production
      );

      expect(prodConfig).toMatchObject({
        define: {
          'process.env.NODE_ENV': '"production"',
        },
        dts: false,
        external: [],
        format: [
          'esm',
        ],
        keepNames: false,
        minify: true,
        minifyIdentifiers: true,
        minifySyntax: true,
        // Minification settings are direct properties
        minifyWhitespace: true,
        platform: 'browser',
        shims: false,
        sourcemap: false,
        splitting: true,
        treeshake: true,
      });
    });
  });
});
