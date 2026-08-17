import type { BiomeId } from "../types/biome";
import type { SimulationControls } from "../types/ecosystem";

export type BiomeStoryEffect =
  | "dawn"
  | "rain"
  | "wind"
  | "mist"
  | "canopy"
  | "current"
  | "sand"
  | "aurora"
  | "fireflies"
  | "fire"
  | "reef";

export type EcologicalStoryPhase = "thriving" | "pressured" | "collapsed" | "restoring";

export type BiomeStoryBeat = {
  durationMs: 5000;
  subtitle: string;
  effect: BiomeStoryEffect;
  phase: EcologicalStoryPhase;
  conditions: SimulationControls;
};

export type BiomeStory = {
  biomeId: BiomeId;
  biomeName: string;
  title: string;
  durationMs: 20000;
  beats: readonly [BiomeStoryBeat, BiomeStoryBeat, BiomeStoryBeat, BiomeStoryBeat];
};

export const BIOME_STORIES = {
  "temperate-rainforest": {
    biomeId: "temperate-rainforest",
    biomeName: "Cascadian Rainforest",
    title: "The River Beneath the Moss",
    durationMs: 20000,
    beats: [
      { durationMs: 5000, subtitle: "Rain settles on Douglas fir as cold water carries cutthroat trout below.", effect: "rain", phase: "thriving", conditions: { pollution: 0, drought: 0, habitatLoss: 0, invasiveSpecies: false } },
      { durationMs: 5000, subtitle: "Runoff and heat begin to cloud the stream; the shaded refuge starts shrinking.", effect: "mist", phase: "pressured", conditions: { pollution: 44, drought: 38, habitatLoss: 32, invasiveSpecies: false } },
      { durationMs: 5000, subtitle: "Clear-cut slopes and contaminated water break the food web; the river falls silent.", effect: "fire", phase: "collapsed", conditions: { pollution: 94, drought: 92, habitatLoss: 88, invasiveSpecies: true } },
      { durationMs: 5000, subtitle: "Riparian trees return, runoff is stopped, and cool water reconnects the forest.", effect: "canopy", phase: "restoring", conditions: { pollution: 0, drought: 0, habitatLoss: 0, invasiveSpecies: false } },
    ],
  },
  "desert-oasis": {
    biomeId: "desert-oasis",
    biomeName: "Sonoran Oasis",
    title: "A Spring in the Dry Country",
    durationMs: 20000,
    beats: [
      { durationMs: 5000, subtitle: "Before sunrise, a living spring shelters pupfish, frogs, and flowering cactus.", effect: "dawn", phase: "thriving", conditions: { pollution: 0, drought: 0, habitatLoss: 0, invasiveSpecies: false } },
      { durationMs: 5000, subtitle: "Groundwater is pulled down and the oasis contracts into a warm, crowded pool.", effect: "sand", phase: "pressured", conditions: { pollution: 28, drought: 58, habitatLoss: 34, invasiveSpecies: false } },
      { durationMs: 5000, subtitle: "The spring fails. Heat, invasive grass, and runoff leave no refuge behind.", effect: "fire", phase: "collapsed", conditions: { pollution: 88, drought: 96, habitatLoss: 76, invasiveSpecies: true } },
      { durationMs: 5000, subtitle: "A protected aquifer and native shade plants refill the oasis from the ground up.", effect: "current", phase: "restoring", conditions: { pollution: 0, drought: 0, habitatLoss: 0, invasiveSpecies: false } },
    ],
  },
  savanna: {
    biomeId: "savanna",
    biomeName: "Acacia Savanna",
    title: "Between Rain and Fire",
    durationMs: 20000,
    beats: [
      { durationMs: 5000, subtitle: "Rain wakes the grasslands, and gazelles move freely between acacia shade and water.", effect: "rain", phase: "thriving", conditions: { pollution: 0, drought: 0, habitatLoss: 0, invasiveSpecies: false } },
      { durationMs: 5000, subtitle: "Fences narrow the migration route as failed rains drain the waterhole.", effect: "wind", phase: "pressured", conditions: { pollution: 22, drought: 54, habitatLoss: 52, invasiveSpecies: false } },
      { durationMs: 5000, subtitle: "Uncontrolled fire and a dry, fenced landscape leave animals with nowhere to move.", effect: "fire", phase: "collapsed", conditions: { pollution: 76, drought: 94, habitatLoss: 92, invasiveSpecies: true } },
      { durationMs: 5000, subtitle: "Migration gates reopen, clean water returns, and cool patch burns renew the grass.", effect: "current", phase: "restoring", conditions: { pollution: 0, drought: 0, habitatLoss: 0, invasiveSpecies: false } },
    ],
  },
  "arctic-tundra": {
    biomeId: "arctic-tundra",
    biomeName: "Arctic Tundra",
    title: "The Summer Measured in Light",
    durationMs: 20000,
    beats: [
      { durationMs: 5000, subtitle: "Snowmelt ponds and a brief flower season feed caribou across intact tundra.", effect: "dawn", phase: "thriving", conditions: { pollution: 0, drought: 0, habitatLoss: 0, invasiveSpecies: false } },
      { durationMs: 5000, subtitle: "Early thaw, dust, and roads begin to fragment the route between thaw ponds.", effect: "wind", phase: "pressured", conditions: { pollution: 38, drought: 45, habitatLoss: 46, invasiveSpecies: false } },
      { durationMs: 5000, subtitle: "Permafrost collapses, ponds disappear, and the migration corridor becomes a barrier.", effect: "mist", phase: "collapsed", conditions: { pollution: 82, drought: 91, habitatLoss: 84, invasiveSpecies: true } },
      { durationMs: 5000, subtitle: "Protected crossings and clean thaw ponds give the short summer its life back.", effect: "aurora", phase: "restoring", conditions: { pollution: 0, drought: 0, habitatLoss: 0, invasiveSpecies: false } },
    ],
  },
  "amazon-floodplain": {
    biomeId: "amazon-floodplain",
    biomeName: "Amazon Floodplain",
    title: "When the Forest Becomes a River",
    durationMs: 20000,
    beats: [
      { durationMs: 5000, subtitle: "Seasonal floodwater carries fish through a forest full of fruit, roots, and shelter.", effect: "rain", phase: "thriving", conditions: { pollution: 0, drought: 0, habitatLoss: 0, invasiveSpecies: false } },
      { durationMs: 5000, subtitle: "Mercury runoff and clearing turn the flood pulse into a stressed, broken corridor.", effect: "current", phase: "pressured", conditions: { pollution: 58, drought: 38, habitatLoss: 54, invasiveSpecies: false } },
      { durationMs: 5000, subtitle: "When forest and water are both cut off, fish, fruit, and wildlife lose their passage.", effect: "fire", phase: "collapsed", conditions: { pollution: 94, drought: 84, habitatLoss: 94, invasiveSpecies: true } },
      { durationMs: 5000, subtitle: "Restored floodplain forest filters the river and reconnects the submerged food web.", effect: "canopy", phase: "restoring", conditions: { pollution: 0, drought: 0, habitatLoss: 0, invasiveSpecies: false } },
    ],
  },
  "alpine-meadow": {
    biomeId: "alpine-meadow",
    biomeName: "Himalayan Meadow",
    title: "A Garden Above the Clouds",
    durationMs: 20000,
    beats: [
      { durationMs: 5000, subtitle: "Cold glacial water feeds alpine flowers, bumble bees, and a clear snow-trout stream.", effect: "current", phase: "thriving", conditions: { pollution: 0, drought: 0, habitatLoss: 0, invasiveSpecies: false } },
      { durationMs: 5000, subtitle: "Warming snowmelt and trail damage shorten the flowering window on the slope.", effect: "wind", phase: "pressured", conditions: { pollution: 26, drought: 52, habitatLoss: 46, invasiveSpecies: false } },
      { durationMs: 5000, subtitle: "A retreating glacier and scarred hillside leave the stream too warm and disconnected.", effect: "mist", phase: "collapsed", conditions: { pollution: 78, drought: 94, habitatLoss: 82, invasiveSpecies: true } },
      { durationMs: 5000, subtitle: "Protected headwaters and repaired trails let flowers and cold water return together.", effect: "dawn", phase: "restoring", conditions: { pollution: 0, drought: 0, habitatLoss: 0, invasiveSpecies: false } },
    ],
  },
  "coral-reef": {
    biomeId: "coral-reef",
    biomeName: "Coral Reef",
    title: "The City Built by Animals",
    durationMs: 20000,
    beats: [
      { durationMs: 5000, subtitle: "Sunlight powers living coral, and every crevice shelters a reef community.", effect: "reef", phase: "thriving", conditions: { pollution: 0, drought: 0, habitatLoss: 0, invasiveSpecies: false } },
      { durationMs: 5000, subtitle: "Heat and plastic stress the reef; fish lose the structure that keeps them safe.", effect: "current", phase: "pressured", conditions: { pollution: 56, drought: 46, habitatLoss: 48, invasiveSpecies: false } },
      { durationMs: 5000, subtitle: "Bleaching and breakage turn a living city into a pale, scattered seabed.", effect: "mist", phase: "collapsed", conditions: { pollution: 94, drought: 94, habitatLoss: 90, invasiveSpecies: true } },
      { durationMs: 5000, subtitle: "Cooler, cleaner water lets young coral settle and rebuild shelter for the whole reef.", effect: "reef", phase: "restoring", conditions: { pollution: 0, drought: 0, habitatLoss: 0, invasiveSpecies: false } },
    ],
  },
} satisfies Record<BiomeId, BiomeStory>;
