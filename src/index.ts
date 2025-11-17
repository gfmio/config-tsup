// Main export: presets only and default config

export * from "./presets";

import { SRC_INDEX_TS } from "./constants";
import { neutralLibrary } from "./presets";
import { entry } from "./utils/entry";
import { merge } from "./utils/merge";

export default neutralLibrary.map((item) => merge(item, entry(SRC_INDEX_TS)));
