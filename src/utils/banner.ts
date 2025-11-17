import { partial } from './partial';

/** Utility function that creates the esbuild config for defining a banner at the top of the generate files. */
export const banner = (banner: string) => partial({
  esbuildOptions: (options: import('esbuild').BuildOptions) => {
    options.banner = {
      js: banner,
    };
  }
});
