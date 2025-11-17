import { describe, expect, it } from 'bun:test';

// We'll test the config generation logic since the interactive parts are hard to test
// This simulates what the CLI generates based on different options

interface ConfigOptions {
  projectType: string;
  format: string[];
  platform: string;
  typescript: boolean;
  minify: boolean;
  sourcemap: boolean;
  bundleAnalysis: boolean;
  framework?: string;
  entry?: string;
}

function generateConfig(options: ConfigOptions): string {
  const lines: string[] = [];

  lines.push(`import { tsupBuilder } from '@gfmio/config-tsup/builder';`);
  lines.push('');
  lines.push('export default tsupBuilder()');

  // Entry point
  lines.push(`  .entry('${options.entry}')`);

  // Project type specifics
  if (options.projectType.includes('Library')) {
    lines.push('  .asLibrary()');

    if (options.format.length === 2) {
      lines.push('  .dualFormat()');
    } else {
      lines.push(`  .format('${options.format[0]}')`);
    }

    if (options.typescript) {
      lines.push('  .withTypes()');
    }
  } else if (options.projectType.includes('CLI')) {
    lines.push(`  .asCli('node')`);
  } else if (options.projectType.includes('Browser')) {
    lines.push('  .asBrowserBundle()');
    lines.push('  .withSplitting()');
  } else if (options.projectType.includes('Serverless')) {
    lines.push(`  .format('cjs')`);
    lines.push(`  .platform('node')`);
    lines.push(`  .target('node18')`);
    lines.push(`  .external(['aws-sdk', '@aws-sdk/*'])`);
  }

  // Framework specific
  if (options.framework === 'react') {
    lines.push('  .forReact()');
  } else if (options.framework === 'vue') {
    lines.push('  .forVue()');
  }

  // Minification
  if (options.minify && !options.projectType.includes('CLI')) {
    lines.push('  .minify()');
  }

  // Source maps
  if (options.sourcemap) {
    if (options.projectType.includes('Browser')) {
      lines.push(`  .sourcemap('external')`);
    } else {
      lines.push('  .sourcemap(true)');
    }
  }

  // Bundle analysis
  if (options.bundleAnalysis) {
    lines.push('  .withBundleAnalysis()');
  }

  lines.push('  .build();');

  return lines.join('\n');
}

function generatePackageJsonScripts(options: ConfigOptions): Record<string, string> {
  const scripts: Record<string, string> = {
    build: 'tsup',
    dev: 'tsup --watch'
  };

  if (options.projectType.includes('CLI')) {
    scripts.start = `node dist/${options.entry?.replace('src/', '').replace('.ts', '.mjs') || 'cli.mjs'}`;
  }

  return scripts;
}

describe('CLI Config Generation', () => {
  describe('generateConfig', () => {
    it('should generate library configuration', () => {
      const options: ConfigOptions = {
        projectType: 'Library (npm package)',
        format: ['cjs', 'esm'],
        platform: 'neutral',
        typescript: true,
        minify: false,
        sourcemap: true,
        bundleAnalysis: false,
        entry: 'src/index.ts',
      };

      const config = generateConfig(options);

      expect(config).toContain("import { tsupBuilder } from '@gfmio/config-tsup/builder';");
      expect(config).toContain(".entry('src/index.ts')");
      expect(config).toContain('.asLibrary()');
      expect(config).toContain('.dualFormat()');
      expect(config).toContain('.withTypes()');
      expect(config).toContain('.sourcemap(true)');
      expect(config).toContain('.build();');
    });

    it('should generate CLI configuration', () => {
      const options: ConfigOptions = {
        projectType: 'CLI Tool',
        format: ['esm'],
        platform: 'node',
        typescript: false,
        minify: true,
        sourcemap: true,
        bundleAnalysis: false,
        entry: 'src/cli.ts',
      };

      const config = generateConfig(options);

      expect(config).toContain(".asCli('node')");
      expect(config).toContain('.sourcemap(true)');
      expect(config).not.toContain('.minify()'); // CLI has minify built-in
    });

    it('should generate browser app configuration', () => {
      const options: ConfigOptions = {
        projectType: 'Browser Application',
        format: ['esm'],
        platform: 'browser',
        typescript: false,
        minify: true,
        sourcemap: true,
        bundleAnalysis: true,
        entry: 'src/app.ts',
      };

      const config = generateConfig(options);

      expect(config).toContain('.asBrowserBundle()');
      expect(config).toContain('.withSplitting()');
      expect(config).toContain('.minify()');
      expect(config).toContain(".sourcemap('external')");
      expect(config).toContain('.withBundleAnalysis()');
    });

    it('should generate React library configuration', () => {
      const options: ConfigOptions = {
        projectType: 'React Component Library',
        format: ['cjs', 'esm'],
        platform: 'browser',
        typescript: true,
        minify: false,
        sourcemap: true,
        bundleAnalysis: false,
        framework: 'react',
        entry: 'src/index.ts',
      };

      const config = generateConfig(options);

      expect(config).toContain('.asLibrary()');
      expect(config).toContain('.dualFormat()');
      expect(config).toContain('.withTypes()');
      expect(config).toContain('.forReact()');
    });

    it('should generate Vue library configuration', () => {
      const options: ConfigOptions = {
        projectType: 'Vue Component Library',
        format: ['esm'],
        platform: 'browser',
        typescript: true,
        minify: false,
        sourcemap: false,
        bundleAnalysis: false,
        framework: 'vue',
        entry: 'src/index.ts',
      };

      const config = generateConfig(options);

      expect(config).toContain('.asLibrary()');
      expect(config).toContain(".format('esm')");
      expect(config).toContain('.withTypes()');
      expect(config).toContain('.forVue()');
      expect(config).not.toContain('.sourcemap');
    });

    it('should generate serverless function configuration', () => {
      const options: ConfigOptions = {
        projectType: 'Serverless Function',
        format: ['cjs'],
        platform: 'node',
        typescript: false,
        minify: true,
        sourcemap: false,
        bundleAnalysis: false,
        entry: 'src/handler.ts',
      };

      const config = generateConfig(options);

      expect(config).toContain(".format('cjs')");
      expect(config).toContain(".platform('node')");
      expect(config).toContain(".target('node18')");
      expect(config).toContain(".external(['aws-sdk', '@aws-sdk/*'])");
      expect(config).toContain('.minify()');
    });

    it('should handle ESM-only library', () => {
      const options: ConfigOptions = {
        projectType: 'Library (npm package)',
        format: ['esm'],
        platform: 'neutral',
        typescript: true,
        minify: false,
        sourcemap: true,
        bundleAnalysis: false,
        entry: 'src/index.ts',
      };

      const config = generateConfig(options);

      expect(config).toContain('.asLibrary()');
      expect(config).toContain(".format('esm')");
      expect(config).not.toContain('.dualFormat()');
    });

    it('should handle CommonJS-only library', () => {
      const options: ConfigOptions = {
        projectType: 'Library (npm package)',
        format: ['cjs'],
        platform: 'node',
        typescript: false,
        minify: false,
        sourcemap: false,
        bundleAnalysis: false,
        entry: 'src/index.ts',
      };

      const config = generateConfig(options);

      expect(config).toContain('.asLibrary()');
      expect(config).toContain(".format('cjs')");
      expect(config).not.toContain('.withTypes()');
      expect(config).not.toContain('.sourcemap');
    });

    it('should add bundle analysis when requested', () => {
      const options: ConfigOptions = {
        projectType: 'Library (npm package)',
        format: ['esm'],
        platform: 'neutral',
        typescript: true,
        minify: false,
        sourcemap: true,
        bundleAnalysis: true,
        entry: 'src/index.ts',
      };

      const config = generateConfig(options);

      expect(config).toContain('.withBundleAnalysis()');
    });
  });

  describe('generatePackageJsonScripts', () => {
    it('should generate basic scripts for library', () => {
      const options: ConfigOptions = {
        projectType: 'Library (npm package)',
        format: ['cjs', 'esm'],
        platform: 'neutral',
        typescript: true,
        minify: false,
        sourcemap: true,
        bundleAnalysis: false,
        entry: 'src/index.ts',
      };

      const scripts = generatePackageJsonScripts(options);

      expect(scripts.build).toBe('tsup');
      expect(scripts.dev).toBe('tsup --watch');
      expect(scripts.start).toBeUndefined();
    });

    it('should add start script for CLI', () => {
      const options: ConfigOptions = {
        projectType: 'CLI Tool',
        format: ['esm'],
        platform: 'node',
        typescript: false,
        minify: true,
        sourcemap: true,
        bundleAnalysis: false,
        entry: 'src/cli.ts',
      };

      const scripts = generatePackageJsonScripts(options);

      expect(scripts.build).toBe('tsup');
      expect(scripts.dev).toBe('tsup --watch');
      expect(scripts.start).toBe('node dist/cli.mjs');
    });

    it('should handle custom entry for CLI start script', () => {
      const options: ConfigOptions = {
        projectType: 'CLI Tool',
        format: ['esm'],
        platform: 'node',
        typescript: false,
        minify: true,
        sourcemap: true,
        bundleAnalysis: false,
        entry: 'src/bin/mycli.ts',
      };

      const scripts = generatePackageJsonScripts(options);

      expect(scripts.start).toBe('node dist/bin/mycli.mjs');
    });
  });

  describe('Config Output Format', () => {
    it('should have proper indentation', () => {
      const options: ConfigOptions = {
        projectType: 'Library (npm package)',
        format: ['cjs', 'esm'],
        platform: 'neutral',
        typescript: true,
        minify: false,
        sourcemap: true,
        bundleAnalysis: false,
        entry: 'src/index.ts',
      };

      const config = generateConfig(options);
      const lines = config.split('\n');

      // Check that builder methods are indented
      expect(lines[3]).toMatch(/^  \./); // .entry()
      expect(lines[4]).toMatch(/^  \./); // .asLibrary()
      expect(lines[lines.length - 1]).toMatch(/^  \.build\(\);$/);
    });

    it('should have proper import statement', () => {
      const options: ConfigOptions = {
        projectType: 'Library (npm package)',
        format: ['esm'],
        platform: 'neutral',
        typescript: false,
        minify: false,
        sourcemap: false,
        bundleAnalysis: false,
        entry: 'src/index.ts',
      };

      const config = generateConfig(options);

      expect(config.startsWith("import { tsupBuilder } from '@gfmio/config-tsup/builder';")).toBe(true);
    });

    it('should end with build() call', () => {
      const options: ConfigOptions = {
        projectType: 'Library (npm package)',
        format: ['esm'],
        platform: 'neutral',
        typescript: false,
        minify: false,
        sourcemap: false,
        bundleAnalysis: false,
        entry: 'src/index.ts',
      };

      const config = generateConfig(options);

      expect(config.endsWith('  .build();')).toBe(true);
    });
  });
});