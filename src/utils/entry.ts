export type Entry<T extends string | string[] | Record<string, string>> = T extends string ? { entry: [T]; } : { entry: T; };

/** Utility function that creates a tsup entry object for the argument */
export function entry<T extends string>(entry: T): Entry<T>;
export function entry<T extends string[]>(entries: T): Entry<T>;
export function entry<T extends string[]>(...entries: T): Entry<T>;
export function entry<T extends Record<string, string>>(entryMap: T): Entry<T>;
export function entry<T extends [string] | [string[]] | [Record<string, string>] | string[]>(...args: T): T extends [infer U] ? U extends (string | string[] | Record<string, string>) ? Entry<U> : never : T extends string[] ? Entry<T> : never;
export function entry(...args: [string] | [string[]] | [Record<string, string>] | string[]) {
  if (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0])) {
    // Handle object mapping
    return { entry: args[0] };
  }
  // Handle string or array
  return {
    entry: args.flat(1)
  };
}
