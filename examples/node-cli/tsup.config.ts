import { tsupBuilder } from '@gfmio/config-tsup/builder';

// CLI tool with minification and shebang
export default tsupBuilder()
  .entry('src/cli.ts')
  .asCli('node')
  .minify({ keepNames: true })  // Keep function names for better error messages
  .watch('node dist/cli.js')     // Auto-restart in watch mode
  .build();