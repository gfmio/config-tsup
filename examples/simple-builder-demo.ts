/**
 * Simple Builder Demonstration
 *
 * Shows how functional primitives (merge, map, set, unset) provide
 * a cleaner, more composable API than many specialized methods.
 */

import { simpleBuilder, emptyBuilder } from '../src/simple-builder';

// ========================================================================
// ✅ FUNCTIONAL COMPOSITION
// ========================================================================

// Example 1: Build configuration functionally
export const library = simpleBuilder()
  .merge({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'] as const,
  })
  .set('dts', true)
  .merge({
    external: [/^[^./]/, /^node:/],
    skipNodeModulesBundle: true,
  })
  .build();

// Example 2: Use map for complex transformations
export const reactLibrary = simpleBuilder()
  .merge({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'] as const,
    dts: true,
  })
  .map(state => ({
    ...state,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    esbuildOptions: (options: any) => {
      options.jsx = 'automatic';
    },
  }))
  .build();

// Example 3: Conditional logic with when
const isProd = process.env.NODE_ENV === 'production';

export const conditional = simpleBuilder()
  .set('entry', ['src/index.ts'])
  .set('format', ['esm'])
  .when(isProd, b => b.set('minify', true))
  .when(!isProd, b => b.set('sourcemap', 'inline'))
  .build();

// ========================================================================
// ✅ REUSABLE PARTIALS
// ========================================================================

// Define reusable configuration partials
const baseLibrary = {
  external: [/^[^./]/, /^node:/],
  skipNodeModulesBundle: true,
} as const;

const dualFormat = {
  format: ['cjs', 'esm'] as const,
  cjsInterop: true,
} as const;

const withTypes = {
  dts: true,
} as const;

// Compose them
export const composedLibrary = simpleBuilder()
  .set('entry', ['src/index.ts'])
  .merge(baseLibrary)
  .merge(dualFormat)
  .merge(withTypes)
  .build();

// ========================================================================
// ✅ TRANSFORM PIPELINES
// ========================================================================

// Example 4: Multi-step transformation pipeline
export const pipeline = emptyBuilder()
  .merge({
    entry: ['src/index.ts'],
    format: ['esm'] as const,
  })
  .map(state => ({
    ...state,
    productType: 'library' as const,
    external: [/^[^./]/],
  }))
  .when(true, b => b.set('dts', true))
  .map(state => ({
    ...state,
    sourcemap: 'external' as const,
    clean: true,
  }))
  .build();

// ========================================================================
// ✅ FACTORY FUNCTIONS
// ========================================================================

// Create factory functions for common configurations
function createLibraryConfig(entry: string | string[]) {
  return simpleBuilder()
    .set('entry', Array.isArray(entry) ? entry : [entry])
    .merge({
      format: ['cjs', 'esm'] as const,
      dts: true,
      external: [/^[^./]/, /^node:/],
      skipNodeModulesBundle: true,
    });
}

function createCliConfig(entry: string) {
  return simpleBuilder()
    .set('entry', [entry])
    .merge({
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
    }));
}

function createBrowserConfig(entry: string) {
  return simpleBuilder()
    .set('entry', [entry])
    .merge({
      format: ['esm'] as const,
      platform: 'browser' as const,
      splitting: true,
      minify: true,
      shims: false,
    });
}

// Use the factories
export const myLibrary = createLibraryConfig('src/index.ts')
  .set('target', 'es2020')
  .build();

export const myCli = createCliConfig('src/cli.ts')
  .set('target', 'node18')
  .build();

export const myBrowser = createBrowserConfig('src/app.ts')
  .set('sourcemap', 'external')
  .build();

// ========================================================================
// ✅ HIGHER-ORDER TRANSFORMATIONS
// ========================================================================

// Create reusable transformation functions
function addReactSupport<T>(builder: ReturnType<typeof simpleBuilder>) {
  return builder.map(state => ({
    ...state,
    external: [
      ...(Array.isArray(state.external) ? state.external : []),
      'react',
      'react-dom',
      'react/jsx-runtime',
    ],
    esbuildOptions: (options: any) => {
      options.jsx = 'automatic';
      state.esbuildOptions?.(options, {} as any);
    },
  }));
}

function addVueSupport<T>(builder: ReturnType<typeof simpleBuilder>) {
  return builder.map(state => ({
    ...state,
    external: [
      ...(Array.isArray(state.external) ? state.external : []),
      'vue',
      /^@vue\//,
    ],
  }));
}

function optimizeForProduction<T>(builder: ReturnType<typeof simpleBuilder>) {
  return builder
    .set('minify', true)
    .set('sourcemap', 'hidden')
    .map(state => ({
      ...state,
      treeshake: {
        preset: 'smallest' as const,
      },
    }));
}

// Apply transformations
export const reactProdLib = createLibraryConfig('src/index.ts')
  .merge(state => addReactSupport(emptyBuilder().merge(state)))
  .merge(state => optimizeForProduction(emptyBuilder().merge(state)))
  .build();

// Or use pipe-like composition
export const vueProdLib = (() => {
  let builder = createLibraryConfig('src/index.ts');
  builder = addVueSupport(builder);
  builder = optimizeForProduction(builder);
  return builder.build();
})();

// ========================================================================
// ✅ COMPARISON WITH SPECIALIZED BUILDER
// ========================================================================

// Specialized builder (many methods):
// const config = tsupBuilder()
//   .entry('src/index.ts')
//   .asLibrary()
//   .dualFormat()
//   .withTypes()
//   .forReact()
//   .build();

// Simple builder (functional primitives):
const configSimple = simpleBuilder()
  .set('entry', ['src/index.ts'])
  .merge({
    format: ['cjs', 'esm'] as const,
    dts: true,
    external: ['react', 'react-dom'],
    skipNodeModulesBundle: true,
  })
  .map(state => ({
    ...state,
    esbuildOptions: (options: any) => {
      options.jsx = 'automatic';
    },
  }))
  .build();

// ========================================================================
// ✅ ADVANTAGES OF SIMPLE BUILDER
// ========================================================================

// 1. **Fewer Methods**: Just merge, map, set, unset, when vs 40+ specialized methods
// 2. **More Composable**: Easy to extract and reuse configuration patterns
// 3. **No Method Explosion**: Don't need forReact, forVue, forPreact, forSvelte, etc.
// 4. **Easier to Extend**: Just create helper functions, no need to modify builder class
// 5. **Better for Codegen**: Simple operations are easier to generate programmatically
// 6. **Functional Style**: Familiar to FP programmers, uses standard patterns
// 7. **Less Magic**: Clear what each operation does, no hidden state changes

// ========================================================================
// ✅ STATE INSPECTION
// ========================================================================

// You can inspect state at any point
const partialConfig = simpleBuilder()
  .set('entry', ['src/index.ts'])
  .set('format', ['esm'])
  .config();

console.log('Partial config:', partialConfig);
// { entry: ['src/index.ts'], format: ['esm'], target: 'es2022', ... }

// Continue building from there
const finalConfig = simpleBuilder()
  .merge(partialConfig)
  .set('minify', true)
  .build();

// ========================================================================
// ✅ DYNAMIC CONFIGURATION
// ========================================================================

// Build configuration dynamically
function createDynamicConfig(options: {
  entry: string;
  formats: Array<'cjs' | 'esm' | 'iife'>;
  minify?: boolean;
  types?: boolean;
  framework?: 'react' | 'vue';
}) {
  let builder = simpleBuilder()
    .set('entry', [options.entry])
    .set('format', options.formats as any);

  if (options.minify) {
    builder = builder.set('minify', true);
  }

  if (options.types) {
    builder = builder.set('dts', true);
  }

  if (options.framework === 'react') {
    builder = addReactSupport(builder);
  } else if (options.framework === 'vue') {
    builder = addVueSupport(builder);
  }

  return builder.build();
}

export const dynamicReact = createDynamicConfig({
  entry: 'src/index.ts',
  formats: ['cjs', 'esm'],
  minify: false,
  types: true,
  framework: 'react',
});

// ========================================================================
// ✅ TESTING BENEFITS
// ========================================================================

// Simple builder is easier to test - just check state transformations
export function testBuilder() {
  const state1 = emptyBuilder().set('entry', ['src/index.ts']).config();
  console.assert(state1.entry?.[0] === 'src/index.ts');

  const state2 = emptyBuilder()
    .merge({ entry: ['src/index.ts'], format: ['esm'] as const })
    .config();
  console.assert(state2.format?.[0] === 'esm');

  // No need to test 40+ methods, just test the primitives
}

// ========================================================================
// 🎯 KEY TAKEAWAYS
// ========================================================================

// 1. **Simplicity**: 5 core operations (merge, map, set, unset, when) vs 40+ methods
// 2. **Composability**: Easy to create reusable transformations
// 3. **Flexibility**: Can express any configuration without new methods
// 4. **Testability**: Test primitives once, compose freely
// 5. **Maintainability**: Fewer methods to maintain and document
// 6. **Extensibility**: User code can add abstractions without modifying builder
// 7. **Type Safety**: Still maintains full type safety through state parameter
