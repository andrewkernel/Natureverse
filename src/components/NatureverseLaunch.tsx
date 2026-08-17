"use client";

import { Leaf, type LucideIcon } from "lucide-react";
import { useState } from "react";

type Props = {
  progress: number;
};

const statusForProgress = (progress: number) => {
  if (progress < 48) return "Gathering living systems";
  if (progress < 76) return "Connecting every field site";
  return "Opening the world atlas";
};

function FallbackLogo({ Icon = Leaf }: { Icon?: LucideIcon }) {
  return <div className="launch-wall-logo-fallback" aria-label="Natureverse"><Icon size={94} /><strong>Nature<span>verse</span></strong><small>Explore · Learn · Restore</small></div>;
}

export function NatureverseLaunch({ progress }: Props) {
  const [logoUnavailable, setLogoUnavailable] = useState(false);

  return (
    <div className="launch-backdrop launch-loading-backdrop" role="status" aria-live="polite" aria-label="Loading Natureverse">
      <section className={"launch-wall" + (progress >= 76 ? " is-opening" : "")} aria-label="Preparing the Natureverse world atlas">
        <div className="launch-wall-shutter launch-wall-shutter-left" aria-hidden="true" />
        <div className="launch-wall-shutter launch-wall-shutter-right" aria-hidden="true" />
        <div className="launch-wall-content">
          <div className="launch-wall-logo-frame">
            {logoUnavailable
              ? <FallbackLogo />
              : <>
                {/* The supplied transparent brand art is intentionally presented at its native aspect ratio. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/natureverse-launch-logo.png" alt="Natureverse logo — Explore, learn, restore" className="launch-wall-logo" onError={() => setLogoUnavailable(true)} />
              </>}
          </div>
          <div className="launch-wall-status">
            <span>{statusForProgress(progress)}</span>
            <div className="launch-progress" aria-hidden="true"><i style={{ width: progress + "%" }} /></div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default NatureverseLaunch;
