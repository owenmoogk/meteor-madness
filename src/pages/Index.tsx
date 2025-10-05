import { useEffect, useState } from 'react';
import { ThreeTrajectory } from '@/components/ThreeTrajectory';
import { ImpactMap } from '@/components/ImpactMap';
import { ControlsPanel } from '@/components/ControlsPanel';
import { MetricsPanel } from '@/components/MetricsPanel';
import { useSimStore } from '@/state/useSimStore';
import { simulateImpact } from '@/lib/physics';

const Index = () => {
  const { neo, deflection, toggles } = useSimStore();
  const [simulation, setSimulation] = useState<ReturnType<typeof simulateImpact>>();
  const [deflectedSimulation, setDeflectedSimulation] = useState<ReturnType<typeof simulateImpact>>();
  useEffect(() => {
    // Run simulation whenever parameters change
    const result = simulateImpact(
      neo,
    );
    setSimulation(result);
    const deflectedResult = simulateImpact(
      {
        ...neo,
        impact_angle_deg: neo.impact_angle_deg + deflection.delta_impact_angle_deg,
        density_kg_m3: neo.density_kg_m3 + deflection.delta_density_kg_m3,
        diameter_m: neo.diameter_m + deflection.delta_diameter_m,
        velocity_km_s: neo.velocity_km_s + deflection.delta_velocity_km_s,
        impact_lat: neo.impact_lat + deflection.delta_location_km[0],
        impact_lon: neo.impact_lon + deflection.delta_location_km[1],
      }
      
    );
    setDeflectedSimulation(deflectedResult);
  }, [neo, deflection]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Add favicon.png here */}
            <img src="/favicon.png" alt="Asteroid Impact Simulator" className="w-14 h-14 rounded mr-2" />
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

      {/* Main Content - Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 flex-shrink-0 overflow-hidden" style={{ height: 'calc(100vh - 80px - 400px)' }}>
        {/* Left Pane - 3D Trajectory */}
        <div className="h-full border-b lg:border-b-0 lg:border-r border-border bg-gradient-space overflow-hidden">
          {
            deflectedSimulation && (
              <ImpactMap
                impactLat={neo.impact_lat + deflection.delta_location_km[0]}
                impactLon={neo.impact_lon + deflection.delta_location_km[1]}
                rings={deflectedSimulation.pre.rings_km}
                showCrater={toggles.crater}
                showThermal={toggles.thermal}
                showOverpressure={toggles.overpressure}
                showTsunami={toggles.tsunami && neo.ocean_impact}
              />
            )
          }
        </div>

        {/* Right Pane - 2D Impact Map */}
        <div className="h-full bg-muted">
          {simulation && (
            <ImpactMap
              impactLat={neo.impact_lat}
              impactLon={neo.impact_lon}
              rings={simulation.pre.rings_km}
              showCrater={toggles.crater}
              showThermal={toggles.thermal}
              showOverpressure={toggles.overpressure}
              showTsunami={toggles.tsunami && neo.ocean_impact}
            />
          )}
        </div>
      </div>

      {/* Metrics Panel */}
      {simulation && (
        <MetricsPanel
          pre={simulation.pre}
        />
      )}

      {/* Controls */}
      <ControlsPanel />
    </div>
  );
};

export default Index;
