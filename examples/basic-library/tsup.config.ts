import { tsupBuilder } from '@gfmio/config-tsup/builder';

// Simple library with dual format and TypeScript declarations
export default tsupBuilder()
  .entry('src/index.ts')
  .asLibrary()
  .dualFormat()
  .withTypes()
  .build();
