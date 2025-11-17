# Builder Pattern Comparison

This document compares the two type-safe builder implementations in this project.

## Overview

| Feature | Simple Builder | Robust Builder |
|---------|----------------|----------------|
| **Type Tracking** | Partial compatibility | Merged result validation |
| **Methods** | 5 generic primitives | 5 generic + validation |
| **Error Messages** | Basic | Excellent |
| **Runtime Validation** | No | Optional |
| **Complexity** | Low | Medium |
| **Use Case** | Composable configs | Mission-critical |

## 1. Simple Builder ([src/simple-builder.ts](../src/simple-builder.ts))

### Approach
Provides minimal generic operations instead of specialized methods.

```typescript
// Only 5 operations:
merge(partial)        // Merge configuration
map(transform)        // Transform state
set(key, value)       // Set single property
unset(key)           // Remove property
when(cond, then)     // Conditional application
```

### Characteristics

**Pros:**
- Minimal API surface (5 methods)
- Highly composable
- Easy to extend via user-defined functions
- No method explosion
- Easier to test
- Functional programming style

**Cons:**
- Less discoverable (no specialized methods)
- Requires more knowledge of configuration options
- Basic type checking (compatibility, not validation)
- No runtime validation

### Example

```typescript
// Reusable helpers
function asLibrary(builder) {
  return builder.merge({
    format: ['cjs', 'esm'] as const,
    dts: true,
    external: [/^[^./]/],
  });
}

function forReact(builder) {
  return builder.merge({
    external: ['react', 'react-dom'],
  }).map(state => ({
    ...state,
    esbuildOptions: (opts) => { opts.jsx = 'automatic'; }
  }));
}

// Usage
const config = simpleBuilder()
  .set('entry', ['src/index.ts'])
  .merge(state => asLibrary(emptyBuilder().merge(state)))
  .merge(state => forReact(emptyBuilder().merge(state)))
  .build();
```

### When to Use
- Building composable configuration systems
- When you want maximum flexibility
- When users will define their own patterns
- When you prefer functional programming style
- For code generation or programmatic configuration

## 2. Robust Builder ([src/robust-builder.ts](../src/robust-builder.ts))

### Approach
Validates merged results with branded error types and optional runtime validation.

```typescript
type ValidateMerge<T, U> = ValidateMergedConfig<Merge2<T, U>>;

type ConstraintViolation<Message extends string> = {
  __constraint_violation__: Message;
  __this_merge_is_not_allowed__: never;
};
```

### Characteristics

**Pros:**
- Validates merged results, not just partials
- Excellent error messages via `ConstraintViolation<Message>`
- Optional runtime validation
- Runtime checks mirror type-level checks
- Can toggle validation for performance
- Handles complex constraint interdependencies

**Cons:**
- More complex type system
- Return types use `any` for practical reasons
- Runtime validation adds overhead (when enabled)
- Requires understanding of both type and runtime validation

### Example

```typescript
// Type-safe merge
const config = robustBuilder()
  .set('entry', ['src/index.ts'])
  .set('format', 'esm')
  .merge({
    splitting: true,  // ✅ OK: ESM supports splitting
  })
  .build();

// Constraint violation (compile-time error)
robustBuilder()
  .set('format', 'iife')
  .merge({
    splitting: true,  // ❌ ConstraintViolation<'Cannot enable splitting with IIFE format'>
  });

// Runtime validation
try {
  robustBuilder()
    .set('format', 'iife')
    .unsafeMerge({ splitting: true })
    .build();
} catch (error) {
  // BuilderConstraintError with detailed violations
}

// Toggle validation
const prod = robustBuilder().withoutRuntimeChecks();
const dev = robustBuilder().withRuntimeChecks();
```

### When to Use
- Building mission-critical configurations
- When you need both compile-time and runtime safety
- When error messages are crucial
- When constraints have complex interdependencies
- When you want optional runtime validation for development

## Type System Techniques

### Compatibility Checking (Simple Builder)

```typescript
type IsCompatibleWith<T, U> =
  // Check if partial U is compatible with current state T
  U extends { splitting: true }
    ? FormatIncludes<T['format'], 'iife'> extends true
      ? false  // IIFE can't have splitting
      : true
    : true;
```

### Merged Result Validation (Robust Builder)

```typescript
// Validate AFTER merging, not before
type ValidateMerge<T, U> = ValidateMergedConfig<Merge2<T, U>>;

// Chain of responsibility
type ValidateMergedConfig<Merged> =
  // Check 1
  Merged extends { splitting: true; format: infer F }
    ? FormatIncludes<F, 'iife'> extends true
      ? ConstraintViolation<'Cannot enable splitting with IIFE'>
      : ValidateConstraint2<Merged>
    : ValidateConstraint2<Merged>;

type ValidateConstraint2<Merged> =
  // Check 2
  // ...
```

### Non-Distributive Type Checking

```typescript
// Without tuple wrapping (incorrect):
type FormatIncludes<Format, Target> =
  Format extends Target ? true : false;
// FormatIncludes<'esm' | 'iife', 'iife'> = boolean ❌

// With tuple wrapping (correct):
type FormatIncludes<Format, Target> =
  [Format] extends [Target] ? true : false;
// FormatIncludes<'esm' | 'iife', 'iife'> = true ✅
```

## Constraint Validation Examples

### IIFE + Splitting

```typescript
// Simple Builder
simpleBuilder()
  .set('format', ['iife'])
  .merge({ splitting: true })  // ❌ Type error: incompatible

// Robust Builder
robustBuilder()
  .set('format', ['iife'])
  .merge({ splitting: true })  // ❌ ConstraintViolation<'Cannot enable splitting...'>
```

### Browser + Shims

```typescript
// Simple Builder
simpleBuilder()
  .set('platform', 'browser')
  .merge({ shims: true })  // ❌ Type error: incompatible

// Robust Builder
robustBuilder()
  .set('platform', 'browser')
  .merge({ shims: true })  // ❌ ConstraintViolation<'Cannot use shims with browser...'>
```

## Performance Comparison

### Compile Time

| Builder | Type Checking Speed | Memory Usage |
|---------|-------------------|--------------|
| Simple | Fast | Low (few types) |
| Robust | Slow | High (complex validation) |

### Runtime

| Builder | Overhead | Validation |
|---------|----------|-----------|
| Simple | Low | None |
| Robust | Low-High* | Optional |

*Depends on whether runtime validation is enabled

## Testing

### Test Coverage

| Builder | Tests | Coverage |
|---------|-------|----------|
| Simple | 25 tests | Generic operations, composition |
| Robust | 40 tests | Constraint validation, runtime checks |

### What's Tested

**Simple Builder:**
- 5 core operations
- Compatibility checking
- State immutability
- Real-world scenarios

**Robust Builder:**
- All 5 constraint checks
- Runtime validation
- Error message quality
- Validation toggling
- Multiple constraint violations

## Migration Guide

### From Simple to Robust

```typescript
// Before (Simple)
simpleBuilder()
  .merge({ format: ['esm'], splitting: true })

// After (Robust)
robustBuilder()
  .merge({ format: ['esm'], splitting: true })  // Same API!
  .build();

// Enable runtime validation
robustBuilder()
  .withRuntimeChecks()  // Add this for runtime safety
  .merge({ format: ['esm'], splitting: true })
  .build();
```

## Recommendations

### Choose Simple Builder if:
- ✅ Building composable systems
- ✅ Users will create custom patterns
- ✅ You prefer functional programming
- ✅ Minimal API surface is desired
- ✅ Code generation is involved

### Choose Robust Builder if:
- ✅ Safety is paramount
- ✅ Error messages are crucial
- ✅ Complex constraint validation needed
- ✅ Both compile-time and runtime checking desired
- ✅ Configurations have interdependent constraints

## Future Improvements

### Simple Builder
- [ ] Better type inference for merge()
- [ ] Standard library of reusable helpers
- [ ] Documentation generator

### Robust Builder
- [ ] More sophisticated constraint validation
- [ ] Performance optimization for type checking
- [ ] Better error message customization
- [ ] Constraint composition API

## Conclusion

Both builders serve different needs:

- **Simple Builder**: Best for composable, functional configuration building
- **Robust Builder**: Best for mission-critical configurations with comprehensive validation

Choose based on your specific requirements for API surface, type safety, runtime validation, and extensibility.
