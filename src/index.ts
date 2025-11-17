// Main export: presets only and default config

export * from './presets.ts';

import { SRC_INDEX_TS } from './constants.ts';
import { neutralLibrary } from './presets.ts';
import { entry } from './utils/entry.ts';
import { merge } from './utils/merge.ts';

export default neutralLibrary.map((item) => merge(item, entry(SRC_INDEX_TS)));
