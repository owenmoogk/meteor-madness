import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSimStore } from '@/state/useSimStore';
import { Card } from '@/components/ui/card';

export function ControlsPanel() {
  const { neo, deflection, toggles, setNEO, setDeflection, setToggles, toggleDeflection } = useSimStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-card/50 backdrop-blur-sm border-t border-border">
      {/* Deflection Settings */}
      <Card className="p-6 bg-secondary/30 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Deflection Settings</h3>
            <div className="flex items-center gap-2">
              <Label htmlFor="deflection-toggle" className="text-sm">
                Enable
              </Label>
              <Switch
                id="deflection-toggle"
                checked={deflection.enabled}
                onCheckedChange={toggleDeflection}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <Label className="text-sm">Asteroid Diameter</Label>
                <span className="text-xs text-muted-foreground">{neo.diameter_m} m</span>
              </div>
              <Slider
                value={[neo.diameter_m]}
                min={50}
                max={2000}
                step={10}
                onValueChange={([value]) => setNEO({ diameter_m: value })}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label className="text-sm">Density</Label>
                <span className="text-xs text-muted-foreground">{neo.density_kg_m3} kg/m³</span>
              </div>
              <Slider
                value={[neo.density_kg_m3]}
                min={1500}
                max={3500}
                step={50}
                onValueChange={([value]) => setNEO({ density_kg_m3: value })}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label className="text-sm">Impact Velocity</Label>
                <span className="text-xs text-muted-foreground">{neo.velocity_km_s} km/s</span>
              </div>
              <Slider
                value={[neo.velocity_km_s]}
                min={5}
                max={30}
                step={0.5}
                onValueChange={([value]) => setNEO({ velocity_km_s: value })}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label className="text-sm">Impact Angle</Label>
                <span className="text-xs text-muted-foreground">{neo.impact_angle_deg}°</span>
              </div>
              <Slider
                value={[neo.impact_angle_deg]}
                min={15}
                max={90}
                step={5}
                onValueChange={([value]) => setNEO({ impact_angle_deg: value })}
                className="w-full"
              />
            </div>

            <div className={`pt-2 border-t border-border/50 transition-opacity ${!deflection.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-sm">Deflection Δv</Label>
                  <span className="text-xs text-muted-foreground">{deflection.delta_v_mm_s} mm/s</span>
                </div>
                <Slider
                  value={[deflection.delta_v_mm_s]}
                  min={0}
                  max={5}
                  step={0.1}
                  onValueChange={([value]) => setDeflection({ delta_v_mm_s: value })}
                  className="w-full"
                  disabled={!deflection.enabled}
                />
              </div>

              <div className="mt-4">
                <div className="flex justify-between mb-2">
                  <Label className="text-sm">Lead Time</Label>
                  <span className="text-xs text-muted-foreground">{deflection.lead_time_years} years</span>
                </div>
                <Slider
                  value={[deflection.lead_time_years]}
                  min={0}
                  max={5}
                  step={0.1}
                  onValueChange={([value]) => setDeflection({ lead_time_years: value })}
                  className="w-full"
                  disabled={!deflection.enabled}
                />
              </div>
              
              {!deflection.enabled && (
                <p className="text-xs text-muted-foreground/60 mt-3 italic">
                  Enable deflection above to adjust these parameters
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

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

            <div className="pt-3 border-t border-border/50">
              <div className="flex items-center justify-between">
                <Label htmlFor="sun-toggle" className="text-sm">
                  Show Sun
                </Label>
                <Switch
                  id="sun-toggle"
                  checked={toggles.showSun}
                  onCheckedChange={(checked) => setToggles({ showSun: checked })}
                />
              </div>

              <div className="flex items-center justify-between mt-3">
                <Label htmlFor="moon-toggle" className="text-sm">
                  Show Moon
                </Label>
                <Switch
                  id="moon-toggle"
                  checked={toggles.showMoon}
                  onCheckedChange={(checked) => setToggles({ showMoon: checked })}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
