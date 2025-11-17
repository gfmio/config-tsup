/**
 * Simple type-safe builder using functional primitives
 *
 * Instead of many specialized methods, provides generic operations
 * that work with any configuration shape while maintaining type safety.
 */

import type { Options } from 'tsup';
import { merge } from './utils/merge';

/**
 * Product type for tracking preset configurations
 */
export type ProductType = 'library' | 'cli' | 'standalone-cli' | 'browser';

/**
 * Extended options with product type tracking
 */
export interface ExtendedOptions extends Options {
  productType?: ProductType;
}

/**
 * Helper to check if format includes a specific value
 */
type FormatIncludes<
  Format,
  Target extends 'cjs' | 'esm' | 'iife'
> = Format extends readonly (infer F)[]
  ? F extends Target
    ? true
    : false
  : Format extends Target
    ? true
    : false;

/**
 * Check if a partial is compatible with current state
 */
type IsCompatibleWith<
  T extends Partial<ExtendedOptions>,
  P extends Partial<ExtendedOptions>
> =
  // IIFE format incompatible with splitting
  P extends { splitting: true }
    ? FormatIncludes<T['format'], 'iife'> extends true
      ? false
      : true
  // Splitting requires ESM format
  : P extends { format: infer F }
    ? P extends { splitting: true }
      ? FormatIncludes<F, 'esm'> extends true
        ? true
        : false
      : true
  // Browser platform incompatible with shims
  : T['platform'] extends 'browser'
    ? P extends { shims: true }
      ? false
      : true
  // Shims incompatible with browser
  : P extends { shims: true }
    ? T['platform'] extends 'browser'
      ? false
      : true
  // CLI preset incompatible with library preset
  : T['productType'] extends 'cli'
    ? P extends { skipNodeModulesBundle: true }
      ? false
      : true
  : T['productType'] extends 'library'
    ? P extends { format: 'esm' }
      ? true  // Can override format for library
      : true
  : true;

/**
 * Require specific keys to be set before building
 */
type RequiredKeys = 'entry' | 'format';

/**
 * Check if all required keys are present
 */
type HasRequiredKeys<T> = RequiredKeys extends keyof T ? true : false;

/**
 * Simple type-safe builder using functional primitives
 *
 * The state type parameter T tracks the exact shape of the configuration,
 * enabling precise type checking without specialized methods.
 */
export class SimpleTypeSafeBuilder<T extends Partial<ExtendedOptions>> {
  private readonly state: T;

  private constructor(state: T) {
    this.state = state;
  }

  /**
   * Create an empty builder
   */
  public static empty() {
    return new this({});
  }

  /**
   * Create a builder with sensible defaults
   */
  public static default() {
    return new this({
      target: 'es2022',
      clean: true,
      sourcemap: true,
      treeshake: true,
    } as const);
  }

  /**
   * Create a builder from existing state
   */
  public static forState<T extends Partial<ExtendedOptions>>(state: T) {
    return new this(state);
  }

  /**
   * Build the final configuration (only when required keys are present)
   */
  public build(this: HasRequiredKeys<T> extends true ? this : never): ExtendedOptions {
    return this.state as ExtendedOptions;
  }

  /**
   * Get current configuration state
   */
  public config(): T {
    return this.state;
  }

  /**
   * Merge a partial configuration into the current state
   *
   * Type-checked for compatibility with current state
   */
  public merge<U extends Partial<ExtendedOptions>>(
    partial: IsCompatibleWith<T, U> extends true ? U : never
  ): SimpleTypeSafeBuilder<T & U> {
    return SimpleTypeSafeBuilder.forState(merge(this.state, partial) as T & U);
  }

  /**
   * Unsafe merge without compatibility checking
   */
  public unsafeMerge<U extends Partial<ExtendedOptions>>(
    partial: U
  ): SimpleTypeSafeBuilder<T & U> {
    return SimpleTypeSafeBuilder.forState(merge(this.state, partial) as T & U);
  }

  /**
   * Transform the state using a mapping function
   */
  public map<U extends Partial<ExtendedOptions>>(
    transform: (state: T) => U
  ): SimpleTypeSafeBuilder<U> {
    return SimpleTypeSafeBuilder.forState(transform(this.state));
  }

  /**
   * Set a specific key to a value
   */
  public set<K extends keyof ExtendedOptions, V extends ExtendedOptions[K]>(
    key: K,
    value: V
  ): SimpleTypeSafeBuilder<T & { [P in K]: V }> {
    return SimpleTypeSafeBuilder.forState({ ...this.state, [key]: value } as T & { [P in K]: V });
  }

  /**
   * Remove a key from the state
   */
  public unset<K extends keyof T>(
    key: K
  ): SimpleTypeSafeBuilder<Omit<T, K>> {
    const newState = { ...this.state };
    delete newState[key];
    return SimpleTypeSafeBuilder.forState(newState as Omit<T, K>);
  }

  /**
   * Conditionally apply a transformation
   */
  public when<U extends Partial<ExtendedOptions>>(
    condition: boolean,
    then: (builder: this) => SimpleTypeSafeBuilder<U>
  ): SimpleTypeSafeBuilder<T | U> {
    if (condition) {
      return then(this) as any;
    }
    return this as any;
  }
}

/**
 * Create a simple type-safe builder
 */
export function simpleBuilder() {
  return SimpleTypeSafeBuilder.default();
}

/**
 * Create an empty simple type-safe builder
 */
export function emptyBuilder() {
  return SimpleTypeSafeBuilder.empty();
}
