import { create } from 'zustand';
import type { IncidentType } from '../db/models/Incident';
import type { LocationResult } from '../services/location';

interface ActiveIncident {
  id: string;
  type: IncidentType;
  completedSteps: string[];
}

interface PhotoPayload {
  uri: string;
  lat: number | null;
  lng: number | null;
  label: string;
}

interface IncidentStore {
  activeIncident: ActiveIncident | null;
  startIncident: (id: string, type: IncidentType) => void;
  completeStep: (stepKey: string, data?: Record<string, unknown>) => void;
  addPhoto: (photo: PhotoPayload) => void;
  completeIncident: () => void;
  clearActiveIncident: () => void;
}

export const useIncidentStore = create<IncidentStore>((set) => ({
  activeIncident: null,

  startIncident: (id, type) =>
    set({ activeIncident: { id, type, completedSteps: [] } }),

  completeStep: (stepKey) =>
    set((state) => {
      if (!state.activeIncident) return state;
      const already = state.activeIncident.completedSteps.includes(stepKey);
      if (already) return state;
      return {
        activeIncident: {
          ...state.activeIncident,
          completedSteps: [...state.activeIncident.completedSteps, stepKey],
        },
      };
    }),

  addPhoto: (_photo) => {},

  completeIncident: () =>
    set((state) => {
      if (!state.activeIncident) return state;
      return { activeIncident: null };
    }),

  clearActiveIncident: () => set({ activeIncident: null }),
}));
