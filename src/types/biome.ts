export type BiomeId =
  | "temperate-rainforest"
  | "desert-oasis"
  | "savanna"
  | "arctic-tundra"
  | "amazon-floodplain"
  | "alpine-meadow"
  | "coral-reef";

export type BiomeIconKey = "forest" | "sun" | "savanna" | "snow" | "river" | "mountain" | "reef";
export type TerrainStyle = "valley" | "dunes" | "grassland" | "tundra" | "floodplain" | "alpine" | "seabed";
export type FloraStyle = "conifer" | "cactus" | "acacia" | "tundra" | "rainforest" | "alpine" | "coral";
export type WaterStyle = "river" | "oasis" | "waterhole" | "ice-stream" | "floodplain" | "glacial" | "ocean";

export type SpeciesRole = "deer" | "rabbit" | "bird" | "fish" | "frog" | "bee" | "butterfly" | "dragonfly";

export type BiomeSpecies = {
  id: SpeciesRole;
  name: string;
  scientificName: string;
  category: string;
  habitat: string;
  role: string;
  description: string;
  primary: string;
  secondary: string;
};

export type BiomeConfig = {
  id: BiomeId;
  name: string;
  shortLabel: string;
  location: string;
  tagline: string;
  iconKey: BiomeIconKey;
  climate: string;
  terrainStyle: TerrainStyle;
  floraStyle: FloraStyle;
  waterStyle: WaterStyle;
  palette: {
    skyTop: string;
    skyHorizon: string;
    fog: string;
    ground: string;
    groundDry: string;
    cliff: string;
    water: string;
    waterPolluted: string;
    flora: string;
    floraSecondary: string;
    accent: string;
    sunlight: string;
  };
  pressures: { pollution: string; drought: string; habitatLoss: string; invasiveSpecies: string };
  mission: string;
  focalSpecies: SpeciesRole[];
  ambientSpecies: string[];
  signatureFlora: string[];
  species: Record<SpeciesRole, BiomeSpecies>;
};
