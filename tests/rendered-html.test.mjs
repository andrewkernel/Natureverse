import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://natureverse.test/", {
      headers: { accept: "text/html", host: "natureverse.test" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Natureverse experience and social metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Natureverse — Everything is connected<\/title>/i);
  assert.match(html, /Explore a living 3D ecosystem/i);
  assert.match(html, /property="og:image" content="https:\/\/natureverse\.test\/og\.png"/i);
  assert.match(html, /Natureverse/i);
  assert.match(html, /Ecosystem health/i);
  assert.match(html, /Ask the ecosystem/i);
  assert.match(html, /Waking the world/i);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/i);
});

test("ships a loading sequence and requires a starting region", async () => {
  const [app, launch] = await Promise.all([
    readFile(new URL("../src/NatureverseApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/NatureverseLaunch.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(app, /type LaunchPhase = "loading" \| "choose-region" \| "exploring"/);
  assert.match(app, /setLaunchPhase\("choose-region"\)/);
  assert.match(app, /previewStartBiome/);
  assert.match(app, /beginExploration/);
  assert.match(app, /<NatureverseLaunch/);
  assert.match(launch, /Where would you like to begin\?/);
  assert.match(launch, /disabled=\{!selectedBiome\}/);
  assert.match(launch, /aria-pressed/);
  assert.match(launch, /Waking the world/);
});

test("ships data-driven species, relationships, and scenarios", async () => {
  const [species, relationships, scenarios] = await Promise.all([
    readFile(new URL("../src/data/species.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../src/data/relationships.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../src/data/scenarios.json", import.meta.url), "utf8").then(JSON.parse),
  ]);

  assert.ok(species.length >= 8, "expected a diverse species catalog");
  assert.ok(relationships.length >= 8, "expected an ecological relationship graph");
  assert.ok(Object.keys(scenarios.effects).length >= 4, "expected multiple environmental pressures");
  assert.ok(species.every((entry) => entry.id && entry.name && entry.role));
  assert.ok(relationships.every((entry) => entry.source && entry.target && entry.label));
});

test("ships seven distinct biome configurations and shared terrain grounding", async () => {
  const [biomesSource, sceneSource, terrainSource, animalSource] = await Promise.all([
    readFile(new URL("../src/data/biomes.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/scene/EcosystemScene.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/scene/terrain.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/scene/AnimalModels.tsx", import.meta.url), "utf8"),
  ]);

  for (const id of ["temperate-rainforest", "desert-oasis", "savanna", "arctic-tundra", "amazon-floodplain", "alpine-meadow", "coral-reef"]) {
    assert.match(biomesSource, new RegExp(`id: "${id}"`));
  }
  assert.equal((biomesSource.match(/^ {2}\{\n {4}id: /gm) ?? []).length, 7, "expected exactly seven top-level biomes");
  assert.match(terrainSource, /export function sampleTerrain/);
  assert.match(sceneSource, /terrainHeight\(oakAnchor/);
  assert.match(sceneSource, /scatterLand\(biome/);
  for (const model of ["DeerModel", "RabbitModel", "BirdModel", "FishModel", "FrogModel", "TurtleModel", "RayModel"]) {
    assert.match(animalSource, new RegExp(`function ${model}`));
  }
});

test("ships the world-building, weather, atlas, story, and natural behavior layers", async () => {
  const [scene, landmarks, weather, atlas, story] = await Promise.all([
    readFile(new URL("../src/scene/EcosystemScene.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/scene/WorldLandmarks.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/scene/WeatherSystem.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/BiomeAtlas.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/EcosystemStory.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(scene, /const cruisePulse/);
  assert.match(scene, /const glide/);
  assert.match(scene, /const behaviorCycle/);
  assert.match(scene, /frameMs/);
  assert.match(landmarks, /function SalmonRun/);
  assert.match(landmarks, /function ReefLandmark/);
  assert.match(weather, /WeatherAtmosphere/);
  assert.match(weather, /setDrawRange/);
  assert.match(atlas, /import\("cobe"\)/);
  assert.match(atlas, /devicePixelRatio/);
  assert.match(story, /Canopy loss breaks the food web/);
});

test("generates a distinct fauna composition for every biome", async () => {
  const { BIOME_FAUNA } = await import("../src/data/biomeFauna.ts");
  const profiles = Object.values(BIOME_FAUNA);

  assert.equal(profiles.length, 7);
  assert.ok(profiles.every((profile) => profile.spawns.length >= 9), "every biome should ship a substantial fauna roster");
  assert.ok(profiles.every((profile) => profile.interaction.length > 40), "every biome should explain its signature ecological interaction");

  const signatures = profiles.map((profile) => profile.spawns
    .map((spawn) => `${spawn.kind}:${spawn.motion}:${spawn.anchor.join(",")}:${spawn.count}`)
    .sort()
    .join("|"));
  assert.equal(new Set(signatures).size, 7, "no two biomes should reuse the same fauna composition");

  for (const profile of profiles) {
    assert.equal(new Set(profile.spawns.map((spawn) => spawn.id)).size, profile.spawns.length, `${profile.biomeId} spawn IDs must be unique`);
    assert.ok(profile.spawns.some((spawn) => spawn.count > 1), `${profile.biomeId} should visibly generate an animal group`);
    for (const spawn of profile.spawns.filter((entry) => entry.motion === "ground" || entry.motion === "hop")) {
      assert.equal(spawn.height, 0, `${profile.biomeId}/${spawn.id} ground contact must use the canonical Y=0 support plane`);
    }
  }

  const reef = BIOME_FAUNA["coral-reef"];
  assert.ok(reef.spawns.filter((spawn) => spawn.motion === "midwater").length >= 5);
  assert.ok(reef.spawns.filter((spawn) => spawn.motion === "benthic").length >= 3);
  for (const kind of ["shark", "seahorse", "jellyfish", "octopus", "turtle", "ray"]) {
    assert.ok(reef.spawns.some((spawn) => spawn.kind === kind), `reef should include ${kind}`);
  }
});

test("mounts biome-owned movement, connected rigs, and the underwater habitat", async () => {
  const [scene, animalModels, underwater] = await Promise.all([
    readFile(new URL("../src/scene/EcosystemScene.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/scene/AnimalModels.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/scene/UnderwaterEcosystem.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(scene, /getBiomeFauna\(biome\.id\)/);
  assert.match(scene, /faunaProfile\.spawns\.flatMap/);
  assert.match(scene, /spawn\.motion === "ground"|spawn\.motion === "hop"/);
  assert.match(scene, /terrainHeight\(x, z, biome\) \+ hop/);
  assert.doesNotMatch(scene, /function visualKindFor/);
  assert.match(scene, /<UnderwaterEcosystem/);

  assert.match(animalModels, /function ArticulatedLeg/);
  assert.match(animalModels, /function ElephantModel/);
  assert.match(animalModels, /function DolphinModel/);
  assert.match(animalModels, /function SeahorseModel/);
  assert.match(animalModels, /function JellyfishModel/);
  assert.match(animalModels, /function OctopusModel/);
  assert.match(animalModels, /Unknown animal visual kind/);
  assert.doesNotMatch(animalModels, /return <RayModel \{\.\.\.props\} \/>;\s*\n\s*}/);

  for (const layer of ["WaterCeiling", "KelpField", "BenthicStructures", "BubblesAndPlankton", "CausticFloor", "CleaningStation"]) {
    assert.match(underwater, new RegExp(`function ${layer}`));
  }
});

test("ships a conversational field guide that can explain and change the ecosystem", async () => {
  const [{ BIOME_INTERVENTIONS }, app, guide] = await Promise.all([
    import("../src/data/interventions.ts"),
    readFile(new URL("../src/NatureverseApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/FieldGuideChat.tsx", import.meta.url), "utf8"),
  ]);

  assert.equal(Object.keys(BIOME_INTERVENTIONS).length, 7);
  assert.equal(new Set(Object.values(BIOME_INTERVENTIONS).map((entry) => entry.action)).size, 7);
  assert.ok(Object.values(BIOME_INTERVENTIONS).every((entry) => entry.lesson.length > 60));
  assert.match(app, /FieldGuideChat/);
  assert.match(app, /applyFieldChanges/);
  assert.match(guide, /Bring rain/);
  assert.match(guide, /Clear the runoff/);
  assert.match(guide, /onApplyConditions/);
  assert.match(guide, /Weather adjusted/);
});

test("ships conversational controls and a resilient species selection path", async () => {
  const [interventions, app, panel, guide, rail, scene] = await Promise.all([
    import("../src/data/interventions.ts"),
    readFile(new URL("../src/NatureverseApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/SpeciesPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/FieldGuideChat.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/SpeciesRail.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/scene/EcosystemScene.tsx", import.meta.url), "utf8"),
  ]);

  for (const intervention of Object.values(interventions.BIOME_INTERVENTIONS)) {
    assert.equal(intervention.actions.length, 3, "each biome needs a focused three-action restoration plan");
    assert.equal(new Set(intervention.actions.map((action) => action.id)).size, 3, "restoration action IDs must be unique per biome");
    assert.ok(intervention.actions.every((action) => action.label && action.description && action.tradeoff));
    assert.ok(intervention.actions.every((action) => Object.keys(action.effect).length > 0));
  }

  assert.match(app, /const speciesAccent: Record<SpeciesRole, NonNullable<SpeciesDetails\["accent"\]>>/);
  assert.match(app, /accent: biomeSpecies \? speciesAccent\[biomeSpecies\.role\] : definition\.accent/);
  assert.match(app, /type Drawer = "chat" \| "explore" \| "metrics" \| null/);
  assert.match(app, /chatReset/);
  assert.match(app, /idPrefix="desktop-field-guide"/);
  assert.match(app, /idPrefix="mobile-field-guide"/);
  assert.match(panel, /accentStyles\[species\.accent \?\? "leaf"\] \?\? accentStyles\.leaf/);
  assert.match(panel, /role="dialog"/);
  assert.match(guide, /Why are the fish struggling\?/);
  assert.match(guide, /Restore the forest corridor/);
  assert.match(guide, /warm\(\?:er\)\?/);
  assert.match(guide, /const isQuestion/);
  assert.match(guide, /idPrefix/);
  assert.match(rail, /aria-pressed/);
  assert.doesNotMatch(scene, /<Selectable id="river"/, "water geometry must not intercept visible animal clicks");
  assert.match(scene, /raycast=\{\(\) => undefined\}/, "transparent water must not block the underlying animal raycast");
});
