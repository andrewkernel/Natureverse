export type MetricKey = "waterQuality" | "vegetation" | "pollination" | "biodiversity";

export type SpeciesDefinition = {
  id: string;
  name: string;
  scientificName?: string;
  type: string;
  habitat: string;
  native: boolean;
  baselinePopulation: number;
  resilience: number;
  description: string;
  role: string;
  roleDescription: string;
  accent: "leaf" | "sky" | "amber" | "violet";
  requirements: Partial<Record<MetricKey, number>>;
};

export type RelationshipDefinition = {
  source: string;
  target: string;
  relationship: string;
  strength: number;
  label: string;
};

export type ScenarioEffect = {
  metrics: Partial<Record<MetricKey, number>>;
  species: Record<string, number>;
};

export type ScenarioData = {
  initialMetrics: Record<MetricKey, number>;
  effects: Record<"pollution" | "drought" | "habitatLoss" | "invasiveSpecies", ScenarioEffect>;
};

export type SimulationControls = {
  pollution: number;
  drought: number;
  habitatLoss: number;
  invasiveSpecies: boolean;
};

export type SimulationMetrics = Record<MetricKey | "overallHealth", number>;

export type SimulationResult = {
  metrics: SimulationMetrics;
  populations: Record<string, number>;
};
