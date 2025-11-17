import type { BuildOptions } from 'esbuild';

import { partial } from './partial.ts';

/** Utility function that creates the esbuild config for defining a banner at the top of the generate files. */
export const banner = (banner: string) =>
  partial({
    esbuildOptions: (options: BuildOptions) => {
      options.banner = {
        js: banner,
      };
    },
  });
