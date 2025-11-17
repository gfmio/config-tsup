import type { Options } from 'tsup';

import { describe, expect, it } from 'bun:test';

import { banner, config, configs, entry, merge, partial } from '../src/utils/index.ts';

describe('Utility Functions', () => {
  describe('partial', () => {
    it('should wrap a partial configuration', () => {
      const result = partial({
        minify: true,
      });
      expect(result).toEqual({
        minify: true,
      });
    });

    it('should handle empty configuration', () => {
      const result = partial({});
      expect(result).toEqual({});
    });

    it('should preserve all options', () => {
      const options = {
        clean: true,
        dts: false,
        format: [
          'esm',
          'cjs',
        ] as ('esm' | 'cjs')[],
        minify: true,
        sourcemap: true,
      };
      const result = partial(options);
      expect(result).toEqual(options);
    });
  });

  describe('merge', () => {
    it('should merge two partial configurations', () => {
      const part1 = partial({
        minify: true,
      });
      const part2 = partial({
        sourcemap: true,
      });
      const result = merge(part1, part2);
      expect(result).toEqual({
        minify: true,
        sourcemap: true,
      });
    });

    it('should override properties from left to right', () => {
      const part1 = partial({
        minify: true,
        sourcemap: false,
      });
      const part2 = partial({
        minify: false,
      });
      const result = merge(part1, part2);
      expect(result).toEqual({
        minify: false,
        sourcemap: false,
      });
    });

    it('should merge arrays correctly', () => {
      const part1 = partial({
        format: [
          'esm',
        ] as 'esm'[],
      });
      const part2 = partial({
        format: [
          'cjs',
        ] as 'cjs'[],
      });
      const result = merge(part1, part2);
      expect(result.format).toEqual([
        'cjs',
      ]);
    });

    it('should handle multiple partials', () => {
      const part1 = partial({
        minify: true,
      });
      const part2 = partial({
        sourcemap: true,
      });
      const part3 = partial({
        dts: true,
      });
      const part4 = partial({
        clean: false,
      });
      const result = merge(part1, part2, part3, part4);
      expect(result).toEqual({
        clean: false,
        dts: true,
        minify: true,
        sourcemap: true,
      });
    });

    it('should perform shallow merge for nested objects', () => {
      const part1 = partial({
        esbuildOptions: {
          keepNames: false,
          minifyWhitespace: true,
        },
      });
      const part2 = partial({
        esbuildOptions: {
          keepNames: true,
          minifyIdentifiers: true,
        },
      });
      const result = merge(part1, part2);
      // Shallow merge means part2's esbuildOptions completely replaces part1's
      expect(result.esbuildOptions).toEqual({
        keepNames: true,
        minifyIdentifiers: true,
      });
    });

    it('should perform shallow merge for env variables', () => {
      const part1 = partial({
        env: {
          NODE_ENV: 'development',
        },
      });
      const part2 = partial({
        env: {
          DEBUG: 'true',
        },
      });
      const result = merge(part1, part2);
      // Shallow merge means part2's env completely replaces part1's
      expect(result.env).toEqual({
        DEBUG: 'true',
      });
    });
  });

  describe('config', () => {
    it('should validate a complete configuration', () => {
      const options: Options = {
        dts: true,
        entry: [
          'src/index.ts',
        ],
        format: [
          'esm',
        ],
        minify: false,
      };
      const result = config(options);
      expect(result).toEqual(options);
    });

    it('should handle configuration with all options', () => {
      const options: Options = {
        banner: {
          js: '/* Banner */',
        },
        cjsInterop: true,
        clean: true,
        dts: true,
        entry: {
          cli: 'src/cli.ts',
          main: 'src/index.ts',
        },
        env: {
          NODE_ENV: 'production',
        },
        external: [
          'react',
          'react-dom',
        ],
        footer: {
          js: '/* Footer */',
        },
        format: [
          'esm',
          'cjs',
        ],
        minify: true,
        outDir: 'dist',
        platform: 'node',
        shims: true,
        skipNodeModulesBundle: true,
        sourcemap: true,
        splitting: false,
        target: 'node20',
        treeshake: true,
      };
      const result = config(options);
      expect(result).toEqual(options);
    });
  });

  describe('configs', () => {
    it('should validate an array of configurations', () => {
      const config1: Options = {
        dts: false,
        entry: [
          'src/index.ts',
        ],
        format: [
          'esm',
        ],
      };
      const config2: Options = {
        dts: false,
        entry: [
          'src/index.ts',
        ],
        format: [
          'cjs',
        ],
      };
      const config3: Options = {
        dts: {
          only: true,
        },
        entry: [
          'src/index.ts',
        ],
        format: undefined,
      };
      const result = configs(config1, config2, config3);
      expect(result).toEqual([
        config1,
        config2,
        config3,
      ]);
    });

    it('should handle empty array', () => {
      const result = configs();
      expect(result).toEqual([]);
    });

    it('should handle single configuration', () => {
      const config1: Options = {
        entry: [
          'src/index.ts',
        ],
        format: [
          'esm',
        ],
      };
      const result = configs(config1);
      expect(result).toEqual([
        config1,
      ]);
    });
  });

  describe('entry', () => {
    it('should handle single string entry', () => {
      const result = entry('src/index.ts');
      expect(result).toEqual({
        entry: [
          'src/index.ts',
        ],
      });
    });

    it('should handle array of entries', () => {
      const result = entry([
        'src/index.ts',
        'src/cli.ts',
      ]);
      expect(result).toEqual({
        entry: [
          'src/index.ts',
          'src/cli.ts',
        ],
      });
    });

    it('should handle object entries', () => {
      const result = entry({
        cli: 'src/cli.ts',
        main: 'src/index.ts',
        utils: 'src/utils.ts',
      });
      expect(result).toEqual({
        entry: {
          cli: 'src/cli.ts',
          main: 'src/index.ts',
          utils: 'src/utils.ts',
        },
      });
    });

    it('should handle multiple string arguments', () => {
      const result = entry('src/index.ts', 'src/cli.ts', 'src/utils.ts');
      expect(result).toEqual({
        entry: [
          'src/index.ts',
          'src/cli.ts',
          'src/utils.ts',
        ],
      });
    });

    it('should handle mixed arguments', () => {
      const result = entry(
        'src/index.ts',
        [
          'src/cli.ts',
          'src/utils.ts',
        ],
        {
          lib: 'src/lib.ts',
        },
      );
      expect(result).toEqual({
        entry: [
          'src/index.ts',
          'src/cli.ts',
          'src/utils.ts',
          {
            lib: 'src/lib.ts',
          },
        ],
      });
    });

    it('should handle empty input', () => {
      const result = entry();
      expect(result).toEqual({
        entry: [],
      });
    });
  });

  describe('banner', () => {
    it('should create esbuildOptions as a function', () => {
      const result = banner('/* This is a banner */');
      expect(result.esbuildOptions).toBeDefined();
      expect(typeof result.esbuildOptions).toBe('function');
    });

    it('should modify options when esbuildOptions function is called', () => {
      const result = banner('#!/usr/bin/env node\n');
      const options: any = {};
      if (typeof result.esbuildOptions === 'function') {
        result.esbuildOptions(options);
      }
      expect(options.banner).toEqual({
        js: '#!/usr/bin/env node\n',
      });
    });

    it('should handle multi-line banners', () => {
      const multilineBanner = `/**
 * This is a multi-line banner
 * with multiple lines
 */`;
      const result = banner(multilineBanner);
      const options: any = {};
      if (typeof result.esbuildOptions === 'function') {
        result.esbuildOptions(options);
      }
      expect(options.banner).toEqual({
        js: multilineBanner,
      });
    });

    it('should handle empty banner', () => {
      const result = banner('');
      const options: any = {};
      if (typeof result.esbuildOptions === 'function') {
        result.esbuildOptions(options);
      }
      expect(options.banner).toEqual({
        js: '',
      });
    });

    it('should override when merging due to shallow merge', () => {
      const bannerPartial = banner('/* Banner */');
      const otherPartial = partial({
        esbuildOptions: {
          minifyWhitespace: true,
        },
      });
      const result = merge(otherPartial, bannerPartial);
      // Banner's function will override the object completely
      expect(typeof result.esbuildOptions).toBe('function');
    });
  });
});
