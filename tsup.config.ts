import { neutralLibrary } from "@/presets";
import { entry } from "@/utils/entry";
import { merge } from "@/utils/merge";

export default neutralLibrary.map((config) =>
  merge(config, entry({
    index: "src/index.ts",
    constants: "src/constants.ts",
    partials: "src/partials.ts",
    presets: "src/presets.ts",
    utils: "src/utils/index.ts",
  }))
);
