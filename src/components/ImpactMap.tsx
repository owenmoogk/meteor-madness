import { useState, useEffect, useCallback, useMemo } from 'react';
import { Map, Marker, ZoomControl, Overlay, GeoJsonLoader, GeoJsonFeature, GeoJson } from 'pigeon-maps';
import { maptiler } from 'pigeon-maps/providers';
import { Box, Flex, Text } from '@mantine/core';


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
  onMove?: (center: [number, number], zoom: number) => void;
  syncCenter?: [number, number];
  syncZoom?: number;
}

const populationProvider = (x: number, y: number, z: number) =>
  `https://luminocity3d.org/WorldPopDen/tiles2020/${z}/${x}/${y}.png`;

const apiKey = 'i8Vj4Y3CJzSksr0lAqNJ';
const maptilerProvider = maptiler(apiKey, 'basic-v2');

function createCircleLatLon(centerLat: number, centerLon: number, radiusKm: number, points = 128) {
  const coords: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = radiusKm * Math.cos(angle);
    const dy = radiusKm * Math.sin(angle);
    const newLon = centerLon + dx / (111.32 * Math.cos((centerLat * Math.PI) / 180));
    const newLat = centerLat + dy / 110.574;
    coords.push([newLat, newLon]);
  }
  return coords;
}

function createCircleGeoJson(lat: number, lon: number, radiusKm: number, points = 64) {
  const coords: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = radiusKm * Math.cos(angle);
    const dy = radiusKm * Math.sin(angle);
    const newLon = lon + dx / (111.32 * Math.cos((lat * Math.PI) / 180));
    const newLat = lat + dy / 111.32;
    coords.push([newLon, newLat]); // GeoJSON expects [lon, lat]!
  }
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [coords],
    },
    properties: {},
  };
}

export function ImpactMap({
  impactLat,
  impactLon,
  rings,
  showCrater,
  showThermal,
  showOverpressure,
  showTsunami,
  onMove,
  syncCenter,
  syncZoom,
}: ImpactMapProps) {
  const [center, setCenter] = useState<[number, number]>(syncCenter);
  const [zoom, setZoom] = useState(syncZoom ?? 6);

  const handleBoundsChange = useCallback(
    ({ center: c, zoom: z }: { center: [number, number]; zoom: number }) => {
      setCenter(c);
      setZoom(z);
      onMove?.(c, z);
    },
    [onMove]
  );

  useEffect(() => {
    if (syncCenter) setCenter(syncCenter);
    if (syncZoom) setZoom(syncZoom);
  }, [syncCenter, syncZoom]);

  const ringConfigs = [
    { id: 'crater', radius: rings.crater, color: '#ff0000', show: showCrater, label: 'Crater' },
    { id: 'thermal', radius: rings.thermal, color: '#ff9900', show: showThermal, label: 'Thermal' },
    { id: 'overpressure-10', radius: rings.overpressure_10psi, color: '#AA336A', show: showOverpressure, label: '10 PSI' },
    { id: 'overpressure-5', radius: rings.overpressure_5psi, color: '#99ff00', show: showOverpressure, label: '5 PSI' },
    { id: 'overpressure-3', radius: rings.overpressure_3psi, color: '#00ff99', show: showOverpressure, label: '3 PSI' },
    { id: 'overpressure-1', radius: rings.overpressure_1psi, color: '#00d9ff', show: showOverpressure, label: '1 PSI' },
    { id: 'tsunami', radius: rings.tsunami, color: '#0099ff', show: showTsunami, label: 'Tsunami' },
  ];


  return (
    <Box className="relative w-full h-full">

      <Map
        provider={populationProvider}
        height={400}
        limitBounds='edge'
        center={center}
        zoom={zoom}
        minZoom={2}
        onBoundsChanged={handleBoundsChange}
        dprs={[1, 2]}
        defaultCenter={[impactLat,impactLon]}
      >
        <ZoomControl />
        
        {ringConfigs.map(({ radius, color, show }) => {
          if (!show) return null
          return (
            <GeoJson
              svgAttributes={{
                fill: "#ff000011",
                stroke: color,
                strokeWidth: "2",
              }}
            >
              <GeoJsonFeature feature={createCircleGeoJson(impactLat, impactLon, radius)} />
            </GeoJson>           );
        })}

        {/* Impact markers */}
        <Marker width={30} anchor={[impactLat, impactLon]} color="red" />
      </Map>

      {/* Legend */}
      <Flex
        direction="column"
        gap="xs"
        c={"black"}
        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-md text-xs shadow-md"
      >
        {showCrater && rings.crater && (
          <Flex align="center" gap="xs">
            <Box w={12} h={2} bg="#ff0000" />
            <Text style={{color: ringConfigs.find(x => x.id == "crater").color}}>Crater: {rings.crater.toFixed(1)} km</Text>
          </Flex>
        )}
        {showThermal && rings.thermal && (
          <Flex align="center" gap="xs">
            <Box w={12} h={2} bg="#ff9900" />
            <Text style={{color: ringConfigs.find(x => x.id == "thermal").color}}>Thermal: {rings.thermal.toFixed(1)} km</Text>
          </Flex>
        )}
        {showOverpressure && rings.overpressure_10psi && (
          <Flex align="center" gap="xs">
            <Box w={12} h={2} bg="#ffff00" />
            <Text style={{color: ringConfigs.find(x => x.id == "overpressure-10").color}}>10 PSI: {rings.overpressure_10psi.toFixed(1)} km</Text>
          </Flex>
        )}
        {showOverpressure && rings.overpressure_1psi && (
          <Flex align="center" gap="xs">
            <Box w={12} h={2} bg="#00d9ff" />
            <Text style={{ color: ringConfigs.find(x => x.id == "overpressure-1").color}}>1 PSI: {rings.overpressure_1psi.toFixed(1)} km</Text>
          </Flex>
        )}
        {showTsunami && rings.tsunami && (
          <Flex align="center" gap="xs">
            <Box w={12} h={2} bg="#0099ff" />
            <Text style={{color: ringConfigs.find(x => x.id == "tsunami").color }}>Tsunami: {rings.tsunami.toFixed(1)} km</Text>
          </Flex>
        )}
      </Flex>
    </Box>
  );
}
