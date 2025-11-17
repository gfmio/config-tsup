import type { Options } from "tsup";

/** Utility function for defining a partial tsup config */
export const partial = <const T extends Partial<Options>>(options: T) => options;
