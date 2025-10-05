import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSimStore } from '@/state/useSimStore';
import { Card } from '@/components/ui/card';
import React, { useState } from 'react';

export function ControlsPanel() {
  const { neo, deflection, toggles, setNEO, setDeflection, setToggles } = useSimStore();

  // Local state for sliders
  const [localDiameter, setLocalDiameter] = useState(deflection.delta_diameter_m);
  const [localDensity, setLocalDensity] = useState(deflection.delta_density_kg_m3);
  const [localLat, setLocalLat] = useState(deflection.delta_location_angle[0]);
  const [localLon, setLocalLon] = useState(deflection.delta_location_angle[1]);
  const [localVelocity, setLocalVelocity] = useState(deflection.delta_velocity_km_s);
  const [localAngle, setLocalAngle] = useState(deflection.new_impact_angle);

  // Keep local state in sync if deflection changes externally
  React.useEffect(() => {
    setLocalDiameter(deflection.delta_diameter_m);
    setLocalDensity(deflection.delta_density_kg_m3);
    setLocalLat(deflection.delta_location_angle[0]);
    setLocalLon(deflection.delta_location_angle[1]);
    setLocalVelocity(deflection.delta_velocity_km_s);
    setLocalAngle(deflection.new_impact_angle);
  }, [deflection]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-card/50 backdrop-blur-sm border-border">
      {/* Visualization Settings */}
      <Card className="p-6 bg-secondary/30 border-primary/20">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary mb-4">Visualization Settings</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="crater-toggle" className="text-sm">
                Show Crater
              </Label>
              <Switch
                id="crater-toggle"
                checked={toggles.crater}
                onCheckedChange={(checked) => setToggles({ crater: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="thermal-toggle" className="text-sm">
                Show Thermal Radius
              </Label>
              <Switch
                id="thermal-toggle"
                checked={toggles.thermal}
                onCheckedChange={(checked) => setToggles({ thermal: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="overpressure-toggle" className="text-sm">
                Show Overpressure Zones
              </Label>
              <Switch
                id="overpressure-toggle"
                checked={toggles.overpressure}
                onCheckedChange={(checked) => setToggles({ overpressure: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="thermal-toggle" className="text-sm">
                Show Population Heatmap
              </Label>
              <Switch
                id="thermal-toggle"
                checked={toggles.showPopulation}
                onCheckedChange={(checked) => setToggles({ showPopulation: checked })}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Deflection Settings */}
      <Card className="p-6 bg-secondary/30 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Deflection Settings</h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-sm">Change in Diameter (m)</Label>
              <span className="text-xs text-muted-foreground">{localDiameter} m</span>
            </div>
            <Slider
              value={[localDiameter]}
              min={-neo.diameter_m}
              max={0}
              step={10}
              onValueChange={([value]) => setLocalDiameter(value)}
              onValueCommit={([value]) => setDeflection({ delta_diameter_m: value })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-sm">Change in Density (kg/m³)</Label>
              <span className="text-xs text-muted-foreground">{localDensity} kg/m³</span>
            </div>
            <Slider
              value={[localDensity]}
              min={-neo.density_kg_m3}
              max={neo.density_kg_m3}
              step={50}
              onValueChange={([value]) => setLocalDensity(value)}
              onValueCommit={([value]) => setDeflection({ delta_density_kg_m3: value })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-sm">Impact Location (lat/long degrees)</Label>
              <span className="text-xs text-muted-foreground">{localLat}°, {localLon}°</span>
            </div>
            <Slider
              value={[localLat]}
              min={-5}
              max={5}
              step={0.25}
              onValueChange={([value]) => setLocalLat(value)}
              onValueCommit={([value]) => setDeflection({ delta_location_angle: [value, localLon] })}
              className="w-full"
            />
            <br />
            <Slider
              value={[localLon]}
              min={-5}
              max={5}
              step={0.25}
              onValueChange={([value]) => setLocalLon(value)}
              onValueCommit={([value]) => setDeflection({ delta_location_angle: [localLat, value] })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-sm">Change in Velocity (km/s)</Label>
              <span className="text-xs text-muted-foreground">{localVelocity} km/s</span>
            </div>
            <Slider
              value={[localVelocity]}
              min={-neo.velocity_km_s}
              max={2 * neo.velocity_km_s}
              step={0.5}
              onValueChange={([value]) => setLocalVelocity(value)}
              onValueCommit={([value]) => setDeflection({ delta_velocity_km_s: value })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-sm">Change in Impact Angle (°)</Label>
              <span className="text-xs text-muted-foreground">{localAngle}°</span>
            </div>
            <Slider
              value={[localAngle]}
              min={-90}
              max={90}
              step={5}
              onValueChange={([value]) => setLocalAngle(value)}
              onValueCommit={([value]) => setDeflection({ new_impact_angle: value })}
              className="w-full"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
