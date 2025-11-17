import { describe, expect, it, beforeAll, mock, spyOn } from 'bun:test';
import {
  validateConfig,
  createValidatedConfig,
  withValidation,
  checkIncompatibilities,
  TsupOptionsSchema,
} from '../src/validation';
import type { Options } from 'tsup';

describe('Configuration Validation', () => {
  // Suppress console warnings during tests
  beforeAll(() => {
    spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('validateConfig', () => {
    it('should validate a simple valid configuration', () => {
      const config = {
        entry: 'src/index.ts',
        format: ['esm'],
        minify: true,
      };

      const result = validateConfig(config);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject(config);
      expect(result.errors).toBeUndefined();
    });

    it('should validate complex configuration', () => {
      const config = {
        entry: {
          main: 'src/index.ts',
          cli: 'src/cli.ts',
        },
        format: ['cjs', 'esm'],
        platform: 'node',
        target: 'node18',
        dts: {
          entry: 'src/index.ts',
          resolve: true,
        },
        external: ['react', 'react-dom'],
        sourcemap: 'inline',
        minify: true,
        treeshake: {
          preset: 'smallest',
          moduleSideEffects: false,
        },
      };

      const result = validateConfig(config);

      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should accept valid format options', () => {
      const formats: Array<'cjs' | 'esm' | 'iife'> = ['cjs', 'esm', 'iife'];

      formats.forEach(format => {
        const result = validateConfig({ format: [format] });
        expect(result.success).toBe(true);
      });
    });

    it('should accept valid platform options', () => {
      const platforms: Array<'node' | 'browser' | 'neutral'> = ['node', 'browser', 'neutral'];

      platforms.forEach(platform => {
        const result = validateConfig({ platform });
        expect(result.success).toBe(true);
      });
    });

    it('should accept valid sourcemap options', () => {
      const sourcemaps = [true, false, 'inline', 'external', 'hidden'];

      sourcemaps.forEach(sourcemap => {
        const result = validateConfig({ sourcemap });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Incompatibility Checks', () => {
    it('should reject IIFE format with code splitting', () => {
      const config = {
        format: ['iife'],
        splitting: true,
      };

      const result = validateConfig(config);

      expect(result.success).toBe(false);
      expect(result.errors?.[0].message).toContain('Code splitting is not supported with IIFE format');
    });

    it('should reject CJS-only with code splitting', () => {
      const config = {
        format: ['cjs'],
        splitting: true,
      };

      const result = validateConfig(config);

      expect(result.success).toBe(false);
      expect(result.errors?.[0].message).toContain('Code splitting requires ESM format');
    });

    it('should allow CJS+ESM with code splitting', () => {
      const config = {
        format: ['cjs', 'esm'],
        splitting: true,
      };

      const result = validateConfig(config);

      expect(result.success).toBe(true);
    });

    it('should reject browser platform with shims', () => {
      const config = {
        platform: 'browser',
        shims: true,
      };

      const result = validateConfig(config);

      expect(result.success).toBe(false);
      expect(result.errors?.[0].message).toContain('Node.js shims are not applicable for browser platform');
    });

    it('should reject dts-only mode with minification', () => {
      const config = {
        dts: {
          only: true,
        },
        minify: true,
      };

      const result = validateConfig(config);

      expect(result.success).toBe(false);
      expect(result.errors?.[0].message).toContain('Minification is not applicable in dts-only mode');
    });

    it('should reject dts-only mode with splitting', () => {
      const config = {
        dts: {
          only: true,
        },
        splitting: true,
      };

      const result = validateConfig(config);

      expect(result.success).toBe(false);
      expect(result.errors?.[0].message).toContain('Code splitting is not applicable in dts-only mode');
    });

    it('should reject conflicting external and noExternal', () => {
      const config = {
        external: ['react', 'lodash'],
        noExternal: ['react'],
      };

      const result = validateConfig(config);

      expect(result.success).toBe(false);
      expect(result.errors?.[0].message).toContain('Packages cannot be both external and not external: react');
    });

    it('should reject minification sub-options without main minify flag', () => {
      const config = {
        minify: false,
        minifyWhitespace: true,
        minifyIdentifiers: true,
      };

      const result = validateConfig(config);

      expect(result.success).toBe(false);
      expect(result.errors?.[0].message).toContain('Minification sub-options require minify to be enabled');
    });

    it('should reject globalName without IIFE format', () => {
      const config = {
        format: ['esm'],
        globalName: 'MyLib',
      };

      const result = validateConfig(config);

      expect(result.success).toBe(false);
      expect(result.errors?.[0].message).toContain('globalName is only applicable when using IIFE format');
    });

    it('should accept globalName with IIFE format', () => {
      const config = {
        format: ['iife'],
        globalName: 'MyLib',
      };

      const result = validateConfig(config);

      expect(result.success).toBe(true);
    });

    it('should reject empty onSuccess command', () => {
      const config = {
        watch: true,
        onSuccess: '  ',
      };

      const result = validateConfig(config);

      expect(result.success).toBe(false);
      expect(result.errors?.[0].message).toContain('onSuccess command cannot be empty');
    });

    it('should provide warning for ES target with Node platform', () => {
      const config = {
        platform: 'node',
        target: 'es2022',
      };

      const result = validateConfig(config);

      // This is a warning, not an error
      expect(result.success).toBe(true);
      expect(result.warnings?.[0].message).toContain('Consider using a Node.js-specific target');
    });

    it('should not warn for node target with Node platform', () => {
      const config = {
        platform: 'node',
        target: 'node18',
      };

      const result = validateConfig(config);

      expect(result.success).toBe(true);
      expect(result.warnings).toBeUndefined();
    });
  });

  describe('createValidatedConfig', () => {
    it('should return valid configuration', () => {
      const config = {
        entry: 'src/index.ts',
        format: ['esm'] as const,
      };

      const result = createValidatedConfig(config);

      expect(result).toMatchObject(config);
    });

    it('should throw on invalid configuration', () => {
      const config = {
        format: ['iife'] as const,
        splitting: true,
      };

      expect(() => createValidatedConfig(config)).toThrow('Invalid tsup configuration');
    });

    it('should log warnings but return config', () => {
      const consoleSpy = spyOn(console, 'warn');

      const config = {
        platform: 'node' as const,
        target: 'es2022',
      };

      const result = createValidatedConfig(config);

      expect(result).toMatchObject(config);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('withValidation', () => {
    it('should pass through valid configuration', () => {
      const config: Partial<Options> = {
        entry: ['src/index.ts'],
        format: ['esm'],
      };

      const result = withValidation(config);

      expect(result).toBe(config);
    });

    it('should throw on invalid configuration when VALIDATE_CONFIG is true', () => {
      process.env.VALIDATE_CONFIG = 'true';

      const config: Partial<Options> = {
        format: ['iife'],
        splitting: true,
      };

      expect(() => withValidation(config)).toThrow('Invalid tsup configuration');

      delete process.env.VALIDATE_CONFIG;
    });

    it('should skip validation in production by default', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const config: Partial<Options> = {
        format: ['iife'],
        splitting: true, // This is invalid
      };

      // Should not throw in production
      const result = withValidation(config);
      expect(result).toBe(config);

      process.env.NODE_ENV = originalEnv;
    });

    it('should validate in production if VALIDATE_CONFIG is true', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      process.env.VALIDATE_CONFIG = 'true';

      const config: Partial<Options> = {
        format: ['iife'],
        splitting: true,
      };

      expect(() => withValidation(config)).toThrow('Invalid tsup configuration');

      process.env.NODE_ENV = originalEnv;
      delete process.env.VALIDATE_CONFIG;
    });
  });

  describe('checkIncompatibilities', () => {
    it('should detect IIFE with splitting', () => {
      const issues = checkIncompatibilities({
        format: ['iife'],
        splitting: true,
      });

      expect(issues).toContain('IIFE format does not support code splitting');
    });

    it('should detect browser with shims', () => {
      const issues = checkIncompatibilities({
        platform: 'browser',
        shims: true,
      });

      expect(issues).toContain('Node.js shims should not be used with browser platform');
    });

    it('should detect dts-only issues', () => {
      const issues = checkIncompatibilities({
        dts: {
          only: true,
        },
        minify: true,
        splitting: true,
      });

      expect(issues).toContain('Minification not needed in dts-only mode');
      expect(issues).toContain('Code splitting not applicable in dts-only mode');
    });

    it('should return empty array for valid config', () => {
      const issues = checkIncompatibilities({
        entry: ['src/index.ts'],
        format: ['esm', 'cjs'],
        dts: true,
      });

      expect(issues).toEqual([]);
    });
  });

  describe('Zod Schema Direct Tests', () => {
    it('should parse entry as string', () => {
      const result = TsupOptionsSchema.safeParse({
        entry: 'src/index.ts',
      });

      expect(result.success).toBe(true);
    });

    it('should parse entry as array', () => {
      const result = TsupOptionsSchema.safeParse({
        entry: ['src/index.ts', 'src/cli.ts'],
      });

      expect(result.success).toBe(true);
    });

    it('should parse entry as object', () => {
      const result = TsupOptionsSchema.safeParse({
        entry: {
          main: 'src/index.ts',
          cli: 'src/cli.ts',
        },
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid format', () => {
      const result = TsupOptionsSchema.safeParse({
        format: ['invalid'],
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid platform', () => {
      const result = TsupOptionsSchema.safeParse({
        platform: 'invalid',
      });

      expect(result.success).toBe(false);
    });

    it('should parse treeshake options', () => {
      const result = TsupOptionsSchema.safeParse({
        treeshake: {
          preset: 'smallest',
          moduleSideEffects: false,
        },
      });

      expect(result.success).toBe(true);
    });

    it('should parse dts options', () => {
      const result = TsupOptionsSchema.safeParse({
        dts: {
          entry: 'src/index.ts',
          resolve: true,
          only: false,
        },
      });

      expect(result.success).toBe(true);
    });
  });
});