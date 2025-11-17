// Example 3: Using constants
import { DIST, NODE_LTS } from '@gfmio/config-tsup/constants';
// Example 2: Using partials to compose custom config
import { base, esm, node, production } from '@gfmio/config-tsup/partials';
import { config, merge } from '@gfmio/config-tsup/utils';

// Example 4: Building a custom configuration
const _customConfig = config(
  merge(base, node, production, esm, {
    entry: [
      'src/index.ts',
    ],
    outDir: DIST,
    target: NODE_LTS,
  }),
);

// Example 5: Using the default export (self-configuring)
import defaultConfig from '@gfmio/config-tsup';

export default defaultConfig;
