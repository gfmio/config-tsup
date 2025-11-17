#!/usr/bin/env node

/**
 * Interactive CLI for generating tsup configurations
 */

import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

// Simple prompt implementation (no external dependencies)
async function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question + ' ');
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}

async function select(question: string, choices: string[]): Promise<string> {
  console.log(question);
  choices.forEach((choice, i) => {
    console.log(`  ${i + 1}. ${choice}`);
  });

  const answer = await prompt('Enter choice (number):');
  const index = parseInt(answer || '0') - 1;

  if (index >= 0 && index < choices.length) {
    return choices[index]!;
  }

  console.log('Invalid choice, please try again.');
  return select(question, choices);
}

async function confirm(question: string): Promise<boolean> {
  const answer = await prompt(`${question} (y/n):`);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

interface ConfigOptions {
  projectType: string;
  format: string[];
  platform: string;
  typescript: boolean;
  minify: boolean;
  sourcemap: boolean;
  bundleAnalysis: boolean;
  framework?: string;
  entry: string;
}

async function collectOptions(): Promise<ConfigOptions> {
  console.log('\n🚀 Welcome to tsup configuration generator!\n');

  const projectType = await select('What type of project is this?', [
    'Library (npm package)',
    'CLI Tool',
    'Browser Application',
    'Node.js Application',
    'React Component Library',
    'Vue Component Library',
    'Serverless Function'
  ]);

  let format: string[] = [];
  if (projectType.includes('Library')) {
    const formatChoice = await select('Which module format(s) do you need?', [
      'Both CommonJS and ESM (recommended)',
      'ESM only (modern)',
      'CommonJS only (legacy)'
    ]);

    if (formatChoice.includes('Both')) {
      format = ['cjs', 'esm'];
    } else if (formatChoice.includes('ESM')) {
      format = ['esm'];
    } else {
      format = ['cjs'];
    }
  } else if (projectType.includes('CLI')) {
    format = ['esm'];
  } else if (projectType.includes('Browser')) {
    format = ['esm'];
  } else {
    format = ['cjs'];
  }

  let platform = 'neutral';
  if (projectType.includes('CLI') || projectType.includes('Node.js')) {
    platform = 'node';
  } else if (projectType.includes('Browser')) {
    platform = 'browser';
  }

  const typescript = !projectType.includes('CLI') &&
    await confirm('Generate TypeScript declarations?');

  const minify = projectType.includes('CLI') || projectType.includes('Browser') ||
    await confirm('Minify the output?');

  const sourcemap = await confirm('Generate source maps?');

  const bundleAnalysis = await confirm('Enable bundle size analysis?');

  let framework: string | undefined;
  if (projectType.includes('React')) {
    framework = 'react';
  } else if (projectType.includes('Vue')) {
    framework = 'vue';
  }

  const entry = await prompt('Entry point (default: src/index.ts):') || 'src/index.ts';

  const result: ConfigOptions = {
    projectType,
    format,
    platform,
    typescript,
    minify,
    sourcemap,
    bundleAnalysis,
    entry
  };

  if (framework) {
    result.framework = framework;
  }

  return result;
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

function generatePackageJsonScripts(options: ConfigOptions): string {
  const scripts: Record<string, string> = {
    build: 'tsup',
    dev: 'tsup --watch'
  };

  if (options.projectType.includes('CLI')) {
    scripts['start'] = `node dist/${options.entry.replace('src/', '').replace('.ts', '.mjs')}`;
  }

  return JSON.stringify(scripts, null, 2).slice(1, -1);
}

async function main() {
  try {
    // Check if tsup.config.ts already exists
    const configPath = resolve(process.cwd(), 'tsup.config.ts');
    if (existsSync(configPath)) {
      const overwrite = await confirm('tsup.config.ts already exists. Overwrite?');
      if (!overwrite) {
        console.log('Aborted.');
        process.exit(0);
      }
    }

    // Collect options
    const options = await collectOptions();

    // Generate configuration
    const config = generateConfig(options);

    // Show preview
    console.log('\n📝 Generated configuration:\n');
    console.log('```typescript');
    console.log(config);
    console.log('```\n');

    // Confirm and write
    const proceed = await confirm('Write this configuration to tsup.config.ts?');

    if (proceed) {
      writeFileSync(configPath, config);
      console.log('✅ Created tsup.config.ts');

      // Suggest package.json scripts
      console.log('\n📦 Add these scripts to your package.json:\n');
      console.log('```json');
      console.log(generatePackageJsonScripts(options));
      console.log('```\n');

      console.log('🎉 Done! Run `npm install @gfmio/config-tsup tsup` to install dependencies.');
    } else {
      console.log('Aborted.');
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    process.stdin.pause();
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };