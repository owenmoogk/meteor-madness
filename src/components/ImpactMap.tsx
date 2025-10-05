import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Props for the ImpactMap component
interface ImpactMapProps {
  impactLat: number; // Latitude of the impact point
  impactLon: number; // Longitude of the impact point
  rings: {
    crater?: number; // Crater radius in km
    thermal?: number; // Thermal effect radius in km
    overpressure_1psi?: number; // 1 PSI overpressure radius in km
    overpressure_3psi?: number; // 3 PSI overpressure radius in km
    overpressure_5psi?: number; // 5 PSI overpressure radius in km
    overpressure_10psi?: number; // 10 PSI overpressure radius in km
    tsunami?: number; // Tsunami effect radius in km
  };
  showCrater: boolean; // Whether to show the crater ring
  showThermal: boolean; // Whether to show the thermal ring
  showOverpressure: boolean; // Whether to show overpressure rings
  showTsunami: boolean; // Whether to show the tsunami ring
  postImpactLat?: number; // Latitude of post-deflection impact (if any)
  postImpactLon?: number; // Longitude of post-deflection impact (if any)
}

// Main ImpactMap component
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
  // Ref for the map container div
  const mapContainer = useRef<HTMLDivElement>(null);
  // Ref for the maplibre map instance
  const map = useRef<maplibregl.Map | null>(null);

  // Initialize the map only once
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return; // Prevent re-initialization

    // Create the maplibre map instance
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

    // Add navigation controls to the map
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Cleanup: remove the map instance on unmount
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map center and rings when impact location or rings change
  useEffect(() => {
    if (!map.current) return;

    const currentMap = map.current;

    // Helper function to update map layers and features
    function updateMapLayers() {
      if (!currentMap) return;

      // Fly to the new impact location with a zoom based on ring size
      currentMap.flyTo({
        center: [impactLon, impactLat],
        zoom: Math.max(6, 12 - Math.log2((rings.thermal || 10) / 10)),
        duration: 1000,
      });

      // Remove any existing ring and marker layers/sources
      [
        'crater',
        'thermal',
        'overpressure-1',
        'overpressure-3',
        'overpressure-5',
        'overpressure-10',
        'tsunami',
        'impact-point',
        'post-impact-point',
      ].forEach((id) => {
        if (currentMap.getLayer(id)) currentMap.removeLayer(id);
        if (currentMap.getSource(id)) currentMap.removeSource(id);
      });

      // Helper to create a GeoJSON circle (as a LineString) for a given center and radius (in km)
      const createCircle = (center: [number, number], radiusKm: number) => {
        const points = 64;
        const coords: [number, number][] = [];
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * 2 * Math.PI;
          const dx = radiusKm * Math.cos(angle);
          const dy = radiusKm * Math.sin(angle);
          // Approximate conversion: 1 degree ≈ 111 km at equator
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

      // Configuration for each ring to be displayed
      const ringConfigs = [
        { id: 'crater', radius: rings.crater, color: '#ff0000', show: showCrater, label: 'Crater' },
        { id: 'thermal', radius: rings.thermal, color: '#ff9900', show: showThermal, label: 'Thermal' },
        { id: 'overpressure-10', radius: rings.overpressure_10psi, color: '#ffff00', show: showOverpressure, label: '10 PSI' },
        { id: 'overpressure-5', radius: rings.overpressure_5psi, color: '#99ff00', show: showOverpressure, label: '5 PSI' },
        { id: 'overpressure-3', radius: rings.overpressure_3psi, color: '#00ff99', show: showOverpressure, label: '3 PSI' },
        { id: 'overpressure-1', radius: rings.overpressure_1psi, color: '#00d9ff', show: showOverpressure, label: '1 PSI' },
        { id: 'tsunami', radius: rings.tsunami, color: '#0099ff', show: showTsunami, label: 'Tsunami' },
      ];

      // Add each ring as a line layer if enabled and has a positive radius
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

      // Add the main impact point marker (pre-deflection)
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

      // If post-deflection impact exists, add a marker for it
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

    // If the map is not loaded yet, wait for the 'load' event before updating layers
    if (!currentMap.loaded()) {
      currentMap.on('load', updateMapLayers);
    } else {
      updateMapLayers();
    }
  }, [
    impactLat,
    impactLon,
    rings,
    showCrater,
    showThermal,
    showOverpressure,
    showTsunami,
    postImpactLat,
    postImpactLon,
  ]);

  // Render the map container and the legend overlay
  return (
    <div className="w-full h-full relative">
      {/* Map container for maplibre-gl */}
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      {/* Overlay legend for ring colors and radii */}
      <div className="absolute top-4 right-4 text-xs text-foreground space-y-1 pointer-events-none z-10">
        <div className="bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded shadow-elevated">
          <div className="text-primary font-medium">Impact Zone Map</div>
        </div>
        <div className="bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded shadow-elevated space-y-0.5">
          {/* Crater ring legend */}
          {showCrater && rings.crater && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#ff0000]"></div>
              <span>Crater: {rings.crater.toFixed(1)} km</span>
            </div>
          )}
          {/* Thermal ring legend */}
          {showThermal && rings.thermal && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#ff9900]"></div>
              <span>Thermal: {rings.thermal.toFixed(1)} km</span>
            </div>
          )}
          {/* 10 PSI overpressure ring legend */}
          {showOverpressure && rings.overpressure_10psi && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#ffff00]"></div>
              <span>10 PSI: {rings.overpressure_10psi.toFixed(1)} km</span>
            </div>
          )}
          {/* 1 PSI overpressure ring legend */}
          {showOverpressure && rings.overpressure_1psi && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#00d9ff]"></div>
              <span>1 PSI: {rings.overpressure_1psi.toFixed(1)} km</span>
            </div>
          )}
          {/* Tsunami ring legend */}
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
