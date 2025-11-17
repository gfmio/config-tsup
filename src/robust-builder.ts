/**
 * Robust type-safe builder with comprehensive constraint validation
 *
 * Combines compile-time type checking with optional runtime validation
 * for maximum safety and excellent error messages.
 */

import type { Options } from 'tsup';
import { merge as utilMerge } from './utils/merge';

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
 * Branded type for constraint violations with helpful error messages
 */
export type ConstraintViolation<Message extends string> = {
  __constraint_violation__: Message;
  __this_merge_is_not_allowed__: never;
};

/**
 * Non-distributive format checker to avoid union type issues
 * Wrapping in tuple [T] prevents distribution over unions
 */
type FormatIncludes<
  Format,
  Target extends 'cjs' | 'esm' | 'iife'
> = [Format] extends [readonly (infer F)[]]
  ? F extends Target
    ? true
    : false
  : [Format] extends [Target]
    ? true
    : false;

/**
 * Check if format includes ESM (required for splitting)
 */
type HasESM<Format> =
  [Format] extends [readonly (infer F)[]]
    ? F extends 'esm'
      ? true
      : false
    : [Format] extends ['esm']
      ? true
      : false;

/**
 * Merge two types
 */
type Merge2<T, U> = Omit<T, keyof U> & U;

/**
 * Comprehensive constraint validation with specific error messages
 * Returns the merged config if valid, or a ConstraintViolation if invalid
 */
type ValidateMergedConfig<Merged extends Partial<ExtendedOptions>> =
  // Check 1: IIFE format incompatible with splitting
  Merged extends { splitting: true; format: infer F }
    ? FormatIncludes<F, 'iife'> extends true
      ? ConstraintViolation<'Cannot enable splitting with IIFE format - IIFE does not support code splitting'>
      : ValidateConstraint2<Merged>
    : ValidateConstraint2<Merged>;

type ValidateConstraint2<Merged extends Partial<ExtendedOptions>> =
  // Check 2: Splitting requires ESM format
  Merged extends { splitting: true; format: infer F }
    ? HasESM<F> extends true
      ? ValidateConstraint3<Merged>
      : ConstraintViolation<'Code splitting requires ESM format - add "esm" to format array or set format to "esm"'>
    : ValidateConstraint3<Merged>;

type ValidateConstraint3<Merged extends Partial<ExtendedOptions>> =
  // Check 3: Browser platform incompatible with shims
  Merged extends { platform: 'browser'; shims: true }
    ? ConstraintViolation<'Cannot use shims with browser platform - shims are only for Node.js'>
    : ValidateConstraint4<Merged>;

type ValidateConstraint4<Merged extends Partial<ExtendedOptions>> =
  // Check 4: CLI preset incompatible with skipNodeModulesBundle
  Merged extends { productType: 'cli'; skipNodeModulesBundle: true }
    ? ConstraintViolation<'CLI tools should bundle dependencies - cannot skip node_modules bundling'>
    : ValidateConstraint5<Merged>;

type ValidateConstraint5<Merged extends Partial<ExtendedOptions>> =
  // Check 5: Standalone CLI must have exactly one format
  Merged extends { productType: 'standalone-cli'; format: infer F }
    ? F extends readonly unknown[]
      ? F['length'] extends 1
        ? Merged  // Valid: single format in array
        : ConstraintViolation<'Standalone CLI must have exactly one output format'>
      : Merged  // Valid: single format string
    : Merged;  // All constraints passed

/**
 * Validate a merge operation before it happens
 */
type ValidateMerge<
  T extends Partial<ExtendedOptions>,
  U extends Partial<ExtendedOptions>
> = ValidateMergedConfig<Merge2<T, U>>;

/**
 * Runtime constraint validator
 */
export class ConstraintValidator {
  static validate(state: Partial<ExtendedOptions>): void {
    const errors: string[] = [];

    // Check 1: IIFE + splitting
    if (state.splitting === true) {
      const format = state.format;
      if (format === 'iife' || (Array.isArray(format) && format.includes('iife'))) {
        errors.push('Cannot enable splitting with IIFE format - IIFE does not support code splitting');
      }
    }

    // Check 2: Splitting requires ESM
    if (state.splitting === true && state.format) {
      const format = state.format;
      const hasESM = format === 'esm' || (Array.isArray(format) && format.includes('esm'));
      if (!hasESM) {
        errors.push('Code splitting requires ESM format - add "esm" to format array or set format to "esm"');
      }
    }

    // Check 3: Browser + shims
    if (state.platform === 'browser' && state.shims === true) {
      errors.push('Cannot use shims with browser platform - shims are only for Node.js');
    }

    // Check 4: CLI + skipNodeModulesBundle
    if (state.productType === 'cli' && state.skipNodeModulesBundle === true) {
      errors.push('CLI tools should bundle dependencies - cannot skip node_modules bundling');
    }

    // Check 5: Standalone CLI format count
    if (state.productType === 'standalone-cli' && state.format) {
      const format = state.format;
      const formatCount = Array.isArray(format) ? format.length : 1;
      if (formatCount !== 1) {
        errors.push('Standalone CLI must have exactly one output format');
      }
    }

    if (errors.length > 0) {
      throw new BuilderConstraintError(errors);
    }
  }
}

/**
 * Custom error for constraint violations
 */
export class BuilderConstraintError extends Error {
  constructor(public readonly violations: string[]) {
    super(
      'Builder configuration violates constraints:\n' +
      violations.map(v => `  - ${v}`).join('\n')
    );
    this.name = 'BuilderConstraintError';
  }
}

/**
 * Require specific keys to be set before building
 */
type RequiredKeys = 'entry' | 'format';

/**
 * Check if all required keys are present
 */
type HasRequiredKeys<T> = RequiredKeys extends keyof T ? true : false;

/**
 * Type-safe builder with runtime and compile-time constraint checking
 */
export class RobustBuilder<T extends Partial<ExtendedOptions>> {
  private readonly state: T;
  private readonly enableRuntimeChecks: boolean;

  private constructor(state: T, enableRuntimeChecks = true) {
    this.state = state;
    this.enableRuntimeChecks = enableRuntimeChecks;
  }

  /**
   * Create an empty builder
   */
  public static empty(enableRuntimeChecks = true) {
    return new this({}, enableRuntimeChecks);
  }

  /**
   * Create a builder with sensible defaults
   */
  public static default(enableRuntimeChecks = true) {
    return new this({
      target: 'es2022',
      clean: true,
      sourcemap: true,
      treeshake: true,
    } as const, enableRuntimeChecks);
  }

  /**
   * Create a builder from existing state
   */
  public static forState<T extends Partial<ExtendedOptions>>(
    state: T,
    enableRuntimeChecks = true
  ) {
    return new this(state, enableRuntimeChecks);
  }

  /**
   * Build the final configuration (only when required keys are present)
   */
  public build(this: HasRequiredKeys<T> extends true ? this : never): ExtendedOptions {
    if (this.enableRuntimeChecks) {
      ConstraintValidator.validate(this.state);
    }
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
   * Type-level constraint checking prevents invalid merges at compile time.
   * Runtime validation provides detailed error messages in development.
   *
   * @example
   * ```ts
   * builder()
   *   .merge({ format: 'esm', splitting: true })  // ✅ Valid
   *   .merge({ format: 'iife' })                  // ❌ Type error: violates splitting constraint
   * ```
   */
  public merge<U extends Partial<ExtendedOptions>>(
    // The parameter type is the validation result - it will be ConstraintViolation if invalid
    partial: ValidateMerge<T, U> extends ConstraintViolation<infer Msg>
      ? ConstraintViolation<Msg>
      : U
  ): RobustBuilder<any> {
    const merged = utilMerge(this.state, partial as U);

    // Runtime validation in development
    if (this.enableRuntimeChecks) {
      try {
        ConstraintValidator.validate(merged);
      } catch (error) {
        if (error instanceof BuilderConstraintError) {
          console.error('Configuration constraint violation:', error.message);
          throw error;
        }
        throw error;
      }
    }

    return RobustBuilder.forState(
      merged as any,
      this.enableRuntimeChecks
    );
  }

  /**
   * Unsafe merge without constraint checking
   * Use this when you need to temporarily violate constraints
   * or when you're certain the merge is safe
   */
  public unsafeMerge<U extends Partial<ExtendedOptions>>(
    partial: U
  ): RobustBuilder<any> {
    return RobustBuilder.forState(
      utilMerge(this.state, partial) as any,
      this.enableRuntimeChecks
    );
  }

  /**
   * Transform the state using a mapping function
   * Note: Constraints are NOT checked on the transform result
   * Use merge() if you need constraint checking
   */
  public map<U extends Partial<ExtendedOptions>>(
    transform: (state: T) => U
  ): RobustBuilder<U> {
    return RobustBuilder.forState(
      transform(this.state),
      this.enableRuntimeChecks
    );
  }

  /**
   * Set a specific key to a value
   * Uses merge internally for constraint checking
   */
  public set<K extends keyof ExtendedOptions, V extends ExtendedOptions[K]>(
    key: K,
    value: V
  ): RobustBuilder<any> {
    return this.merge({ [key]: value } as any);
  }

  /**
   * Remove a key from the state
   */
  public unset<K extends keyof T>(
    key: K
  ): RobustBuilder<Omit<T, K>> {
    const newState = { ...this.state };
    delete newState[key];
    return RobustBuilder.forState(
      newState as Omit<T, K>,
      this.enableRuntimeChecks
    );
  }

  /**
   * Conditionally apply a transformation
   */
  public when<U extends Partial<ExtendedOptions>>(
    condition: boolean,
    then: (builder: this) => RobustBuilder<U>
  ): RobustBuilder<T | U> {
    if (condition) {
      return then(this) as any;
    }
    return this as any;
  }

  /**
   * Disable runtime constraint checking for performance
   * Useful in production builds where type checking is sufficient
   */
  public withoutRuntimeChecks(): RobustBuilder<T> {
    return new RobustBuilder(this.state, false);
  }

  /**
   * Enable runtime constraint checking
   * Useful in development for better error messages
   */
  public withRuntimeChecks(): RobustBuilder<T> {
    return new RobustBuilder(this.state, true);
  }
}

/**
 * Create a type-safe builder with default settings
 */
export function robustBuilder() {
  return RobustBuilder.default();
}

/**
 * Create an empty type-safe builder
 */
export function emptyRobustBuilder() {
  return RobustBuilder.empty();
}
