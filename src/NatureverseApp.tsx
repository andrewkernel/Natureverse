"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, CloudSun, Compass, Globe2, Leaf, MessageCircle, Search, Sparkles, X } from "lucide-react";
import { EcosystemScene } from "./scene/EcosystemScene";
import { MetricsPanel, type EcosystemMetrics, type MetricStatus } from "./components/MetricsPanel";
import { SpeciesPanel, type SpeciesDetails } from "./components/SpeciesPanel";
import { BiomeSwitcher } from "./components/BiomeSwitcher";
import { BiomeAtlas } from "./components/BiomeAtlas";
import { BiomeGlobeLaunch } from "./components/BiomeGlobeLaunch";
import { ConditionsPanel } from "./components/ConditionsPanel";
import { SpeciesRail } from "./components/SpeciesRail";
import { FieldGuideChat } from "./components/FieldGuideChat";
import { NatureverseLaunch } from "./components/NatureverseLaunch";
import { getBiomeFauna } from "./data/biomeFauna";
import { getConnections, healthStatus, relationships, species } from "./engine/ecosystemEngine";
import { useEcosystemStore } from "./store/ecosystemStore";
import type { SimulationControls } from "./types/ecosystem";
import { BIOMES, DEFAULT_BIOME_ID, getBiome } from "./data/biomes";
import type { BiomeId, SpeciesRole } from "./types/biome";

const metricStatus = (value: number): MetricStatus => {
  if (value >= 85) return "thriving";
  if (value >= 70) return "healthy";
  if (value >= 50) return "recovering";
  if (value >= 30) return "at-risk";
  return "critical";
};

const iconForSpecies = (type: string) => {
  if (type.includes("tree") || type.includes("plant") || type.includes("cover")) return <Leaf size={23} />;
  return <Sparkles size={23} />;
};

type Drawer = "chat" | "conditions" | "explore" | "metrics" | null;
type SidePanel = "chat" | "conditions" | null;
type LaunchPhase = "loading" | "globe" | "exploring";

const speciesAccent: Record<SpeciesRole, NonNullable<SpeciesDetails["accent"]>> = {
  deer: "amber", rabbit: "amber", bird: "sky", fish: "sky", frog: "leaf", bee: "amber", butterfly: "violet", dragonfly: "sky",
};

export default function NatureverseApp() {
  const { controls, result, previousResult, selectedId, setControl, setSelectedId, reset } = useEcosystemStore();
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [sidePanel, setSidePanel] = useState<SidePanel>(null);
  const [activeBiomeId, setActiveBiomeId] = useState<BiomeId>(DEFAULT_BIOME_ID);
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [chatReset, setChatReset] = useState(0);
  const [launchPhase, setLaunchPhase] = useState<LaunchPhase>("loading");
  const [launchProgress, setLaunchProgress] = useState(0);
  const [startBiomeId, setStartBiomeId] = useState<BiomeId | null>(null);
  const worldHealthRef = useRef<HTMLElement>(null);
  const activeBiome = getBiome(activeBiomeId);
  const status = healthStatus(result.metrics.overallHealth);
  const selectedFauna = useMemo(() => selectedId ? getBiomeFauna(activeBiomeId).spawns.find((spawn) => spawn.id === selectedId) : undefined, [activeBiomeId, selectedId]);
  const selectedNetworkId = selectedFauna?.role ?? selectedId;

  useEffect(() => {
    const startedAt = performance.now();
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 220 : 2200;
    let frame = 0;
    let revealTimer = 0;
    const run = (now: number) => {
      const next = Math.min(100, Math.round(((now - startedAt) / duration) * 100));
      setLaunchProgress(next);
      if (next < 100) frame = window.requestAnimationFrame(run);
      else revealTimer = window.setTimeout(() => setLaunchPhase("globe"), 80);
    };
    frame = window.requestAnimationFrame(run);
    return () => { window.cancelAnimationFrame(frame); window.clearTimeout(revealTimer); };
  }, []);

  useEffect(() => {
    window.__NATUREVERSE_STATE__ = { biome: activeBiomeId, controls, result, selectedId, isRestoring: false };
  }, [activeBiomeId, controls, result, selectedId]);

  const applyFieldChanges = useCallback((changes: Partial<SimulationControls>) => {
    if (changes.pollution !== undefined) setControl("pollution", changes.pollution);
    if (changes.drought !== undefined) setControl("drought", changes.drought);
    if (changes.habitatLoss !== undefined) setControl("habitatLoss", changes.habitatLoss);
    if (changes.invasiveSpecies !== undefined) setControl("invasiveSpecies", changes.invasiveSpecies);
  }, [setControl]);

  const resetConditions = () => {
    setSelectedId(null);
    setChatReset((current) => current + 1);
    reset();
  };

  const handleBiomeChange = (biomeId: BiomeId) => {
    setActiveBiomeId(biomeId);
    setSelectedId(null);
    setDrawer(null);
    setSidePanel(null);
    reset();
  };

  const previewStartBiome = (biomeId: BiomeId) => {
    setStartBiomeId(biomeId);
    setActiveBiomeId(biomeId);
    setSelectedId(null);
  };

  const beginExploration = () => {
    if (!startBiomeId) return;
    handleBiomeChange(startBiomeId);
    setLaunchPhase("exploring");
    window.requestAnimationFrame(() => worldHealthRef.current?.focus());
  };

  const handleSpeciesSelect = (id: string | null) => setSelectedId(id);

  const displaySpeciesName = useCallback((id: string) => {
    if (id in activeBiome.species) return activeBiome.species[id as SpeciesRole].name;
    if (id === "oak") return activeBiome.signatureFlora[0] ?? "Canopy habitat";
    if (id === "fruit_tree") return activeBiome.signatureFlora[1] ?? "Food plants";
    if (id === "wildflower") return activeBiome.signatureFlora[2] ?? "Native flowers";
    if (id === "river") return activeBiome.waterStyle === "ocean" ? "Lagoon water" : "Fresh water";
    return species.find((item) => item.id === id)?.name ?? id;
  }, [activeBiome]);

  const selectedSpecies: SpeciesDetails | null = useMemo(() => {
    if (!selectedNetworkId) return null;
    const definition = species.find((item) => item.id === selectedNetworkId);
    if (!definition) return null;
    const biomeSpecies = selectedNetworkId in activeBiome.species ? activeBiome.species[selectedNetworkId as SpeciesRole] : null;
    const connections = getConnections(selectedNetworkId);
    return {
      id: selectedFauna?.id ?? definition.id,
      name: selectedFauna?.label ?? biomeSpecies?.name ?? displaySpeciesName(selectedNetworkId),
      scientificName: selectedFauna ? selectedFauna.scientificName : biomeSpecies?.scientificName ?? definition.scientificName,
      category: selectedFauna ? selectedFauna.category : biomeSpecies?.category ?? definition.type,
      habitat: selectedFauna ? selectedFauna.habitat ?? activeBiome.location : biomeSpecies?.habitat ?? activeBiome.location,
      icon: iconForSpecies(definition.type),
      accent: biomeSpecies ? speciesAccent[biomeSpecies.id] : definition.accent,
      role: biomeSpecies?.role ?? definition.role,
      roleDescription: selectedFauna?.ecologicalBeat ?? biomeSpecies?.description ?? definition.roleDescription,
      status: healthStatus(result.populations[selectedNetworkId] ?? 0),
      health: result.populations[selectedNetworkId] ?? 0,
      population: Math.round(result.populations[selectedNetworkId] ?? 0) + "% of healthy baseline",
      description: selectedFauna?.ecologicalBeat ?? biomeSpecies?.description ?? definition.description,
      dependencies: connections.filter((item) => item.target === selectedNetworkId).map((item) => ({ id: item.source, name: displaySpeciesName(item.source), detail: item.label, status: healthStatus(result.populations[item.source] ?? 0) })),
      supports: connections.filter((item) => item.source === selectedNetworkId).map((item) => ({ id: item.target, name: displaySpeciesName(item.target), detail: item.label, status: healthStatus(result.populations[item.target] ?? 0) })),
    };
  }, [activeBiome, displaySpeciesName, result.populations, selectedFauna, selectedNetworkId]);

  const connectionIds = useMemo(() => {
    if (!selectedNetworkId) return [];
    return relationships.filter((item) => item.source === selectedNetworkId || item.target === selectedNetworkId).map((item) => item.source === selectedNetworkId ? item.target : item.source);
  }, [selectedNetworkId]);

  const focalSpecies = useMemo(() => activeBiome.focalSpecies.map((id) => ({ id, item: activeBiome.species[id], health: result.populations[id] ?? 0 })), [activeBiome, result.populations]);

  const dashboardMetrics: EcosystemMetrics = useMemo(() => {
    const metric = (key: "biodiversity" | "waterQuality" | "pollination" | "overallHealth", description: string) => ({
      value: result.metrics[key],
      delta: result.metrics[key] - previousResult.metrics[key],
      status: metricStatus(result.metrics[key]),
      description,
    });
    return {
      biodiversity: metric("biodiversity", "Native species balance"),
      waterQuality: metric("waterQuality", activeBiome.waterStyle === "ocean" ? "Reef clarity and oxygen" : "Clarity and oxygen"),
      pollination: metric("pollination", activeBiome.waterStyle === "ocean" ? "Larval flow and recruitment" : "Flower-to-food activity"),
      overallHealth: metric("overallHealth", "Whole-system resilience"),
    };
  }, [activeBiome.waterStyle, previousResult.metrics, result.metrics]);

  return (
    <main className="natureverse-shell field-guide-mode">
      <div className="scene-layer" aria-hidden={launchPhase !== "exploring"} aria-label="Interactive 3D ecosystem">
        <EcosystemScene biome={activeBiome} metrics={result.metrics} populations={result.populations} pollution={controls.pollution} drought={controls.drought} habitatLoss={controls.habitatLoss} invasive={controls.invasiveSpecies} selectedId={selectedId} connectionIds={connectionIds} onSelect={handleSpeciesSelect} />
      </div>

      {launchPhase === "loading" && <NatureverseLaunch progress={launchProgress} />}
      {launchPhase === "globe" && <BiomeGlobeLaunch biomes={BIOMES} selectedBiomeId={startBiomeId} onSelectBiome={previewStartBiome} onBegin={beginExploration} />}

      <div className="experience-interface" inert={launchPhase !== "exploring"} aria-hidden={launchPhase !== "exploring"}>
        <div className="top-vignette" aria-hidden="true" />
        <section className="world-health" ref={worldHealthRef} tabIndex={-1} aria-label={"Ecosystem health " + Math.round(result.metrics.overallHealth) + " percent, " + status}>
          <strong>{Math.round(result.metrics.overallHealth)}</strong>
          <span><small>Ecosystem health</small><b>{status}</b></span>
        </section>

        {atlasOpen && <BiomeAtlas biomes={BIOMES} activeId={activeBiomeId} onChange={(id) => { handleBiomeChange(id); setAtlasOpen(false); }} onClose={() => setAtlasOpen(false)} />}
        <BiomeSwitcher biomes={BIOMES.map((biome) => ({ id: biome.id, name: biome.name, shortLabel: biome.shortLabel, location: biome.location, iconKey: biome.iconKey, accent: biome.palette.accent }))} activeId={activeBiomeId} onChange={handleBiomeChange} />

        <aside className="world-tool-rail" aria-label="Field tools">
          <button type="button" onClick={() => setAtlasOpen(true)} aria-label="Open world atlas" title="Open world atlas">
            <Globe2 size={17} /><span>Atlas</span>
          </button>
          <button type="button" className={sidePanel === "chat" ? "active" : ""} onClick={() => setSidePanel(sidePanel === "chat" ? null : "chat")} aria-pressed={sidePanel === "chat"}>
            <MessageCircle size={17} /><span>Field Guide</span>
          </button>
          <button type="button" className={sidePanel === "conditions" ? "active" : ""} onClick={() => setSidePanel(sidePanel === "conditions" ? null : "conditions")} aria-pressed={sidePanel === "conditions"}>
            <CloudSun size={17} /><span>Conditions</span>
          </button>
        </aside>

        {sidePanel && <aside className="world-side-panel" aria-label={sidePanel === "chat" ? "Field Guide" : "Manual environmental conditions"}>
          <div className="world-side-panel-bar"><span>{sidePanel === "chat" ? "Field Guide" : "Manual conditions"}</span><button type="button" onClick={() => setSidePanel(null)} aria-label="Close side panel"><X size={16} /></button></div>
          {sidePanel === "chat" && <FieldGuideChat key={activeBiomeId + "-" + chatReset} idPrefix="desktop-field-guide" biome={activeBiome} controls={controls} result={result} onApplyConditions={applyFieldChanges} className="field-guide-side-card" />}
          {sidePanel === "conditions" && <ConditionsPanel biome={activeBiome} controls={controls} onControlChange={setControl} onReset={resetConditions} className="world-conditions-panel" />}
        </aside>}

        <div className="explore-hint"><Compass size={15} /><span>Drag to explore</span><i /> <span>Tap a species to observe</span></div>

        <nav className="mobile-dock" aria-label="Natureverse tools">
          <button type="button" className={drawer === "chat" ? "active" : ""} onClick={() => setDrawer(drawer === "chat" ? null : "chat")}><Sparkles size={19} /><span>Ask</span></button>
          <button type="button" className={drawer === "conditions" ? "active" : ""} onClick={() => setDrawer(drawer === "conditions" ? null : "conditions")}><CloudSun size={19} /><span>Weather</span></button>
          <button type="button" className={drawer === "explore" ? "active" : ""} onClick={() => setDrawer(drawer === "explore" ? null : "explore")}><Search size={19} /><span>Explore</span></button>
          <button type="button" className={drawer === "metrics" ? "active" : ""} onClick={() => setDrawer(drawer === "metrics" ? null : "metrics")}><Activity size={19} /><span>Health</span></button>
        </nav>

        {drawer && <div className="mobile-drawer-backdrop" role="button" tabIndex={-1} aria-label="Close tools" onKeyDown={(event) => event.key === "Escape" && setDrawer(null)} onMouseDown={(event) => event.target === event.currentTarget && setDrawer(null)}>
          <div className="mobile-drawer field-guide-mobile-drawer">
            <div className="mobile-drawer-head"><div className="drawer-grabber" /><button type="button" onClick={() => setDrawer(null)} aria-label="Close tools">Close</button></div>
            {drawer === "chat" && <FieldGuideChat key={"mobile-" + activeBiomeId + "-" + chatReset} idPrefix="mobile-field-guide" biome={activeBiome} controls={controls} result={result} onApplyConditions={applyFieldChanges} className="field-guide-mobile" />}
            {drawer === "conditions" && <ConditionsPanel biome={activeBiome} controls={controls} onControlChange={setControl} onReset={resetConditions} className="mobile-conditions-panel" />}
            {drawer === "explore" && <SpeciesRail species={focalSpecies} selectedId={selectedId} onSelect={(id) => { handleSpeciesSelect(id); setDrawer(null); }} />}
            {drawer === "metrics" && <MetricsPanel metrics={dashboardMetrics} compact />}
          </div>
        </div>}

        <SpeciesPanel species={selectedSpecies} open={Boolean(selectedSpecies)} onClose={() => setSelectedId(null)} onConnectionSelect={(connection) => connection.id && handleSpeciesSelect(connection.id)} />
      </div>
    </main>
  );
}

declare global {
  interface Window { __NATUREVERSE_STATE__?: unknown; }
}
