import type { BiomeId } from "../types/biome";
import type { AnimalVisualKind, BiomeFaunaProfile, FaunaMotion, FaunaSpawn } from "../types/fauna";

type SpawnOptions = {
  id: string;
  role: FaunaSpawn["role"];
  label: string;
  kind: AnimalVisualKind;
  motion: FaunaMotion;
  anchor: readonly [number, number];
  count?: number;
  spread?: number;
  scale?: number;
  speed?: number;
  radius?: readonly [number, number];
  height?: number;
  primary?: string;
  secondary?: string;
  scientificName?: string;
  category?: string;
  habitat?: string;
  ecologicalBeat: string;
};

const fauna = ({ count = 1, spread = 0.75, scale = 1, speed = 1, radius = [1, 0.7], height = 0, ...entry }: SpawnOptions): FaunaSpawn => ({
  ...entry,
  count,
  spread,
  scale,
  speed,
  radius,
  height,
});

export const BIOME_FAUNA: Record<BiomeId, BiomeFaunaProfile> = {
  "temperate-rainforest": {
    biomeId: "temperate-rainforest",
    generationSeed: 1701,
    interaction: "A trout run links the cold stream to bears, forest nutrients, and the shaded canopy.",
    spawns: [
      fauna({ id: "blacktail-family", role: "deer", label: "Black-tailed deer", kind: "deer", motion: "ground", anchor: [5.1, 2.25], count: 2, spread: 1.15, scale: 0.82, speed: 0.72, radius: [1.25, 0.82], ecologicalBeat: "Browses along a fern edge." }),
      fauna({ id: "brush-rabbits", role: "rabbit", label: "Brush rabbit", kind: "rabbit", motion: "hop", anchor: [3.2, 3.8], count: 2, spread: 0.82, scale: 0.62, speed: 1.05, ecologicalBeat: "Moves between bramble cover." }),
      fauna({ id: "steller-jays", role: "bird", label: "Steller's jay", kind: "bird", motion: "flight", anchor: [2.6, -2.7], count: 2, spread: 1.2, scale: 0.7, speed: 0.88, radius: [2.25, 1.45], height: 3.2, ecologicalBeat: "Carries cached seeds across a canopy gap." }),
      fauna({ id: "cutthroat-pool", role: "fish", label: "Coastal cutthroat trout", kind: "fish", motion: "river", anchor: [0.2, 2.1], count: 3, spread: 0.3, scale: 0.72, speed: 1.1, radius: [0.32, 2.3], height: -0.12, ecologicalBeat: "Holds in a cool shaded pool." }),
      fauna({ id: "tree-frogs", role: "frog", label: "Pacific tree frog", kind: "frog", motion: "hop", anchor: [-1.5, 1.65], count: 2, spread: 0.5, scale: 0.5, speed: 0.8, radius: [0.42, 0.3], ecologicalBeat: "Calls from the wet stream margin." }),
      fauna({ id: "bumblebees", role: "bee", label: "Yellow-faced bumble bee", kind: "bee", motion: "hover", anchor: [-3.6, 1.7], count: 2, spread: 0.52, scale: 0.38, speed: 1.25, height: 1.2, ecologicalBeat: "Pollinates salmonberry flowers." }),
      fauna({ id: "silverspot", role: "butterfly", label: "Oregon silverspot", kind: "butterfly", motion: "hover", anchor: [-4.45, 0.6], scale: 0.42, speed: 0.78, height: 1.05, ecologicalBeat: "Returns to a violet-rich meadow." }),
      fauna({ id: "river-bear", role: "deer", label: "American black bear", kind: "bear", motion: "ground", anchor: [-6.1, 1.15], scale: 0.72, speed: 0.42, radius: [0.8, 0.55], primary: "#29231f", secondary: "#5b4637", ecologicalBeat: "Waits beside the trout run." }),
      fauna({ id: "skimmers", role: "dragonfly", label: "Eight-spotted skimmer", kind: "dragonfly", motion: "hover", anchor: [-1.1, -0.8], count: 2, spread: 0.6, scale: 0.42, speed: 1.4, height: 1.45, ecologicalBeat: "Hunts above a slow backwater." }),
    ],
  },
  "desert-oasis": {
    biomeId: "desert-oasis",
    generationSeed: 2701,
    interaction: "A protected spring creates concentric zones for fish, amphibians, pollinators, and nocturnal mammals.",
    spawns: [
      fauna({ id: "pronghorn-scouts", role: "deer", label: "Sonoran pronghorn", kind: "pronghorn", motion: "ground", anchor: [5.8, 2.7], count: 2, spread: 1.65, scale: 0.78, speed: 1.05, radius: [1.8, 0.8], ecologicalBeat: "Crosses an open migration corridor." }),
      fauna({ id: "jackrabbits", role: "rabbit", label: "Black-tailed jackrabbit", kind: "jackrabbit", motion: "hop", anchor: [3.5, 4.25], count: 2, spread: 1.1, scale: 0.67, speed: 1.28, radius: [1.15, 0.62], ecologicalBeat: "Dashes between creosote shadows." }),
      fauna({ id: "cactus-wrens", role: "bird", label: "Cactus wren", kind: "wren", motion: "flight", anchor: [-3.1, -3.4], count: 2, spread: 0.7, scale: 0.55, speed: 0.72, radius: [1.1, 0.7], height: 2.25, ecologicalBeat: "Loops back to a cactus nest." }),
      fauna({ id: "pupfish-school", role: "fish", label: "Desert pupfish", kind: "fish", motion: "river", anchor: [-0.25, 0.05], count: 4, spread: 0.22, scale: 0.48, speed: 1.2, radius: [0.48, 0.6], height: -0.08, ecologicalBeat: "Schools in the warm spring shallows." }),
      fauna({ id: "leopard-frogs", role: "frog", label: "Lowland leopard frog", kind: "frog", motion: "hop", anchor: [-1.75, 0.95], count: 2, spread: 0.42, scale: 0.48, speed: 0.75, ecologicalBeat: "Shelters under a damp bank." }),
      fauna({ id: "cactus-bees", role: "bee", label: "Cactus bee", kind: "bee", motion: "hover", anchor: [-4.15, 2.25], count: 3, spread: 0.6, scale: 0.34, speed: 1.35, height: 1.15, ecologicalBeat: "Tracks a brief cactus bloom." }),
      fauna({ id: "desert-tortoise", role: "rabbit", label: "Desert tortoise", kind: "tortoise", motion: "ground", anchor: [6.3, -2.1], scale: 0.68, speed: 0.24, radius: [0.42, 0.3], ecologicalBeat: "Emerges beside a shaded burrow." }),
      fauna({ id: "kit-fox", role: "deer", label: "Kit fox", kind: "canid", motion: "ground", anchor: [-5.7, -1.5], scale: 0.56, speed: 0.8, radius: [1, 0.5], primary: "#b89770", secondary: "#ead9bd", ecologicalBeat: "Patrols the cool side of the oasis." }),
      fauna({ id: "flame-skimmers", role: "dragonfly", label: "Flame skimmer", kind: "dragonfly", motion: "hover", anchor: [0.95, -1.15], count: 2, spread: 0.45, scale: 0.4, speed: 1.5, height: 1.35, ecologicalBeat: "Defends a spring-edge perch." }),
    ],
  },
  savanna: {
    biomeId: "savanna",
    generationSeed: 3701,
    interaction: "A waterhole concentrates grazers, predators, pollinators, and rain-pool life into one visible food web.",
    spawns: [
      fauna({ id: "gazelle-herd", role: "deer", label: "Thomson's gazelle", kind: "gazelle", motion: "ground", anchor: [5.0, 2.35], count: 4, spread: 1.65, scale: 0.72, speed: 1.15, radius: [1.8, 0.95], ecologicalBeat: "Herds along the short-grass edge." }),
      fauna({ id: "savanna-hares", role: "rabbit", label: "African savanna hare", kind: "hare", motion: "hop", anchor: [3.45, 4.0], count: 2, spread: 0.9, scale: 0.62, speed: 1.12, ecologicalBeat: "Freezes, then breaks for tall grass." }),
      fauna({ id: "rollers", role: "bird", label: "Lilac-breasted roller", kind: "roller", motion: "flight", anchor: [1.7, -3.3], count: 2, spread: 0.85, scale: 0.62, speed: 0.92, radius: [1.7, 1.0], height: 2.8, ecologicalBeat: "Hunts insects from an acacia lookout." }),
      fauna({ id: "catfish", role: "fish", label: "African sharptooth catfish", kind: "catfish", motion: "river", anchor: [0.4, -0.1], count: 3, spread: 0.3, scale: 0.68, speed: 0.78, radius: [0.5, 0.7], height: -0.12, ecologicalBeat: "Circles the shrinking waterhole." }),
      fauna({ id: "bullfrog", role: "frog", label: "African bullfrog", kind: "bullfrog", motion: "hop", anchor: [-1.3, 1.0], scale: 0.7, speed: 0.58, ecologicalBeat: "Waits at a temporary rain pool." }),
      fauna({ id: "acacia-bees", role: "bee", label: "African honey bee", kind: "bee", motion: "hover", anchor: [-4.0, 2.25], count: 3, spread: 0.62, scale: 0.34, speed: 1.3, height: 1.45, ecologicalBeat: "Moves between acacia blossoms." }),
      fauna({ id: "elephant-matriarch", role: "deer", label: "African elephant", kind: "elephant", motion: "ground", anchor: [-5.7, -0.8], scale: 0.82, speed: 0.38, radius: [0.8, 0.45], primary: "#8c8d84", secondary: "#b4aa9d", ecologicalBeat: "Opens a path to clean water." }),
      fauna({ id: "lioness", role: "rabbit", label: "Lioness", kind: "feline", motion: "ground", anchor: [-6.4, 3.0], scale: 0.7, speed: 0.42, radius: [0.72, 0.42], primary: "#c29a62", secondary: "#ead4a5", ecologicalBeat: "Rests downwind of the herd." }),
      fauna({ id: "dropwings", role: "dragonfly", label: "Red-veined dropwing", kind: "dragonfly", motion: "hover", anchor: [1.1, 0.75], count: 2, spread: 0.5, scale: 0.4, speed: 1.45, height: 1.35, ecologicalBeat: "Skims above persistent water." }),
    ],
  },
  "arctic-tundra": {
    biomeId: "arctic-tundra",
    generationSeed: 4701,
    interaction: "Caribou migration, lemming predators, thaw ponds, and a short pollination pulse all respond to warming.",
    spawns: [
      fauna({ id: "caribou-line", role: "deer", label: "Caribou", kind: "caribou", motion: "ground", anchor: [4.7, 2.2], count: 4, spread: 1.55, scale: 0.8, speed: 0.9, radius: [2.0, 0.7], ecologicalBeat: "Moves in a loose migration line." }),
      fauna({ id: "arctic-hares", role: "rabbit", label: "Arctic hare", kind: "hare", motion: "hop", anchor: [3.4, 4.0], count: 2, spread: 0.85, scale: 0.67, speed: 1.0, ecologicalBeat: "Uses wind-sculpted snow for cover." }),
      fauna({ id: "snowy-owl", role: "bird", label: "Snowy owl", kind: "owl", motion: "flight", anchor: [2.1, -2.7], scale: 0.78, speed: 0.64, radius: [2.15, 1.15], height: 3.25, ecologicalBeat: "Quartering flight follows the lemming cycle." }),
      fauna({ id: "arctic-char", role: "fish", label: "Arctic char", kind: "fish", motion: "river", anchor: [0.15, 2.2], count: 3, spread: 0.28, scale: 0.7, speed: 0.9, radius: [0.35, 2.2], height: -0.1, ecologicalBeat: "Holds below cold snowmelt." }),
      fauna({ id: "wood-frogs", role: "frog", label: "Wood frog", kind: "frog", motion: "hop", anchor: [-1.35, 1.4], count: 2, spread: 0.42, scale: 0.46, speed: 0.6, ecologicalBeat: "Breeds during the thaw-pond window." }),
      fauna({ id: "arctic-bees", role: "bee", label: "Arctic bumble bee", kind: "bee", motion: "hover", anchor: [-3.8, 1.9], count: 2, spread: 0.45, scale: 0.38, speed: 0.85, height: 0.9, ecologicalBeat: "Warms itself over saxifrage." }),
      fauna({ id: "arctic-fox", role: "rabbit", label: "Arctic fox", kind: "canid", motion: "ground", anchor: [-5.6, -1.4], scale: 0.58, speed: 0.72, radius: [1.0, 0.48], primary: "#e8e7de", secondary: "#aeb4b4", ecologicalBeat: "Listens beside a snowbank." }),
      fauna({ id: "polar-bear", role: "deer", label: "Polar bear", kind: "bear", motion: "ground", anchor: [-6.6, 2.6], scale: 0.82, speed: 0.3, radius: [0.55, 0.32], primary: "#e8e4d7", secondary: "#b8b9b2", ecologicalBeat: "Crosses the outer ice margin." }),
      fauna({ id: "fritillaries", role: "butterfly", label: "Arctic fritillary", kind: "butterfly", motion: "hover", anchor: [-4.5, 0.45], count: 2, spread: 0.4, scale: 0.38, speed: 0.62, height: 0.78, ecologicalBeat: "Uses the brief polar bloom." }),
    ],
  },
  "amazon-floodplain": {
    biomeId: "amazon-floodplain",
    generationSeed: 5701,
    interaction: "Floodwater lets fruit-eating fish and river dolphins move through a forest normally occupied by terrestrial seed dispersers.",
    spawns: [
      fauna({ id: "brocket", role: "deer", label: "Red brocket", kind: "brocket", motion: "ground", anchor: [5.5, 2.4], scale: 0.72, speed: 0.62, radius: [1.1, 0.75], ecologicalBeat: "Browses the dry forest edge." }),
      fauna({ id: "paca-pair", role: "rabbit", label: "Lowland paca", kind: "paca", motion: "ground", anchor: [3.4, 3.85], count: 2, spread: 0.62, scale: 0.62, speed: 0.58, ecologicalBeat: "Carries large fruit toward a bank burrow." }),
      fauna({ id: "macaws", role: "bird", label: "Scarlet macaw", kind: "macaw", motion: "flight", anchor: [2.5, -2.8], count: 2, spread: 1.2, scale: 0.75, speed: 0.82, radius: [2.0, 1.3], height: 3.55, ecologicalBeat: "Crosses between emergent trees." }),
      fauna({ id: "tambaqui", role: "fish", label: "Tambaqui", kind: "fish", motion: "river", anchor: [0.1, 2.1], count: 4, spread: 0.32, scale: 0.75, speed: 0.82, radius: [0.65, 2.1], height: -0.14, ecologicalBeat: "Feeds below a flooded fruit tree." }),
      fauna({ id: "tree-frogs", role: "frog", label: "Red-eyed tree frog", kind: "frog", motion: "hop", anchor: [-1.4, 1.55], count: 2, spread: 0.5, scale: 0.48, speed: 0.72, ecologicalBeat: "Drops toward a temporary nursery pool." }),
      fauna({ id: "orchid-bees", role: "bee", label: "Orchid bee", kind: "bee", motion: "hover", anchor: [-3.5, 1.7], count: 2, spread: 0.62, scale: 0.4, speed: 1.35, height: 1.45, ecologicalBeat: "Commutes between rare canopy flowers." }),
      fauna({ id: "capybara-family", role: "rabbit", label: "Capybara", kind: "capybara", motion: "ground", anchor: [-5.15, -1.4], count: 2, spread: 0.72, scale: 0.74, speed: 0.42, radius: [0.72, 0.38], primary: "#8f6747", secondary: "#c49c74", ecologicalBeat: "Grazes beside the flooded bank." }),
      fauna({ id: "river-dolphin", role: "fish", label: "Pink river dolphin", kind: "dolphin", motion: "river", anchor: [0.2, -2.5], scale: 0.92, speed: 0.76, radius: [0.72, 2.0], height: -0.16, primary: "#d7a3aa", secondary: "#efc7c4", ecologicalBeat: "Navigates the submerged forest corridor." }),
      fauna({ id: "caiman", role: "frog", label: "Spectacled caiman", kind: "crocodile", motion: "river", anchor: [-0.45, -3.6], scale: 0.78, speed: 0.26, radius: [0.3, 0.75], height: -0.06, primary: "#526847", secondary: "#303e2d", ecologicalBeat: "Holds motionless at the flood edge." }),
      fauna({ id: "morphos", role: "butterfly", label: "Blue morpho", kind: "butterfly", motion: "hover", anchor: [-4.4, 0.6], count: 2, spread: 0.5, scale: 0.48, speed: 0.78, height: 1.1, ecologicalBeat: "Flashes through a sunlit forest gap." }),
    ],
  },
  "alpine-meadow": {
    biomeId: "alpine-meadow",
    generationSeed: 6701,
    interaction: "Glacial water, narrow flower windows, cliff predators, and sure-footed grazers form a vertical food web.",
    spawns: [
      fauna({ id: "musk-deer", role: "deer", label: "Himalayan musk deer", kind: "musk-deer", motion: "ground", anchor: [5.1, 2.3], count: 2, spread: 0.9, scale: 0.72, speed: 0.58, radius: [0.85, 0.58], ecologicalBeat: "Browses at the shrub-meadow seam." }),
      fauna({ id: "woolly-hares", role: "rabbit", label: "Woolly hare", kind: "hare", motion: "hop", anchor: [3.2, 4.0], count: 2, spread: 0.72, scale: 0.64, speed: 0.9, ecologicalBeat: "Moves between warm talus pockets." }),
      fauna({ id: "monal", role: "bird", label: "Himalayan monal", kind: "monal", motion: "flight", anchor: [2.3, -2.75], scale: 0.72, speed: 0.62, radius: [1.45, 0.9], height: 2.65, ecologicalBeat: "Glides down to turn meadow soil." }),
      fauna({ id: "snow-trout", role: "fish", label: "Snow trout", kind: "fish", motion: "river", anchor: [0.2, 2.0], count: 3, spread: 0.28, scale: 0.68, speed: 1.0, radius: [0.35, 2.0], height: -0.12, ecologicalBeat: "Faces into the glacial current." }),
      fauna({ id: "lazy-toad", role: "frog", label: "Himalayan lazy toad", kind: "bullfrog", motion: "hop", anchor: [-1.35, 1.45], scale: 0.55, speed: 0.42, ecologicalBeat: "Shelters below a stream stone." }),
      fauna({ id: "alpine-bees", role: "bee", label: "Himalayan bumble bee", kind: "bee", motion: "hover", anchor: [-3.5, 1.7], count: 3, spread: 0.6, scale: 0.36, speed: 1.0, height: 1.0, ecologicalBeat: "Pollinates during a warm interval." }),
      fauna({ id: "snow-leopard", role: "deer", label: "Snow leopard", kind: "feline", motion: "ground", anchor: [-6.1, 3.15], scale: 0.66, speed: 0.38, radius: [0.58, 0.34], primary: "#b8b6aa", secondary: "#696d6d", ecologicalBeat: "Traverses a high rocky ledge." }),
      fauna({ id: "yak", role: "deer", label: "Wild yak", kind: "yak", motion: "ground", anchor: [-5.6, -1.4], count: 2, spread: 1.0, scale: 0.78, speed: 0.4, radius: [0.72, 0.45], primary: "#3d332d", secondary: "#211d1a", ecologicalBeat: "Grazes a wind-exposed shoulder." }),
      fauna({ id: "bhutan-glory", role: "butterfly", label: "Bhutan glory", kind: "butterfly", motion: "hover", anchor: [-4.5, 0.55], scale: 0.46, speed: 0.7, height: 0.92, ecologicalBeat: "Follows the forest-meadow boundary." }),
    ],
  },
  "coral-reef": {
    biomeId: "coral-reef",
    generationSeed: 7701,
    interaction: "A cleaning station, turtle-grazed seagrass, coral shelter, and plankton layers make the reef function as a living city.",
    spawns: [
      fauna({ id: "green-turtle", role: "deer", label: "Green sea turtle", kind: "turtle", motion: "midwater", anchor: [5.0, 2.25], scale: 0.88, speed: 0.42, radius: [1.25, 0.8], height: 1.15, scientificName: "Chelonia mydas", category: "Marine reptile", habitat: "Reef edge and seagrass meadow", ecologicalBeat: "Travels between reef and seagrass meadow." }),
      fauna({ id: "ribbontail-rays", role: "rabbit", label: "Bluespotted ribbontail ray", kind: "ray", motion: "benthic", anchor: [3.35, 3.85], count: 2, spread: 0.9, scale: 0.7, speed: 0.52, radius: [1.0, 0.62], height: 0.28, scientificName: "Taeniura lymma", category: "Benthic ray", habitat: "Sandy reef flat", ecologicalBeat: "Aerates a sandy feeding flat." }),
      fauna({ id: "manta", role: "bird", label: "Reef manta ray", kind: "ray", motion: "midwater", anchor: [2.4, -2.8], scale: 1.08, speed: 0.34, radius: [2.5, 1.55], height: 2.75, scientificName: "Mobula alfredi", category: "Pelagic ray", habitat: "Reef cleaning station", ecologicalBeat: "Returns to a cleaner-fish station." }),
      fauna({ id: "anemonefish", role: "fish", label: "Clown anemonefish", kind: "fish", motion: "midwater", anchor: [0.25, 2.05], count: 3, spread: 0.34, scale: 0.56, speed: 1.08, radius: [0.62, 0.48], height: 0.88, scientificName: "Amphiprion ocellaris", category: "Reef fish", habitat: "Anemone garden", ecologicalBeat: "Circles its host anemone." }),
      fauna({ id: "hawksbill", role: "frog", label: "Hawksbill turtle", kind: "turtle", motion: "midwater", anchor: [-1.45, 1.55], scale: 0.72, speed: 0.36, radius: [0.82, 0.54], height: 0.72, scientificName: "Eretmochelys imbricata", category: "Marine reptile", habitat: "Sponge-rich coral garden", ecologicalBeat: "Browses sponges between coral branches." }),
      fauna({ id: "cleaner-wrasse", role: "bee", label: "Cleaner wrasse", kind: "fish", motion: "midwater", anchor: [-3.55, 1.75], count: 3, spread: 0.34, scale: 0.42, speed: 1.25, radius: [0.52, 0.38], height: 1.3, scientificName: "Labroides dimidiatus", category: "Reef fish", habitat: "Coral cleaning station", ecologicalBeat: "Darts around a cleaning station client." }),
      fauna({ id: "chromis-school", role: "dragonfly", label: "Blue-green chromis", kind: "fish", motion: "midwater", anchor: [-1.1, -0.75], count: 5, spread: 0.78, scale: 0.43, speed: 1.18, radius: [1.25, 0.72], height: 1.85, scientificName: "Chromis viridis", category: "Reef fish", habitat: "Branching coral canopy", ecologicalBeat: "Pulses above a branching coral head." }),
      fauna({ id: "reef-shark", role: "fish", label: "Blacktip reef shark", kind: "shark", motion: "midwater", anchor: [-5.7, -1.5], scale: 0.95, speed: 0.62, radius: [2.1, 1.1], height: 2.05, primary: "#536a72", secondary: "#24343a", scientificName: "Carcharhinus melanopterus", category: "Reef shark", habitat: "Outer nursery reef", ecologicalBeat: "Patrols the outer edge of the nursery." }),
      fauna({ id: "seahorses", role: "butterfly", label: "Tiger-tail seahorse", kind: "seahorse", motion: "benthic", anchor: [-4.4, 0.55], count: 2, spread: 0.4, scale: 0.58, speed: 0.2, radius: [0.24, 0.2], height: 0.42, primary: "#e8b64d", secondary: "#6b452a", scientificName: "Hippocampus comes", category: "Syngnathid fish", habitat: "Seagrass holdfast", ecologicalBeat: "Anchors to swaying seagrass." }),
      fauna({ id: "moon-jellies", role: "bird", label: "Moon jelly", kind: "jellyfish", motion: "midwater", anchor: [5.4, -2.9], count: 3, spread: 0.9, scale: 0.62, speed: 0.22, radius: [0.85, 0.7], height: 3.4, primary: "#b5e5e1", secondary: "#9d9ee0", scientificName: "Aurelia aurita", category: "Jellyfish", habitat: "Plankton-rich water column", ecologicalBeat: "Drifts through a plankton-rich layer." }),
      fauna({ id: "reef-octopus", role: "frog", label: "Day octopus", kind: "octopus", motion: "benthic", anchor: [-5.0, 3.35], scale: 0.68, speed: 0.18, radius: [0.35, 0.24], height: 0.08, primary: "#ba6549", secondary: "#e0a05e", scientificName: "Octopus cyanea", category: "Cephalopod", habitat: "Coral den", ecologicalBeat: "Changes posture beside a coral den." }),
    ],
  },
};

export const getBiomeFauna = (biomeId: BiomeId) => BIOME_FAUNA[biomeId];
