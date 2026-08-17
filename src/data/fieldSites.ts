import type { BiomeId } from "../types/biome";

// [latitude, longitude] of the actual field site represented by each biome.
// Both the launch model and the Atlas consume this source so their markers
// cannot drift to nearby cities or a different region.
export const FIELD_SITE_COORDINATES: Record<BiomeId, [number, number]> = {
  "temperate-rainforest": [47.8616, -123.9344], // Hoh Rain Forest, Washington
  "desert-oasis": [31.9518, -113.0208], // Quitobaquito Springs, Sonoran Desert
  savanna: [-2.3333, 34.8333], // Serengeti National Park, Tanzania
  "arctic-tundra": [70.2550, -148.3380], // Prudhoe Bay, Alaska North Slope
  "amazon-floodplain": [-3.1, -64.78], // Mamirauá floodplain, Brazil
  "alpine-meadow": [27.44, 92.09], // Sakteng alpine meadow, Bhutan
  "coral-reef": [-0.23, 130.53], // Raja Ampat, Indonesia
};
