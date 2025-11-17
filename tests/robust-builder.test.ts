import { describe, expect, it } from 'bun:test';
import { robustBuilder, emptyRobustBuilder, RobustBuilder, BuilderConstraintError } from '../src/robust-builder';

describe('RobustBuilder', () => {
  describe('Creation', () => {
    it('should create empty builder', () => {
      const builder = emptyRobustBuilder();
      const config = builder.config();

      expect(config).toEqual({});
    });

    it('should create builder with defaults', () => {
      const builder = robustBuilder();
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

      const builder = RobustBuilder.forState(state);
      const config = builder.config();

      expect(config).toEqual(state);
    });
  });

  describe('Basic Operations', () => {
    it('should set a value', () => {
      const config = emptyRobustBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['esm'])
        .config();

      expect(config.entry).toEqual(['src/index.ts']);
      expect(config.format).toEqual(['esm']);
    });

    it('should unset a value', () => {
      const config = robustBuilder()
        .set('entry', ['src/index.ts'])
        .unset('sourcemap')
        .config();

      expect(config.entry).toEqual(['src/index.ts']);
      expect(config.sourcemap).toBeUndefined();
    });

    it('should merge configurations', () => {
      const config = robustBuilder()
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
      const config = robustBuilder()
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
      const withMinify = robustBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['esm'])
        .when(true, b => b.set('minify', true))
        .config();

      const withoutMinify = robustBuilder()
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
      const config = emptyRobustBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['esm'])
        .build();

      expect(config.entry).toEqual(['src/index.ts']);
      expect(config.format).toEqual(['esm']);
    });

    it('should not allow build without entry', () => {
      const builder = emptyRobustBuilder()
        .set('format', ['esm']);

      // This would be a type error:
      // builder.build();

      expect(builder.config().format).toEqual(['esm']);
    });

    it('should not allow build without format', () => {
      const builder = emptyRobustBuilder()
        .set('entry', ['src/index.ts']);

      // This would be a type error:
      // builder.build();

      expect(builder.config().entry).toEqual(['src/index.ts']);
    });
  });

  describe('Runtime Constraint Validation', () => {
    it('should throw when IIFE format is used with splitting', () => {
      expect(() => {
        robustBuilder()
          .set('entry', ['src/index.ts'])
          .set('format', ['iife'])
          .unsafeMerge({ splitting: true })
          .build();
      }).toThrow(BuilderConstraintError);

      expect(() => {
        robustBuilder()
          .set('entry', ['src/index.ts'])
          .set('format', ['iife'])
          .unsafeMerge({ splitting: true })
          .build();
      }).toThrow('Cannot enable splitting with IIFE format');
    });

    it('should throw when splitting is enabled without ESM format', () => {
      expect(() => {
        robustBuilder()
          .set('entry', ['src/index.ts'])
          .set('format', ['cjs'])
          .unsafeMerge({ splitting: true })
          .build();
      }).toThrow(BuilderConstraintError);

      expect(() => {
        robustBuilder()
          .set('entry', ['src/index.ts'])
          .set('format', ['cjs'])
          .unsafeMerge({ splitting: true })
          .build();
      }).toThrow('Code splitting requires ESM format');
    });

    it('should allow splitting with ESM format', () => {
      const config = robustBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['esm'])
        .merge({ splitting: true })
        .build();

      expect(config.splitting).toBe(true);
      expect(config.format).toEqual(['esm']);
    });

    it('should allow splitting with mixed formats including ESM', () => {
      const config = robustBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['cjs', 'esm'])
        .merge({ splitting: true })
        .build();

      expect(config.splitting).toBe(true);
      expect(config.format).toEqual(['cjs', 'esm']);
    });

    it('should throw when browser platform is used with shims', () => {
      expect(() => {
        robustBuilder()
          .set('entry', ['src/index.ts'])
          .set('format', ['esm'])
          .set('platform', 'browser')
          .unsafeMerge({ shims: true })
          .build();
      }).toThrow(BuilderConstraintError);

      expect(() => {
        robustBuilder()
          .set('entry', ['src/index.ts'])
          .set('format', ['esm'])
          .set('platform', 'browser')
          .unsafeMerge({ shims: true })
          .build();
      }).toThrow('Cannot use shims with browser platform');
    });

    it('should allow shims with node platform', () => {
      const config = robustBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['esm'])
        .set('platform', 'node')
        .merge({ shims: true })
        .build();

      expect(config.shims).toBe(true);
      expect(config.platform).toBe('node');
    });

    it('should throw when CLI product type skips node_modules bundling', () => {
      expect(() => {
        robustBuilder()
          .set('entry', ['src/index.ts'])
          .set('format', ['esm'])
          .unsafeMerge({
            productType: 'cli' as const,
            skipNodeModulesBundle: true,
          })
          .build();
      }).toThrow(BuilderConstraintError);

      expect(() => {
        robustBuilder()
          .set('entry', ['src/index.ts'])
          .set('format', ['esm'])
          .unsafeMerge({
            productType: 'cli' as const,
            skipNodeModulesBundle: true,
          })
          .build();
      }).toThrow('CLI tools should bundle dependencies');
    });

    it('should throw when standalone CLI has multiple formats', () => {
      expect(() => {
        robustBuilder()
          .set('entry', ['src/index.ts'])
          .set('format', ['cjs', 'esm'])
          .unsafeMerge({ productType: 'standalone-cli' as const })
          .build();
      }).toThrow(BuilderConstraintError);

      expect(() => {
        robustBuilder()
          .set('entry', ['src/index.ts'])
          .set('format', ['cjs', 'esm'])
          .unsafeMerge({ productType: 'standalone-cli' as const })
          .build();
      }).toThrow('Standalone CLI must have exactly one output format');
    });

    it('should allow standalone CLI with single format in array', () => {
      const config = robustBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['esm'])
        .merge({ productType: 'standalone-cli' as const })
        .build();

      expect(config.productType).toBe('standalone-cli');
      expect(config.format).toEqual(['esm']);
    });

    it('should allow standalone CLI with single format string', () => {
      const config = robustBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', 'esm')
        .merge({ productType: 'standalone-cli' as const })
        .build();

      expect(config.productType).toBe('standalone-cli');
      expect(config.format).toBe('esm');
    });

    it('should collect multiple constraint violations', () => {
      let error: BuilderConstraintError | undefined;

      try {
        robustBuilder()
          .set('entry', ['src/index.ts'])
          .set('format', ['iife'])
          .set('platform', 'browser')
          .unsafeMerge({
            splitting: true,
            shims: true,
          })
          .build();
      } catch (e) {
        if (e instanceof BuilderConstraintError) {
          error = e;
        }
      }

      expect(error).toBeDefined();
      expect(error!.violations.length).toBeGreaterThanOrEqual(2);
      expect(error!.violations.some(v => v.includes('Cannot enable splitting with IIFE format'))).toBe(true);
      expect(error!.violations.some(v => v.includes('Cannot use shims with browser platform'))).toBe(true);
    });
  });

  describe('Runtime Validation Toggle', () => {
    it('should allow disabling runtime checks', () => {
      // Should not throw even though constraint is violated
      const config = robustBuilder()
        .withoutRuntimeChecks()
        .set('entry', ['src/index.ts'])
        .set('format', ['iife'])
        .unsafeMerge({ splitting: true })
        .build();

      expect(config.format).toEqual(['iife']);
      expect(config.splitting).toBe(true);
    });

    it('should allow re-enabling runtime checks', () => {
      expect(() => {
        robustBuilder()
          .withoutRuntimeChecks()
          .withRuntimeChecks()
          .set('entry', ['src/index.ts'])
          .set('format', ['iife'])
          .unsafeMerge({ splitting: true })
          .build();
      }).toThrow(BuilderConstraintError);
    });

    it('should propagate runtime check flag through operations', () => {
      const builder = robustBuilder()
        .withoutRuntimeChecks()
        .set('entry', ['src/index.ts'])
        .set('format', ['esm']);

      // Should not throw
      const config = builder
        .unsafeMerge({
          format: ['iife'],
          splitting: true,
        })
        .build();

      expect(config.format).toEqual(['iife']);
    });
  });

  describe('Type Safety via Merge', () => {
    it('should allow compatible merge', () => {
      const config = robustBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['esm'])
        .merge({
          splitting: true, // ESM supports splitting
        })
        .build();

      expect(config.splitting).toBe(true);
    });

    // Note: The following test cases would fail at compile-time with type errors
    // They are included to document the expected type-level behavior

    // it('should prevent incompatible IIFE + splitting at type level', () => {
    //   robustBuilder()
    //     .set('entry', ['src/index.ts'])
    //     .set('format', ['iife'])
    //     .merge({
    //       splitting: true, // ❌ Type error: ConstraintViolation
    //     });
    // });

    // it('should prevent browser + shims at type level', () => {
    //   robustBuilder()
    //     .set('entry', ['src/index.ts'])
    //     .set('format', ['esm'])
    //     .set('platform', 'browser')
    //     .merge({
    //       shims: true, // ❌ Type error: ConstraintViolation
    //     });
    // });
  });

  describe('Fluent API', () => {
    it('should chain operations', () => {
      const config = emptyRobustBuilder()
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
      const config = robustBuilder()
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
      const config = robustBuilder()
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
      const config = robustBuilder()
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
      const config = robustBuilder()
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
      const config = robustBuilder()
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
      const step1 = emptyRobustBuilder();
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
      const original = robustBuilder();
      const modified = original.set('entry', ['src/index.ts']);

      expect(original.config().entry).toBeUndefined();
      expect(modified.config().entry).toEqual(['src/index.ts']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple entry formats', () => {
      const arrayEntry = emptyRobustBuilder()
        .set('entry', ['src/index.ts', 'src/cli.ts'])
        .set('format', ['esm'])
        .build();

      const objectEntry = emptyRobustBuilder()
        .set('entry', { main: 'src/index.ts', cli: 'src/cli.ts' })
        .set('format', ['esm'])
        .build();

      expect(arrayEntry.entry).toEqual(['src/index.ts', 'src/cli.ts']);
      expect(objectEntry.entry).toEqual({ main: 'src/index.ts', cli: 'src/cli.ts' });
    });

    it('should handle complex external patterns', () => {
      const config = robustBuilder()
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
      const config = robustBuilder()
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

  describe('Unsafe Merge', () => {
    it('should allow unsafe merge without type checking', () => {
      const config = robustBuilder()
        .set('entry', ['src/index.ts'])
        .set('format', ['esm'])
        .unsafeMerge({
          // Any configuration, bypasses type checking
          customOption: 'value',
        } as any)
        .config();

      expect(config.entry).toEqual(['src/index.ts']);
    });

    it('should still run runtime validation on unsafe merge by default', () => {
      expect(() => {
        robustBuilder()
          .set('entry', ['src/index.ts'])
          .set('format', ['iife'])
          .unsafeMerge({ splitting: true })
          .build();
      }).toThrow(BuilderConstraintError);
    });

    it('should skip runtime validation when disabled', () => {
      const config = robustBuilder()
        .withoutRuntimeChecks()
        .set('entry', ['src/index.ts'])
        .set('format', ['iife'])
        .unsafeMerge({ splitting: true })
        .build();

      expect(config.format).toEqual(['iife']);
      expect(config.splitting).toBe(true);
    });
  });
});
