import type { Options } from "tsup";

/** Utility function for defining a tsup config that guarantees that the argument is a valid and complete config. */
export const config = <const T extends Options>(options: T) => options;
