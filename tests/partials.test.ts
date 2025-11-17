import { describe, expect, it } from 'bun:test';

import { ALL_EXTERNALS, DIST, ES2022, NODE_LTS } from '../src/constants.ts';
import * as partials from '../src/partials.ts';

describe('Partial Configurations', () => {
  describe('Clean Options', () => {
    it('should have clean enabled', () => {
      expect(partials.clean).toEqual({
        clean: true,
      });
    });

    it('should have clean disabled', () => {
      expect(partials.noClean).toEqual({
        clean: false,
      });
    });
  });

  describe('Minification Options', () => {
    it('should have minify enabled', () => {
      expect(partials.minify).toEqual({
        minify: true,
      });
    });

    it('should have minify disabled', () => {
      expect(partials.noMinify).toEqual({
        minify: false,
      });
    });

    it('should have whitespace minification', () => {
      expect(partials.minifyWhitespace).toEqual({
        minifyWhitespace: true,
      });
    });

    it('should have no whitespace minification', () => {
      expect(partials.noMinifyWhitespace).toEqual({
        minifyWhitespace: false,
      });
    });

    it('should have identifier minification', () => {
      expect(partials.minifyIdentifiers).toEqual({
        minifyIdentifiers: true,
      });
    });

    it('should have no identifier minification', () => {
      expect(partials.noMinifyIdentifiers).toEqual({
        minifyIdentifiers: false,
      });
    });

    it('should have syntax minification', () => {
      expect(partials.minifySyntax).toEqual({
        minifySyntax: true,
      });
    });

    it('should have no syntax minification', () => {
      expect(partials.noMinifySyntax).toEqual({
        minifySyntax: false,
      });
    });

    it('should keep names', () => {
      expect(partials.keepNames).toEqual({
        keepNames: true,
      });
    });

    it('should not keep names', () => {
      expect(partials.noKeepNames).toEqual({
        keepNames: false,
      });
    });

    it('should have debug minification preset', () => {
      expect(partials.debugMinify).toMatchObject({
        keepNames: true,
        minify: true,
        minifyIdentifiers: false, // noMinifyIdentifiers
        minifySyntax: true,
        minifyWhitespace: true, // includes minifyWhitespace
      });
    });

    it('should have production minification preset', () => {
      expect(partials.productionMinify).toMatchObject({
        minify: true,
        minifyIdentifiers: true,
        minifySyntax: true,
        minifyWhitespace: true,
        // productionMinify doesn't include keepNames or noKeepNames
      });
    });

    it('should have safe minification preset', () => {
      expect(partials.safeMinify).toMatchObject({
        keepNames: true,
        minify: true,
        minifyIdentifiers: false, // noMinifyIdentifiers
        minifySyntax: false, // noMinifySyntax
        minifyWhitespace: true,
      });
    });
  });

  describe('Sourcemap Options', () => {
    it('should have sourcemap enabled', () => {
      expect(partials.sourcemap).toEqual({
        sourcemap: true,
      });
    });

    it('should have inline sourcemap', () => {
      expect(partials.sourcemapInline).toEqual({
        sourcemap: 'inline',
      });
    });

    it('should have sourcemap disabled', () => {
      expect(partials.noSourcemap).toEqual({
        sourcemap: false,
      });
    });
  });

  describe('Splitting Options', () => {
    it('should have splitting enabled', () => {
      expect(partials.splitting).toEqual({
        splitting: true,
      });
    });

    it('should have splitting disabled', () => {
      expect(partials.noSplitting).toEqual({
        splitting: false,
      });
    });
  });

  describe('Treeshake Options', () => {
    it('should have treeshake enabled', () => {
      expect(partials.treeshake).toEqual({
        treeshake: true,
      });
    });

    it('should have treeshake disabled', () => {
      expect(partials.noTreeshake).toEqual({
        treeshake: false,
      });
    });
  });

  describe('DTS Options', () => {
    it('should have dts enabled', () => {
      expect(partials.dts).toEqual({
        dts: true,
      });
    });

    it('should have dts disabled', () => {
      expect(partials.noDts).toEqual({
        dts: false,
      });
    });
  });

  describe('Shims Options', () => {
    it('should have shims enabled', () => {
      expect(partials.shims).toEqual({
        shims: true,
      });
    });

    it('should have shims disabled', () => {
      expect(partials.noShims).toEqual({
        shims: false,
      });
    });
  });

  describe('CJS Interop Options', () => {
    it('should have cjsInterop enabled', () => {
      expect(partials.cjsInterop).toEqual({
        cjsInterop: true,
      });
    });

    it('should have cjsInterop disabled', () => {
      expect(partials.noCjsInterop).toEqual({
        cjsInterop: false,
      });
    });
  });

  describe('Skip Node Modules Bundle Options', () => {
    it('should have skipNodeModulesBundle enabled', () => {
      expect(partials.skipNodeModulesBundle).toEqual({
        skipNodeModulesBundle: true,
      });
    });

    it('should have skipNodeModulesBundle disabled', () => {
      expect(partials.noSkipNodeModulesBundle).toEqual({
        skipNodeModulesBundle: false,
      });
    });
  });

  describe('Base Configuration', () => {
    it('should have correct base configuration', () => {
      expect(partials.base).toMatchObject({
        clean: true,
        external: ALL_EXTERNALS,
        minify: false,
        outDir: DIST,
        target: ES2022,
        treeshake: true,
      });
    });
  });

  describe('Format Partials', () => {
    it('should have cjs format', () => {
      expect(partials.cjs).toMatchObject({
        cjsInterop: true,
        format: [
          'cjs',
        ],
      });
      // Has banner function for USE_STRICT
      expect(typeof partials.cjs.esbuildOptions).toBe('function');
    });

    it('should have cjs only format', () => {
      expect(partials.cjsOnly).toMatchObject({
        cjsInterop: true,
        dts: false,
        format: [
          'cjs',
        ],
      });
      expect(typeof partials.cjsOnly.esbuildOptions).toBe('function');
    });

    it('should have esm format', () => {
      expect(partials.esm).toEqual({
        format: [
          'esm',
        ],
      });
    });

    it('should have esm only format', () => {
      expect(partials.esmOnly).toMatchObject({
        dts: false,
        format: [
          'esm',
        ],
      });
    });

    it('should have iife format', () => {
      expect(partials.iife).toMatchObject({
        dts: false,
        format: [
          'iife',
        ],
      });
      // Has banner function for USE_STRICT
      expect(typeof partials.iife.esbuildOptions).toBe('function');
    });

    it('should have dts only format', () => {
      expect(partials.dtsOnly).toEqual({
        dts: {
          only: true,
        },
        format: [
          'esm',
        ], // dtsOnly sets format to esm
        sourcemap: false,
        // Note: splitting is not explicitly set in dtsOnly
      });
    });
  });

  describe('Platform Partials', () => {
    it('should have browser platform', () => {
      expect(partials.browser).toEqual({
        platform: 'browser',
        shims: false, // Browser doesn't need Node.js shims
        target: ES2022,
      });
    });

    it('should have node platform', () => {
      expect(partials.node).toEqual({
        platform: 'node',
        target: NODE_LTS,
      });
    });

    it('should have neutral platform', () => {
      expect(partials.neutral).toEqual({
        platform: 'neutral',
      });
    });

    it('should have isomorphic as alias for neutral', () => {
      expect(partials.isomorphic).toBe(partials.neutral);
    });
  });

  describe('Environment Partials', () => {
    it('should have development configuration', () => {
      expect(partials.development).toMatchObject({
        define: {
          'process.env.NODE_ENV': '"development"',
        },
        minify: false,
        sourcemap: true,
      });
    });

    it('should have production configuration', () => {
      expect(partials.production).toMatchObject({
        define: {
          'process.env.NODE_ENV': '"production"',
        },
        keepNames: false,
        minify: true,
        sourcemap: false,
      });
    });
  });

  describe('Project Type Partials', () => {
    it('should have library configuration', () => {
      expect(partials.library).toEqual({
        external: ALL_EXTERNALS,
        skipNodeModulesBundle: true, // Libraries should not bundle dependencies
      });
    });

    it('should have cli configuration', () => {
      expect(partials.cli).toMatchObject({
        keepNames: true,
        minify: true,
        shims: true,
        target: NODE_LTS,
      });
      // esbuildOptions is a function from banner()
      expect(typeof partials.cli.esbuildOptions).toBe('function');
    });

    it('should have nodeCli that is just cli', () => {
      // nodeCli is just merge(cli) which returns cli
      expect(partials.nodeCli).toMatchObject({
        keepNames: true,
        minify: true,
        shims: true,
        target: NODE_LTS,
      });
      expect(typeof partials.nodeCli.esbuildOptions).toBe('function');
    });

    it('should have esmNodeCli that is just cli', () => {
      // esmNodeCli is also just merge(cli)
      expect(partials.esmNodeCli).toMatchObject({
        keepNames: true,
        minify: true,
        shims: true,
        target: NODE_LTS,
      });
      expect(typeof partials.esmNodeCli.esbuildOptions).toBe('function');
    });

    it('should have cjsNodeCli configuration', () => {
      expect(partials.cjsNodeCli).toMatchObject({
        keepNames: true,
        minify: true,
        shims: true,
        target: NODE_LTS,
      });
      // Has its own banner function
      expect(typeof partials.cjsNodeCli.esbuildOptions).toBe('function');
    });

    it('should have bunCli configuration', () => {
      expect(partials.bunCli).toMatchObject({
        keepNames: true,
        minify: true,
        shims: true,
        target: NODE_LTS,
      });
      // Has its own banner function for BUN_SHEBANG
      expect(typeof partials.bunCli.esbuildOptions).toBe('function');
    });

    it('should have esmBunCli that is just bunCli', () => {
      // esmBunCli is merge(bunCli)
      expect(partials.esmBunCli).toMatchObject({
        keepNames: true,
        minify: true,
        shims: true,
        target: NODE_LTS,
      });
      expect(typeof partials.esmBunCli.esbuildOptions).toBe('function');
    });

    it('should have cjsBunCli configuration', () => {
      expect(partials.cjsBunCli).toMatchObject({
        keepNames: true,
        minify: true,
        shims: true,
        target: NODE_LTS,
      });
      // Has its own banner function
      expect(typeof partials.cjsBunCli.esbuildOptions).toBe('function');
    });
  });

  describe('Bundle Analyzer', () => {
    it('should have analyze configuration', () => {
      expect(partials.analyzeConfig).toMatchObject({
        metafile: true,
      });
      expect(typeof partials.analyzeConfig.onSuccess).toBe('function');
    });
  });
});
