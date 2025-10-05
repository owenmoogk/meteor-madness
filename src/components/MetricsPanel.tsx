import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <div className="p-6 bg-gradient-space border-t border-border">
      {title && (
        <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
      )}
      <div className="flex flex-col gap-4">
      {/* Energy Metrics */}
      <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20">
        <h4 className="text-sm font-semibold text-primary mb-3">Impact Energy</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Kinetic Energy:</span>
            <span className="font-mono">{formatScientific(pre.energy_j)} J</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">TNT Equivalent:</span>
            <span className="font-mono text-warning">{formatNumber(pre.energy_mt, 1)} Mt</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Asteroid Mass:</span>
            <span className="font-mono">{formatScientific(pre.mass_kg)} kg</span>
          </div>
        </div>
      </Card>

      {/* Crater Metrics */}
      <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20">
        <h4 className="text-sm font-semibold text-primary mb-3">Crater Formation</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Diameter:</span>
            <span className="font-mono text-destructive">{formatNumber(pre.crater_diam_km, 2)} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Depth:</span>
            <span className="font-mono">{formatNumber(pre.crater_depth_m, 0)} m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Seismic Mag:</span>
            <span className="font-mono">{formatNumber(pre.seismic_magnitude, 1)}</span>
          </div>
        </div>
      </Card>

      {/* Blast Effects */}
      <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20">
        <h4 className="text-sm font-semibold text-primary mb-3">Blast Effects</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Thermal Radius:</span>
            <span className="font-mono text-warning">{formatNumber(pre.rings_km.thermal, 1)} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">10 PSI Zone:</span>
            <span className="font-mono">{formatNumber(pre.rings_km.overpressure_10psi, 1)} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">1 PSI Zone:</span>
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
