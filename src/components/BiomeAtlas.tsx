"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Globe2, MapPin, X } from "lucide-react";
import { FIELD_SITE_COORDINATES } from "../data/fieldSites";
import { useModalFocus } from "../hooks/useModalFocus";
import type { BiomeConfig, BiomeId } from "../types/biome";

type Props = {
  biomes: BiomeConfig[];
  activeId: BiomeId;
  onChange: (id: BiomeId) => void;
  onClose: () => void;
};

export function BiomeAtlas({ biomes, activeId, onChange, onClose }: Props) {
  const { dialogRef, closeButtonRef } = useModalFocus(onClose);
  const canvas = useRef<HTMLCanvasElement>(null);
  const dragging = useRef<number | null>(null);
  const pointerX = useRef(0);
  const phi = useRef(0.4);
  const targetPhi = useRef(0.4);
  const size = useRef(460);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let disposed = false;
    let destroy: (() => void) | undefined;
    const resize = () => { size.current = Math.max(280, Math.round(element.getBoundingClientRect().width)); };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);

    void import("cobe").then(({ default: createGlobe }) => {
      if (disposed) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const globe = createGlobe(element, {
        devicePixelRatio: dpr,
        width: size.current,
        height: size.current,
        phi: phi.current,
        theta: 0.18,
        dark: 0,
        diffuse: 1.2,
        scale: 0.98,
        mapSamples: 12_000,
        mapBrightness: 12,
        baseColor: [0.06, 0.18, 0.1],
        glowColor: [0.24, 0.52, 0.3],
        markerColor: [0.74, 0.95, 0.45],
        markers: biomes.map((biome) => ({ location: FIELD_SITE_COORDINATES[biome.id], size: biome.id === activeId ? 0.095 : 0.055 })),
        onRender: (state) => {
          if (dragging.current == null) targetPhi.current += 0.0022;
          phi.current += (targetPhi.current - phi.current) * 0.09;
          state.phi = phi.current;
          state.width = size.current;
          state.height = size.current;
        },
      });
      destroy = () => globe.destroy();
    });

    return () => {
      disposed = true;
      observer.disconnect();
      destroy?.();
    };
  }, [activeId, biomes]);

  const pointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    dragging.current = event.pointerId;
    pointerX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (dragging.current !== event.pointerId) return;
    const delta = event.clientX - pointerX.current;
    pointerX.current = event.clientX;
    targetPhi.current += delta / 180;
  };
  const pointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (dragging.current === event.pointerId) dragging.current = null;
  };

  return (
    <div className="atlas-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} className="atlas-dialog" role="dialog" aria-modal="true" aria-labelledby="atlas-title">
        <header className="atlas-header">
          <div className="atlas-heading"><span><Globe2 size={18} /></span><div><small>Field atlas</small><h2 id="atlas-title">Seven worlds. One living planet.</h2></div></div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close world atlas"><X size={18} /></button>
        </header>
        <div className="atlas-body">
          <div className="atlas-globe-wrap">
            <canvas
              ref={canvas}
              className="atlas-globe"
              aria-label="Interactive globe showing all seven Natureverse biomes"
              onPointerDown={pointerDown}
              onPointerMove={pointerMove}
              onPointerUp={pointerUp}
              onPointerCancel={pointerUp}
            />
            <div className="atlas-globe-caption"><span>Drag to rotate</span><i /> <span>7 active field sites</span></div>
          </div>
          <div className="atlas-sites" aria-label="Natureverse field sites">
            <p className="atlas-intro">Each field site runs the same cause-and-effect simulator while revealing a different ecological story.</p>
            <div className="atlas-site-list">
              {biomes.map((biome, index) => (
                <button
                  key={biome.id}
                  type="button"
                  className={biome.id === activeId ? "active" : ""}
                  onClick={() => onChange(biome.id)}
                >
                  <span className="atlas-site-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="atlas-site-copy"><strong>{biome.name}</strong><small><MapPin size={10} />{biome.location}</small></span>
                  <span className="atlas-site-dot" style={{ background: biome.palette.accent }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
