import { neutralLibrary } from '@/presets.ts';
import { entry } from '@/utils/entry.ts';
import { merge } from '@/utils/merge.ts';

export default neutralLibrary.map((config) =>
  merge(
    config,
    entry({
      constants: 'src/constants.ts',
      index: 'src/index.ts',
      partials: 'src/partials.ts',
      presets: 'src/presets.ts',
      utils: 'src/utils/index.ts',
      builder: 'src/builder.ts',
      validation: 'src/validation.ts',
      cli: 'src/cli.ts',
    }),
  ),
);
