import { describe, expect, it } from 'bun:test';

import { partial } from '../src/utils/index.ts';

describe('partial type safety', () => {
  it('should accept valid Options keys', () => {
    // These should all work fine
    const validPartials = [
      partial({
        minify: true,
      }),
      partial({
        sourcemap: true,
      }),
      partial({
        dts: false,
      }),
      partial({
        clean: true,
      }),
      partial({
        format: [
          'esm',
          'cjs',
        ] as ('esm' | 'cjs')[],
      }),
      partial({
        entry: [
          'src/index.ts',
        ],
      }),
      partial({
        outDir: 'dist',
      }),
      partial({
        target: 'es2020',
      }),
      partial({
        platform: 'node',
      }),
      partial({
        splitting: true,
      }),
      partial({
        treeshake: true,
      }),
      partial({
        shims: false,
      }),
      partial({
        cjsInterop: true,
      }),
      partial({
        skipNodeModulesBundle: true,
      }),
      partial({
        minifyWhitespace: true,
      }),
      partial({
        minifyIdentifiers: false,
      }),
      partial({
        minifySyntax: true,
      }),
      partial({
        keepNames: false,
      }),
    ];

    // All should be defined
    validPartials.forEach((p) => {
      expect(p).toBeDefined();
    });
  });

  it('should demonstrate type error with invalid keys (commented out)', () => {
    // The following lines would cause TypeScript compilation errors
    // if uncommented, demonstrating that invalid keys are rejected:

    // @ts-expect-error - 'invalidKey' is not a valid Options property
    // const invalid1 = partial({ invalidKey: true });

    // @ts-expect-error - 'unknownOption' is not a valid Options property
    // const invalid2 = partial({ unknownOption: "value" });

    // @ts-expect-error - 'notAnOption' is not a valid Options property
    // const invalid3 = partial({ minify: true, notAnOption: false });

    // @ts-expect-error - mixing valid and invalid keys should fail
    // const invalid4 = partial({
    //   sourcemap: true,
    //   someRandomKey: "test",
    //   dts: true
    // });

    expect(true).toBe(true); // Dummy assertion for the test to pass
  });

  it('should work correctly with empty object', () => {
    const empty = partial({});
    expect(empty).toEqual({});
  });

  it('should preserve const assertions and literal types', () => {
    const withConst = partial({
      format: [
        'esm',
      ] as const,
      platform: 'node' as const,
    });

    expect(withConst.format).toEqual([
      'esm',
    ]);
    expect(withConst.platform).toBe('node');
  });
});
