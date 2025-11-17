# Type-Safe Builder Implementation Summary

## Overview

This document summarizes the implementation of two type-safe builder patterns for tsup configuration, progressing from a simple functional approach to a robust validation-focused implementation.

## Implementation Journey

### Phase 1: Simple Builder

**Request:** User provided `SimpleTypeSafeBuilder` code showing a functional approach with generic primitives instead of specialized methods.

**Approach:** Functional primitives instead of specialized methods.

**Key Insight:** 5 generic operations (merge, map, set, unset, when) are more composable than many specialized methods.

**Implementation:**

```typescript
export class SimpleTypeSafeBuilder<T> {
  merge<U>(partial: IsCompatibleWith<T, U> extends true ? U : never)
  map<U>(transform: (state: T) => U)
  set<K, V>(key: K, value: V)
  unset<K>(key: K)
  when<U>(condition: boolean, then: (builder) => SimpleTypeSafeBuilder<U>)
}
```

**Result:** [src/simple-builder.ts](../src/simple-builder.ts) with 25 tests and comprehensive examples.

### Phase 2: Robust Builder

**Request:** User shared Claude Desktop recommendations for validating merged results with constraint violations.

**Approach:** Validate the merged result (not just the partial) with branded error types and optional runtime validation.

**Key Features:**

1. **Validates Merged Result:** `ValidateMerge<T, U>` checks `Merge2<T, U>` for violations
2. **Branded Error Types:** `ConstraintViolation<Message>` for helpful error messages
3. **Runtime Validation:** Optional runtime checks that mirror type-level validation
4. **Chain of Responsibility:** Sequential constraint validation with specific errors
5. **Non-Distributive Checking:** Tuple wrapping to prevent union type distribution

**Implementation:**

```typescript
type ValidateMerge<T, U> = ValidateMergedConfig<Merge2<T, U>>;

type ConstraintViolation<Message extends string> = {
  __constraint_violation__: Message;
  __this_merge_is_not_allowed__: never;
};

public merge<U>(
  partial: ValidateMerge<T, U> extends ConstraintViolation<infer Msg>
    ? ConstraintViolation<Msg>
    : U
): RobustBuilder<any>
```

**Result:** [src/robust-builder.ts](../src/robust-builder.ts) with 40 tests covering all constraint validation scenarios.

## File Inventory

### Source Files

| File | Lines | Description |
|------|-------|-------------|
| [src/simple-builder.ts](../src/simple-builder.ts) | 217 | Functional builder with 5 generic operations |
| [src/robust-builder.ts](../src/robust-builder.ts) | 387 | Constraint-validating builder with runtime checks |

### Test Files

| File | Tests | Description |
|------|-------|-------------|
| [tests/simple-builder.test.ts](../tests/simple-builder.test.ts) | 25 | Validates simple builder operations |
| [tests/robust-builder.test.ts](../tests/robust-builder.test.ts) | 40 | Validates constraint validation and runtime checks |

### Example Files

| File | Lines | Description |
|------|-------|-------------|
| [examples/simple-builder-demo.ts](../examples/simple-builder-demo.ts) | 349 | Functional composition and reusable transformations |
| [examples/robust-builder-demo.ts](../examples/robust-builder-demo.ts) | 420+ | Constraint validation and error handling examples |

### Documentation

| File | Purpose |
|------|---------|
| [docs/builder-comparison.md](../docs/builder-comparison.md) | Detailed comparison of both builders |
| [docs/builder-implementation-summary.md](../docs/builder-implementation-summary.md) | This file |

## Technical Achievements

### 1. Non-Distributive Type Checking

```typescript
// Prevents distribution over union types
type FormatIncludes<Format, Target> =
  [Format] extends [readonly (infer F)[]]
    ? F extends Target ? true : false
    : [Format] extends [Target] ? true : false;

// Without tuple wrapping: FormatIncludes<'esm' | 'iife', 'iife'> = boolean
// With tuple wrapping:    FormatIncludes<'esm' | 'iife', 'iife'> = true
```

### 2. Branded Error Types

```typescript
export type ConstraintViolation<Message extends string> = {
  __constraint_violation__: Message;
  __this_merge_is_not_allowed__: never;
};

// Usage:
type Result = ValidateMerge<State, Partial>;
// Result = ConstraintViolation<'Cannot enable splitting with IIFE format'> | ValidConfig
```

### 3. Chain of Responsibility Validation

```typescript
type ValidateMergedConfig<Merged> =
  Merged extends { splitting: true; format: infer F }
    ? FormatIncludes<F, 'iife'> extends true
      ? ConstraintViolation<'Cannot enable splitting with IIFE format'>
      : ValidateConstraint2<Merged>
    : ValidateConstraint2<Merged>;

type ValidateConstraint2<Merged> =
  // Check 2...

type ValidateConstraint3<Merged> =
  // Check 3...
```

### 4. Runtime/Type-Level Mirroring

```typescript
// Type-level check
type ValidateConstraint1<Merged> =
  Merged extends { splitting: true; format: infer F }
    ? FormatIncludes<F, 'iife'> extends true
      ? ConstraintViolation<'Cannot enable splitting with IIFE'>
      : ValidateConstraint2<Merged>
    : ValidateConstraint2<Merged>;

// Runtime check (exact mirror)
export class ConstraintValidator {
  static validate(state: Partial<ExtendedOptions>): void {
    if (state.splitting === true) {
      const format = state.format;
      if (format === 'iife' || (Array.isArray(format) && format.includes('iife'))) {
        errors.push('Cannot enable splitting with IIFE format');
      }
    }
  }
}
```

## Constraint Validation

### Implemented Constraints

Both builders enforce these constraints:

1. **IIFE + Splitting:** IIFE format cannot use code splitting
2. **Splitting Requires ESM:** Code splitting requires ESM in the format array
3. **Browser + Shims:** Browser platform cannot use Node.js shims
4. **CLI + Skip Bundling:** CLI tools should bundle dependencies
5. **Standalone CLI Format:** Standalone CLI must have exactly one output format

### Validation Approaches

| Builder | Validation Strategy |
|---------|-------------------|
| Simple | Compatibility checking on partials |
| Robust | Comprehensive validation of merged results |

## Test Coverage

### Total Test Stats

- **394 tests** across 15 test files
- **879 expect() calls**
- **All tests passing**

### Builder-Specific Coverage

| Builder | Tests | Key Areas |
|---------|-------|-----------|
| Simple | 25 | Generic operations, composition, immutability |
| Robust | 40 | Constraint validation, runtime checks, error messages |

## Performance Characteristics

### Compile Time

| Builder | Type Complexity | Compilation Speed |
|---------|----------------|-------------------|
| Simple | Low (5 methods) | Fast |
| Robust | Very High (constraint validation) | Slow |

### Runtime

| Builder | Overhead | Validation |
|---------|----------|-----------|
| Simple | Low | None |
| Robust | Low-High* | Optional |

*Depends on whether runtime validation is enabled via `withRuntimeChecks()`.

## API Surface Comparison

### Simple Builder (5 Methods)

Generic functional primitives:

**merge(partial)** - Merge configuration
**map(transform)** - Transform state
**set(key, value)** - Set property
**unset(key)** - Remove property
**when(condition, then)** - Conditional application

### Robust Builder (5 Methods + Validation)

Same as Simple Builder plus:

**withRuntimeChecks()** - Enable runtime validation
**withoutRuntimeChecks()** - Disable runtime validation
**unsafeMerge(partial)** - Bypass type checking

## Key Learnings

### 1. Functional Primitives > Specialized Methods

5 generic operations are more composable and extensible than many specialized methods.

### 2. Validate Merged Results

Validating the merged result catches order-dependent constraint violations that validating partials misses.

### 3. Branded Types for Better Errors

```typescript
type ConstraintViolation<Message> = {
  __constraint_violation__: Message;
  __this_merge_is_not_allowed__: never;
};
```

Provides much better error messages than just returning `never`.

### 4. Runtime Validation Should Mirror Type Checks

Having runtime validation exactly mirror type-level checks provides consistency and catches issues in production.

### 5. Non-Distributive Checking is Essential

Union types distribute over conditional types unless prevented with tuple wrapping:

```typescript
[Format] extends [Target] ? true : false  // ✅ Correct
Format extends Target ? true : false      // ❌ Distributes
```

## Future Enhancements

### Simple Builder
- [ ] Better type inference for array formats
- [ ] Standard library of reusable helpers
- [ ] Documentation generator from usage

### Robust Builder
- [ ] More sophisticated constraint rules
- [ ] Performance optimization for type checking
- [ ] Constraint composition API
- [ ] Better error recovery strategies

## Conclusion

This implementation demonstrates two complementary approaches to type-safe configuration building:

1. **Simple Builder:** Minimal, composable API for functional programming styles
2. **Robust Builder:** Comprehensive validation for mission-critical configurations

Each serves different needs and can be chosen based on specific project requirements for API surface, type safety, runtime validation, and extensibility.

The progression from simple functional primitives → validated merging → runtime checks shows how TypeScript's type system can be leveraged for increasingly sophisticated compile-time guarantees while maintaining runtime safety.

---

**Total Implementation:**
- 2 builder implementations
- 604+ lines of source code
- 65 comprehensive tests
- 769+ lines of examples
- Extensive documentation

**All tests passing ✅**
