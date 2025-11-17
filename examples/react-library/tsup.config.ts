import { tsupBuilder } from '@gfmio/config-tsup/builder';

// React component library with automatic JSX transform
export default tsupBuilder()
  .entry('src/index.ts')
  .asLibrary()
  .dualFormat()
  .withTypes()
  .forReact()
  .build();