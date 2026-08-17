import type { BiomeId, SpeciesRole } from "../types/biome";

export type InterventionEffect = {
  pollution?: number;
  drought?: number;
  habitatLoss?: number;
  invasiveSpecies?: boolean;
};

export type RestorationAction = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  tradeoff: string;
  effect: InterventionEffect;
};

export type BiomeIntervention = {
  action: string;
  progress: string;
  outcome: string;
  lesson: string;
  focalRole: SpeciesRole;
  actions: RestorationAction[];
};

export const BIOME_INTERVENTIONS: Record<BiomeId, BiomeIntervention> = {
  "temperate-rainforest": {
    action: "Plant riparian buffer",
    progress: "Planting native streamside canopy…",
    outcome: "Cold-water corridor restored",
    lesson: "Streamside trees reduce runoff and add shade, helping trout and amphibians recover together.",
    focalRole: "fish",
    actions: [
      { id: "riparian-buffer", label: "Plant riparian buffer", shortLabel: "Riparian buffer", description: "Rebuild a native tree-and-shrub filter along the river.", tradeoff: "Best for runoff; slower habitat recovery.", effect: { pollution: 64, drought: 8 } },
      { id: "forest-corridor", label: "Reconnect forest corridor", shortLabel: "Forest corridor", description: "Link mature forest, wet meadow, and stream edge with native cover.", tradeoff: "Best for wildlife movement; does not clean water alone.", effect: { habitatLoss: 64 } },
      { id: "spawning-gravel", label: "Protect spawning gravel", shortLabel: "Spawning gravel", description: "Stabilize cold-water pools and fish spawning ground.", tradeoff: "Fast fish refuge; smaller whole-forest benefit.", effect: { drought: 52, pollution: 12, habitatLoss: 10 } },
    ],
  },
  "desert-oasis": {
    action: "Protect spring & shade",
    progress: "Rebuilding shade around the spring…",
    outcome: "Oasis refuge restored",
    lesson: "Protecting groundwater and native shade keeps the small oasis usable for fish, frogs, pollinators, and mammals.",
    focalRole: "fish",
    actions: [
      { id: "spring-protection", label: "Protect the spring", shortLabel: "Protect spring", description: "Fence and recharge the groundwater source that keeps the oasis alive.", tradeoff: "Strong water recovery; limited shade benefit.", effect: { drought: 64, pollution: 20 } },
      { id: "shade-grove", label: "Replant shade grove", shortLabel: "Shade grove", description: "Rebuild palo verde and mesquite shelter around the water.", tradeoff: "Cooler habitat; slower aquifer response.", effect: { habitatLoss: 64, drought: 12 } },
      { id: "runoff-cleanup", label: "Contain mine runoff", shortLabel: "Contain runoff", description: "Filter contaminated runoff before it reaches the spring pools.", tradeoff: "Immediate clarity; does not reconnect habitat.", effect: { pollution: 64 } },
    ],
  },
  savanna: {
    action: "Reopen migration corridor",
    progress: "Removing barriers and protecting water…",
    outcome: "Migration route restored",
    lesson: "Connected grassland and clean water let herds move, which redistributes nutrients and supports predators.",
    focalRole: "deer",
    actions: [
      { id: "remove-fences", label: "Open migration gates", shortLabel: "Open gates", description: "Remove barriers around the seasonal herd route.", tradeoff: "Strong corridor gain; water remains vulnerable.", effect: { habitatLoss: 64 } },
      { id: "waterhole-filter", label: "Filter the waterhole", shortLabel: "Filter waterhole", description: "Stop sediment and contaminants at the shared dry-season water source.", tradeoff: "Clean water fast; does not add cover.", effect: { pollution: 64, drought: 10 } },
      { id: "native-grass", label: "Seed native grass", shortLabel: "Seed grasses", description: "Restore resilient grazing patches around the route.", tradeoff: "Feeds herds later; smaller immediate change.", effect: { drought: 52, habitatLoss: 12 } },
    ],
  },
  "arctic-tundra": {
    action: "Protect thaw ponds",
    progress: "Securing ponds and migration ground…",
    outcome: "Tundra refuge restored",
    lesson: "Protecting thaw ponds and open routes supports breeding amphibians, cold-water fish, and migrating caribou.",
    focalRole: "deer",
    actions: [
      { id: "pond-buffer", label: "Protect thaw ponds", shortLabel: "Protect ponds", description: "Create a buffer around fragile summer water and breeding areas.", tradeoff: "Strong water benefit; migration stays exposed.", effect: { pollution: 64, drought: 18 } },
      { id: "raise-road", label: "Raise road crossings", shortLabel: "Raise crossings", description: "Reopen safe movement below the road and across permafrost.", tradeoff: "Strong corridor gain; no direct cooling.", effect: { habitatLoss: 64 } },
      { id: "native-sedge", label: "Restore native sedge", shortLabel: "Restore sedge", description: "Rebuild low tundra cover that holds moisture through the short summer.", tradeoff: "Gradual moisture recovery; modest water cleanup.", effect: { drought: 52, pollution: 12 } },
    ],
  },
  "amazon-floodplain": {
    action: "Reconnect flooded forest",
    progress: "Reopening seasonal flood channels…",
    outcome: "Flood forest reconnected",
    lesson: "Seasonal flood corridors let fruit-eating fish and river dolphins move through the forest and spread seeds.",
    focalRole: "fish",
    actions: [
      { id: "reopen-channels", label: "Reopen flood channels", shortLabel: "Open channels", description: "Reconnect seasonal water paths between river and flooded forest.", tradeoff: "Best connectivity; sediment takes time to settle.", effect: { habitatLoss: 64, drought: 18 } },
      { id: "riverbank-filter", label: "Plant riverbank filter", shortLabel: "Riverbank filter", description: "Use native roots and wetlands to trap runoff before the flood pulse.", tradeoff: "Strong water clarity; narrower habitat benefit.", effect: { pollution: 64 } },
      { id: "fruit-tree-islands", label: "Restore fruit-tree islands", shortLabel: "Fruit-tree islands", description: "Replant food-rich forest islands used by fish and seed-dispersing wildlife.", tradeoff: "Food-web recovery; slower water response.", effect: { drought: 52, habitatLoss: 12 } },
    ],
  },
  "alpine-meadow": {
    action: "Restore glacial stream",
    progress: "Protecting snowmelt and flower slopes…",
    outcome: "Alpine watershed restored",
    lesson: "A protected glacial stream links cold-water fish, narrow flower windows, pollinators, and high-slope grazers.",
    focalRole: "fish",
    actions: [
      { id: "stream-buffer", label: "Protect glacial stream", shortLabel: "Protect stream", description: "Stabilize snowmelt banks and filter runoff from the headwater.", tradeoff: "Strong clarity gain; flower slopes still fragment.", effect: { pollution: 64, drought: 18 } },
      { id: "flower-corridor", label: "Reconnect flower slopes", shortLabel: "Flower corridor", description: "Restore linked bloom patches across the alpine meadow.", tradeoff: "Pollinator gain; little direct water cleanup.", effect: { habitatLoss: 64 } },
      { id: "snow-fence", label: "Build snow fences", shortLabel: "Hold snowmelt", description: "Retain seasonal snow and release moisture slowly into the meadow.", tradeoff: "Longer growing season; modest habitat repair.", effect: { drought: 52, habitatLoss: 12 } },
    ],
  },
  "coral-reef": {
    action: "Rebuild nursery reef",
    progress: "Cooling the lagoon and restoring coral…",
    outcome: "Nursery reef restored",
    lesson: "Healthy coral structure, seagrass, and cleaner-fish stations create shelter and services across every reef depth.",
    focalRole: "fish",
    actions: [
      { id: "cool-lagoon", label: "Cool the lagoon", shortLabel: "Cool lagoon", description: "Reduce heat and contaminated runoff reaching the nursery reef.", tradeoff: "Fast water recovery; shelter remains broken.", effect: { pollution: 64, drought: 24 } },
      { id: "coral-nursery", label: "Plant coral nursery", shortLabel: "Plant coral", description: "Attach resilient branching coral to rebuild cover and complexity.", tradeoff: "Strong shelter gain; slow full reef recovery.", effect: { habitatLoss: 64 } },
      { id: "seagrass-buffer", label: "Restore seagrass buffer", shortLabel: "Restore seagrass", description: "Stabilize sand and create calmer juvenile-fish habitat.", tradeoff: "Recruitment gain; smaller immediate clarity boost.", effect: { drought: 44, pollution: 18, habitatLoss: 12 } },
    ],
  },
};

export const getBiomeIntervention = (biomeId: BiomeId) => BIOME_INTERVENTIONS[biomeId];
