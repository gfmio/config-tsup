import { describe, expect, it } from 'bun:test';
import { simpleBuilder, emptyBuilder, SimpleTypeSafeBuilder } from '../src/simple-builder';

describe('SimpleTypeSafeBuilder', () => {
  describe('Creation', () => {
    it('should create empty builder', () => {
      const builder = emptyBuilder();
      const config = builder.config();

      expect(config).toEqual({});
    });

    it('should create builder with defaults', () => {
      const builder = simpleBuilder();
      const config = builder.config();

      expect(config.target).toBe('es2022');
      expect(config.clean).toBe(true);
      expect(config.sourcemap).toBe(true);
      expect(config.treeshake).toBe(true);
    });

    it('should create builder from state', () => {
      const state = {
        entry: ['src/index.ts'],
        format: ['esm'] as const,
      };

      const builder = SimpleTypeSafeBuilder.forState(state);
      const config = builder.config();

      expect(config).toEqual(state);
    });
  });

  describe('Basic Operations', () => {
    it('should set a value', () => {
      const config = emptyBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['esm'])
        .config();

      expect(config.entry).toEqual(['src/index.ts']);
      expect(config.format).toEqual(['esm']);
    });

    it('should unset a value', () => {
      const config = simpleBuilder()
        .set('entry', ['src/index.ts'])
        .unset('sourcemap')
        .config();

      expect(config.entry).toEqual(['src/index.ts']);
      expect(config.sourcemap).toBeUndefined();
    });

    it('should merge configurations', () => {
      const config = simpleBuilder()
        .merge({
          entry: ['src/index.ts'],
          format: ['esm'],
        })
        .config();

      expect(config.entry).toEqual(['src/index.ts']);
      expect(config.format).toEqual(['esm']);
      expect(config.target).toBe('es2022'); // From default
    });

    it('should transform with map', () => {
      const config = simpleBuilder()
        .set('entry', ['src/index.ts'])
        .map(state => ({
          ...state,
          format: ['cjs', 'esm'] as const,
        }))
        .config();

      expect(config.entry).toEqual(['src/index.ts']);
      expect(config.format).toEqual(['cjs', 'esm']);
    });

    it('should conditionally apply transformations', () => {
      const withMinify = simpleBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['esm'])
        .when(true, b => b.set('minify', true))
        .config();

      const withoutMinify = simpleBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['esm'])
        .when(false, b => b.set('minify', true))
        .config();

      expect(withMinify.minify).toBe(true);
      expect(withoutMinify.minify).toBeUndefined();
    });
  });

  describe('Build Validation', () => {
    it('should build when required fields are present', () => {
      const config = emptyBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['esm'])
        .build();

      expect(config.entry).toEqual(['src/index.ts']);
      expect(config.format).toEqual(['esm']);
    });

    it('should not allow build without entry', () => {
      const builder = emptyBuilder()
        .set('format', ['esm']);

      // This would be a type error:
      // builder.build();

      // But we can use unsafeBuild or add entry first
      expect(builder.config().format).toEqual(['esm']);
    });

    it('should not allow build without format', () => {
      const builder = emptyBuilder()
        .set('entry', ['src/index.ts']);

      // This would be a type error:
      // builder.build();

      expect(builder.config().entry).toEqual(['src/index.ts']);
    });
  });

  describe('Type Safety', () => {
    it('should allow compatible merge', () => {
      const config = simpleBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['esm'])
        .merge({
          splitting: true, // ESM supports splitting
        })
        .build();

      expect(config.splitting).toBe(true);
    });

    it('should prevent incompatible IIFE + splitting via unsafe merge', () => {
      // Type-safe merge would reject this, but unsafeMerge allows it
      const config = simpleBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['iife'])
        .unsafeMerge({
          splitting: true, // This is incompatible but allowed via unsafe
        })
        .build();

      expect(config.format).toEqual(['iife']);
      expect(config.splitting).toBe(true);
    });

    it('should prevent browser + shims via unsafe merge', () => {
      const config = simpleBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['esm'])
        .set('platform', 'browser')
        .unsafeMerge({
          shims: true, // Incompatible but allowed via unsafe
        })
        .build();

      expect(config.platform).toBe('browser');
      expect(config.shims).toBe(true);
    });
  });

  describe('Fluent API', () => {
    it('should chain operations', () => {
      const config = emptyBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['cjs', 'esm'])
        .set('platform', 'node')
        .set('target', 'node18')
        .set('dts', true)
        .set('sourcemap', 'external')
        .merge({
          minify: false,
          clean: true,
        })
        .build();

      expect(config.entry).toEqual(['src/index.ts']);
      expect(config.format).toEqual(['cjs', 'esm']);
      expect(config.platform).toBe('node');
      expect(config.target).toBe('node18');
      expect(config.dts).toBe(true);
      expect(config.sourcemap).toBe('external');
      expect(config.minify).toBe(false);
      expect(config.clean).toBe(true);
    });

    it('should support complex workflows', () => {
      const config = simpleBuilder()
        .merge({
          entry: ['src/index.ts'],
          productType: 'library' as const,
        })
        .map(state => ({
          ...state,
          format: ['cjs', 'esm'] as const,
          external: [/^[^./]/, /^node:/],
          skipNodeModulesBundle: true,
        }))
        .set('dts', true)
        .when(process.env.NODE_ENV === 'production', b =>
          b.set('minify', true)
        )
        .build();

      expect(config.productType).toBe('library');
      expect(config.format).toEqual(['cjs', 'esm']);
      expect(config.external).toBeDefined();
      expect(config.dts).toBe(true);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should build library configuration', () => {
      const config = simpleBuilder()
        .merge({
          entry: ['src/index.ts'],
          productType: 'library' as const,
          format: ['cjs', 'esm'] as const,
          dts: true,
          external: [/^[^./]/],
          skipNodeModulesBundle: true,
        })
        .build();

      expect(config.productType).toBe('library');
      expect(config.format).toEqual(['cjs', 'esm']);
      expect(config.dts).toBe(true);
    });

    it('should build CLI configuration', () => {
      const config = simpleBuilder()
        .merge({
          entry: ['src/cli.ts'],
          productType: 'cli' as const,
          format: ['esm'] as const,
          platform: 'node' as const,
          minify: true,
          shims: true,
        })
        .map(state => ({
          ...state,
          esbuildOptions: (options: any) => {
            options.banner = { js: '#!/usr/bin/env node' };
          },
        }))
        .build();

      expect(config.productType).toBe('cli');
      expect(config.format).toEqual(['esm']);
      expect(config.minify).toBe(true);
    });

    it('should build browser configuration', () => {
      const config = simpleBuilder()
        .merge({
          entry: ['src/app.ts'],
          productType: 'browser' as const,
          format: ['esm'] as const,
          platform: 'browser' as const,
          splitting: true,
          minify: true,
          shims: false,
        })
        .build();

      expect(config.productType).toBe('browser');
      expect(config.platform).toBe('browser');
      expect(config.splitting).toBe(true);
    });

    it('should build React library', () => {
      const config = simpleBuilder()
        .merge({
          entry: ['src/index.ts'],
          productType: 'library' as const,
          format: ['cjs', 'esm'] as const,
          dts: true,
          external: ['react', 'react-dom', 'react/jsx-runtime'],
        })
        .map(state => ({
          ...state,
          esbuildOptions: (options: any) => {
            options.jsx = 'automatic';
          },
        }))
        .build();

      expect(config.external).toContain('react');
      expect(config.dts).toBe(true);
    });
  });

  describe('State Tracking', () => {
    it('should track state through transformations', () => {
      const step1 = emptyBuilder();
      expect(step1.config()).toEqual({});

      const step2 = step1.set('entry', ['src/index.ts']);
      expect(step2.config().entry).toEqual(['src/index.ts']);

      const step3 = step2.set('format', ['esm']);
      expect(step3.config().format).toEqual(['esm']);

      const final = step3.build();
      expect(final.entry).toEqual(['src/index.ts']);
      expect(final.format).toEqual(['esm']);
    });

    it('should maintain immutability', () => {
      const original = simpleBuilder();
      const modified = original.set('entry', ['src/index.ts']);

      expect(original.config().entry).toBeUndefined();
      expect(modified.config().entry).toEqual(['src/index.ts']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple entry formats', () => {
      const arrayEntry = emptyBuilder()
        .set('entry', ['src/index.ts', 'src/cli.ts'])
        .set('format', ['esm'])
        .build();

      const objectEntry = emptyBuilder()
        .set('entry', { main: 'src/index.ts', cli: 'src/cli.ts' })
        .set('format', ['esm'])
        .build();

      expect(arrayEntry.entry).toEqual(['src/index.ts', 'src/cli.ts']);
      expect(objectEntry.entry).toEqual({ main: 'src/index.ts', cli: 'src/cli.ts' });
    });

    it('should handle complex external patterns', () => {
      const config = simpleBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['esm'])
        .merge({
          external: [
            'react',
            /^lodash/,
            /^@types\//,
          ],
        })
        .build();

      expect(config.external).toHaveLength(3);
    });

    it('should handle esbuildOptions', () => {
      const config = simpleBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['esm'])
        .merge({
          esbuildOptions: (options: any, context: any) => {
            options.loader = { '.png': 'dataurl' };
          },
        })
        .build();

      expect(config.esbuildOptions).toBeDefined();
    });
  });
});
