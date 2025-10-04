import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface ImpactMapProps {
  impactLat: number;
  impactLon: number;
  rings: {
    crater?: number;
    thermal?: number;
    overpressure_1psi?: number;
    overpressure_3psi?: number;
    overpressure_5psi?: number;
    overpressure_10psi?: number;
    tsunami?: number;
  };
  showCrater: boolean;
  showThermal: boolean;
  showOverpressure: boolean;
  showTsunami: boolean;
  postImpactLat?: number;
  postImpactLon?: number;
}

export function ImpactMap({
  impactLat,
  impactLon,
  rings,
  showCrater,
  showThermal,
  showOverpressure,
  showTsunami,
  postImpactLat,
  postImpactLon,
}: ImpactMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return; // Initialize map only once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: [impactLon, impactLat],
      zoom: 8,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map center and rings when impact location or rings change
  useEffect(() => {
    if (!map.current) return;

    const currentMap = map.current;

    // Wait for map to load
    if (!currentMap.loaded()) {
      currentMap.on('load', updateMapLayers);
    } else {
      updateMapLayers();
    }

    function updateMapLayers() {
      if (!currentMap) return;

      // Fly to impact location
      currentMap.flyTo({
        center: [impactLon, impactLat],
        zoom: Math.max(6, 12 - Math.log2((rings.thermal || 10) / 10)),
        duration: 1000,
      });

      // Remove existing ring layers
      ['crater', 'thermal', 'overpressure-1', 'overpressure-3', 'overpressure-5', 'overpressure-10', 'tsunami', 'impact-point', 'post-impact-point'].forEach(
        (id) => {
          if (currentMap.getLayer(id)) currentMap.removeLayer(id);
          if (currentMap.getSource(id)) currentMap.removeSource(id);
        }
      );

      // Helper to create circle GeoJSON
      const createCircle = (center: [number, number], radiusKm: number) => {
        const points = 64;
        const coords: [number, number][] = [];
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * 2 * Math.PI;
          const dx = radiusKm * Math.cos(angle);
          const dy = radiusKm * Math.sin(angle);
          // Approximate conversion (1 degree ≈ 111 km at equator)
          const lon = center[0] + dx / (111 * Math.cos((center[1] * Math.PI) / 180));
          const lat = center[1] + dy / 111;
          coords.push([lon, lat]);
        }
        return {
          type: 'Feature' as const,
          geometry: {
            type: 'LineString' as const,
            coordinates: coords,
          },
          properties: {},
        };
      };

      // Add rings
      const ringConfigs = [
        { id: 'crater', radius: rings.crater, color: '#ff0000', show: showCrater, label: 'Crater' },
        { id: 'thermal', radius: rings.thermal, color: '#ff9900', show: showThermal, label: 'Thermal' },
        { id: 'overpressure-10', radius: rings.overpressure_10psi, color: '#ffff00', show: showOverpressure, label: '10 PSI' },
        { id: 'overpressure-5', radius: rings.overpressure_5psi, color: '#99ff00', show: showOverpressure, label: '5 PSI' },
        { id: 'overpressure-3', radius: rings.overpressure_3psi, color: '#00ff99', show: showOverpressure, label: '3 PSI' },
        { id: 'overpressure-1', radius: rings.overpressure_1psi, color: '#00d9ff', show: showOverpressure, label: '1 PSI' },
        { id: 'tsunami', radius: rings.tsunami, color: '#0099ff', show: showTsunami, label: 'Tsunami' },
      ];

      ringConfigs.forEach(({ id, radius, color, show, label }) => {
        if (show && radius && radius > 0) {
          const circle = createCircle([impactLon, impactLat], radius);
          
          currentMap.addSource(id, {
            type: 'geojson',
            data: circle,
          });

          currentMap.addLayer({
            id,
            type: 'line',
            source: id,
            paint: {
              'line-color': color,
              'line-width': 2,
              'line-opacity': 0.8,
            },
          });
        }
      });

      // Add impact point marker (pre-deflection)
      currentMap.addSource('impact-point', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [impactLon, impactLat],
          },
          properties: {},
        },
      });

      currentMap.addLayer({
        id: 'impact-point',
        type: 'circle',
        source: 'impact-point',
        paint: {
          'circle-radius': 8,
          'circle-color': '#ff0000',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Add post-deflection impact point if exists
      if (postImpactLat !== undefined && postImpactLon !== undefined) {
        currentMap.addSource('post-impact-point', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [postImpactLon, postImpactLat],
            },
            properties: {},
          },
        });

        currentMap.addLayer({
          id: 'post-impact-point',
          type: 'circle',
          source: 'post-impact-point',
          paint: {
            'circle-radius': 8,
            'circle-color': '#00d9ff',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });
      }
    }
  }, [impactLat, impactLon, rings, showCrater, showThermal, showOverpressure, showTsunami, postImpactLat, postImpactLon]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      <div className="absolute top-4 right-4 text-xs text-foreground space-y-1 pointer-events-none z-10">
        <div className="bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded shadow-elevated">
          <div className="text-primary font-medium">Impact Zone Map</div>
        </div>
        <div className="bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded shadow-elevated space-y-0.5">
          {showCrater && rings.crater && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#ff0000]"></div>
              <span>Crater: {rings.crater.toFixed(1)} km</span>
            </div>
          )}
          {showThermal && rings.thermal && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#ff9900]"></div>
              <span>Thermal: {rings.thermal.toFixed(1)} km</span>
            </div>
          )}
          {showOverpressure && rings.overpressure_10psi && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#ffff00]"></div>
              <span>10 PSI: {rings.overpressure_10psi.toFixed(1)} km</span>
            </div>
          )}
          {showOverpressure && rings.overpressure_1psi && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#00d9ff]"></div>
              <span>1 PSI: {rings.overpressure_1psi.toFixed(1)} km</span>
            </div>
          )}
          {showTsunami && rings.tsunami && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#0099ff]"></div>
              <span>Tsunami: {rings.tsunami.toFixed(1)} km</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
