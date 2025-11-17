#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

program
  .name('example-cli')
  .description('Example CLI tool built with tsup')
  .version('1.0.0');

program
  .command('greet <name>')
  .description('Greet someone')
  .option('-e, --emoji', 'Add emoji to greeting')
  .action((name, options) => {
    const greeting = options.emoji
      ? `👋 Hello, ${name}! 🎉`
      : `Hello, ${name}!`;
    console.log(chalk.green(greeting));
  });

program
  .command('count <file>')
  .description('Count lines in a file')
  .action(async (file) => {
    if (!existsSync(file)) {
      console.error(chalk.red(`Error: File "${file}" not found`));
      process.exit(1);
    }

    try {
      const content = await readFile(file, 'utf-8');
      const lines = content.split('\n').length;
      console.log(chalk.blue(`File "${file}" has ${lines} lines`));
    } catch (error) {
      console.error(chalk.red(`Error reading file: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('transform <input> <output>')
  .description('Transform a file to uppercase')
  .action(async (input, output) => {
    try {
      const content = await readFile(input, 'utf-8');
      const transformed = content.toUpperCase();
      await writeFile(output, transformed);
      console.log(chalk.green(`✓ Transformed "${input}" to "${output}"`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();