import type { Options } from "tsup";

export type Merge2<T extends Partial<Options>, U extends Partial<Options>> = Omit<T, keyof U> & U;
export type Merge<T extends Array<Partial<Options>>> = T extends [] ? Record<never, never> : T extends [infer U] ? U : T extends [infer U, ...infer R] ?  U extends Partial<Options> ? R extends Array<Partial<Options>> ? Merge2<U, Merge<R>> : never : never : never;

/** Utility function for merging tsup configs and/or partial configs */
export function merge(): Record<never, never>;
export function merge<T extends Partial<Options>>(partial: T): T;
export function merge<T extends Array<Partial<Options>>>(...partials: T): Merge<T>;
export function merge<T extends Array<Partial<Options>>>(...partials: T): Merge<T> {
  let result = {} as Merge<T>;

  for (const item of partials) {
    result = {
      ...result,
      ...item,
    }
  }

  return result;
}
