"use client";

import { ArrowRight, Compass, Eye, Sprout, X } from "lucide-react";

export function NatureverseWelcome({ onExplore, onJudgeMode }: { onExplore: () => void; onJudgeMode: () => void }) {
  return <div className="natureverse-welcome-backdrop" role="presentation">
    <section className="natureverse-welcome" role="dialog" aria-modal="true" aria-labelledby="natureverse-welcome-title">
      <button type="button" className="natureverse-welcome-close" onClick={onExplore} aria-label="Close welcome"><X size={17} /></button>
      <span className="natureverse-welcome-mark"><Compass size={18} /></span>
      <p>Welcome to Natureverse</p>
      <h1 id="natureverse-welcome-title">Every living thing is a clue.</h1>
      <div className="natureverse-welcome-steps"><span><Eye size={16} />Observe</span><i /><span><Compass size={16} />Trace</span><i /><span><Sprout size={16} />Restore</span></div>
      <p className="natureverse-welcome-copy">Explore freely, or take the three-minute judge path: identify a warning species, repair the links around it, and prove that the ecosystem is recovering.</p>
      <div className="natureverse-welcome-actions"><button type="button" onClick={onJudgeMode}>Start Judge Mode <ArrowRight size={16} /></button><button type="button" onClick={onExplore}>Explore freely</button></div>
    </section>
  </div>;
}

export default NatureverseWelcome;
