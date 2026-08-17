"use client";

import { ArrowUp, Leaf, MessageCircle, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import type { BiomeConfig } from "../types/biome";
import type { SimulationControls, SimulationResult } from "../types/ecosystem";

type FieldMessage = { id: number; role: "guide" | "visitor"; text: string; effect?: string };

type Props = {
  biome: BiomeConfig;
  controls: SimulationControls;
  result: SimulationResult;
  onApplyConditions: (changes: Partial<SimulationControls>) => void;
  className?: string;
  idPrefix?: string;
};

const commandVerb = /\b(make|bring|add|more|clear|clean|filter|reduce|remove|restore|rebuild|grow|plant|protect|introduce|increase|warm(?:er)?|heat|dry)\b/;
const questionLead = /^(can|could|would|will|should|how|what|why|when|where|is|are|do|does)\b/;

function pressureSummary(controls: SimulationControls) {
  const entries = [
    ["pollution", controls.pollution],
    ["drought", controls.drought],
    ["habitat loss", controls.habitatLoss],
    ["invasive species", controls.invasiveSpecies ? 65 : 0],
  ] as const;
  return [...entries].sort((a, b) => b[1] - a[1])[0];
}

function respond(input: string, biome: BiomeConfig, controls: SimulationControls, result: SimulationResult) {
  const query = input.trim().toLowerCase();
  const health = Math.round(result.metrics.overallHealth);
  const water = Math.round(result.metrics.waterQuality);
  const dry = Math.round(controls.drought);
  const isQuestion = /\?$/.test(query) || questionLead.test(query);
  const hasCommand = commandVerb.test(query) && !isQuestion;

  if (/\b(rain|storm|drizzle|cool|overcast|cloud)\b/.test(query) && (hasCommand || !isQuestion)) {
    const next = Math.max(0, controls.drought - 24);
    return { changes: { drought: next }, effect: "Weather adjusted", text: "A cooler, wetter pattern moves through " + biome.shortLabel + ". Drought stress falls from " + dry + "% to " + next + "%, giving " + biome.species.frog.name + " and stream-edge plants more breathing room." };
  }
  if (/\b(sun|sunny|heat|hot(?:ter)?|warm(?:er)?|dry(?:er)?)\b/.test(query) && hasCommand) {
    const next = Math.min(100, controls.drought + 22);
    return { changes: { drought: next }, effect: "Heat and dryness increased", text: "The air turns warmer and drier. Drought stress rises to " + next + "%, which reduces moisture available to " + biome.signatureFlora[2] + " and the species that depend on it." };
  }
  if (/\b(clear|clean|filter|runoff|pollution|contaminant)\b/.test(query) && hasCommand) {
    const next = Math.max(0, controls.pollution - 28);
    return { changes: { pollution: next }, effect: "Water pressure reduced", text: "The water clears. Pollution pressure drops to " + next + "% and the current water-quality reading can begin to recover from " + water + "%." };
  }
  if (/\b(pollute|dirty|smoke|spill)\b/.test(query) && hasCommand) {
    const next = Math.min(100, controls.pollution + 26);
    return { changes: { pollution: next }, effect: "Pollution increased", text: "Runoff and contaminants rise to " + next + "%. Watch the water tone and " + biome.species.fish.name + " closely—their population responds quickly to declining clarity and oxygen." };
  }
  if (/\b(forest|tree|canopy|habitat|corridor|meadow|coral)\b/.test(query) && hasCommand) {
    const next = Math.max(0, controls.habitatLoss - 26);
    return { changes: { habitatLoss: next }, effect: "Habitat restored", text: "Native cover starts to reconnect. Habitat loss drops to " + next + "%, creating more shelter and movement routes for " + biome.species.bird.name + ", " + biome.species.deer.name + ", and their food sources." };
  }
  if (/\b(invasive|knotweed|competitor)\b/.test(query) && /\b(remove|clear|reduce|control|pull)\b/.test(query)) {
    return { changes: { invasiveSpecies: false }, effect: "Invasive pressure removed", text: "Native plants have room again. The invasive competitor is removed, so " + biome.signatureFlora[2] + " can support a more varied food web." };
  }
  if (/\b(invasive|knotweed|competitor)\b/.test(query) && /\b(add|introduce|spread)\b/.test(query)) {
    return { changes: { invasiveSpecies: true }, effect: "Invasive pressure introduced", text: "A fast-spreading competitor takes hold. Native food and cover become less available, which will ripple out to pollinators and small animals." };
  }
  if (/\b(weather|climate|rain|temperature|dry|drought)\b/.test(query)) {
    return { text: biome.name + " is modeled as " + biome.climate.toLowerCase().replace(/\.+$/, "") + ". Right now drought stress is " + dry + "%; water quality is " + water + "%. Ask me to bring rain or make it warmer to see a gentle weather shift." };
  }
  if (/\b(trout|fish|river|water)\b/.test(query)) {
    return { text: biome.species.fish.name + " is a living signal for this place. It needs " + biome.species.fish.habitat.toLowerCase() + ", and its current population is " + Math.round(result.populations.fish ?? 0) + "% of a healthy baseline." };
  }
  if (/\b(bee|pollinator|flower|plant)\b/.test(query)) {
    return { text: biome.species.bee.name + " links " + biome.signatureFlora[2].toLowerCase() + " to the rest of the web. Pollination activity is " + Math.round(result.metrics.pollination) + "%, so small changes to moisture and habitat can travel further than they first appear." };
  }
  if (/\b(why|health|happening|problem|struggling)\b/.test(query)) {
    const [pressure, value] = pressureSummary(controls);
    return { text: value > 8 ? "The strongest current pressure is " + pressure + " at " + Math.round(value) + "%. It is pulling whole-system health down to " + health + "%. Ask about a species, or describe a weather or habitat change and I’ll translate it into the scene." : "The system is fairly calm: overall health is " + health + "%. In this model, water, plant renewal, habitat, and species populations influence one another rather than moving independently." };
  }
  return { text: "I can read this " + biome.name + " scene with you. Try why are the fish struggling, bring rain, clear the runoff, or restore the forest corridor." };
}

export function FieldGuideChat({ biome, controls, result, onApplyConditions, className = "", idPrefix = "field-guide" }: Props) {
  const [draft, setDraft] = useState("");
  const [messageId, setMessageId] = useState(1);
  const [messages, setMessages] = useState<FieldMessage[]>([{ id: 0, role: "guide", text: "I’m your field guide for " + biome.name + ". Ask about a species, the weather, or describe a change you want to observe." }]);
  const inputRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const suggestions = useMemo(() => ["Why are the fish struggling?", "Bring rain", "Clear the runoff", "Restore the forest corridor"], []);
  const titleId = idPrefix + "-title";
  const inputId = idPrefix + "-input";

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTo({ top: thread.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (value: string) => {
    const text = value.trim();
    if (!text) return;
    const answer = respond(text, biome, controls, result);
    if (answer.changes) onApplyConditions(answer.changes);
    setMessages((current) => [...current, { id: messageId, role: "visitor", text }, { id: messageId + 1, role: "guide", text: answer.text, effect: answer.effect }]);
    setMessageId((current) => current + 2);
    setDraft("");
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); send(draft); };
  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    send(draft);
  };

  return (
    <section className={["field-guide-chat", className].join(" ")} aria-labelledby={titleId}>
      <header className="field-guide-head">
        <div className="field-guide-mark"><Sparkles size={17} /></div>
        <div><small>Living field guide</small><h2 id={titleId}>Ask the ecosystem</h2></div>
        <button type="button" onClick={() => setMessages([{ id: 0, role: "guide", text: "Fresh page, fresh observation. What would you like to notice in " + biome.name + "?" }])} aria-label="Clear conversation" title="Clear conversation"><RotateCcw size={15} /></button>
      </header>
      <div className="field-guide-context"><Leaf size={14} /><span>{biome.location}</span><i /> <span>{Math.round(result.metrics.overallHealth)}% living health</span></div>
      <div className="field-guide-thread" ref={threadRef} role="log" aria-live="polite" aria-label="Field guide conversation">
        {messages.map((message) => (
          <article className={"field-message field-message-" + message.role} key={message.id}>
            {message.role === "guide" && <MessageCircle size={13} aria-hidden="true" />}
            <div>{message.effect && <small>{message.effect}</small>}<p>{message.text}</p></div>
          </article>
        ))}
      </div>
      <div className="field-guide-suggestions" aria-label="Suggested prompts">
        {suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => send(suggestion)}>{suggestion}</button>)}
      </div>
      <form className="field-guide-composer" onSubmit={submit}>
        <label className="sr-only" htmlFor={inputId}>Ask the field guide</label>
        <input id={inputId} ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={onInputKeyDown} placeholder="Ask about this ecosystem…" autoComplete="off" />
        <button type="submit" aria-label="Send prompt" disabled={!draft.trim()}><ArrowUp size={17} /></button>
      </form>
    </section>
  );
}

export default FieldGuideChat;
