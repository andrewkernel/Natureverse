import { create } from "zustand";
import { simulateEcosystem } from "../engine/ecosystemEngine";
import type { InterventionEffect } from "../data/interventions";
import type { SimulationControls, SimulationResult } from "../types/ecosystem";

const initialControls: SimulationControls = {
  pollution: 4,
  drought: 3,
  habitatLoss: 2,
  invasiveSpecies: false,
};

type Store = {
  controls: SimulationControls;
  result: SimulationResult;
  previousResult: SimulationResult;
  selectedId: string | null;
  isRestoring: boolean;
  interventions: number;
  restorationBudget: number;
  appliedInterventionIds: string[];
  restorationTarget: SimulationControls | null;
  setControl: <K extends keyof SimulationControls>(key: K, value: SimulationControls[K]) => void;
  setSelectedId: (id: string | null) => void;
  startRestoration: () => void;
  applyIntervention: (id: string, effect: InterventionEffect) => void;
  restorationTick: () => void;
  reset: () => void;
};

const initialResult = simulateEcosystem(initialControls);

export const useEcosystemStore = create<Store>((set, get) => ({
  controls: initialControls,
  result: initialResult,
  previousResult: initialResult,
  selectedId: null,
  isRestoring: false,
  interventions: 0,
  restorationBudget: 3,
  appliedInterventionIds: [],
  restorationTarget: null,
  setControl: (key, value) =>
    set((state) => {
      const controls = { ...state.controls, [key]: value };
      return {
        controls,
        previousResult: state.result,
        result: simulateEcosystem(controls),
        isRestoring: false,
        restorationTarget: null,
      };
    }),
  setSelectedId: (selectedId) => set({ selectedId }),
  startRestoration: () => set((state) => ({ isRestoring: true, interventions: state.interventions + 1 })),
  applyIntervention: (id, effect) => set((state) => {
    if (state.restorationBudget <= 0 || state.appliedInterventionIds.includes(id)) return state;
    const target: SimulationControls = {
      pollution: Math.max(0, state.controls.pollution - (effect.pollution ?? 0)),
      drought: Math.max(0, state.controls.drought - (effect.drought ?? 0)),
      habitatLoss: Math.max(0, state.controls.habitatLoss - (effect.habitatLoss ?? 0)),
      invasiveSpecies: effect.invasiveSpecies ?? state.controls.invasiveSpecies,
    };
    return {
      isRestoring: true,
      restorationTarget: target,
      interventions: state.interventions + 1,
      restorationBudget: state.restorationBudget - 1,
      appliedInterventionIds: [...state.appliedInterventionIds, id],
    };
  }),
  restorationTick: () => {
    const state = get();
    if (!state.isRestoring) return;
    if (state.restorationTarget) {
      const target = state.restorationTarget;
      const approach = (value: number, goal: number, step: number) => Math.max(goal, value - step);
      const controls: SimulationControls = {
        pollution: approach(state.controls.pollution, target.pollution, 1.8),
        drought: approach(state.controls.drought, target.drought, 1.25),
        habitatLoss: approach(state.controls.habitatLoss, target.habitatLoss, 1.5),
        invasiveSpecies: target.invasiveSpecies,
      };
      const finished = controls.pollution === target.pollution && controls.drought === target.drought && controls.habitatLoss === target.habitatLoss && controls.invasiveSpecies === target.invasiveSpecies;
      set({ controls, previousResult: state.result, result: simulateEcosystem(controls), isRestoring: !finished, restorationTarget: finished ? null : target });
      return;
    }
    const controls: SimulationControls = {
      pollution: Math.max(0, state.controls.pollution - 2.4),
      drought: Math.max(0, state.controls.drought - 1.7),
      habitatLoss: Math.max(0, state.controls.habitatLoss - 1.25),
      invasiveSpecies: state.controls.invasiveSpecies && state.controls.pollution > 18,
    };
    const finished = controls.pollution <= 1 && controls.drought <= 1 && controls.habitatLoss <= 1 && !controls.invasiveSpecies;
    set({
      controls,
      previousResult: state.result,
      result: simulateEcosystem(controls),
      isRestoring: !finished,
    });
  },
  reset: () => set({
    controls: initialControls,
    result: initialResult,
    previousResult: initialResult,
    selectedId: null,
    isRestoring: false,
    interventions: 0,
    restorationBudget: 3,
    appliedInterventionIds: [],
    restorationTarget: null,
  }),
}));
