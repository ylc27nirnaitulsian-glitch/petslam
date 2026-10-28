import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Compass,
  MapPin,
  X,
  RotateCcw,
  Sparkles,
  Zap,
  Navigation,
  Crosshair,
  ChevronRight,
  Shield,
  Heart,
  LocateFixed,
  Layers,
  Info,
  Key,
  Check,
} from 'lucide-react';
import { WildPetEncounter, CompanionPet } from '../../../types/pet';
import { ANIMALS_DATA, Animal } from '../../../data/animals';
import { usePetCompanion } from '../../../context/PetCompanionContext';
import { sound } from '../../../utils/audio';
import { getPetPhoto } from '../../../utils/petVisuals';
import { WildPetCatchModal } from './WildPetCatchModal';

interface PetWorldMapViewProps {
  onClose: () => void;
}

interface GeoPetMarker extends WildPetEncounter {
  lat: number;
  lng: number;
  liveDistanceMeters: number;
  animalRef: Animal;
}

// Haversine formula to compute distance in meters between two lat/lng points
function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const PetWorldMapView: React.FC<PetWorldMapViewProps> = ({ onClose }) => {
  const { addKennelPet } = usePetCompanion();

  // Map DOM element reference
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const playerMarkerRef = useRef<L.Marker | null>(null);
  const playerCircleRef = useRef<L.Circle | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // User GPS coordinates (default: vibrant city center if permission prompt is pending)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 37.7749,
    lng: -122.4194,
  });
  const [gpsStatus, setGpsStatus] = useState<'locating' | 'live_gps' | 'simulated'>('locating');
  const [accuracyMeters, setAccuracyMeters] = useState<number>(30);
  const [mapTheme, setMapTheme] = useState<
    'dark' | 'google_roadmap' | 'google_hybrid' | 'voyager' | 'osm'
  >('dark');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Maps API Key (Google Maps Platform or Mapbox)
  const [mapsApiKey, setMapsApiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return (
        (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
        localStorage.getItem('petslam_maps_api_key') ||
        ''
      );
    }
    return '';
  });
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>('');

  const getTileConfig = (theme: typeof mapTheme, apiKey: string) => {
    if (theme === 'google_roadmap') {
      const url = apiKey
        ? `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${apiKey}`
        : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      return { url, subdomains: '0123', maxZoom: 20 };
    }
    if (theme === 'google_hybrid') {
      const url = apiKey
        ? `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${apiKey}`
        : 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      return { url, subdomains: '0123', maxZoom: 20 };
    }
    if (theme === 'voyager') {
      return {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        subdomains: 'abcd',
        maxZoom: 19,
      };
    }
    if (theme === 'osm') {
      return {
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        subdomains: 'abc',
        maxZoom: 19,
      };
    }
    return {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      subdomains: 'abcd',
      maxZoom: 19,
    };
  };

  // Active pet spawns around user
  const [geoPetSpawns, setGeoPetSpawns] = useState<GeoPetMarker[]>([]);
  const [selectedPin, setSelectedPin] = useState<GeoPetMarker | null>(null);
  const [activeCatchEncounter, setActiveCatchEncounter] = useState<WildPetEncounter | null>(null);

  // Purebred candidate animals for radar spawns
  const purebredCatalog = ANIMALS_DATA.filter(
    (a) => a.category === 'Canines' || a.category === 'Felines'
  );

  // Helper to generate geo spawns centered around given coordinates
  const generateSpawnsAround = (centerLat: number, centerLng: number): GeoPetMarker[] => {
    // 6 to 8 realistic spawns at distances between 35m and 320m
    const spawnAngles = [25, 75, 135, 195, 250, 310, 345];
    const distances = [45, 80, 115, 160, 210, 270, 320];

    const metersPerLat = 111000;
    const metersPerLng = 111000 * Math.cos((centerLat * Math.PI) / 180);

    return spawnAngles.map((angleDeg, idx) => {
      const dist = distances[idx % distances.length];
      const rad = (angleDeg * Math.PI) / 180;

      const offsetLat = (dist * Math.cos(rad)) / metersPerLat;
      const offsetLng = (dist * Math.sin(rad)) / metersPerLng;

      const petLat = centerLat + offsetLat;
      const petLng = centerLng + offsetLng;

      const animal = purebredCatalog[idx % purebredCatalog.length] || purebredCatalog[0];
      const isCat = animal.category === 'Felines';
      const rarityRoll = Math.random();
      const rarity: WildPetEncounter['rarity'] =
        rarityRoll > 0.85 ? 'legendary' : rarityRoll > 0.6 ? 'epic' : rarityRoll > 0.3 ? 'rare' : 'common';

      const baseCp = Math.round(animal.damage * 4.5 + animal.health * 0.35);

      return {
        id: `radar_spawn_${Date.now()}_${idx}`,
        lat: petLat,
        lng: petLng,
        liveDistanceMeters: dist,
        animalRef: animal,
        species: animal.breed.toLowerCase().replace(/\s+/g, '') as any,
        category: isCat ? 'cat' : 'dog',
        name: animal.name,
        title: `Wild ${animal.breed}`,
        cp: baseCp + Math.floor(Math.random() * 80) - 30,
        level: Math.floor(Math.random() * 15) + 5,
        rarity,
        baseCatchRate: rarity === 'legendary' ? 0.35 : rarity === 'epic' ? 0.5 : rarity === 'rare' ? 0.65 : 0.8,
        distanceMeters: dist,
        spawnTimeRemaining: 900,
        stats: {
          attack: animal.damage,
          defense: 60,
          agility: 75,
          stamina: 85,
          cp: baseCp,
          hunger: 80,
          energy: 90,
          happiness: 85,
          hygiene: 80,
        },
      };
    });
  };

  // 1. Initialize Real GPS Geolocation
  useEffect(() => {
    let watchId: number | null = null;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy || 25);
          setUserLocation({ lat, lng });
          setAccuracyMeters(acc);
          setGpsStatus('live_gps');

          // Generate nearby purebred spawns
          const spawns = generateSpawnsAround(lat, lng);
          setGeoPetSpawns(spawns);

          // Pan Leaflet map if already initialized
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 16);
          }
        },
        (err) => {
          console.warn('Geolocation warning, using simulated location:', err.message);
          setGpsStatus('simulated');
          const spawns = generateSpawnsAround(37.7749, -122.4194);
          setGeoPetSpawns(spawns);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      // Continuous watch
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          setAccuracyMeters(Math.round(pos.coords.accuracy || 25));
          setGpsStatus('live_gps');

          // Update live distances
          setGeoPetSpawns((prev) =>
            prev.map((p) => ({
              ...p,
              liveDistanceMeters: calculateDistanceMeters(lat, lng, p.lat, p.lng),
            }))
          );
        },
        null,
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    } else {
      setGpsStatus('simulated');
      setGeoPetSpawns(generateSpawnsAround(37.7749, -122.4194));
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = userLocation.lat;
    const initialLng = userLocation.lng;

    // Create Leaflet instance
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    // Add zoom controls at top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial Tile Layer
    const tileConfig = getTileConfig(mapTheme, mapsApiKey);
    const tileLayer = L.tileLayer(tileConfig.url, {
      maxZoom: tileConfig.maxZoom,
      subdomains: tileConfig.subdomains,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Marker layers group
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Tap map to walk / simulate movement
    map.on('click', (e: L.LeafletMouseEvent) => {
      sound.playClick();
      const newLat = e.latlng.lat;
      const newLng = e.latlng.lng;
      setUserLocation({ lat: newLat, lng: newLng });

      // Recalculate distances to all spawns
      setGeoPetSpawns((prev) =>
        prev.map((p) => ({
          ...p,
          liveDistanceMeters: calculateDistanceMeters(newLat, newLng, p.lat, p.lng),
        }))
      );
    });

    mapInstanceRef.current = map;

    // Trigger invalidateSize to prevent grey tiles inside modal containers
    const invalidateTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(invalidateTimer);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Switch Tile Layer when theme or API key changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const tileConfig = getTileConfig(mapTheme, mapsApiKey);
    const newLayer = L.tileLayer(tileConfig.url, {
      maxZoom: tileConfig.maxZoom,
      subdomains: tileConfig.subdomains,
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [mapTheme, mapsApiKey]);

  // 4. Render & Update Player & Pet Markers on Leaflet Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    // A. Player Marker (Trainer with green pulsing radar ripple)
    const playerIcon = L.divIcon({
      className: 'custom-player-marker',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div class="absolute w-16 h-16 rounded-full border-2 border-[#CCFF00]/50 animate-ping opacity-60"></div>
          <div class="absolute w-24 h-24 rounded-full border border-emerald-400/25 animate-pulse"></div>
          <div class="w-8 h-8 rounded-full bg-[#CCFF00] border-2 border-white shadow-[0_0_15px_rgba(204,255,0,0.9)] flex items-center justify-center">
            <svg class="w-4 h-4 text-black transform rotate-45" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            </svg>
          </div>
          <div class="absolute -bottom-5 bg-black/85 text-[9px] font-mono font-black text-[#CCFF00] px-1.5 py-0.2 rounded border border-white/20 whitespace-nowrap shadow-md">
            YOU (Trainer)
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    const pMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: playerIcon,
      zIndexOffset: 1000,
    }).addTo(markersLayer);
    playerMarkerRef.current = pMarker;

    // Player GPS Accuracy Radius Circle
    const pCircle = L.circle([userLocation.lat, userLocation.lng], {
      radius: Math.max(25, accuracyMeters),
      color: '#CCFF00',
      weight: 1,
      fillColor: '#10B981',
      fillOpacity: 0.12,
    }).addTo(markersLayer);
    playerCircleRef.current = pCircle;

    // B. Wild Pet Markers
    geoPetSpawns.forEach((pet) => {
      const isSelected = selectedPin?.id === pet.id;
      const petPhoto = getPetPhoto(pet.animalRef);
      const isCat = pet.category === 'cat';

      const petIcon = L.divIcon({
        className: 'custom-pet-marker',
        html: `
          <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-115">
            <!-- Pulsing Ring for Selected Pet -->
            ${
              isSelected
                ? `<div class="absolute -inset-2 rounded-full border-2 border-[#CCFF00] animate-ping opacity-75"></div>`
                : ''
            }
            
            <!-- Pet Photo Avatar Frame -->
            <div class="w-10 h-10 rounded-2xl overflow-hidden border-2 ${
              isSelected
                ? 'border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.9)] scale-110 ring-2 ring-white'
                : isCat
                ? 'border-purple-400 bg-purple-950/90 shadow-lg'
                : 'border-amber-400 bg-amber-950/90 shadow-lg'
            } bg-black transition-all">
              <img src="${petPhoto}" alt="${pet.name}" class="w-full h-full object-cover" />
            </div>

            <!-- Mini Species Icon Badge -->
            <div class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-black border border-white/30 flex items-center justify-center text-[9px] shadow">
              ${isCat ? '🐱' : '🐶'}
            </div>

            <!-- Distance Tag -->
            <div class="mt-1 px-1.5 py-0.2 rounded text-[8px] font-mono font-bold whitespace-nowrap shadow-md border ${
              isSelected
                ? 'bg-black text-[#CCFF00] border-[#CCFF00]'
                : 'bg-black/85 text-white border-white/15'
            }">
              ${pet.liveDistanceMeters}m · CP ${pet.cp}
            </div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const petMarker = L.marker([pet.lat, pet.lng], { icon: petIcon }).addTo(markersLayer);

      petMarker.on('click', () => {
        sound.playClick();
        setSelectedPin(pet);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([pet.lat, pet.lng], 17, { duration: 0.6 });
        }
      });
    });
  }, [userLocation, geoPetSpawns, selectedPin, accuracyMeters]);

  // Handle Scan Area
  const handleScanArea = () => {
    sound.playMatchSearch();
    setIsScanning(true);
    setTimeout(() => {
      const freshSpawns = generateSpawnsAround(userLocation.lat, userLocation.lng);
      setGeoPetSpawns(freshSpawns);
      setIsScanning(false);
      sound.playLevelUp();
    }, 700);
  };

  // Center to user GPS
  const handleRecenter = () => {
    sound.playClick();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 0.8 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full h-full sm:h-[700px] max-w-lg bg-[#090D16] border-0 sm:border border-white/20 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        {/* TOP BAR */}
        <div className="p-2.5 sm:p-3 border-b border-white/10 bg-[#101726] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow shrink-0">
              <Compass className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-white truncate">
                  Pet Radar
                </h3>
                <span
                  className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full uppercase border shrink-0 ${
                    gpsStatus === 'live_gps'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {gpsStatus === 'live_gps' ? '🛰️ Live GPS' : '🏙️ Tap-To-Walk'}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono truncate">
                {geoPetSpawns.length} Wild Purebreds Detected Nearby · Tap Map to Walk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Configure Maps API Key (Google Maps / Mapbox) */}
            <button
              onClick={() => {
                sound.playClick();
                setTempApiKey(mapsApiKey);
                setShowKeyModal(true);
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white cursor-pointer transition-colors relative"
              title="Configure Maps API Key (Google Maps)"
            >
              <Key className="w-3.5 h-3.5 text-[#CCFF00]" />
              {mapsApiKey && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#CCFF00] shadow-[0_0_6px_#CCFF00]" />
              )}
            </button>

            {/* Tile Layer Selector */}
            <button
              onClick={() => {
                sound.playClick();
                setMapTheme((prev) =>
                  prev === 'dark'
                    ? 'google_roadmap'
                    : prev === 'google_roadmap'
                    ? 'google_hybrid'
                    : prev === 'google_hybrid'
                    ? 'voyager'
                    : prev === 'voyager'
                    ? 'osm'
                    : 'dark'
                );
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white cursor-pointer transition-colors"
              title="Toggle Map Style (Dark / Google Maps / Satellite / Voyager / OSM)"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            {/* Recenter to User */}
            <button
              onClick={handleRecenter}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white cursor-pointer transition-colors"
              title="Center to Trainer"
            >
              <LocateFixed className="w-3.5 h-3.5 text-[#CCFF00]" />
            </button>

            {/* Scan Radar */}
            <button
              onClick={handleScanArea}
              disabled={isScanning}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white cursor-pointer transition-colors"
              title="Re-Scan Nearby Animals"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-[#CCFF00]' : ''}`} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white cursor-pointer transition-colors"
              title="Close Pet Radar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* REAL-TIME LEAFLET MAP CONTAINER */}
        <div className="flex-1 relative overflow-hidden bg-black min-h-0">
          <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-10" />

          {/* Floating Radar Sonar Scanner Overlay */}
          {isScanning && (
            <div className="absolute inset-0 z-30 pointer-events-none bg-emerald-500/10 flex items-center justify-center animate-pulse">
              <div className="w-48 h-48 rounded-full border-4 border-emerald-400/40 animate-ping" />
            </div>
          )}

          {/* Map Controls Floating Badge */}
          <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 text-[9px] font-mono text-neutral-300 flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
            <span>
              {mapTheme.startsWith('google')
                ? 'GOOGLE MAPS'
                : mapTheme === 'osm'
                ? 'OPENSTREETMAP'
                : mapTheme === 'voyager'
                ? 'CARTO VOYAGER'
                : 'CARTO DARK'}
            </span>
            <span className="text-neutral-500">|</span>
            <span className="text-[#CCFF00] font-bold uppercase">
              {mapTheme === 'google_roadmap'
                ? 'Roadmap'
                : mapTheme === 'google_hybrid'
                ? 'Satellite'
                : mapTheme}
            </span>
          </div>
        </div>

        {/* BOTTOM DRAWER: SELECTED PET DETAILS & CATCH TRIGGER */}
        <div className="p-3 bg-[#101624] border-t border-white/10 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {selectedPin ? (
            <div className="bg-[#141C2E] border border-white/15 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between shadow-lg animate-in fade-in gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-black border-2 border-[#CCFF00] overflow-hidden shrink-0 shadow">
                  <img
                    src={getPetPhoto(selectedPin.animalRef)}
                    alt={selectedPin.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-display font-black text-sm text-white uppercase truncate">
                      {selectedPin.name}
                    </span>
                    <span className="text-[9px] bg-[#CCFF00]/20 text-[#CCFF00] font-mono font-bold px-1.5 rounded shrink-0">
                      CP {selectedPin.cp}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-300 truncate">
                    {selectedPin.animalRef.breed} · {selectedPin.liveDistanceMeters}m away
                  </div>
                  <div className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                    <span>{selectedPin.category === 'cat' ? '🐱 Feline' : '🐶 Canine'}</span>
                    <span>·</span>
                    <span className="uppercase text-amber-300">{selectedPin.rarity}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playBattleStart();
                  setActiveCatchEncounter(selectedPin);
                }}
                className="py-2.5 px-3.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all shrink-0"
              >
                <span>Encounter & Catch</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-2.5 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-2 truncate">
                <Crosshair className="w-4 h-4 text-[#CCFF00] animate-pulse shrink-0" />
                <span className="truncate">Tap any wild Dog or Cat pin on the map to target & catch</span>
              </div>
              <button
                onClick={handleScanArea}
                className="text-[11px] font-bold text-[#CCFF00] hover:underline cursor-pointer shrink-0 ml-2"
              >
                Scan Area
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Wild Catch Encounter Throw Modal */}
      {activeCatchEncounter && (
        <WildPetCatchModal
          encounter={activeCatchEncounter}
          onClose={() => setActiveCatchEncounter(null)}
          onCaught={(newPet) => {
            addKennelPet(newPet);
            setActiveCatchEncounter(null);
            setSelectedPin(null);
            sound.playVictory();
            // Remove caught pet from radar
            setGeoPetSpawns((prev) => prev.filter((p) => p.id !== activeCatchEncounter.id));
          }}
        />
      )}

      {/* Google Maps / Mapbox Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0E1320] border-2 border-[#CCFF00]/40 rounded-3xl p-5 shadow-2xl text-white space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#CCFF00]" />
                <h4 className="font-display font-black text-base uppercase tracking-wider text-white">Maps API Key</h4>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-xl hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-300 font-mono leading-relaxed">
              Connect your Google Maps Platform API key or Mapbox Access Token to unlock high-definition satellite and roadmap views in Pet Radar.
            </p>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#CCFF00] font-bold">API Key or Token</label>
              <input
                type="text"
                placeholder="AIzaSy... or pk.eyJ1..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/70 border border-white/20 font-mono text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#CCFF00]"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  sound.playVictory();
                  const trimmed = tempApiKey.trim();
                  setMapsApiKey(trimmed);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('petslam_maps_api_key', trimmed);
                  }
                  if (trimmed) {
                    setMapTheme('google_roadmap');
                  }
                  setShowKeyModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#CCFF00] text-black font-display font-black text-xs uppercase tracking-wider cursor-pointer hover:bg-[#b8e600] active:scale-95 transition-all shadow-md"
              >
                Save & Apply Map
              </button>
              {mapsApiKey && (
                <button
                  onClick={() => {
                    sound.playClick();
                    setMapsApiKey('');
                    setTempApiKey('');
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('petslam_maps_api_key');
                    }
                    setMapTheme('dark');
                    setShowKeyModal(false);
                  }}
                  className="px-3 py-2.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-mono cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
