# Example Projects

This directory contains example projects demonstrating different configurations of @gfmio/config-tsup.

## Examples

### 1. Basic Library (`basic-library/`)

A simple TypeScript library with dual format (CJS + ESM) and type declarations.

**Features:**
- Dual format output (CommonJS and ESM)
- TypeScript declarations
- Clean API exports

**Usage:**
```bash
cd basic-library
npm install
npm run build
```

### 2. React Component Library (`react-library/`)

A React component library with automatic JSX transform and externalized dependencies.

**Features:**
- React 17+ automatic JSX transform
- Externalized React dependencies
- Component and hook exports
- TypeScript types for props

**Usage:**
```bash
cd react-library
npm install
npm run build
```

### 3. Node.js CLI Tool (`node-cli/`)

A command-line tool with multiple commands, using Commander.js and Chalk.

**Features:**
- Executable with shebang
- Multiple subcommands
- Colorized output with Chalk
- File operations
- Minified for smaller size

**Usage:**
```bash
cd node-cli
npm install
npm run build
npm start -- greet World --emoji
```

### 4. Browser Application (`browser-app/`)

A browser application with code splitting, Web Worker, and bundle analysis.

**Features:**
- Code splitting for lazy loading
- Web Worker for background processing
- Multiple entry points
- Bundle size analysis
- Dynamic imports

**Usage:**
```bash
cd browser-app
npm install
npm run build
npm run serve
```

Open browser to http://localhost:3000

## Common Patterns Demonstrated

### Using the Config Builder

All examples use the new fluent config builder API:

```typescript
import { tsupBuilder } from '@gfmio/config-tsup/builder';

export default tsupBuilder()
  .asLibrary()
  .dualFormat()
  .withTypes()
  .build();
```

### Environment-aware Configuration

Add environment detection:

```typescript
import { getBuildMode } from '@gfmio/config-tsup/utils';

export default tsupBuilder()
  .asLibrary()
  .env(getBuildMode())
  .build();
```

### Bundle Analysis

Enable bundle analysis in any example:

```typescript
export default tsupBuilder()
  .asLibrary()
  .withBundleAnalysis({
    warnThreshold: 200 * 1024  // 200KB
  })
  .build();
```

### Watch Mode with Auto-restart

For development with auto-restart:

```typescript
export default tsupBuilder()
  .asCli()
  .watch('node dist/cli.js')
  .build();
```

## Running Examples

Each example is self-contained and can be run independently:

1. Navigate to the example directory
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run the output (varies by example)

## Adding Your Own Examples

To add a new example:

1. Create a new directory under `examples/`
2. Add a `package.json` with tsup and @gfmio/config-tsup as dependencies
3. Create a `tsup.config.ts` using the config builder
4. Add your source code in `src/`
5. Document the example in this README

## Tips

- Use `npm run dev` for watch mode during development
- Check `dist/` directory for build output
- View `dist/bundle-analysis-*.html` for visualization (if enabled)
- Use `workspace:*` for @gfmio/config-tsup in monorepo setups