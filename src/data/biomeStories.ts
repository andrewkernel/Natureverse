import type { BiomeId } from "../types/biome";

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

export type BiomeStoryBeat = {
  durationMs: 5000;
  subtitle: string;
  effect: BiomeStoryEffect;
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
      { durationMs: 5000, subtitle: "Rain settles on Douglas fir and sword fern.", effect: "rain" },
      { durationMs: 5000, subtitle: "Moss keeps the forest floor cool between storms.", effect: "mist" },
      { durationMs: 5000, subtitle: "A cutthroat trout holds in cold, oxygen-rich water.", effect: "current" },
      { durationMs: 5000, subtitle: "Jays cache seeds that can become tomorrow's canopy.", effect: "canopy" },
    ],
  },
  "desert-oasis": {
    biomeId: "desert-oasis",
    biomeName: "Sonoran Oasis",
    title: "A Spring in the Dry Country",
    durationMs: 20000,
    beats: [
      { durationMs: 5000, subtitle: "Before sunrise, the oasis is cooler than the open desert.", effect: "dawn" },
      { durationMs: 5000, subtitle: "A spring gives pupfish and frogs water year-round.", effect: "current" },
      { durationMs: 5000, subtitle: "Cactus bees move pollen during a brief bloom.", effect: "fireflies" },
      { durationMs: 5000, subtitle: "Shade from palo verde slows water loss for everything beneath it.", effect: "sand" },
    ],
  },
  savanna: {
    biomeId: "savanna",
    biomeName: "Acacia Savanna",
    title: "Between Rain and Fire",
    durationMs: 20000,
    beats: [
      { durationMs: 5000, subtitle: "The first rains wake seeds hidden in dry grass.", effect: "rain" },
      { durationMs: 5000, subtitle: "Gazelles follow fresh growth across open ground.", effect: "wind" },
      { durationMs: 5000, subtitle: "A waterhole concentrates life through the dry season.", effect: "current" },
      { durationMs: 5000, subtitle: "Cool, patchy fire renews grass without erasing every refuge.", effect: "fire" },
    ],
  },
  "arctic-tundra": {
    biomeId: "arctic-tundra",
    biomeName: "Arctic Tundra",
    title: "The Summer Measured in Light",
    durationMs: 20000,
    beats: [
      { durationMs: 5000, subtitle: "Low sun warms a landscape still anchored by permafrost.", effect: "dawn" },
      { durationMs: 5000, subtitle: "Snowmelt gathers in shallow ponds above frozen ground.", effect: "current" },
      { durationMs: 5000, subtitle: "Caribou carry nutrients along an ancient migration route.", effect: "wind" },
      { durationMs: 5000, subtitle: "For a few weeks, bees and flowers race the returning cold.", effect: "aurora" },
    ],
  },
  "amazon-floodplain": {
    biomeId: "amazon-floodplain",
    biomeName: "Amazon Floodplain",
    title: "When the Forest Becomes a River",
    durationMs: 20000,
    beats: [
      { durationMs: 5000, subtitle: "Rising water carries the river into the forest.", effect: "rain" },
      { durationMs: 5000, subtitle: "Tambaqui eat fallen fruit beneath flooded trees.", effect: "current" },
      { durationMs: 5000, subtitle: "The fish disperse seeds through a submerged forest.", effect: "canopy" },
      { durationMs: 5000, subtitle: "As water falls, fruit, fish, and forest reconnect on land.", effect: "mist" },
    ],
  },
  "alpine-meadow": {
    biomeId: "alpine-meadow",
    biomeName: "Himalayan Meadow",
    title: "A Garden Above the Clouds",
    durationMs: 20000,
    beats: [
      { durationMs: 5000, subtitle: "Glacial melt begins a cold, clear descent through the valley.", effect: "current" },
      { durationMs: 5000, subtitle: "Warm slopes open a short window for alpine flowers.", effect: "dawn" },
      { durationMs: 5000, subtitle: "Bumble bees turn that brief bloom into seed and fruit.", effect: "wind" },
      { durationMs: 5000, subtitle: "Snow trout need the stream to stay cold and connected.", effect: "mist" },
    ],
  },
  "coral-reef": {
    biomeId: "coral-reef",
    biomeName: "Coral Reef",
    title: "The City Built by Animals",
    durationMs: 20000,
    beats: [
      { durationMs: 5000, subtitle: "Sunlight powers algae living inside reef-building corals.", effect: "reef" },
      { durationMs: 5000, subtitle: "A clownfish shelters inside its anemone's stinging tentacles.", effect: "canopy" },
      { durationMs: 5000, subtitle: "Cleaner wrasse remove parasites at a busy station.", effect: "current" },
      { durationMs: 5000, subtitle: "Clear, cooler water gives young coral a chance to grow.", effect: "reef" },
    ],
  },
} satisfies Record<BiomeId, BiomeStory>;
