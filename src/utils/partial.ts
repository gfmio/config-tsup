import type { Options } from "tsup";

/**
 * Utility function for defining a partial tsup config
 * This version strictly enforces that only valid Options keys are allowed
 */
export const partial = <const T extends Partial<Options>>(
  options: T extends Partial<Options> ?
    keyof T extends keyof Options ? T : never
    : never
) => options;
