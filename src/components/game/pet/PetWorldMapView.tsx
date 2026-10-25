import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { WildPetEncounter, CompanionPet } from '../../../types/pet';
import { usePetCompanion } from '../../../context/PetCompanionContext';
import { sound } from '../../../utils/audio';
import { WildPetCatchModal } from './WildPetCatchModal';

interface PetWorldMapViewProps {
  onClose: () => void;
}

export const PetWorldMapView: React.FC<PetWorldMapViewProps> = ({ onClose }) => {
  const { wildEncounters, refreshWildSpawns, addKennelPet } = usePetCompanion();

  // Selected encounter for detail card or catch
  const [selectedPin, setSelectedPin] = useState<WildPetEncounter | null>(null);
  const [activeCatchEncounter, setActiveCatchEncounter] = useState<WildPetEncounter | null>(null);

  // Trainer coordinates on the virtual map (centered at 50%, 50%)
  const [trainerPos, setTrainerPos] = useState({ x: 50, y: 50 });
  const [isScanning, setIsScanning] = useState(false);

  // Map pin relative offsets (deterministic from id)
  const getPinPosition = (enc: WildPetEncounter, idx: number) => {
    const angles = [35, 120, 210, 310, 80, 260];
    const angle = ((angles[idx % angles.length] || idx * 60) * Math.PI) / 180;
    const distanceNorm = Math.min(38, 15 + (enc.distanceMeters / 250) * 22);

    return {
      x: 50 + Math.cos(angle) * distanceNorm,
      y: 50 + Math.sin(angle) * distanceNorm,
    };
  };

  const handleScan = () => {
    sound.playClick();
    setIsScanning(true);
    setTimeout(() => {
      refreshWildSpawns();
      setIsScanning(false);
      sound.playLevelUp();
    }, 600);
  };

  const handleMapTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.max(15, Math.min(85, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(15, Math.min(85, ((e.clientY - rect.top) / rect.height) * 100));

    sound.playCardPlay();
    setTrainerPos({ x: xPct, y: yPct });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-md bg-[#090D16] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[680px] max-h-[94vh] text-white">
        {/* TOP BAR */}
        <div className="p-3.5 border-b border-white/10 bg-[#101726] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow">
              <Compass className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
                Pokémon GO Beast Radar
              </h3>
              <p className="text-[10px] text-neutral-400 font-mono">
                Real-Time GPS Map · {wildEncounters.length} Wild Dogs & Cats Detected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white cursor-pointer transition-colors"
              title="Rescan Area"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-[#CCFF00]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MAP CANVAS STAGE */}
        <div
          onClick={handleMapTap}
          className="flex-1 relative overflow-hidden bg-[#070B12] cursor-crosshair"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(20,30,50,0.8) 0%, rgba(5,8,15,0.95) 100%),
              linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 36px 36px, 36px 36px',
          }}
        >
          {/* Stylized Park Zone 1 */}
          <div
            className="absolute top-8 left-6 w-36 h-28 rounded-3xl bg-emerald-950/30 border border-emerald-500/20 pointer-events-none"
            style={{ transform: 'rotate(-10deg)' }}
          >
            <span className="absolute bottom-2 left-3 text-[9px] font-mono text-emerald-400 font-bold uppercase opacity-60">
              Willow Park
            </span>
          </div>

          {/* Stylized Water Pond */}
          <div
            className="absolute bottom-12 right-6 w-32 h-24 rounded-full bg-cyan-950/30 border border-cyan-500/20 pointer-events-none"
            style={{ transform: 'rotate(15deg)' }}
          >
            <span className="absolute top-2 right-3 text-[9px] font-mono text-cyan-400 font-bold uppercase opacity-60">
              Mirror Lake
            </span>
          </div>

          {/* Roads & Avenues */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 bg-neutral-900/60 border-y border-white/5 pointer-events-none" />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-neutral-900/60 border-x border-white/5 pointer-events-none" />

          {/* TRAINER RADAR AVATAR AT POS */}
          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-500"
            style={{ left: `${trainerPos.x}%`, top: `${trainerPos.y}%` }}
          >
            {/* Expanding Pulsing Radar Waves */}
            <div className="absolute -inset-8 rounded-full border-2 border-emerald-400/30 animate-ping pointer-events-none" />
            <div className="absolute -inset-14 rounded-full border border-emerald-400/15 animate-[ping_3s_ease-out_infinite] pointer-events-none" />

            {/* Trainer Marker */}
            <div className="relative w-8 h-8 rounded-full bg-[#CCFF00] text-black border-2 border-white shadow-[0_0_20px_rgba(204,255,0,0.8)] flex items-center justify-center font-black text-xs">
              <Navigation className="w-4 h-4 fill-black rotate-45" />
            </div>
            <div className="bg-black/80 text-[8px] font-mono font-bold text-[#CCFF00] px-1.5 py-0.2 rounded-md border border-white/10 mt-1 whitespace-nowrap text-center">
              You
            </div>
          </div>

          {/* WILD PET PINS AROUND MAP */}
          {wildEncounters.map((enc, idx) => {
            const pos = getPinPosition(enc, idx);
            const isSelected = selectedPin?.id === enc.id;

            return (
              <div
                key={enc.id}
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  setSelectedPin(enc);
                }}
                className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-115 active:scale-95 group"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                {/* Pin Head */}
                <div
                  className={`relative p-1 rounded-2xl border shadow-xl flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#CCFF00] border-white scale-110 shadow-[0_0_20px_rgba(204,255,0,0.8)]'
                      : enc.category === 'cat'
                      ? 'bg-purple-900/90 border-purple-400/60 hover:border-purple-300'
                      : 'bg-amber-900/90 border-amber-400/60 hover:border-amber-300'
                  }`}
                >
                  <span className="text-sm">
                    {enc.category === 'cat' ? '🐱' : '🐶'}
                  </span>
                </div>

                {/* Distance Badge */}
                <div
                  className={`mt-0.5 px-1.5 py-0.2 rounded text-[8px] font-mono font-bold whitespace-nowrap text-center border ${
                    isSelected
                      ? 'bg-black text-[#CCFF00] border-[#CCFF00]'
                      : 'bg-black/80 text-white border-white/10'
                  }`}
                >
                  {enc.distanceMeters}m
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM DRAWER: SELECTED PET ENCOUNTER CARD */}
        <div className="p-3 bg-[#101624] border-t border-white/10">
          {selectedPin ? (
            <div className="bg-[#141C2E] border border-white/15 rounded-2xl p-3 flex items-center justify-between shadow-lg animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-black border border-[#CCFF00]/40 flex items-center justify-center text-2xl shadow">
                  {selectedPin.category === 'cat' ? '🐱' : '🐶'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-black text-sm text-white uppercase">
                      {selectedPin.name}
                    </span>
                    <span className="text-[9px] bg-[#CCFF00]/20 text-[#CCFF00] font-mono font-bold px-1.5 rounded">
                      CP {selectedPin.cp}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400">
                    {selectedPin.distanceMeters}m away · {selectedPin.title}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playBattleStart();
                  setActiveCatchEncounter(selectedPin);
                }}
                className="py-2.5 px-3.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all"
              >
                <span>Encounter & Catch</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-3 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-[#CCFF00] animate-pulse" />
                <span>Tap any Dog or Cat on the map to target & catch</span>
              </div>
              <button
                onClick={handleScan}
                className="text-[11px] font-bold text-[#CCFF00] hover:underline cursor-pointer"
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
          }}
        />
      )}
    </div>
  );
};
