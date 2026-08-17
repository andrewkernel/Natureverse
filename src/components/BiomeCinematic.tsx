"use client";

import { X } from "lucide-react";
import type { BiomeStory } from "../data/biomeStories";

type Props = {
  story: BiomeStory;
  elapsedMs: number;
  onClose: () => void;
};

const formatRemaining = (elapsedMs: number, durationMs: number) => {
  const remaining = Math.max(0, Math.ceil((durationMs - elapsedMs) / 1000));
  return `0:${String(remaining).padStart(2, "0")}`;
};

export function BiomeCinematic({ story, elapsedMs, onClose }: Props) {
  const beatEnds = story.beats.reduce<number[]>((ends, beat) => [...ends, (ends.at(-1) ?? 0) + beat.durationMs], []);
  const locatedBeat = beatEnds.findIndex((end) => elapsedMs < end);
  const beatIndex = locatedBeat === -1 ? story.beats.length - 1 : locatedBeat;
  const activeBeat = story.beats[beatIndex];
  const progress = Math.min(100, (elapsedMs / story.durationMs) * 100);

  return (
    <>
      <div className="cinematic-frame" aria-hidden="true" />
      <section className="biome-cinematic" aria-live="polite" aria-label={`${story.title} cinematic story`}>
        <div className="biome-cinematic-meta"><strong>{story.title}</strong><span>{formatRemaining(elapsedMs, story.durationMs)}</span></div>
        <p className="biome-cinematic-subtitle" key={`${story.biomeId}-${beatIndex}`}>{activeBeat.subtitle}</p>
        <div className="biome-cinematic-footer">
          <div className="biome-cinematic-steps" aria-label={`Story beat ${beatIndex + 1} of ${story.beats.length}`}>
            {story.beats.map((beat, index) => <i key={beat.subtitle} className={index <= beatIndex ? "active" : ""} />)}
          </div>
          <button type="button" onClick={onClose} aria-label="Exit story mode"><X size={16} /></button>
        </div>
        <div className="biome-cinematic-progress" role="progressbar" aria-label="Story progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><i style={{ width: `${progress}%` }} /></div>
      </section>
    </>
  );
}

export default BiomeCinematic;
