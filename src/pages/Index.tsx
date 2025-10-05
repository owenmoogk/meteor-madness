import { useEffect, useState } from 'react';
import { ImpactMap } from '@/components/ImpactMap';
import { ControlsPanel } from '@/components/ControlsPanel';
import { MetricsPanel } from '@/components/MetricsPanel';
import { useSimStore } from '@/state/useSimStore';
import { simulateImpact } from '@/lib/physics';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { neo, deflection, toggles, loadPreset } = useSimStore();
  const [simulation, setSimulation] = useState<ReturnType<typeof simulateImpact>>();
  const [deflectedSimulation, setDeflectedSimulation] = useState<ReturnType<typeof simulateImpact>>();
  const [syncCenter, setSyncCenter] = useState<[number, number]>([neo.impact_lon, neo.impact_lat]);
  const [syncZoom, setSyncZoom] = useState<number>(8);
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<'small' | 'medium' | 'large' | 'tunguska' | 'chicxulub'>('medium');
  useEffect(() => {
    // Run simulation whenever parameters change
    const result = simulateImpact(
      neo,
    );
    setSimulation(result);
    const deflectedResult = simulateImpact(
      {
        ...neo,
        impact_angle_deg:  deflection.new_impact_angle+90,
        density_kg_m3: neo.density_kg_m3 + deflection.delta_density_kg_m3,
        diameter_m: neo.diameter_m + deflection.delta_diameter_m,
        velocity_km_s: neo.velocity_km_s + deflection.delta_velocity_km_s,
        impact_lat: neo.impact_lat + deflection.delta_location_km[0],
        impact_lon: neo.impact_lon + deflection.delta_location_km[1],
      }
      
    );
    setDeflectedSimulation(deflectedResult);
  }, [neo, deflection]);

  // Helper to compute delta outputs between two simulations
  const computeDelta = (
    a?: ReturnType<typeof simulateImpact>,
    b?: ReturnType<typeof simulateImpact>
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
    } as const;
  };

  const deltaPre = computeDelta(simulation, deflectedSimulation);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Welcome to Asteroid Impact Simulator</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            <div className="sm:col-span-1 flex items-center justify-center">
              <img src="/favicon.png" alt="Logo" className="w-24 h-24 rounded" />
            </div>
            <div className="sm:col-span-2 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Select Preset Astriod</h3>
              </div>
              <div className="max-w-sm">
                <Select
                  value={selectedPreset}
                  onValueChange={(v) => setSelectedPreset(v as typeof selectedPreset)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a preset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="tunguska">Tunguska</SelectItem>
                    <SelectItem value="chicxulub">Chicxulub</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button
                  onClick={() => {
                    loadPreset(selectedPreset);
                    setShowWelcome(false);
                  }}
                >
                  Simulate
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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

      {/* Main Content - Split View */
      }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 flex-shrink-0 overflow-hidden" style={{ height: 'calc(100vh - 80px - 400px)' }}>
        {/* Left Pane - 3D Trajectory */}
        <div className="h-full border-b lg:border-b-0 lg:border-r border-border bg-gradient-space overflow-hidden">
          {
            deflectedSimulation && (
              <ImpactMap
                onMove={(center, zoom) => {
                  setSyncCenter(center);
                  setSyncZoom(zoom);
                }}
                syncCenter={syncCenter}
                syncZoom={syncZoom}
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
              onMove={(center, zoom) => {
                setSyncCenter(center);
                setSyncZoom(zoom);
              }}
              syncCenter={syncCenter}
              syncZoom={syncZoom}
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
          <MetricsPanel pre={deltaPre as any} title="Delta" />
        )}
      </div>
    </div>
  );
};

export default Index;
