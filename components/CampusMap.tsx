"use client";
import React, { useEffect, useState, memo,useRef } from "react";
import { useMap } from 'react-leaflet';
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Dynamic imports
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });

// Leaflet icon fix
if (typeof window !== "undefined") {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

const locations = [
  { position: [13.031966, 80.181146], name: "Main Entrance", category: "entrance" },
  { position: [13.032050, 80.180606], name: "Side Main Entrance", category: "entrance" },
  { position: [13.031825, 80.179673], name: "Easwari Entrance", category: "entrance" },
  { position: [13.032799, 80.180489], name: "BMS Entrance", category: "entrance" },
  { position: [13.033317, 80.179761], name: "BMS Backside Entrance(Bus Exit)", category: "entrance" },
  { position: [13.03262, 80.18060], name: "Admin Block Side Entrance", category: "entrance" },
  { position: [13.03333, 80.18138], name: "Library", category: "academic" },
  { position: [13.033024, 80.181570], name: "East Block", category: "academic" },
  { position: [13.03247, 80.18074], name: "Admin Block", category: "academic" },
  { position: [13.03374, 80.18129], name: "Block 5", category: "academic" },
  { position: [13.03293, 80.17981], name: "BMS Block", category: "academic" },
  { position: [13.03291, 80.17965], name: "Block 3 ECE", category: "academic" },
  { position: [13.03307, 80.17845], name: "Easwari Block", category: "academic" },
  { position: [13.03346, 80.18043], name: "IIE Center and Fab Lab", category: "academic" },
  { position: [13.03307, 80.17845], name: "Easwari Canteen", category: "food" },
  { position: [13.032876, 80.180000], name: "BMS Canteen", category: "food" },
  { position: [13.033092, 80.181404], name: "Q Cafe", category: "food" },
  { position: [13.03354, 80.18063], name: "Q Mart", category: "food" },
  { position: [13.03197, 80.18003], name: "CUB ATM", category: "facility" },
  { position: [13.032224, 80.179703], name: "Easwari Xerox", category: "facility" },
  { position: [13.03294, 80.18040], name: "BMS Xerox", category: "facility" },
  { position: [13.03264, 80.17871], name: "TRP Auditorium", category: "facility" },
  { position: [13.03376, 80.18109], name: "Boys Hostel", category: "other" },
];

const categories = [
  { id: "all", name: "All Locations" },
  { id: "entrance", name: "Entrances" },
  { id: "academic", name: "Academic Blocks" },
  { id: "food", name: "Food & Dining" },
  { id: "sports", name: "Sports Facilities" },
  { id: "facility", name: "Other Facilities" },
  { id: "other", name: "Other" },
];

const paths = [
  { id: 1, name: "Path 1", coordinates: [[13.031977, 80.181137], [13.032077, 80.181126]]},
  { id: 2, name: "Path 2", coordinates: [[13.032077, 80.181126], [13.032094, 80.181121]]},
  { id: 3, name: "Path 3", coordinates: [[13.032094, 80.181121], [13.033298, 80.181267]]},
  { id: 4, name: "Path 4", coordinates: [[13.033298, 80.181267], [13.033344, 80.181227]]},
  { id: 5, name: "Path 5", coordinates: [[13.033344, 80.181227], [13.03399, 80.18126]]},
  { id: 6, name: "Path 6", coordinates: [[13.033298, 80.181267], [13.033283, 80.181536]]},
  { id: 7, name: "Path 7", coordinates: [[13.033283, 80.181536], [13.032125, 80.181420]]},
  { id: 8, name: "Path 8", coordinates: [[13.032125, 80.181420], [13.032077, 80.181126]]},
  { id: 9, name: "Path 9", coordinates: [[13.032077, 80.181126], [13.032069, 80.180546]]},
  { id: 10, name: "Path 10", coordinates: [[13.032069, 80.180546], [13.032846, 80.180523]]},
  { id: 11, name: "Path 11", coordinates: [[13.032846, 80.180523], [13.03289, 80.18032]]},
  { id: 12, name: "Path 12", coordinates: [[13.03289, 80.18032], [13.03288, 80.17972]]},
  { id: 13, name: "Path 13", coordinates: [[13.03288, 80.17972], [13.033291, 80.179754]]},
  { id: 14, name: "Path 14", coordinates: [[13.03288, 80.17972], [13.032856, 80.179668]]},
  { id: 15, name: "Path 15", coordinates: [[13.032856, 80.179668], [13.032859, 80.178891]]},
  { id: 16, name: "Path 16", coordinates: [[13.032859, 80.178891], [13.032810, 80.178464]]},
  { id: 17, name: "Path 17", coordinates: [[13.032810, 80.178464], [13.032619, 80.178236]]},
  { id: 18, name: "Path 18", coordinates: [[13.032619, 80.178236], [13.032410, 80.178190]]},
  { id: 19, name: "Path 19", coordinates: [[13.032856, 80.179668], [13.032154, 80.179629]]},
  { id: 20, name: "Path 20", coordinates: [[13.032154, 80.179629], [13.031908, 80.179620]]},
  { id: 21, name: "Path 21", coordinates: [[13.031908, 80.179620], [13.031882, 80.179955]]},
  { id: 22, name: "Path 22", coordinates: [[13.032846, 80.180523], [13.033245, 80.180522]]},
  { id: 23, name: "Path 23", coordinates: [[13.033245, 80.180522], [13.033291, 80.179754]]},
  { id: 24, name: "Path 24", coordinates: [[13.032069, 80.180546], [13.031646, 80.180588]]},
  { id: 25, name: "Path 25", coordinates: [[13.031646, 80.180588], [13.031626, 80.180157]]},
  { id: 26, name: "Path 26", coordinates: [[13.031626, 80.180157], [13.031654, 80.179691]]},
  { id: 27, name: "Path 27", coordinates: [[13.031654, 80.179691], [13.031678, 80.179635]]},
  { id: 28, name: "Path 28", coordinates: [[13.031678, 80.179635], [13.031908, 80.179620]]},
  { id: 29, name: "Path 29", coordinates: [[13.033245, 80.180522], [13.033610, 80.180530]]},
  { id: 30, name: "Path 30", coordinates: [[13.033610, 80.180530], [13.03366, 80.17992]]},
];

interface PathNode {
  coordinates: number[];
  connections: Set<string>;
}

interface Graph {
  [key: string]: PathNode;
}

const coordsToKey = (coords: number[]): string => `${coords[0]},${coords[1]}`;

const keyToCoords = (key: string): number[] => key.split(',').map(Number);

const distance = (coord1: number[], coord2: number[]): number => {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
};

const buildGraph = (pathsData: typeof paths): Graph => {
  const graph: Graph = {};

  pathsData.forEach(path => {
    path.coordinates.forEach((coord, index) => {
      const key = coordsToKey(coord);
      
      if (!graph[key]) {
        graph[key] = {
          coordinates: coord,
          connections: new Set()
        };
      }

      // Connect to next coordinate if it exists
      if (index < path.coordinates.length - 1) {
        const nextKey = coordsToKey(path.coordinates[index + 1]);
        graph[key].connections.add(nextKey);
        
        // Add reverse connection
        if (!graph[nextKey]) {
          graph[nextKey] = {
            coordinates: path.coordinates[index + 1],
            connections: new Set()
          };
        }
        graph[nextKey].connections.add(key);
      }
    });
  });

  return graph;
};

const findNearestPathPoint = (coord: number[], graph: Graph): string => {
  let nearestKey = '';
  let minDistance = Infinity;

  Object.entries(graph).forEach(([key, node]) => {
    const dist = distance(coord, node.coordinates);
    if (dist < minDistance) {
      minDistance = dist;
      nearestKey = key;
    }
  });

  return nearestKey;
};

const dijkstra = (
  graph: Graph,
  startKey: string,
  endKey: string
): string[] | null => {
  const distances: { [key: string]: number } = {};
  const previous: { [key: string]: string | null } = {};
  const unvisited = new Set<string>();
  Object.keys(graph).forEach(key => {
    distances[key] = Infinity;
    previous[key] = null;
    unvisited.add(key);
  });
  distances[startKey] = 0;

  while (unvisited.size > 0) {
    // Find node with minimum distance
    let current = '';
    let minDistance = Infinity;
    unvisited.forEach(key => {
      if (distances[key] < minDistance) {
        minDistance = distances[key];
        current = key;
      }
    });

    if (current === '' || current === endKey) break;

    unvisited.delete(current);
    graph[current].connections.forEach(neighborKey => {
      if (unvisited.has(neighborKey)) {
        const dist = distances[current] + distance(
          graph[current].coordinates,
          graph[neighborKey].coordinates
        );
        if (dist < distances[neighborKey]) {
          distances[neighborKey] = dist;
          previous[neighborKey] = current;
        }
      }
    });
  }


  if (previous[endKey] === null) return null;

  const path: string[] = [];
  let current = endKey;
  while (current !== null) {
    path.unshift(current);
    current = previous[current]!;
  }

  return path;
};

const CategoryFilter = memo(({ selectedCategory, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
      Filter Locations
    </label>
    <select
      value={selectedCategory}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 
        text-gray-900 dark:text-gray-100"
    >
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  </div>
));

const Controls = memo(({ 
  fromLocation, 
  toLocation, 
  selectedCategory,
  setFromLocation, 
  setToLocation,
  setSelectedCategory 
}) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:shadow-gray-900/30 mb-4">
    <div className="grid grid-cols-2 gap-4 mb-4">
      <LocationSearch
        type="From"
        value={fromLocation}
        onChange={setFromLocation}
      />
      <LocationSearch
        type="To"
        value={toLocation}
        onChange={setToLocation}
      />
    </div>
    <CategoryFilter
      selectedCategory={selectedCategory}
      onChange={setSelectedCategory}
    />
  </div>
));

const LOCATION_THRESHOLD = 0.0002;
const METERS_BETWEEN_POINTS = 1;
//https://stackoverflow.com/questions/15736995/how-can-i-quickly-estimate-the-distance-between-two-latitude-longitude-points
const haversineDistance = (coord1: number[], coord2: number[]): number => {
  const R = 6371000;
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};


//https://stackoverflow.com/questions/17190981/how-can-i-interpolate-between-2-points-when-drawing-with-canvas
const interpolatePoints = (start: number[], end: number[], meterDistance: number): number[][] => {
  const points: number[][] = [];
  const totalDistance = haversineDistance(start, end);
  const numSegments = Math.floor(totalDistance / meterDistance);
  
  for (let i = 0; i <= numSegments; i++) {
    const fraction = i / numSegments;
    const lat = start[0] + (end[0] - start[0]) * fraction;
    const lng = start[1] + (end[1] - start[1]) * fraction;
    points.push([lat, lng]);
  }
  
  return points;
};

const cutPaths = (paths: { id: number, name: string, coordinates: number[][] }[]): { id: number, name: string, coordinates: number[][] }[] => {
  return paths.map(path => {
    let newCoordinates: number[][] = [];
    for (let i = 0; i < path.coordinates.length - 1; i++) {
      const start = path.coordinates[i];
      const end = path.coordinates[i + 1];
      const interpolated = interpolatePoints(start, end, METERS_BETWEEN_POINTS);
      newCoordinates.push(...interpolated);
    }
    return { id: path.id, name: path.name, coordinates: newCoordinates };
  });
};

const newPaths = cutPaths(paths);
const findPath = (fromCoords: number[], toCoords: number[]): number[][] => {
  const graph = buildGraph(newPaths); // Use newPaths for navigation
  
  const startKey = findNearestPathPoint(fromCoords, graph);
  const endKey = findNearestPathPoint(toCoords, graph);
  
  const pathKeys = dijkstra(graph, startKey, endKey);
  
  if (!pathKeys) return [fromCoords, toCoords];

  const pathPoints = pathKeys.map(key => keyToCoords(key));
  let finalPath: number[][] = [fromCoords]; // Start with from coordinates
  
  for (let i = 0; i < pathPoints.length - 1; i++) {
    const currentPoint = pathPoints[i];
    const nextPoint = pathPoints[i + 1];
    
    // Interpolate points between current and next point
    const interpolated = interpolatePoints(currentPoint, nextPoint, METERS_BETWEEN_POINTS);
    finalPath.push(...interpolated);
    
    // Check if we're close enough to destination
    if (haversineDistance(nextPoint, toCoords) <= LOCATION_THRESHOLD) {
      // Create direct path to destination
      const directPath = interpolatePoints(nextPoint, toCoords, METERS_BETWEEN_POINTS);
      finalPath.push(...directPath);
      return finalPath;
    }
  }
  
  // If we haven't reached destination, add final direct path
  const lastPoint = finalPath[finalPath.length - 1];
  if (haversineDistance(lastPoint, toCoords) > LOCATION_THRESHOLD) {
    const finalSegment = interpolatePoints(lastPoint, toCoords, METERS_BETWEEN_POINTS);
    finalPath.push(...finalSegment);
  }
  
  return finalPath;
};

const PathLayer = ({ path }) => {
  const map = useMap();
  const currentZoom = map.getZoom();
  const isZoomedIn = currentZoom > 16;
  return (
    <>
      <Polyline
        positions={path.coordinates}
        pathOptions={{
          color: "#FFFFFF",
          weight: isZoomedIn ? 4 : 3,
          opacity: 0.6,
          lineCap: "butt",
          lineJoin: "miter"
        }}
        smoothFactor={3}
      />
    </>
  );
};

const MapView = memo(({ filteredLocations, paths, selectedPath }) => {
  const center = [13.032221825277995, 80.17990976572038];
  const southWest = [center[0] - 0.002, center[1] - 0.002];
  const northEast = [center[0] + 0.002, center[1] + 0.002];
  const bounds = [southWest, northEast];

  return (
    <div className="h-[600px] w-full">
      <MapContainer
        center={center}
        zoom={18}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        maxBounds={bounds}
        maxZoom={18}
        minZoom={18}
        boundsOptions={{ padding: [50, 50] }}
      >
        <TileLayer
          url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        />
        {filteredLocations.map((location, index) => (
          <Marker key={index} position={location.position}>
            <Popup>
              <div className="text-center">
                <h3 className="font-medium">{location.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{location.category}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        {paths.map((path) => (
          <PathLayer key={path.id} path={path} />
        ))}
        {selectedPath && (
          <Polyline 
            positions={selectedPath} 
            color="#FF5252" 
            weight={4}
            opacity={0.9}
            smoothFactor={1}
          />
        )}
      </MapContainer>
    </div>
  );
});
const LocationSearch = memo(({ value, onChange, type }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelect = (location) => {
    onChange(location.name, location.position);
    setIsExpanded(false);
  };

  return (
    <div className="relative w-full">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center px-4 py-2 bg-white dark:bg-dark-200 border dark:border-dark-300 rounded-lg"
      >
        <span className="font-medium text-gray-700 dark:text-gray-200">
          {value || type}
        </span>
        <span className="text-gray-400 dark:text-gray-500">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      
      {isExpanded && (
        <div className="mt-2 border dark:border-dark-300 rounded-lg overflow-hidden absolute z-[1000] bg-white dark:bg-dark-200 w-full shadow-lg">          {locations.map(location => (
            <div 
              key={location.name}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
              onClick={() => handleSelect(location)}
            >
              {location.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
// Main Component
const CampusMap = () => {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [fromCoordinates, setFromCoordinates] = useState<number[]|null>(null);
  const [toCoordinates, setToCoordinates] = useState<number[]|null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredLocations, setFilteredLocations] = useState(locations);
  const [selectedPath, setSelectedPath] = useState<number[][]|null>(null);

  const handleFromLocationChange = (name: string, position: number[]) => {
    setFromLocation(name);
    setFromCoordinates(position);
  };

  const handleToLocationChange = (name: string, position: number[]) => {
    setToLocation(name);
    setToCoordinates(position);
  };

  useEffect(() => {
    if (fromCoordinates && toCoordinates) {
      const path = findPath(fromCoordinates, toCoordinates);
      setSelectedPath(path);
    } else {
      setSelectedPath(null);
    }
  }, [fromCoordinates, toCoordinates]);

  useEffect(() => {
    const filtered = selectedCategory === "all"
      ? locations
      : locations.filter(location => location.category === selectedCategory);
    setFilteredLocations(filtered);
  }, [selectedCategory]);
  return (
    <div className="flex flex-col h-full">
      <Controls
        fromLocation={fromLocation}
        toLocation={toLocation}
        selectedCategory={selectedCategory}
        setFromLocation={handleFromLocationChange}
        setToLocation={handleToLocationChange}
        setSelectedCategory={setSelectedCategory}
      />
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
        <MapView 
          filteredLocations={filteredLocations}
          paths={paths}
          selectedPath={selectedPath}
        />
      </div>
    </div>
  );
};

export default CampusMap;