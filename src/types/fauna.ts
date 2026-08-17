import type { BiomeId, SpeciesRole } from "./biome";

export type AnimalVisualKind =
  | "deer"
  | "pronghorn"
  | "gazelle"
  | "caribou"
  | "brocket"
  | "musk-deer"
  | "rabbit"
  | "jackrabbit"
  | "hare"
  | "paca"
  | "slug"
  | "bird"
  | "wren"
  | "roller"
  | "owl"
  | "macaw"
  | "monal"
  | "fish"
  | "catfish"
  | "shark"
  | "frog"
  | "bullfrog"
  | "bee"
  | "butterfly"
  | "dragonfly"
  | "turtle"
  | "tortoise"
  | "ray"
  | "elephant"
  | "canid"
  | "otter"
  | "javelina"
  | "warthog"
  | "marmot"
  | "muskox"
  | "bear"
  | "feline"
  | "capybara"
  | "yak"
  | "dolphin"
  | "crocodile"
  | "seahorse"
  | "jellyfish"
  | "octopus"
  | "clam";

export type FaunaMotion = "ground" | "hop" | "flight" | "hover" | "river" | "midwater" | "benthic";

export type FaunaSpawn = {
  id: string;
  role: SpeciesRole;
  label: string;
  kind: AnimalVisualKind;
  motion: FaunaMotion;
  anchor: readonly [number, number];
  count: number;
  spread: number;
  scale: number;
  speed: number;
  radius: readonly [number, number];
  height: number;
  primary?: string;
  secondary?: string;
  scientificName?: string;
  category?: string;
  habitat?: string;
  ecologicalBeat: string;
};

export type BiomeFaunaProfile = {
  biomeId: BiomeId;
  generationSeed: number;
  interaction: string;
  spawns: readonly FaunaSpawn[];
};
