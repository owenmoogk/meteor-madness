import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { ImpactOutputs } from '@/lib/physics';

interface MetricsPanelProps {
  pre: ImpactOutputs;
  title?: string;
}

export function MetricsPanel({ pre, title }: MetricsPanelProps) {
  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatScientific = (num: number) => {
    return num.toExponential(2);
  };

  return (
    <div className="p-6 border-t border-border">
      {title && (
        <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
      )}
      <div className="flex flex-col gap-4">
      {/* Energy Metrics */}
      <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20">
        <h4 className="text-sm font-semibold text-primary mb-3">Impact Energy</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 cursor-help">
                      <Info className="h-4 w-4" aria-hidden="true" />
                      <span>Kinetic Energy:</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="font-mono">E = ½ · m · v²</div>
                      <div className="text-muted-foreground">v = velocity_km_s  1000 (m/s)</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="font-mono">{formatScientific(pre.energy_j)} J</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 cursor-help">
                      <Info className="h-4 w-4" aria-hidden="true" />
                      <span>TNT Equivalent:</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="font-mono">Y_mt = E_J / 4.184×10^15</div>
                      <div className="text-muted-foreground">Convert Joules to megatons of TNT</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="font-mono text-warning">{formatNumber(pre.energy_mt, 1)} Mt</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 cursor-help">
                      <Info className="h-4 w-4" aria-hidden="true" />
                      <span>Asteroid Mass:</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="font-mono">m = ρ · (4/3) · π · r³</div>
                      <div className="text-muted-foreground">r = diameter_m / 2</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="font-mono">{formatScientific(pre.mass_kg)} kg</span>
          </div>
        </div>
      </Card>

      {/* Crater Metrics */}
      <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20">
        <h4 className="text-sm font-semibold text-primary mb-3">Crater Formation</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 cursor-help">
                      <Info className="h-4 w-4" aria-hidden="true" />
                      <span>Diameter:</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="font-mono">Df ≈ 0.01 · Y_mt^0.294 · sin(θ)^(1/3)</div>
                      <div className="text-muted-foreground">θ = impact angle, Y_mt in megatons</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="font-mono text-destructive">{formatNumber(pre.crater_diam_km, 2)} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 cursor-help">
                      <Info className="h-4 w-4" aria-hidden="true" />
                      <span>Depth:</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="font-mono">Depth ≈ 0.2 · Diameter</div>
                      <div className="text-muted-foreground">Converted from km to meters</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="font-mono">{formatNumber(pre.crater_depth_m, 0)} m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 cursor-help">
                      <Info className="h-4 w-4" aria-hidden="true" />
                      <span>Seismic Mag:</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="font-mono">M ≈ (2/3) · log10(E_J) − 2.9</div>
                      <div className="text-muted-foreground">E_J in Joules; clamped to a reasonable range</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="font-mono">{formatNumber(pre.seismic_magnitude, 1)}</span>
          </div>
        </div>
      </Card>

      {/* Blast Effects */}
      <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20">
        <h4 className="text-sm font-semibold text-primary mb-3">Blast Effects</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 cursor-help">
                      <Info className="h-4 w-4" aria-hidden="true" />
                      <span>Thermal Radius:</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="font-mono">r ≈ 7.0 · Y_mt^0.4</div>
                      <div className="text-muted-foreground">Second-degree burn threshold model</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="font-mono text-warning">{formatNumber(pre.rings_km.thermal, 1)} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 cursor-help">
                      <Info className="h-4 w-4" aria-hidden="true" />
                      <span>10 PSI Zone:</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="font-mono">r_10psi ≈ 0.8 · Y_mt^0.33</div>
                      <div className="text-muted-foreground">Empirical overpressure scaling</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="font-mono">{formatNumber(pre.rings_km.overpressure_10psi, 1)} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 cursor-help">
                      <Info className="h-4 w-4" aria-hidden="true" />
                      <span>1 PSI Zone:</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="font-mono">r_1psi ≈ 2.2 · Y_mt^0.33</div>
                      <div className="text-muted-foreground">Empirical overpressure scaling</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="font-mono">{formatNumber(pre.rings_km.overpressure_1psi, 1)} km</span>
          </div>
          {pre.rings_km.tsunami && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tsunami Reach:</span>
              <span className="font-mono text-primary">{formatNumber(pre.rings_km.tsunami, 1)} km</span>
            </div>
          )}
        </div>
      </Card>

      {/* Deflection Status
      {pre && (
        <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20 md:col-span-2 xl:col-span-3">
          <h4 className="text-sm font-semibold text-primary mb-3">Deflection Status</h4>
          <div className="flex items-center gap-4">
            {post.would_miss_earth ? (
              <>
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  ✓ Mission Success
                </Badge>
                <span className="text-sm text-foreground">
                  Asteroid successfully deflected! Impact avoided.
                </span>
              </>
            ) : (
              <>
                <Badge variant="destructive">
                  ⚠ Partial Deflection
                </Badge>
                <span className="text-sm text-foreground">
                  Impact location shifted. Additional deflection may be required.
                </span>
              </>
            )}
          </div>
        </Card>
      )} */}
      </div>
    </div>
  );
}
