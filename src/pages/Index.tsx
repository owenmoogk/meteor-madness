import { useEffect, useState } from 'react';
import { ImpactMap } from '@/components/ImpactMap';
import { ControlsPanel } from '@/components/ControlsPanel';
import { MetricsPanel } from '@/components/MetricsPanel';
import { useSimStore } from '@/state/useSimStore';
import { ImpactOutputs, simulateImpact } from '@/lib/physics';
import { WelcomeDialog } from '@/components/WelcomeDialog';
type SimulateOutput = {
  pre: ImpactOutputs,
  post_impact_point?: { lat: number; lon: number }
}
const Index = () => {
  const { neo, deflection, toggles } = useSimStore();
  const [simulation, setSimulation] = useState<SimulateOutput>();
  const [deflectedSimulation, setDeflectedSimulation] = useState<SimulateOutput>();
  const [syncCenter, setSyncCenter] = useState<[number, number]>([neo.impact_lon, neo.impact_lat]);
  const [syncZoom, setSyncZoom] = useState<number>(8);
  useEffect(() => {
    // Run simulation whenever parameters change
     simulateImpact(
      neo,
    ).then((result) => {

      setSimulation(result);
    })
    simulateImpact(
      {
        ...neo,
        impact_angle_deg:  deflection.new_impact_angle+90,
        density_kg_m3: neo.density_kg_m3 + deflection.delta_density_kg_m3,
        diameter_m: neo.diameter_m + deflection.delta_diameter_m,
        velocity_km_s: neo.velocity_km_s + deflection.delta_velocity_km_s,
        impact_lat: neo.impact_lat + deflection.delta_location_angle[0],
        impact_lon: neo.impact_lon + deflection.delta_location_angle[1],
      }
      
    ).then((deflectedResult)  => {

      setDeflectedSimulation(deflectedResult);
    })
  }, [neo, deflection]);

  // Helper to compute delta outputs between two simulations
  const computeDelta = (
    a?: SimulateOutput,
    b?: SimulateOutput
  ) => {
    if (!a || !b) return undefined;
    const preA = a.pre;
    const preB = b.pre;
    return {
      mass_kg: preB.mass_kg - preA.mass_kg,
      energy_j: preB.energy_j - preA.energy_j,
      energy_mt: preB.energy_mt - preA.energy_mt,
      crater_diam_km: preB.crater_diam_km - preA.crater_diam_km,
      crater_depth_m: preB.crater_depth_m - preA.crater_depth_m,
      rings_km: {
        crater: preB.rings_km.crater - preA.rings_km.crater,
        thermal: preB.rings_km.thermal - preA.rings_km.thermal,
        overpressure_1psi: preB.rings_km.overpressure_1psi - preA.rings_km.overpressure_1psi,
        overpressure_3psi: preB.rings_km.overpressure_3psi - preA.rings_km.overpressure_3psi,
        overpressure_5psi: preB.rings_km.overpressure_5psi - preA.rings_km.overpressure_5psi,
        overpressure_10psi: preB.rings_km.overpressure_10psi - preA.rings_km.overpressure_10psi,
        tsunami: preA.rings_km.tsunami !== undefined && preB.rings_km.tsunami !== undefined
          ? preB.rings_km.tsunami - preA.rings_km.tsunami
          : undefined,
      },
      seismic_magnitude: preB.seismic_magnitude - preA.seismic_magnitude,
      would_miss_earth: false,
      deaths: preB.deaths - preA.deaths,
      injuries: preB.injuries - preA.injuries
    } as const;
  };

  const deltaPre = computeDelta(simulation, deflectedSimulation);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WelcomeDialog />
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Add favicon.png here */}
            <img src={import.meta.env.BASE_URL + "/favicon.png"} alt="Asteroid Impact Simulator" className="w-14 h-14 rounded mr-2" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Asteroid Impact Simulator
              </h1>
              <p className="text-sm text-muted-foreground">
                Visualize near-Earth object impacts and deflection strategies
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Split View */
      }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-x-3 px-4 lg:px-2 flex-shrink-0 overflow-hidden" style={{ height: '450px' }}>
        {/* Left Pane - 3D Trajectory */}
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-2">
            <h1 className="text-lg font-semibold text-primary">Original Impact Simulation</h1>
            <span className="text-destructive font-mono text-base">
              Deaths: {simulation?.pre.deaths !== undefined ? Math.round(simulation.pre.deaths).toLocaleString() : "—"}
            </span>
          </div>
          {simulation && (
            <div className="flex-1 min-h-0 rounded-lg overflow-hidden bg-gradient-space">
              <ImpactMap
              onMove={(center, zoom) => {
                setSyncCenter(center);
                setSyncZoom(zoom);
              }}
              syncCenter={syncCenter}
              syncZoom={syncZoom}
              showPopulation={toggles.showPopulation}
              impactLat={neo.impact_lat}
              impactLon={neo.impact_lon}
              rings={simulation.pre.rings_km}
              showCrater={toggles.crater}
              showThermal={toggles.thermal}
              showOverpressure={toggles.overpressure}
              showTsunami={toggles.tsunami && neo.ocean_impact}
              />
            </div>
          )}
        </div>

        {/* Right Pane - 2D Impact Map */}
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-2">
              <h1 className="text-lg font-semibold text-primary">Deflected Impact Simulation</h1>
              <span className="text-destructive font-mono text-base">
                Deaths: {deflectedSimulation?.pre.deaths !== undefined ? Math.round(deflectedSimulation.pre.deaths).toLocaleString() : "—"}
              </span>
            </div>
          {
            deflectedSimulation && (
              <div className="flex-1 min-h-0 rounded-lg overflow-hidden bg-gradient-space">
                <ImpactMap
                onMove={(center, zoom) => {
                  setSyncCenter(center);
                  setSyncZoom(zoom);
                }}
                syncCenter={syncCenter}
                syncZoom={syncZoom}
                showPopulation={toggles.showPopulation}
                impactLat={neo.impact_lat + deflection.delta_location_angle[0]}
                impactLon={neo.impact_lon + deflection.delta_location_angle[1]}
                rings={deflectedSimulation.pre.rings_km}
                showCrater={toggles.crater}
                showThermal={toggles.thermal}
                showOverpressure={toggles.overpressure}
                showTsunami={toggles.tsunami && neo.ocean_impact}
                />
              </div>
            )
          }
         
        </div>
      </div>

      {/* Controls above metrics */}
      <ControlsPanel />

      {/* Metrics: three panels side by side (each internally stacked) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {simulation && (
          <MetricsPanel pre={simulation.pre} title="Original Impact" />
        )}
        {deflectedSimulation && (
          <MetricsPanel pre={deflectedSimulation.pre} title="Modified Impact" />
        )}
        {deltaPre && (
          // Casting to any is safe for display-only deltas matching ImpactOutputs shape
          <MetricsPanel pre={deltaPre} title="Delta" />
        )}
      </div>
    </div>
  );
};

export default Index;
