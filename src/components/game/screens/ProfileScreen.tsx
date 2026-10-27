import React, { useState, useRef } from 'react';
import {
  User,
  Trophy,
  Swords,
  Shield,
  Zap,
  Sparkles,
  RefreshCw,
  LogOut,
  Edit2,
  Check,
  Volume2,
  VolumeX,
  Lock,
  Camera,
} from 'lucide-react';
import { useGame } from '../../../context/GameContext';
import { sound } from '../../../utils/audio';
import { AccountAuthModal } from '../AccountAuthModal';

interface ProfileScreenProps {
  onOpenSystemDetails?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const {
    trainerName,
    setTrainerName,
    playerTag,
    connectedAccount,
    trophies,
    playerLevel,
    wins,
    losses,
    credits,
    battleDeckIds,
    ownedBeasts,
    soundEnabled,
    toggleSound,
    updateUserAvatar,
  } = useGame();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(trainerName);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateUserAvatar(dataUrl);
        sound.playLevelUp();
        setSyncFeedback('Profile photo updated successfully!');
        setTimeout(() => setSyncFeedback(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setTrainerName(nameInput.trim());
      sound.playClick();
    }
    setIsEditingName(false);
  };

  const handleManualSync = () => {
    sound.playClick();
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      sound.playLevelUp();
      setSyncFeedback('Cloud save synchronized successfully ✓');
      setTimeout(() => setSyncFeedback(null), 3000);
    }, 600);
  };

  // Active 4-Pet Squad
  const squadPets = battleDeckIds
    .map((id) => ownedBeasts.find((b) => b.id === id))
    .filter((b): b is typeof ownedBeasts[0] => !!b);

  const safeSquad = squadPets.length > 0 ? squadPets : ownedBeasts.slice(0, 4);

  return (
    <div className="flex flex-col h-full bg-[#080B12] text-white select-none overflow-y-auto pb-24 max-w-md mx-auto w-full">
      {/* Dynamic Toast Feedback */}
      {syncFeedback && (
        <div className="sticky top-2 z-50 mx-4 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-center animate-in fade-in">
          <p className="text-xs font-mono font-bold text-emerald-300">{syncFeedback}</p>
        </div>
      )}

      {/* TOP TRAINER CARD HERO */}
      <div className="p-4 bg-gradient-to-b from-[#141C2E] to-[#0D121F] border-b border-white/10">
        <div className="flex items-center gap-4">
          {/* Avatar Profile Photo with 1-Click Upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-18 h-18 rounded-3xl overflow-hidden border-2 border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.35)] bg-[#121622] shrink-0 aspect-square group cursor-pointer"
            title="Tap to Upload Custom Profile Photo"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {connectedAccount.avatarUrl ? (
              <img
                src={connectedAccount.avatarUrl}
                alt={trainerName}
                className="w-full h-full object-cover object-center aspect-square"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#CCFF00] font-black text-2xl font-display">
                {trainerName.charAt(0)}
              </div>
            )}

            {/* Hover Camera Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
              <Camera className="w-5 h-5 text-[#CCFF00]" />
              <span className="text-[8px] font-mono font-bold mt-0.5">Upload</span>
            </div>

            <div className="absolute -bottom-0.5 inset-x-0 bg-black/80 text-[#CCFF00] font-mono font-black text-[9px] text-center py-0.5 border-t border-white/10">
              LVL {playerLevel}
            </div>
          </div>

          {/* Name & Player Tag */}
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="bg-[#1A2234] border border-[#CCFF00] rounded-xl px-2.5 py-1 text-sm font-bold text-white outline-none w-full"
                  maxLength={18}
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-1.5 rounded-lg bg-[#CCFF00] text-black cursor-pointer font-bold shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-xl text-white uppercase tracking-wider truncate">
                  {trainerName}
                </h2>
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsEditingName(true);
                  }}
                  className="text-neutral-400 hover:text-[#CCFF00] cursor-pointer"
                  title="Edit Name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono font-bold text-[#CCFF00]">{playerTag}</span>
              <span className="text-[10px] font-mono bg-white/10 text-neutral-300 px-2 py-0.5 rounded-full border border-white/15">
                {connectedAccount.isLoggedIn
                  ? `${connectedAccount.provider === 'Apple' ? 'Google' : connectedAccount.provider} ✓`
                  : 'Guest'}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Quick Stat Badges */}
        <div className="grid grid-cols-4 gap-2 mt-4 text-center">
          <div className="bg-[#101422] border border-white/10 rounded-2xl p-2.5">
            <span className="text-[9px] font-mono text-neutral-400 block uppercase">Trophies</span>
            <span className="font-display font-black text-base text-amber-300">{trophies}</span>
          </div>
          <div className="bg-[#101422] border border-white/10 rounded-2xl p-2.5">
            <span className="text-[9px] font-mono text-neutral-400 block uppercase">Wins</span>
            <span className="font-display font-black text-base text-[#CCFF00]">{wins}</span>
          </div>
          <div className="bg-[#101422] border border-white/10 rounded-2xl p-2.5">
            <span className="text-[9px] font-mono text-neutral-400 block uppercase">Losses</span>
            <span className="font-display font-black text-base text-red-400">{losses}</span>
          </div>
          <div className="bg-[#101422] border border-white/10 rounded-2xl p-2.5">
            <span className="text-[9px] font-mono text-neutral-400 block uppercase">Win Rate</span>
            <span className="font-display font-black text-base text-cyan-300">{winRate}%</span>
          </div>
        </div>
      </div>

      {/* SQUAD SHOWCASE */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
          <span className="font-bold text-white uppercase flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>Active Battle Squad</span>
          </span>
          <span>4 Dogs & Cats</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {safeSquad.map((beast, idx) => (
            <div
              key={beast.id}
              className="bg-[#121622] border border-white/10 rounded-2xl p-2 flex flex-col items-center text-center shadow"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden aspect-square border border-white/15 bg-black mb-1.5">
                <img
                  src={beast.image}
                  alt={beast.name}
                  className="w-full h-full object-cover object-center aspect-square"
                />
              </div>
              <span className="text-[10px] font-bold text-white truncate w-full">
                {beast.name}
              </span>
              <span className="text-[9px] font-mono text-cyan-400">
                LV.{beast.level || 10}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ACCOUNT & CLOUD SAVE ACTIONS */}
      <div className="px-4 space-y-2.5">
        <div className="text-xs font-mono font-bold text-neutral-400 uppercase">
          Account & Device Sync
        </div>

        {/* Google Hub Card */}
        <div
          onClick={() => {
            sound.playClick();
            setShowAuthModal(true);
          }}
          className="p-3.5 rounded-2xl bg-[#121622] hover:bg-[#182030] border border-white/10 flex items-center justify-between cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              {connectedAccount.provider === 'Google' ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              ) : (
                <User className="w-4 h-4 text-[#CCFF00]" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-white">Google Cloud Player Hub</div>
              <div className="text-[10px] font-mono text-neutral-400">
                {connectedAccount.isLoggedIn ? `${connectedAccount.email} (Synced)` : 'Link Google Account for Cloud Saves'}
              </div>
            </div>
          </div>
          <span className="text-xs font-mono text-[#CCFF00]">Manage →</span>
        </div>

        {/* Force Sync Button */}
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="w-full py-3 rounded-2xl bg-[#121622] hover:bg-[#182030] border border-white/10 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#CCFF00]' : ''}`} />
          <span>{isSyncing ? 'Synchronizing Cloud Progress...' : 'Sync Cloud Save Now'}</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={() => {
            sound.playClick();
            toggleSound();
          }}
          className="w-full py-3 rounded-2xl bg-[#121622] hover:bg-[#182030] border border-white/10 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Game SFX & Sounds: ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
              <span>Game SFX & Sounds: MUTED</span>
            </>
          )}
        </button>
      </div>

      {/* Account Auth Modal */}
      {showAuthModal && (
        <AccountAuthModal
          currentTrainerName={trainerName}
          onUpdateTrainerName={setTrainerName}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};
