import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSimStore } from '@/state/useSimStore';
import { Card } from '@/components/ui/card';

export function ControlsPanel() {
  const { neo, deflection, toggles, setNEO, setDeflection, setToggles } = useSimStore();

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
              <Label htmlFor="tsunami-toggle" className="text-sm">
                Show Tsunami Reach
              </Label>
              <Switch
                id="tsunami-toggle"
                checked={toggles.tsunami}
                onCheckedChange={(checked) => setToggles({ tsunami: checked })}
              />
            </div>

            <div className="pt-3 border-t border-border/50">
              <div className="flex items-center justify-between">
                <Label htmlFor="ocean-toggle" className="text-sm">
                  Ocean Impact
                </Label>
                <Switch
                  id="ocean-toggle"
                  checked={neo.ocean_impact}
                  onCheckedChange={(checked) => setNEO({ ocean_impact: checked })}
                />
              </div>
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
              <span className="text-xs text-muted-foreground">{deflection.delta_diameter_m} m</span>
            </div>
            <Slider
              value={[deflection.delta_diameter_m]}
              min={-neo.diameter_m}
              max={0}
              step={10}
              onValueChange={([value]) => setDeflection({ delta_diameter_m: value })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-sm">Change in Density (kg/m³)</Label>
              <span className="text-xs text-muted-foreground">{deflection.delta_density_kg_m3} kg/m³</span>
            </div>
            <Slider
              value={[deflection.delta_density_kg_m3]}
              min={-neo.density_kg_m3}
              max={neo.density_kg_m3}
              step={50}
              onValueChange={([value]) => setDeflection({ delta_density_kg_m3: value })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-sm">Impact Location (lat/long degrees)</Label>
              <span className="text-xs text-muted-foreground">{deflection.delta_location_km[0]}°, {deflection.delta_location_km[1]}°</span>
            </div>
            <Slider
              value={[deflection.delta_location_km[0]]}
              min={-60}
              max={60}
              step={0.5}
              onValueChange={([value]) => setDeflection({ delta_location_km: [value, deflection.delta_location_km[1]] })}
              className="w-full"
            />
            <br />
            <Slider
              value={[deflection.delta_location_km[1]]}
              min={-60}
              max={60}
              step={0.5}
              onValueChange={([value]) => setDeflection({ delta_location_km: [deflection.delta_location_km[0], value] })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-sm">Change in Velocity (km/s)</Label>
              <span className="text-xs text-muted-foreground">{deflection.delta_velocity_km_s} km/s</span>
            </div>
            <Slider
              value={[deflection.delta_velocity_km_s]}
              min={-neo.velocity_km_s}
              max={2*neo.velocity_km_s}
              step={0.5}
              onValueChange={([value]) => setDeflection({ delta_velocity_km_s: value })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label className="text-sm">Change in Impact Angle (°)</Label>
              <span className="text-xs text-muted-foreground">{deflection.new_impact_angle}°</span>
            </div>
            <Slider
              value={[deflection.new_impact_angle]}
              min={-90}
              max={90}
              step={5}
              onValueChange={([value]) => setDeflection({ new_impact_angle: value })}
              className="w-full"
            />
          </div>

        </div>
      </Card>
    </div>
  );
}
