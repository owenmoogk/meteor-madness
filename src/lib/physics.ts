/**
 * Physics calculations for asteroid impact simulation
 * All formulas are simplified MVP models suitable for educational purposes
 */

// Physical constants
const EARTH_RADIUS_KM = 6371;
const JOULES_PER_MEGATON = 4.184e15;
const G = 6.674e-11; // Gravitational constant

export interface NEOParams {
  diameter_m: number;
  density_kg_m3: number;
  velocity_km_s: number;
  impact_angle_deg: number;
  impact_lat: number;
  impact_lon: number;
  ocean_impact: boolean;
}

export interface DeflectionParams {
  delta_v_mm_s: number;
  lead_time_years: number;
  azimuth_deg: number;
}

export interface ImpactOutputs {
  mass_kg: number;
  energy_j: number;
  energy_mt: number;
  crater_diam_km: number;
  crater_depth_m: number;
  rings_km: {
    crater: number;
    thermal: number;
    overpressure_1psi: number;
    overpressure_3psi: number;
    overpressure_5psi: number;
    overpressure_10psi: number;
    tsunami?: number;
  };
  seismic_magnitude: number;
  would_miss_earth: boolean;
}

/**
 * Calculate asteroid mass
 * m = ρ * (4/3) * π * r³
 */
export function calculateMass(diameter_m: number, density_kg_m3: number): number {
  const radius_m = diameter_m / 2;
  return density_kg_m3 * (4 / 3) * Math.PI * Math.pow(radius_m, 3);
}

/**
 * Calculate kinetic energy
 * E = 0.5 * m * v²
 */
export function calculateEnergy(mass_kg: number, velocity_km_s: number): number {
  const velocity_m_s = velocity_km_s * 1000;
  return 0.5 * mass_kg * velocity_m_s * velocity_m_s;
}

/**
 * Convert Joules to Megatons TNT
 */
export function joulesToMegatons(joules: number): number {
  return joules / JOULES_PER_MEGATON;
}

/**
 * Calculate crater diameter using simplified scaling law
 * Df [km] ≈ 0.01 * (Ek)^0.294 * f(θ)
 * where f(θ) = sin^(1/3)(θ) accounts for impact angle
 */
export function calculateCraterDiameter(
  energy_j: number,
  impact_angle_deg: number
): number {
  const energy_mt = joulesToMegatons(energy_j)
  const angle_rad = (impact_angle_deg * Math.PI) / 180;
  const angle_factor = Math.pow(Math.sin(angle_rad), 1 / 3);
  const diameter_km = 0.01 * Math.pow(energy_mt, 0.294) * angle_factor;
  return Math.max(0.01, diameter_km); // Minimum 10m crater
}

/**
 * Calculate crater depth (rough approximation)
 * Depth ≈ 0.2 * Diameter
 */
export function calculateCraterDepth(diameter_km: number): number {
  return diameter_km * 0.2 * 1000; // Convert to meters
}

/**
 * Calculate overpressure radius for given PSI
 * r_psi_km = a(psi) * Y_mt^b(psi)
 * Empirical constants for different overpressures
 */
export function calculateOverpressureRadius(
  yield_mt: number,
  psi: number
): number {
  // Empirical constants (simplified from nuclear blast data)
  const constants: Record<number, { a: number; b: number }> = {
    1: { a: 2.2, b: 0.33 },
    3: { a: 1.5, b: 0.33 },
    5: { a: 1.2, b: 0.33 },
    10: { a: 0.8, b: 0.33 },
  };

  const params = constants[psi] || { a: 1.0, b: 0.33 };
  return params.a * Math.pow(yield_mt, params.b);
}

/**
 * Calculate thermal radiation radius (flash burn)
 * r_thermal [km] = c * Y_mt^0.4
 * Using c ≈ 7 for MVP (second-degree burns)
 */
export function calculateThermalRadius(yield_mt: number): number {
  const c = 7.0;
  return c * Math.pow(yield_mt, 0.4);
}

/**
 * Calculate tsunami reach (very simplified)
 * Only for ocean impacts
 * r_tsunami ≈ k_t * (k_w * E_k)^0.25
 */
export function calculateTsunamiReach(
  energy_j: number,
  ocean_impact: boolean
): number | undefined {
  if (!ocean_impact) return undefined;

  const k_w = 0.2; // Energy coupling to water (20%)
  const k_t = 0.8; // Scaling constant
  const coupled_energy = k_w * energy_j;

  return k_t * Math.pow(coupled_energy, 0.25) / 1000; // Convert to km
}

/**
 * Calculate seismic magnitude (Richter scale approximation)
 * M ≈ (2/3) * log10(E) - 2.9
 * where E is in Joules
 */
export function calculateSeismicMagnitude(energy_j: number): number {
  const magnitude = (2 / 3) * Math.log10(energy_j) - 2.9;
  return Math.max(0, Math.min(12, magnitude)); // Clamp to reasonable range
}

/**
 * Calculate deflection displacement
 * Δs ≈ Δv * T (simple along-track displacement)
 * Returns miss distance in km
 */
export function calculateDeflectionDisplacement(
  delta_v_mm_s: number,
  lead_time_years: number
): number {
  const delta_v_m_s = delta_v_mm_s / 1000; // Convert mm/s to m/s
  const time_seconds = lead_time_years * 365.25 * 24 * 3600;
  const displacement_m = delta_v_m_s * time_seconds;
  return displacement_m / 1000; // Convert to km
}

/**
 * Check if deflection causes asteroid to miss Earth
 */
export function wouldMissEarth(displacement_km: number): boolean {
  return displacement_km > EARTH_RADIUS_KM;
}

/**
 * Calculate new impact point after deflection
 * Moves along great circle based on azimuth
 */
export function calculateNewImpactPoint(
  original_lat: number,
  original_lon: number,
  displacement_km: number,
  azimuth_deg: number
): { lat: number; lon: number } {
  // Convert to radians
  const lat1 = (original_lat * Math.PI) / 180;
  const lon1 = (original_lon * Math.PI) / 180;
  const bearing = (azimuth_deg * Math.PI) / 180;

  // Angular distance
  const angular_distance = displacement_km / EARTH_RADIUS_KM;

  // Calculate new position
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angular_distance) +
      Math.cos(lat1) * Math.sin(angular_distance) * Math.cos(bearing)
  );

  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angular_distance) * Math.cos(lat1),
      Math.cos(angular_distance) - Math.sin(lat1) * Math.sin(lat2)
    );

  // Convert back to degrees
  return {
    lat: (lat2 * 180) / Math.PI,
    lon: ((lon2 * 180) / Math.PI + 540) % 360 - 180, // Normalize to -180 to 180
  };
}

async function getPopulationInArea(lat: number, long: number, radius_km: number): Promise<number> {
  const api = `https://ringpopulationsapi.azurewebsites.net/api/globalringpopulations?latitude=${lat}&longitude=${long}&distance_km=${Math.round(radius_km)}`
  const response = await fetch(api)
  const json = await response.json()
  if (json.length < 1) return 0
  return json[0].people
}


const CR_INJ = 0
const OP1_INJ = 0.2
const OP10_INJ = 0.35
const TH_INJ = 0.1
const CR_DTH = 1
const OP1_DTH = 0.01
const OP10_DTH = 0.6
const TH_DTH = 0.05


async function getCasualties(lat: number, long: number, crater_radius: number, overpres1_radius: number, overpres10_radius: number, thermal_radius: number){
  const [crater_pop, overpres1_pop, overpres10_pop, thermal_pop] = await Promise.all([
    getPopulationInArea(lat, long, crater_radius),
    getPopulationInArea(lat, long, overpres1_radius),
    getPopulationInArea(lat, long, overpres10_radius),
    getPopulationInArea(lat, long, thermal_radius)
  ])
  const injuries = crater_pop * CR_INJ + overpres1_pop * OP1_INJ + overpres10_pop * OP10_INJ + thermal_radius * TH_INJ
  const deaths = crater_pop * CR_DTH + overpres1_pop * OP1_DTH + overpres10_pop * OP10_DTH + thermal_radius * TH_DTH
  return {injuries, deaths}
}



/**
 * Main simulation function
 */
export function simulateImpact(
  neo: NEOParams
): {
  pre: ImpactOutputs;
  post_impact_point?: { lat: number; lon: number };
} {
  // Calculate pre-deflection impact
  const mass = calculateMass(neo.diameter_m, neo.density_kg_m3);
  const energy = calculateEnergy(mass, neo.velocity_km_s);
  const energy_mt = joulesToMegatons(energy);
  const crater_diam = calculateCraterDiameter(energy, neo.impact_angle_deg);
  const crater_depth = calculateCraterDepth(crater_diam);

  const overpressure_1psi = calculateOverpressureRadius(energy_mt, 1)
  const overpressure_3psi = calculateOverpressureRadius(energy_mt, 3)
  const overpressure_5psi = calculateOverpressureRadius(energy_mt, 5)
  const overpressure_10psi = calculateOverpressureRadius(energy_mt, 10)
  const thermal= calculateThermalRadius(energy_mt)

  const pre: ImpactOutputs = {
    mass_kg: mass,
    energy_j: energy,
    energy_mt: energy_mt,
    crater_diam_km: crater_diam,
    crater_depth_m: crater_depth,
    rings_km: {
      crater: crater_diam / 2,
      thermal,
      overpressure_1psi,
      overpressure_3psi, 
      overpressure_5psi, 
      overpressure_10psi,
      tsunami: calculateTsunamiReach(energy, neo.ocean_impact),
    },
    seismic_magnitude: calculateSeismicMagnitude(energy),
    would_miss_earth: false,
    ...getCasualties(neo.impact_lat, neo.impact_lon, crater_diam/2, overpressure_1psi, overpressure_10psi, thermal)
  };

  return { pre };
}
