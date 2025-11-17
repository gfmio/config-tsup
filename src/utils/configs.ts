import type { Options } from 'tsup';

/** Utility function for defining arrays of tsup config objects that ensures that each item is a valid config. */
export function configs<const T extends Options[]>(...configs: T): T;
export function configs<const T extends Options[]>(configs: T): T;
export function configs<const T extends Options[]>(
  ...args:
    | [
        T,
      ]
    | T
): T;
export function configs<const T extends Options[]>(
  ...args:
    | [
        T,
      ]
    | T
): T {
  if (args.length === 0) {
    return [] as Options[] as T;
  }

  if (Array.isArray(args[0])) {
    return args[0];
  }

  return args as Options[] as T;
}
