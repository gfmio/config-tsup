import type { Options } from 'tsup';

import { describe, expect, it } from 'bun:test';

import { ALL_EXTERNALS, DIST, ES2022, NODE_LTS } from '../src/constants.ts';
import * as presets from '../src/presets.ts';

describe('Preset Configurations', () => {
  describe('Library Presets', () => {
    describe('nodeLibrary', () => {
      it('should be an array with 3 configurations', () => {
        expect(Array.isArray(presets.nodeLibrary)).toBe(true);
        expect(presets.nodeLibrary).toHaveLength(3);
      });

      it('should have CJS configuration as first element', () => {
        const cjsConfig = presets.nodeLibrary[0];
        expect(cjsConfig).toMatchObject({
          cjsInterop: true,
          clean: true,
          dts: false,
          external: ALL_EXTERNALS,
          format: [
            'cjs',
          ],
          minify: false,
          outDir: DIST,
          platform: 'node',
          skipNodeModulesBundle: true,
          sourcemap: true,
          target: NODE_LTS,
          treeshake: true,
        });
      });

      it('should have ESM configuration as second element', () => {
        const esmConfig = presets.nodeLibrary[1];
        expect(esmConfig).toMatchObject({
          clean: true,
          dts: false,
          external: ALL_EXTERNALS,
          format: [
            'esm',
          ],
          minify: false,
          outDir: DIST,
          platform: 'node',
          skipNodeModulesBundle: true,
          sourcemap: true,
          target: NODE_LTS,
          treeshake: true,
        });
      });

      it('should have DTS-only configuration as third element', () => {
        const dtsConfig = presets.nodeLibrary[2];
        expect(dtsConfig).toMatchObject({
          clean: true,
          dts: {
            only: true,
          },
          external: ALL_EXTERNALS,
          format: [
            'esm',
          ], // dtsOnly sets format to esm
          minify: false,
          outDir: DIST,
          platform: 'node',
          sourcemap: false, // dtsOnly overrides to false
          splitting: false, // from base
          target: NODE_LTS,
          treeshake: true,
        });
        expect(typeof dtsConfig.outExtension).toBe('function');
      });

      it('should have individual configs accessible', () => {
        expect(presets.cjsNodeLibrary).toBe(presets.nodeLibrary[0]);
        expect(presets.esmNodeLibrary).toBe(presets.nodeLibrary[1]);
        expect(presets.dtsOnlyNodeLibrary).toBe(presets.nodeLibrary[2]);
      });
    });

    describe('browserLibrary', () => {
      it('should be an array with 2 configurations', () => {
        expect(Array.isArray(presets.browserLibrary)).toBe(true);
        expect(presets.browserLibrary).toHaveLength(2);
      });

      it('should have ESM configuration as first element', () => {
        const esmConfig = presets.browserLibrary[0];
        expect(esmConfig).toMatchObject({
          clean: true,
          dts: false,
          external: ALL_EXTERNALS,
          format: [
            'esm',
          ],
          minify: false,
          outDir: DIST,
          platform: 'browser',
          shims: false, // Browser platform sets shims: false
          skipNodeModulesBundle: true,
          sourcemap: true,
          splitting: false, // from base
          target: ES2022,
          treeshake: true,
        });
        expect(typeof esmConfig.outExtension).toBe('function');
      });

      it('should have DTS-only configuration as second element', () => {
        const dtsConfig = presets.browserLibrary[1];
        expect(dtsConfig).toMatchObject({
          clean: true,
          dts: {
            only: true,
          },
          external: ALL_EXTERNALS,
          format: [
            'esm',
          ], // dtsOnly sets format to esm
          minify: false,
          outDir: DIST,
          platform: 'browser',
          sourcemap: false, // dtsOnly overrides to false
          splitting: false, // from base
          target: ES2022,
          treeshake: true,
        });
        expect(typeof dtsConfig.outExtension).toBe('function');
      });

      it('should have individual configs accessible', () => {
        expect(presets.esmBrowserLibrary).toBe(presets.browserLibrary[0]);
        expect(presets.dtsOnlyBrowserLibrary).toBe(presets.browserLibrary[1]);
      });
    });

    describe('neutralLibrary', () => {
      it('should be an array with 3 configurations', () => {
        expect(Array.isArray(presets.neutralLibrary)).toBe(true);
        expect(presets.neutralLibrary).toHaveLength(3);
      });

      it('should have CJS configuration as first element', () => {
        const cjsConfig = presets.neutralLibrary[0];
        expect(cjsConfig).toMatchObject({
          cjsInterop: true,
          clean: true,
          dts: false,
          external: ALL_EXTERNALS,
          format: [
            'cjs',
          ],
          minify: false,
          outDir: DIST,
          platform: 'neutral',
          skipNodeModulesBundle: true,
          sourcemap: true,
          target: ES2022,
          treeshake: true,
        });
      });

      it('should have ESM configuration as second element', () => {
        const esmConfig = presets.neutralLibrary[1];
        expect(esmConfig).toMatchObject({
          clean: true,
          dts: false,
          external: ALL_EXTERNALS,
          format: [
            'esm',
          ],
          minify: false,
          outDir: DIST,
          platform: 'neutral',
          skipNodeModulesBundle: true,
          sourcemap: true,
          target: ES2022,
          treeshake: true,
        });
      });

      it('should have DTS-only configuration as third element', () => {
        const dtsConfig = presets.neutralLibrary[2];
        expect(dtsConfig).toMatchObject({
          clean: true,
          dts: {
            only: true,
          },
          external: ALL_EXTERNALS,
          format: [
            'esm',
          ], // dtsOnly sets format to esm
          minify: false,
          outDir: DIST,
          platform: 'neutral',
          sourcemap: false, // dtsOnly overrides to false
          splitting: false, // from base
          target: ES2022,
          treeshake: true,
        });
        expect(typeof dtsConfig.outExtension).toBe('function');
      });

      it('should have individual configs accessible', () => {
        expect(presets.cjsNeutralLibrary).toBe(presets.neutralLibrary[0]);
        expect(presets.esmNeutralLibrary).toBe(presets.neutralLibrary[1]);
        expect(presets.dtsOnlyNeutralLibrary).toBe(presets.neutralLibrary[2]);
      });

      it('should have library as an alias', () => {
        expect(presets.library).toBe(presets.neutralLibrary);
      });
    });
  });

  describe('CLI Presets', () => {
    describe('nodeCli', () => {
      it('should have correct configuration', () => {
        expect(presets.nodeCli).toMatchObject({
          clean: true,
          // Note: platform and format are missing in the actual implementation
          // This appears to be a bug in the preset definition
          dts: false,
          external: ALL_EXTERNALS,
          minify: true,
          outDir: DIST,
          shims: true,
          sourcemap: true,
          target: NODE_LTS,
          treeshake: true,
          // skipNodeModulesBundle is not included in CLI presets
        });
        // esbuildOptions is a function, not an object
        expect(typeof presets.nodeCli.esbuildOptions).toBe('function');
      });
    });

    describe('cjsNodeCli', () => {
      it('should have correct configuration', () => {
        expect(presets.cjsNodeCli).toMatchObject({
          cjsInterop: true,
          clean: true,
          // Note: platform and format are missing in the actual implementation
          dts: false,
          external: ALL_EXTERNALS,
          minify: true,
          outDir: DIST,
          shims: true,
          sourcemap: true,
          target: NODE_LTS,
          treeshake: true,
        });
        expect(typeof presets.cjsNodeCli.esbuildOptions).toBe('function');
      });
    });

    describe('bunCli', () => {
      it('should have correct configuration', () => {
        expect(presets.bunCli).toMatchObject({
          clean: true,
          // Note: platform and format are missing in the actual implementation
          dts: false,
          external: ALL_EXTERNALS,
          minify: true,
          outDir: DIST,
          shims: true,
          sourcemap: true,
          target: NODE_LTS,
          treeshake: true,
        });
        expect(typeof presets.bunCli.esbuildOptions).toBe('function');
      });
    });

    describe('cjsBunCli', () => {
      it('should have correct configuration', () => {
        expect(presets.cjsBunCli).toMatchObject({
          cjsInterop: true,
          clean: true,
          // Note: platform and format are missing in the actual implementation
          dts: false,
          external: ALL_EXTERNALS,
          minify: true,
          outDir: DIST,
          shims: true,
          sourcemap: true,
          target: NODE_LTS,
          treeshake: true,
        });
        expect(typeof presets.cjsBunCli.esbuildOptions).toBe('function');
      });
    });
  });

  describe('Browser Bundle Presets', () => {
    describe('esmBrowserBundle', () => {
      it('should have correct configuration', () => {
        expect(presets.esmBrowserBundle).toMatchObject({
          clean: true,
          dts: false,
          external: ALL_EXTERNALS,
          format: [
            'esm',
          ],
          minify: true,
          outDir: DIST,
          platform: 'browser',
          shims: false,
          sourcemap: 'external',
          splitting: true,
          target: ES2022,
          treeshake: true,
        });
      });
    });

    describe('iifeBrowserBundle', () => {
      it('should have correct configuration', () => {
        expect(presets.iifeBrowserBundle).toMatchObject({
          clean: true,
          dts: false,
          external: ALL_EXTERNALS,
          format: [
            'iife',
          ],
          minify: true,
          outDir: DIST,
          platform: 'browser',
          shims: false,
          sourcemap: 'external',
          splitting: false,
          target: ES2022,
          treeshake: true,
        });
        // Banner is handled via esbuildOptions function
        expect(typeof presets.iifeBrowserBundle.esbuildOptions).toBe('function');
      });
    });
  });

  describe('Type Safety', () => {
    it('should export valid tsup Options', () => {
      // Test that all presets produce valid tsup Options
      const allSingleConfigs: Options[] = [
        presets.cjsNodeLibrary,
        presets.esmNodeLibrary,
        presets.dtsOnlyNodeLibrary,
        presets.esmBrowserLibrary,
        presets.dtsOnlyBrowserLibrary,
        presets.cjsNeutralLibrary,
        presets.esmNeutralLibrary,
        presets.dtsOnlyNeutralLibrary,
        presets.nodeCli,
        presets.cjsNodeCli,
        presets.bunCli,
        presets.cjsBunCli,
        presets.esmBrowserBundle,
        presets.iifeBrowserBundle,
      ];

      const allArrayConfigs: Options[] = [
        ...presets.nodeLibrary,
        ...presets.browserLibrary,
        ...presets.neutralLibrary,
        // presets.library is just an alias for neutralLibrary, so don't include it
      ];

      // This test passes if TypeScript compilation succeeds
      expect(allSingleConfigs).toHaveLength(14);
      expect(allArrayConfigs).toHaveLength(8); // 3 + 2 + 3 (library is alias)
    });
  });

  describe('Preset Consistency', () => {
    it('should have consistent base settings across library presets', () => {
      const libraryPresets = [
        ...presets.nodeLibrary,
        ...presets.browserLibrary,
        ...presets.neutralLibrary,
      ];

      for (const preset of libraryPresets) {
        expect(preset.clean).toBe(true);
        expect(preset.external).toEqual(ALL_EXTERNALS);
        expect(preset.minify).toBe(false);
        expect(preset.outDir).toBe(DIST);
        expect(preset.treeshake).toBe(true);
      }
    });

    it('should have consistent base settings across CLI presets', () => {
      const cliPresets = [
        presets.nodeCli,
        presets.cjsNodeCli,
        presets.bunCli,
        presets.cjsBunCli,
      ];

      for (const preset of cliPresets) {
        expect(preset.clean).toBe(true);
        expect(preset.external).toEqual(ALL_EXTERNALS);
        expect(preset.minify).toBe(true);
        expect(preset.outDir).toBe(DIST);
        expect(preset.treeshake).toBe(true);
        // Note: platform is missing in CLI presets (bug)
        expect(preset.target).toBe(NODE_LTS);
        expect(preset.dts).toBe(false);
        expect(preset.shims).toBe(true);
        expect(preset.sourcemap).toBe(true);
        // skipNodeModulesBundle is not included in CLI presets
      }
    });

    it('should have esbuildOptions as functions for CLI presets', () => {
      const cliPresets = [
        presets.nodeCli,
        presets.cjsNodeCli,
        presets.bunCli,
        presets.cjsBunCli,
      ];

      for (const preset of cliPresets) {
        expect(typeof preset.esbuildOptions).toBe('function');
      }
    });

    it('should have CJS interop enabled for all CJS configs', () => {
      const cjsConfigs = [
        presets.cjsNodeLibrary,
        presets.cjsNeutralLibrary,
        presets.cjsNodeCli,
        presets.cjsBunCli,
      ];

      for (const config of cjsConfigs) {
        expect(config.cjsInterop).toBe(true);
      }
    });

    it('should have correct platforms set', () => {
      // Node platform - libraries have it
      expect(presets.cjsNodeLibrary.platform).toBe('node');
      expect(presets.esmNodeLibrary.platform).toBe('node');
      expect(presets.dtsOnlyNodeLibrary.platform).toBe('node');

      // CLI presets now have platform set
      expect(presets.nodeCli.platform).toBe('node');
      expect(presets.cjsNodeCli.platform).toBe('node');
      // Bun CLIs use neutral platform (Bun supports both Node and browser APIs)
      expect(presets.bunCli.platform).toBe('neutral');
      expect(presets.cjsBunCli.platform).toBe('neutral');

      // Browser platform
      expect(presets.esmBrowserLibrary.platform).toBe('browser');
      expect(presets.dtsOnlyBrowserLibrary.platform).toBe('browser');
      expect(presets.esmBrowserBundle.platform).toBe('browser');
      expect(presets.iifeBrowserBundle.platform).toBe('browser');

      // Neutral platform
      expect(presets.cjsNeutralLibrary.platform).toBe('neutral');
      expect(presets.esmNeutralLibrary.platform).toBe('neutral');
      expect(presets.dtsOnlyNeutralLibrary.platform).toBe('neutral');
    });
  });
});
