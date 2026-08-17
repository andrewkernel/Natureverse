import speciesData from "../data/species.json";
import relationshipData from "../data/relationships.json";
import scenarioData from "../data/scenarios.json";
import type {
  RelationshipDefinition,
  ScenarioData,
  SimulationControls,
  SimulationResult,
  SpeciesDefinition,
} from "../types/ecosystem";

export const species = speciesData as SpeciesDefinition[];
export const relationships = relationshipData as RelationshipDefinition[];
export const scenarios = scenarioData as ScenarioData;

export const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

const pressureValue = (key: keyof SimulationControls, controls: SimulationControls) =>
  key === "invasiveSpecies" ? (controls.invasiveSpecies ? 1 : 0) : controls[key] / 100;

export function simulateEcosystem(controls: SimulationControls): SimulationResult {
  const metricValues = { ...scenarios.initialMetrics };

  for (const [scenarioKey, effect] of Object.entries(scenarios.effects)) {
    const pressure = pressureValue(scenarioKey as keyof SimulationControls, controls);
    for (const [metric, coefficient] of Object.entries(effect.metrics)) {
      metricValues[metric as keyof typeof metricValues] += coefficient * pressure * (scenarioKey === "invasiveSpecies" ? 1 : 100);
    }
  }

  for (const metric of Object.keys(metricValues) as Array<keyof typeof metricValues>) {
    metricValues[metric] = clamp(metricValues[metric]);
  }

  const populations: Record<string, number> = Object.fromEntries(
    species.map((item) => [item.id, item.baselinePopulation]),
  );

  for (const [scenarioKey, effect] of Object.entries(scenarios.effects)) {
    const pressure = pressureValue(scenarioKey as keyof SimulationControls, controls);
    for (const [id, coefficient] of Object.entries(effect.species)) {
      const definition = species.find((item) => item.id === id);
      if (!definition) continue;
      const rawEffect = coefficient * pressure * (scenarioKey === "invasiveSpecies" ? 1 : 100);
      const resilience = 1 - definition.resilience * 0.38;
      populations[id] = clamp(populations[id] + rawEffect * resilience);
    }
  }

  for (const definition of species) {
    if (!definition.native && !controls.invasiveSpecies) {
      populations[definition.id] = 0;
      continue;
    }
    for (const [metric, requirement] of Object.entries(definition.requirements)) {
      const actual = metricValues[metric as keyof typeof metricValues] ?? 100;
      if (actual < requirement) {
        populations[definition.id] = clamp(
          populations[definition.id] - (requirement - actual) * (1 - definition.resilience) * 0.7,
        );
      }
    }
  }

  // Two gentle propagation passes make dependencies visible without causing
  // unstable population cascades.
  for (let pass = 0; pass < 2; pass += 1) {
    for (const relation of relationships) {
      if (relation.relationship === "competes_with") continue;
      const source = species.find((item) => item.id === relation.source);
      const target = species.find((item) => item.id === relation.target);
      if (!source || !target) continue;
      const sourceRatio = populations[source.id] / Math.max(source.baselinePopulation, 1);
      if (sourceRatio < 0.82) {
        const dependencyLoss = (0.82 - sourceRatio) * relation.strength * 13;
        populations[target.id] = clamp(populations[target.id] - dependencyLoss);
      }
    }
  }

  const nativeSpecies = species.filter((item) => item.native && item.type !== "freshwater habitat");
  const healthyCount = nativeSpecies.filter((item) => populations[item.id] >= 45).length;
  const meanPopulation = nativeSpecies.reduce((sum, item) => sum + populations[item.id], 0) / nativeSpecies.length;
  const richness = (healthyCount / nativeSpecies.length) * 100;
  const evenness = 100 - Math.min(40, Math.sqrt(nativeSpecies.reduce((sum, item) => sum + Math.pow(populations[item.id] - meanPopulation, 2), 0) / nativeSpecies.length));
  const invasivePenalty = controls.invasiveSpecies ? populations.invasive_plant * 0.18 : 0;
  const biodiversity = clamp(richness * 0.35 + meanPopulation * 0.45 + evenness * 0.2 - invasivePenalty);

  const pollinatorIds = ["bee", "butterfly", "wildflower", "fruit_tree"];
  const pollinationPopulation = pollinatorIds.reduce((sum, id) => sum + populations[id], 0) / pollinatorIds.length;
  const pollination = clamp(metricValues.pollination * 0.55 + pollinationPopulation * 0.45);
  const vegetationPopulation = ["oak", "fruit_tree", "wildflower", "grass"].reduce((sum, id) => sum + populations[id], 0) / 4;
  const vegetation = clamp(metricValues.vegetation * 0.58 + vegetationPopulation * 0.42);
  const waterQuality = clamp(metricValues.waterQuality);
  const overallHealth = clamp(
    biodiversity * 0.35 + waterQuality * 0.25 + pollination * 0.2 + vegetation * 0.2,
  );

  return {
    populations: Object.fromEntries(Object.entries(populations).map(([id, value]) => [id, Math.round(value * 10) / 10])),
    metrics: {
      biodiversity,
      waterQuality,
      pollination,
      vegetation,
      overallHealth,
    },
  };
}

export function healthStatus(value: number) {
  if (value >= 85) return "thriving" as const;
  if (value >= 70) return "healthy" as const;
  if (value >= 50) return "stressed" as const;
  if (value >= 30) return "degraded" as const;
  return "critical" as const;
}

export function getConnections(id: string) {
  return relationships.filter((item) => item.source === id || item.target === id);
}

export function dominantPressure(controls: SimulationControls) {
  const pressures = [
    { key: "pollution", value: controls.pollution },
    { key: "drought", value: controls.drought },
    { key: "habitatLoss", value: controls.habitatLoss },
    { key: "invasiveSpecies", value: controls.invasiveSpecies ? 65 : 0 },
  ] as const;
  return [...pressures].sort((a, b) => b.value - a.value)[0];
}
