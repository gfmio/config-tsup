import { describe, expect, it } from 'bun:test';

import * as partials from '../src/partials.ts';
import * as presets from '../src/presets.ts';

describe('Standalone CLI Configurations', () => {
  describe('Standalone vs Regular CLI Differences', () => {
    it('regular CLI should have skipNodeModulesBundle: true', () => {
      expect(partials.cli.skipNodeModulesBundle).toBe(true);
    });

    it('standalone CLI should have skipNodeModulesBundle: false', () => {
      expect(partials.standaloneCli.skipNodeModulesBundle).toBe(false);
    });

    it('standalone CLI should have empty external array', () => {
      expect(partials.standaloneCli.external).toEqual([]);
    });

    it('regular node CLI preset should externalize dependencies', () => {
      expect(presets.nodeCli.skipNodeModulesBundle).toBe(true);
      // External from base is ALL_EXTERNALS
      expect(presets.nodeCli.external).toBeDefined();
      expect(Array.isArray(presets.nodeCli.external)).toBe(true);
      expect(presets.nodeCli.external?.length).toBeGreaterThan(0);
    });

    it('standalone node CLI preset should bundle dependencies', () => {
      expect(presets.standaloneNodeCli.skipNodeModulesBundle).toBe(false);
      // External should be empty array from standaloneCli partial
      expect(presets.standaloneNodeCli.external).toEqual([]);
    });
  });

  describe('Standalone Node CLI Presets', () => {
    it('should have ESM standalone Node CLI', () => {
      expect(presets.esmStandaloneNodeCli).toBeDefined();
      expect(presets.esmStandaloneNodeCli.format).toEqual([
        'esm',
      ]);
      expect(presets.esmStandaloneNodeCli.platform).toBe('node');
      expect(presets.esmStandaloneNodeCli.skipNodeModulesBundle).toBe(false);
      expect(presets.esmStandaloneNodeCli.external).toEqual([]);
      expect(presets.esmStandaloneNodeCli.minify).toBe(true);
      expect(presets.esmStandaloneNodeCli.shims).toBe(true);
    });

    it('should have CJS standalone Node CLI', () => {
      expect(presets.cjsStandaloneNodeCli).toBeDefined();
      expect(presets.cjsStandaloneNodeCli.format).toEqual([
        'cjs',
      ]);
      expect(presets.cjsStandaloneNodeCli.platform).toBe('node');
      expect(presets.cjsStandaloneNodeCli.skipNodeModulesBundle).toBe(false);
      expect(presets.cjsStandaloneNodeCli.external).toEqual([]);
      expect(presets.cjsStandaloneNodeCli.minify).toBe(true);
      expect(presets.cjsStandaloneNodeCli.cjsInterop).toBe(true);
    });

    it('default standaloneNodeCli should be ESM', () => {
      expect(presets.standaloneNodeCli).toBeDefined();
      expect(presets.standaloneNodeCli.format).toEqual([
        'esm',
      ]);
    });
  });

  describe('Standalone Bun CLI Presets', () => {
    it('should have ESM standalone Bun CLI', () => {
      expect(presets.esmStandaloneBunCli).toBeDefined();
      expect(presets.esmStandaloneBunCli.format).toEqual([
        'esm',
      ]);
      expect(presets.esmStandaloneBunCli.platform).toBe('neutral');
      expect(presets.esmStandaloneBunCli.skipNodeModulesBundle).toBe(false);
      expect(presets.esmStandaloneBunCli.external).toEqual([]);
      expect(presets.esmStandaloneBunCli.minify).toBe(true);
      expect(presets.esmStandaloneBunCli.shims).toBe(true);
    });

    it('should have CJS standalone Bun CLI', () => {
      expect(presets.cjsStandaloneBunCli).toBeDefined();
      expect(presets.cjsStandaloneBunCli.format).toEqual([
        'cjs',
      ]);
      expect(presets.cjsStandaloneBunCli.platform).toBe('neutral');
      expect(presets.cjsStandaloneBunCli.skipNodeModulesBundle).toBe(false);
      expect(presets.cjsStandaloneBunCli.external).toEqual([]);
      expect(presets.cjsStandaloneBunCli.minify).toBe(true);
      expect(presets.cjsStandaloneBunCli.cjsInterop).toBe(true);
    });

    it('default standaloneBunCli should be ESM', () => {
      expect(presets.standaloneBunCli).toBeDefined();
      expect(presets.standaloneBunCli.format).toEqual([
        'esm',
      ]);
    });
  });

  describe('Shebang Handling', () => {
    it('all Node CLI variants should have Node shebang', () => {
      const nodeCliVariants = [
        presets.nodeCli,
        presets.esmNodeCli,
        presets.cjsNodeCli,
        presets.standaloneNodeCli,
        presets.esmStandaloneNodeCli,
        presets.cjsStandaloneNodeCli,
      ];

      for (const variant of nodeCliVariants) {
        expect(typeof variant.esbuildOptions).toBe('function');
      }
    });

    it('all Bun CLI variants should have Bun shebang', () => {
      const bunCliVariants = [
        presets.bunCli,
        presets.esmBunCli,
        presets.cjsBunCli,
        presets.standaloneBunCli,
        presets.esmStandaloneBunCli,
        presets.cjsStandaloneBunCli,
      ];

      for (const variant of bunCliVariants) {
        expect(typeof variant.esbuildOptions).toBe('function');
      }
    });
  });
});
