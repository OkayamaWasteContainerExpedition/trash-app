import React, { createContext, ReactNode, useContext, useMemo, useRef, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Region extends LatLng {
  latitudeDelta: number;
  longitudeDelta: number;
}

interface MapViewProps {
  children?: ReactNode;
  initialRegion?: Region;
  onRegionChangeComplete?: (region: Region) => void;
  region?: Region;
  rotateEnabled?: boolean;
  scrollEnabled?: boolean;
  showsMyLocationButton?: boolean;
  showsUserLocation?: boolean;
  style?: StyleProp<ViewStyle>;
  pitchEnabled?: boolean;
  zoomEnabled?: boolean;
}

interface MarkerProps {
  children?: ReactNode;
  coordinate: LatLng;
  onPress?: () => void;
}

interface LayoutSize {
  width: number;
  height: number;
}

interface MapProjection {
  layout: LayoutSize;
  region: Region;
  zoom: number;
}

interface VisibleTile {
  key: string;
  left: number;
  top: number;
  uri: string;
}

const TILE_SIZE = 256;
const MAX_MERCATOR_LATITUDE = 85.05112878;
const OSM_TILE_URL = 'https://tile.openstreetmap.org';
const DEFAULT_REGION: Region = {
  latitude: 34.665,
  longitude: 133.918,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const MapRegionContext = createContext<MapProjection | null>(null);

export default function MapView({
  children,
  initialRegion,
  onRegionChangeComplete,
  region,
  scrollEnabled = true,
  style,
}: MapViewProps) {
  const activeRegion = region || initialRegion || DEFAULT_REGION;
  const [layout, setLayout] = useState<LayoutSize>({ width: 0, height: 0 });
  const dragStartRegion = useRef<Region | null>(null);
  const zoom = useMemo(() => regionToZoom(activeRegion), [activeRegion]);
  const tiles = useMemo(
    () => getVisibleTiles(activeRegion, layout, zoom),
    [activeRegion, layout, zoom],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          scrollEnabled && (Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2),
        onStartShouldSetPanResponder: () => false,
        onPanResponderGrant: () => {
          dragStartRegion.current = activeRegion;
        },
        onPanResponderMove: (_, gestureState) => {
          if (!scrollEnabled || !onRegionChangeComplete || !dragStartRegion.current) {
            return;
          }

          const startCenter = latLngToWorld(dragStartRegion.current, zoom);
          const nextCenter = worldToLatLng(
            {
              x: startCenter.x - gestureState.dx,
              y: startCenter.y - gestureState.dy,
            },
            zoom,
          );

          onRegionChangeComplete({
            ...dragStartRegion.current,
            latitude: nextCenter.latitude,
            longitude: nextCenter.longitude,
          });
        },
        onPanResponderRelease: () => {
          dragStartRegion.current = null;
        },
        onPanResponderTerminate: () => {
          dragStartRegion.current = null;
        },
      }),
    [activeRegion, onRegionChangeComplete, scrollEnabled, zoom],
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  return (
    <MapRegionContext.Provider value={{ layout, region: activeRegion, zoom }}>
      <View style={[styles.map, style]} onLayout={handleLayout} {...panResponder.panHandlers}>
        <View style={styles.tileLayer} pointerEvents="none">
          {tiles.map((tile) => (
            <Image
              key={tile.key}
              source={{ uri: tile.uri }}
              style={[styles.tile, { left: tile.left, top: tile.top }]}
            />
          ))}
        </View>
        <View style={styles.mapTint} pointerEvents="none" />
        {children}
        <View style={styles.attribution} pointerEvents="none">
          <Text style={styles.attributionText}>© OpenStreetMap</Text>
        </View>
      </View>
    </MapRegionContext.Provider>
  );
}

export function Marker({ children, coordinate, onPress }: MarkerProps) {
  const projection = useContext(MapRegionContext);
  const markerPosition = getMarkerPosition(coordinate, projection);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.marker, markerPosition]}
      accessibilityRole="button"
    >
      {children || <View style={styles.defaultMarker} />}
    </Pressable>
  );
}

const getMarkerPosition = (coordinate: LatLng, projection: MapProjection | null) => {
  if (!projection || projection.layout.width === 0 || projection.layout.height === 0) {
    return { left: '50%' as const, top: '50%' as const };
  }

  const center = latLngToWorld(projection.region, projection.zoom);
  const point = latLngToWorld(coordinate, projection.zoom);

  return {
    left: projection.layout.width / 2 + point.x - center.x,
    top: projection.layout.height / 2 + point.y - center.y,
  };
};

const getVisibleTiles = (region: Region, layout: LayoutSize, zoom: number): VisibleTile[] => {
  if (layout.width <= 0 || layout.height <= 0) {
    return [];
  }

  const tileCount = 2 ** zoom;
  const center = latLngToWorld(region, zoom);
  const topLeft = {
    x: center.x - layout.width / 2,
    y: center.y - layout.height / 2,
  };
  const firstTileX = Math.floor(topLeft.x / TILE_SIZE) - 1;
  const lastTileX = Math.floor((topLeft.x + layout.width) / TILE_SIZE) + 1;
  const firstTileY = Math.max(0, Math.floor(topLeft.y / TILE_SIZE) - 1);
  const lastTileY = Math.min(tileCount - 1, Math.floor((topLeft.y + layout.height) / TILE_SIZE) + 1);
  const tiles: VisibleTile[] = [];

  for (let x = firstTileX; x <= lastTileX; x += 1) {
    for (let y = firstTileY; y <= lastTileY; y += 1) {
      const wrappedX = wrapTileIndex(x, tileCount);
      tiles.push({
        key: `${zoom}-${x}-${y}`,
        left: x * TILE_SIZE - topLeft.x,
        top: y * TILE_SIZE - topLeft.y,
        uri: `${OSM_TILE_URL}/${zoom}/${wrappedX}/${y}.png`,
      });
    }
  }

  return tiles;
};

const regionToZoom = (region: Region) => {
  const longitudeDelta = Math.max(0.0001, Math.min(360, region.longitudeDelta));
  return clamp(Math.round(Math.log2(360 / longitudeDelta)), 2, 19);
};

const latLngToWorld = (coordinate: LatLng, zoom: number) => {
  const scale = TILE_SIZE * 2 ** zoom;
  const latitude = clamp(coordinate.latitude, -MAX_MERCATOR_LATITUDE, MAX_MERCATOR_LATITUDE);
  const longitude = normalizeLongitude(coordinate.longitude);
  const sinLatitude = Math.sin((latitude * Math.PI) / 180);

  return {
    x: ((longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * scale,
  };
};

const worldToLatLng = (point: { x: number; y: number }, zoom: number): LatLng => {
  const scale = TILE_SIZE * 2 ** zoom;
  const longitude = normalizeLongitude((point.x / scale) * 360 - 180);
  const mercatorY = 0.5 - point.y / scale;
  const latitude = (90 - (360 * Math.atan(Math.exp(-mercatorY * 2 * Math.PI))) / Math.PI);

  return {
    latitude: clamp(latitude, -MAX_MERCATOR_LATITUDE, MAX_MERCATOR_LATITUDE),
    longitude,
  };
};

const normalizeLongitude = (longitude: number) => ((((longitude + 180) % 360) + 360) % 360) - 180;

const wrapTileIndex = (index: number, tileCount: number) => ((index % tileCount) + tileCount) % tileCount;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const styles = StyleSheet.create({
  map: {
    backgroundColor: '#DDEBF0',
    overflow: 'hidden',
    position: 'relative',
  },
  tileLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#DDEBF0',
  },
  tile: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
  },
  mapTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 248, 244, 0.08)',
  },
  marker: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    width: 44,
    transform: [{ translateX: -22 }, { translateY: -22 }],
  },
  defaultMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F58FB2',
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  attribution: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  attributionText: {
    color: '#53606A',
    fontSize: 10,
    fontWeight: '600',
  },
});
