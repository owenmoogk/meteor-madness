// Zustand store for asteroid impact simulation state management.
// This file defines the types and default values for the NEO (Near-Earth Object),
// deflection parameters, and visualization toggles. It also provides actions to
// update state, reset to defaults, and load asteroid presets.

import { create } from 'zustand';

// State for the asteroid (NEO) being simulated
export interface NEOState {
  diameter_m: number;         // Asteroid diameter in meters
  density_kg_m3: number;      // Density in kg/m^3
  velocity_km_s: number;      // Impact velocity in km/s
  impact_angle_deg: number;   // Impact angle in degrees
  impact_lat: number;         // Impact latitude
  impact_lon: number;         // Impact longitude
  ocean_impact: boolean;      // Whether impact is in ocean
}

// State for deflection scenario (how the asteroid's path is changed)
export interface DeflectionState {
  delta_diameter_m: number;         // Change in diameter (m)
  delta_velocity_km_s: number;      // Change in velocity (km/s)
  delta_density_kg_m3: number;      // Change in density (kg/m^3)
  delta_location_km: [number, number]; // Change in impact location (km)
  new_impact_angle: number;         // New impact angle (deg)
}

// Toggles for which visualizations are shown in the UI
export interface VisualizationToggles {
  crater: boolean;
  thermal: boolean;
  overpressure: boolean;
  tsunami: boolean;
  population: boolean;
  showMoon: boolean;
  showSun: boolean;
}

// Main store interface, including state and actions
export interface SimStore {
  neo: NEOState;
  deflection: DeflectionState;
  toggles: VisualizationToggles;
  presets: Record<string, NEOState>;
  presetsLoading: boolean;
  presetsError?: string;
  
  // Actions to update state
  setNEO: (updates: Partial<NEOState>) => void;
  setDeflection: (updates: Partial<DeflectionState>) => void;
  setToggles: (updates: Partial<VisualizationToggles>) => void;
  reset: () => void;            // Reset all state to defaults
  
  // Presets API
  fetchPresets: () => Promise<void>;
  // Load a preset asteroid scenario
  loadPreset: (presetKey: string) => void;
}

// Default asteroid (NEO) state: medium-sized, Mumbai impact
const defaultNEO: NEOState = {
  diameter_m: 250,
  density_kg_m3: 3000,
  velocity_km_s: 18,
  impact_angle_deg: 90,
  impact_lat: 19.076, // Mumbai
  impact_lon: 72.8777,
  ocean_impact: false,
};

// Default deflection state: no change
const defaultDeflection: DeflectionState = {
  delta_diameter_m: 0,
  delta_velocity_km_s: 0,
  delta_density_kg_m3: 0,
  delta_location_km: [0, 0],
  new_impact_angle: 0,
};

// Default visualization toggles: show crater, thermal, overpressure; hide tsunami, population, moon
const defaultToggles: VisualizationToggles = {
  crater: true,
  thermal: true,
  overpressure: true,
  tsunami: false,
  population: false,
  showMoon: false,
  showSun: true,
};

// Presets are loaded dynamically from /presets.json at runtime

// Zustand store implementation
export const useSimStore = create<SimStore>((set, get) => ({
  // Initial state
  neo: defaultNEO,
  deflection: defaultDeflection,
  toggles: defaultToggles,
  presets: {},
  presetsLoading: false,
  presetsError: undefined,

  // Update NEO state with partial updates
  setNEO: (updates) =>
    set((state) => ({
      neo: { ...state.neo, ...updates },
    })),

  // Update deflection state with partial updates
  setDeflection: (updates) =>
    set((state) => ({
      deflection: { ...state.deflection, ...updates },
    })),

  // Update visualization toggles with partial updates
  setToggles: (updates) =>
    set((state) => ({
      toggles: { ...state.toggles, ...updates },
    })),

  // Reset all state to defaults
  reset: () =>
    set({
      neo: defaultNEO,
      deflection: defaultDeflection,
      toggles: defaultToggles,
    }),

  // Fetch presets from public JSON (cached after first successful load)
  fetchPresets: async () => {
    const { presets, presetsLoading } = get();
    if (presetsLoading || (presets && Object.keys(presets).length > 0)) return;
    set({ presetsLoading: true, presetsError: undefined });
    try {
      const response = await fetch('/presets.json', { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`Failed to load presets: ${response.status}`);
      }
      const data = await response.json();
      set({ presets: data as Record<string, NEOState>, presetsLoading: false });
    } catch (err: any) {
      set({ presetsLoading: false, presetsError: err?.message ?? 'Unknown error loading presets' });
    }
  },

  // Load a preset asteroid scenario (overwrites NEO state with preset values)
  loadPreset: (presetKey: string) => {
    const preset = get().presets[presetKey];
    if (!preset) return;
    set({
      neo: preset,
    });
  },
}));
