import type { Options } from 'tsup';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import process from 'node:process';

import { createAdaptiveConfig, createEnvConfig } from '../src/utils/factories.ts';

describe('Factory Functions', () => {
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

  describe('createEnvConfig', () => {
    it('should return development config when NODE_ENV is development', () => {
      process.env['NODE_ENV'] = 'development';
      const devConfig: Options = {
        entry: [
          'src/index.ts',
        ],
        format: [
          'esm',
        ],
        minify: false,
        sourcemap: true,
      };
      const prodConfig: Options = {
        entry: [
          'src/index.ts',
        ],
        format: [
          'esm',
        ],
        minify: true,
        sourcemap: false,
      };

      const result = createEnvConfig(devConfig, prodConfig);
      expect(result).toEqual(devConfig);
    });

    it('should return production config when NODE_ENV is production', () => {
      process.env['NODE_ENV'] = 'production';
      const devConfig: Options = {
        entry: [
          'src/index.ts',
        ],
        format: [
          'esm',
        ],
        minify: false,
        sourcemap: true,
      };
      const prodConfig: Options = {
        entry: [
          'src/index.ts',
        ],
        format: [
          'esm',
        ],
        minify: true,
        sourcemap: false,
      };

      const result = createEnvConfig(devConfig, prodConfig);
      expect(result).toEqual(prodConfig);
    });

    it('should return production config when NODE_ENV is not set', () => {
      process.env['NODE_ENV'] = undefined;
      const devConfig: Options = {
        entry: [
          'src/index.ts',
        ],
        format: [
          'esm',
        ],
        minify: false,
      };
      const prodConfig: Options = {
        entry: [
          'src/index.ts',
        ],
        format: [
          'esm',
        ],
        minify: true,
      };

      const result = createEnvConfig(devConfig, prodConfig);
      expect(result).toEqual(prodConfig);
    });

    it('should handle complex configurations', () => {
      process.env['NODE_ENV'] = 'development';
      const devConfig: Options = {
        clean: true,
        dts: true,
        entry: {
          cli: 'src/cli.ts',
          main: 'src/index.ts',
        },
        external: [
          'react',
        ],
        format: [
          'esm',
          'cjs',
        ],
        minify: false,
        sourcemap: true,
      };
      const prodConfig: Options = {
        clean: true,
        dts: true,
        entry: {
          cli: 'src/cli.ts',
          main: 'src/index.ts',
        },
        external: [
          'react',
          'react-dom',
        ],
        format: [
          'esm',
          'cjs',
        ],
        minify: true,
        sourcemap: false,
      };

      const result = createEnvConfig(devConfig, prodConfig);
      expect(result).toEqual(devConfig);
    });

    it('should handle array of configurations for development', () => {
      process.env['NODE_ENV'] = 'development';
      const devConfigs: Options[] = [
        {
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
          minify: false,
        },
        {
          entry: [
            'src/cli.ts',
          ],
          format: [
            'cjs',
          ],
          minify: false,
        },
      ];
      const prodConfigs: Options[] = [
        {
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
          minify: true,
        },
        {
          entry: [
            'src/cli.ts',
          ],
          format: [
            'cjs',
          ],
          minify: true,
        },
      ];

      const result = createEnvConfig(devConfigs, prodConfigs);
      expect(result).toEqual(devConfigs);
    });

    it('should handle array of configurations for production', () => {
      process.env['NODE_ENV'] = 'production';
      const devConfigs: Options[] = [
        {
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
          minify: false,
        },
        {
          entry: [
            'src/cli.ts',
          ],
          format: [
            'cjs',
          ],
          minify: false,
        },
      ];
      const prodConfigs: Options[] = [
        {
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
          minify: true,
        },
        {
          entry: [
            'src/cli.ts',
          ],
          format: [
            'cjs',
          ],
          minify: true,
        },
      ];

      const result = createEnvConfig(devConfigs, prodConfigs);
      expect(result).toEqual(prodConfigs);
    });
  });

  describe('createAdaptiveConfig', () => {
    describe('single configuration', () => {
      it('should apply production overrides when NODE_ENV is not set (default)', () => {
        process.env['NODE_ENV'] = undefined;
        process.env['CI'] = undefined;
        process.argv = [
          'node',
          'script.js',
        ];
        process.env['WATCH'] = undefined;

        const base: Options = {
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
          minify: false,
          sourcemap: false,
        };
        const overrides = {
          ci: {
            clean: true,
          },
          development: {
            minify: false,
            sourcemap: true,
          },
          production: {
            minify: true,
            sourcemap: false,
          },
          watch: {
            sourcemap: 'inline' as const,
          },
        };

        const result = createAdaptiveConfig(base, overrides);
        // When NODE_ENV is not set, it defaults to production
        expect(result).toMatchObject({
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
          minify: true, // from production override
          sourcemap: false,
        });
      });

      it('should apply development overrides', () => {
        process.env['NODE_ENV'] = 'development';
        const base: Options = {
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
        };
        const overrides = {
          development: {
            minify: false,
            sourcemap: true,
          },
          production: {
            minify: true,
            sourcemap: false,
          },
        };

        const result = createAdaptiveConfig(base, overrides);
        expect(result).toMatchObject({
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
          minify: false,
          sourcemap: true,
        });
      });

      it('should apply production overrides', () => {
        process.env['NODE_ENV'] = 'production';
        const base: Options = {
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
        };
        const overrides = {
          development: {
            minify: false,
            sourcemap: true,
          },
          production: {
            minify: true,
            sourcemap: false,
          },
        };

        const result = createAdaptiveConfig(base, overrides);
        expect(result).toMatchObject({
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
          minify: true,
          sourcemap: false,
        });
      });

      it('should apply CI overrides', () => {
        process.env['CI'] = 'true';
        const base: Options = {
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
        };
        const overrides = {
          ci: {
            clean: true,
            minify: true,
          },
        };

        const result = createAdaptiveConfig(base, overrides);
        expect(result).toMatchObject({
          clean: true,
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
          minify: true,
        });
      });

      it('should apply watch overrides', () => {
        process.argv = [
          'node',
          'script.js',
          '--watch',
        ];
        const base: Options = {
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
        };
        const overrides = {
          watch: {
            minify: false,
            sourcemap: 'inline' as const,
          },
        };

        const result = createAdaptiveConfig(base, overrides);
        expect(result).toMatchObject({
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
          minify: false,
          sourcemap: 'inline',
        });
      });

      it('should apply multiple overrides with correct precedence', () => {
        process.env['NODE_ENV'] = 'development';
        process.env['CI'] = 'true';
        process.argv = [
          'node',
          'script.js',
          '--watch',
        ];

        const base: Options = {
          clean: false,
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
        };
        const overrides = {
          ci: {
            clean: true,
            minify: true,
          },
          development: {
            minify: false,
            sourcemap: true,
          },
          production: {
            minify: true,
            sourcemap: false,
          },
          watch: {
            sourcemap: 'inline' as const,
          },
        };

        const result = createAdaptiveConfig(base, overrides);
        // Order of precedence: base -> development -> ci -> watch
        expect(result).toMatchObject({
          clean: true, // from CI
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
          minify: true, // from CI (overrides development)
          sourcemap: 'inline', // from watch (overrides development and CI)
        });
      });

      it('should handle empty overrides', () => {
        const base: Options = {
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
        };
        const overrides = {};

        const result = createAdaptiveConfig(base, overrides);
        expect(result).toEqual(base);
      });

      it('should handle partial overrides', () => {
        process.env['NODE_ENV'] = 'development';
        const base: Options = {
          clean: true,
          dts: true,
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
        };
        const overrides = {
          development: {
            minify: false,
          },
          // No production, ci, or watch overrides
        };

        const result = createAdaptiveConfig(base, overrides);
        expect(result).toMatchObject({
          clean: true,
          dts: true,
          entry: [
            'src/index.ts',
          ],
          format: [
            'esm',
          ],
          minify: false,
        });
      });
    });

    // Note: createAdaptiveConfig doesn't actually support arrays
    // The function signature only accepts Partial<Options>, not Options[]
    // These tests were removed as they were testing non-existent functionality
  });
});
