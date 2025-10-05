import { create } from 'zustand';

export interface NEOState {
  diameter_m: number;
  density_kg_m3: number;
  velocity_km_s: number;
  impact_angle_deg: number;
  impact_lat: number;
  impact_lon: number;
  ocean_impact: boolean;
}

export interface DeflectionState {
  delta_diameter_m: number;
  delta_velocity_km_s: number;
  delta_density_kg_m3: number;
  delta_location_km: [number, number];
  new_impact_angle: number;
}

export interface VisualizationToggles {
  crater: boolean;
  thermal: boolean;
  overpressure: boolean;
  tsunami: boolean;
  population: boolean;
  showMoon: boolean;
  showSun: boolean;
}

export interface SimStore {
  neo: NEOState;
  deflection: DeflectionState;
  toggles: VisualizationToggles;
  
  // Actions
  setNEO: (updates: Partial<NEOState>) => void;
  setDeflection: (updates: Partial<DeflectionState>) => void;
  setToggles: (updates: Partial<VisualizationToggles>) => void;
  toggleDeflection: () => void;
  reset: () => void;
  
  // Presets
  loadPreset: (preset: 'small' | 'medium' | 'large' | 'tunguska' | 'chicxulub') => void;
}

// Default state
const defaultNEO: NEOState = {
  diameter_m: 250,
  density_kg_m3: 3000,
  velocity_km_s: 18,
  impact_angle_deg: 90,
  impact_lat: 19.076, // Mumbai
  impact_lon: 72.8777,
  ocean_impact: false,
};

const defaultDeflection: DeflectionState = {
  delta_diameter_m: 0,
  delta_velocity_km_s: 0,
  delta_density_kg_m3: 0,
  delta_location_km: [0, 0],
  new_impact_angle: 0,
};

const defaultToggles: VisualizationToggles = {
  crater: true,
  thermal: true,
  overpressure: true,
  tsunami: false,
  population: false,
  showMoon: false,
  showSun: true,
};

// Presets
const presets = {
  small: {
    diameter_m: 50,
    density_kg_m3: 2000,
    velocity_km_s: 15,
    impact_angle_deg: 45,
  },
  medium: {
    diameter_m: 250,
    density_kg_m3: 3000,
    velocity_km_s: 18,
    impact_angle_deg: 45,
  },
  large: {
    diameter_m: 1000,
    density_kg_m3: 3500,
    velocity_km_s: 25,
    impact_angle_deg: 30,
  },
  tunguska: {
    diameter_m: 60,
    density_kg_m3: 2000,
    velocity_km_s: 15,
    impact_angle_deg: 30,
  },
  chicxulub: {
    diameter_m: 10000,
    density_kg_m3: 3000,
    velocity_km_s: 20,
    impact_angle_deg: 60,
  },
};

export const useSimStore = create<SimStore>((set) => ({
  neo: defaultNEO,
  deflection: defaultDeflection,
  toggles: defaultToggles,

  setNEO: (updates) =>
    set((state) => ({
      neo: { ...state.neo, ...updates },
    })),

  setDeflection: (updates) =>
    set((state) => ({
      deflection: { ...state.deflection, ...updates },
    })),

  setToggles: (updates) =>
    set((state) => ({
      toggles: { ...state.toggles, ...updates },
    })),

  toggleDeflection: () =>
    set((state) => ({
      deflection: {
        ...state.deflection,
      },
    })),

  reset: () =>
    set({
      neo: defaultNEO,
      deflection: defaultDeflection,
      toggles: defaultToggles,
    }),

  loadPreset: (preset) =>
    set((state) => ({
      neo: { ...state.neo, ...presets[preset] },
    })),
}));
