import { describe, expect, it } from 'bun:test';
import { TsupConfigBuilder, tsupBuilder, quickPresets } from '../src/builder';
import { ALL_EXTERNALS, NODE_LTS, ES2022, NODE_SHEBANG, BUN_SHEBANG } from '../src/constants';

describe('TsupConfigBuilder', () => {
  describe('Basic Configuration', () => {
    it('should create a builder with default config', () => {
      const config = tsupBuilder().build();

      expect(config).toMatchObject({
        clean: true,
        outDir: 'dist',
        sourcemap: true,
        target: 'es2022',
        treeshake: true,
      });
    });

    it('should set entry points', () => {
      const config = tsupBuilder()
        .entry('src/index.ts')
        .build();

      expect(config.entry).toEqual(['src/index.ts']);
    });

    it('should handle multiple entry points', () => {
      const config = tsupBuilder()
        .entry(['src/index.ts', 'src/cli.ts'])
        .build();

      expect(config.entry).toEqual(['src/index.ts', 'src/cli.ts']);
    });

    it('should handle named entry points', () => {
      const entries = {
        main: 'src/index.ts',
        cli: 'src/cli.ts',
      };
      const config = tsupBuilder()
        .entry(entries)
        .build();

      expect(config.entry).toEqual(entries);
    });
  });

  describe('Format Configuration', () => {
    it('should set single format', () => {
      const config = tsupBuilder()
        .format('esm')
        .build();

      expect(config.format).toEqual(['esm']);
    });

    it('should set multiple formats', () => {
      const config = tsupBuilder()
        .format(['cjs', 'esm'])
        .build();

      expect(config.format).toEqual(['cjs', 'esm']);
      expect(config.cjsInterop).toBe(true);
    });

    it('should use dualFormat shorthand', () => {
      const config = tsupBuilder()
        .dualFormat()
        .build();

      expect(config.format).toEqual(['cjs', 'esm']);
      expect(config.cjsInterop).toBe(true);
    });

    it('should auto-apply cjsInterop for CJS format', () => {
      const config = tsupBuilder()
        .format('cjs')
        .build();

      expect(config.cjsInterop).toBe(true);
    });
  });

  describe('Platform Configuration', () => {
    it('should set node platform with correct defaults', () => {
      const config = tsupBuilder()
        .platform('node')
        .build();

      expect(config.platform).toBe('node');
      expect(config.target).toBe(NODE_LTS);
    });

    it('should set browser platform with correct defaults', () => {
      const config = tsupBuilder()
        .platform('browser')
        .build();

      expect(config.platform).toBe('browser');
      expect(config.target).toBe(ES2022);
      expect(config.shims).toBe(false);
    });

    it('should set neutral platform', () => {
      const config = tsupBuilder()
        .platform('neutral')
        .build();

      expect(config.platform).toBe('neutral');
    });
  });

  describe('Library Configuration', () => {
    it('should configure as library', () => {
      const config = tsupBuilder()
        .asLibrary()
        .build();

      expect(config.external).toEqual(ALL_EXTERNALS);
      expect(config.skipNodeModulesBundle).toBe(true);
      expect(config.minify).toBe(false);
    });

    it('should combine library with types and dual format', () => {
      const config = tsupBuilder()
        .asLibrary()
        .dualFormat()
        .withTypes()
        .build();

      expect(config.external).toEqual(ALL_EXTERNALS);
      expect(config.format).toEqual(['cjs', 'esm']);
      expect(config.dts).toBe(true);
    });
  });

  describe('CLI Configuration', () => {
    it('should configure as Node.js CLI', () => {
      const config = tsupBuilder()
        .asCli('node')
        .build();

      expect(config.format).toEqual(['esm']);
      expect(config.dts).toBe(false);
      expect(config.minify).toBe(true);
      expect(config.keepNames).toBe(true);
      expect(config.shims).toBe(true);
      expect(config.platform).toBe('node');
    });

    it('should configure as Bun CLI', () => {
      const config = tsupBuilder()
        .asCli('bun')
        .build();

      expect(config.format).toEqual(['esm']);
      expect(config.platform).toBe('neutral');
      expect(config.minify).toBe(true);
    });

    it('should add correct shebang for Node CLI', () => {
      const config = tsupBuilder()
        .asCli('node')
        .build();

      // esbuildOptions is a function, we need to test it
      const options: any = {};
      config.esbuildOptions?.(options, {} as any);
      expect(options.banner?.js).toContain(NODE_SHEBANG);
    });

    it('should add correct shebang for Bun CLI', () => {
      const config = tsupBuilder()
        .asCli('bun')
        .build();

      const options: any = {};
      config.esbuildOptions?.(options, {} as any);
      expect(options.banner?.js).toContain(BUN_SHEBANG);
    });
  });

  describe('Standalone Configuration', () => {
    it('should configure as standalone', () => {
      const config = tsupBuilder()
        .asStandalone()
        .build();

      expect(config.external).toEqual([]);
      expect(config.skipNodeModulesBundle).toBe(false);
      expect(config.minify).toBe(true);
    });

    it('should combine standalone with CLI', () => {
      const config = tsupBuilder()
        .asCli('node')
        .asStandalone()
        .build();

      expect(config.external).toEqual([]);
      expect(config.skipNodeModulesBundle).toBe(false);
      expect(config.format).toEqual(['esm']);
      expect(config.shims).toBe(true);
    });
  });

  describe('Browser Bundle Configuration', () => {
    it('should configure as browser bundle', () => {
      const config = tsupBuilder()
        .asBrowserBundle()
        .build();

      expect(config.platform).toBe('browser');
      expect(config.format).toEqual(['esm']);
      expect(config.minify).toBe(true);
      expect(config.sourcemap).toBe('external');
      expect(config.splitting).toBe(true);
      expect(config.shims).toBe(false);
    });
  });

  describe('Minification Options', () => {
    it('should enable basic minification', () => {
      const config = tsupBuilder()
        .minify(true)
        .build();

      expect(config.minify).toBe(true);
    });

    it('should disable minification', () => {
      const config = tsupBuilder()
        .minify(false)
        .build();

      expect(config.minify).toBe(false);
    });

    it('should set granular minification options', () => {
      const config = tsupBuilder()
        .minify({
          whitespace: true,
          identifiers: false,
          syntax: true,
          keepNames: true,
        })
        .build();

      expect(config.minify).toBe(true);
      expect(config.minifyWhitespace).toBe(true);
      expect(config.minifyIdentifiers).toBe(false);
      expect(config.minifySyntax).toBe(true);
      expect(config.keepNames).toBe(true);
    });
  });

  describe('Framework Support', () => {
    it('should configure for React', () => {
      const config = tsupBuilder()
        .forReact()
        .build();

      expect(config.external).toContain('react');
      expect(config.external).toContain('react-dom');
      expect(config.external).toContain('react/jsx-runtime');

      const options: any = {};
      config.esbuildOptions?.(options, {} as any);
      expect(options.jsx).toBe('automatic');
    });

    it('should configure for Vue', () => {
      const config = tsupBuilder()
        .forVue()
        .build();

      expect(config.external).toContain('vue');
      expect(config.external).toContain('@vue/*');
    });

    it('should configure for Preact', () => {
      const config = tsupBuilder()
        .forPreact()
        .build();

      expect(config.external).toContain('preact');
      expect(config.external).toContain('preact/hooks');

      const options: any = {};
      config.esbuildOptions?.(options, {} as any);
      expect(options.jsx).toBe('automatic');
      expect(options.jsxImportSource).toBe('preact');
    });
  });

  describe('Environment Configuration', () => {
    it('should configure for development', () => {
      const config = tsupBuilder()
        .env('development')
        .build();

      expect(config.minify).toBe(false);
      expect(config.sourcemap).toBe('inline');
      expect(config.define).toMatchObject({
        'process.env.NODE_ENV': '"development"',
        '__DEV__': 'true',
        '__PROD__': 'false',
      });
    });

    it('should configure for production', () => {
      const config = tsupBuilder()
        .env('production')
        .build();

      expect(config.minify).toBe(true);
      expect(config.sourcemap).toBe('hidden');
      expect(config.define).toMatchObject({
        'process.env.NODE_ENV': '"production"',
        '__DEV__': 'false',
        '__PROD__': 'true',
      });
    });
  });

  describe('Additional Options', () => {
    it('should set sourcemap type', () => {
      const config = tsupBuilder()
        .sourcemap('external')
        .build();

      expect(config.sourcemap).toBe('external');
    });

    it('should enable code splitting', () => {
      const config = tsupBuilder()
        .withSplitting()
        .build();

      expect(config.splitting).toBe(true);
    });

    it('should set output directory', () => {
      const config = tsupBuilder()
        .outDir('build')
        .build();

      expect(config.outDir).toBe('build');
    });

    it('should set target', () => {
      const config = tsupBuilder()
        .target('node16')
        .build();

      expect(config.target).toBe('node16');
    });

    it('should add types', () => {
      const config = tsupBuilder()
        .withTypes()
        .build();

      expect(config.dts).toBe(true);
    });

    it('should set external packages', () => {
      const config = tsupBuilder()
        .external(['react', 'lodash'])
        .build();

      expect(config.external).toEqual(['react', 'lodash']);
    });

    it('should externalize additional packages', () => {
      const config = tsupBuilder()
        .asLibrary()
        .externalize('react', 'lodash')
        .build();

      expect(config.external).toContain('react');
      expect(config.external).toContain('lodash');
    });
  });

  describe('Watch Mode', () => {
    it('should enable watch mode', () => {
      const config = tsupBuilder()
        .watch()
        .build();

      expect(config.watch).toBe(true);
    });

    it('should enable watch mode with onSuccess', () => {
      const config = tsupBuilder()
        .watch('node dist/index.js')
        .build();

      expect(config.watch).toBe(true);
      expect(config.onSuccess).toBe('node dist/index.js');
    });
  });

  describe('Custom Configuration', () => {
    it('should merge custom configuration', () => {
      const config = tsupBuilder()
        .configure({
          name: 'custom',
          globalName: 'MyLib',
          pure: ['console.log'],
        })
        .build();

      expect(config.name).toBe('custom');
      expect(config.globalName).toBe('MyLib');
      expect(config.pure).toEqual(['console.log']);
    });

    it('should override previous settings with configure', () => {
      const config = tsupBuilder()
        .minify(true)
        .configure({ minify: false })
        .build();

      expect(config.minify).toBe(false);
    });
  });

  describe('Build Methods', () => {
    it('should build as array', () => {
      const configs = tsupBuilder()
        .asLibrary()
        .buildArray();

      expect(Array.isArray(configs)).toBe(true);
      expect(configs).toHaveLength(1);
      expect(configs[0].external).toEqual(ALL_EXTERNALS);
    });

    it('should create builder via static method', () => {
      const config = TsupConfigBuilder.create()
        .asLibrary()
        .build();

      expect(config.external).toEqual(ALL_EXTERNALS);
    });
  });

  describe('Quick Presets', () => {
    it('should create library preset', () => {
      const config = quickPresets.library();

      expect(config.external).toEqual(ALL_EXTERNALS);
      expect(config.format).toEqual(['cjs', 'esm']);
      expect(config.dts).toBe(true);
    });

    it('should create nodeCli preset', () => {
      const config = quickPresets.nodeCli();

      expect(config.format).toEqual(['esm']);
      expect(config.platform).toBe('node');
      expect(config.minify).toBe(true);
      expect(config.shims).toBe(true);
    });

    it('should create browserApp preset', () => {
      const config = quickPresets.browserApp();

      expect(config.platform).toBe('browser');
      expect(config.format).toEqual(['esm']);
      expect(config.splitting).toBe(true);
    });

    it('should create reactLibrary preset', () => {
      const config = quickPresets.reactLibrary();

      expect(config.external).toContain('react');
      expect(config.format).toEqual(['cjs', 'esm']);
      expect(config.dts).toBe(true);
    });

    it('should create standalone preset', () => {
      const config = quickPresets.standalone();

      expect(config.external).toEqual([]);
      expect(config.skipNodeModulesBundle).toBe(false);
      expect(config.minify).toBe(true);
    });
  });
});