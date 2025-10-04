import { useEffect, useState } from 'react';
import { ThreeTrajectory } from '@/components/ThreeTrajectory';
import { ImpactMap } from '@/components/ImpactMap';
import { ControlsPanel } from '@/components/ControlsPanel';
import { MetricsPanel } from '@/components/MetricsPanel';
import { useSimStore } from '@/state/useSimStore';
import { simulateImpact } from '@/lib/physics';
import { Rocket } from 'lucide-react';

const Index = () => {
  const { neo, deflection, toggles } = useSimStore();
  const [simulation, setSimulation] = useState<ReturnType<typeof simulateImpact>>();

  useEffect(() => {
    // Run simulation whenever parameters change
    const result = simulateImpact(
      neo,
      deflection.enabled ? deflection : undefined
    );
    setSimulation(result);
  }, [neo, deflection]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-cyan rounded-lg flex items-center justify-center shadow-glow-cyan">
              <Rocket className="w-6 h-6 text-primary-foreground" />
            </div>
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
          <ThreeTrajectory
            asteroidSize={neo.diameter_m}
            impactLat={neo.impact_lat}
            impactLon={neo.impact_lon}
            postImpactLat={simulation?.post_impact_point?.lat}
            postImpactLon={simulation?.post_impact_point?.lon}
            showPreTrajectory={true}
            showPostTrajectory={deflection.enabled && !!simulation?.post_impact_point}
            showSun={toggles.showSun}
            showMoon={toggles.showMoon}
          />
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
              postImpactLat={simulation.post_impact_point?.lat}
              postImpactLon={simulation.post_impact_point?.lon}
            />
          )}
        </div>
      </div>

      {/* Metrics Panel */}
      {simulation && (
        <MetricsPanel
          pre={simulation.pre}
          post={simulation.post}
          deflectionEnabled={deflection.enabled}
        />
      )}

      {/* Controls */}
      <ControlsPanel />
    </div>
  );
};

export default Index;
