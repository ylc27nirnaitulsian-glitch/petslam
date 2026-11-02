import React, { useState, useEffect } from 'react';
import { usePetCompanion } from '../../../context/PetCompanionContext';
import { useGame } from '../../../context/GameContext';
import { PetAuctionItem, CompanionPet } from '../../../types/pet';
import { getPetPhoto, getPetBreedName } from '../../../utils/petVisuals';
import { sound } from '../../../utils/audio';
import { triggerConfetti, triggerVictoryExplosion } from '../../../utils/confetti';
import { trackClarityEvent } from '../../../utils/clarity';
import {
  Home,
  Heart,
  X,
  Clock,
  Coins,
  CheckCircle,
  Plus,
  Shield,
  Zap,
  ArrowUpRight,
  Sparkles,
  AlertCircle,
  Tag,
  Crown,
} from 'lucide-react';

interface PetAuctionHouseModalProps {
  onClose: () => void;
}

export const PetAuctionHouseModal: React.FC<PetAuctionHouseModalProps> = ({ onClose }) => {
  const { auctions, placeAuctionBid, buyoutAuction, listPetForAuction, kennelPets, cancelUserAuction } =
    usePetCompanion();
  const { credits, addCredits } = useGame();

  const [activeTab, setActiveTab] = useState<'live' | 'create' | 'my_listings'>('live');
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Create listing form state
  const [selectedKennelPetId, setSelectedKennelPetId] = useState<string>(
    kennelPets[0]?.id || ''
  );
  const [startBid, setStartBid] = useState<number>(1200);
  const [buyoutPrice, setBuyoutPrice] = useState<number>(2500);
  const [durationHours, setDurationHours] = useState<number>(6);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAdopt = (item: PetAuctionItem) => {
    if (credits < item.buyoutPrice) {
      showToast(
        `Insufficient Credits! You need ${item.buyoutPrice.toLocaleString()} Credits for Adoption.`,
        true
      );
      sound.playClick();
      return;
    }

    const res = buyoutAuction(item.id);
    if (res.success) {
      addCredits(-item.buyoutPrice);
      sound.playVictory();
      triggerVictoryExplosion();
      showToast(`🎉 Adoption Complete! ${item.pet.name} has joined your Sanctuary Kennel!`);
    } else {
      showToast(res.message, true);
    }
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKennelPetId) {
      showToast('Please select a pet from your kennel to offer for adoption!', true);
      return;
    }

    if (buyoutPrice <= 0) {
      showToast('Please set a valid adoption fee in credits!', true);
      return;
    }

    const res = listPetForAuction(selectedKennelPetId, buyoutPrice, buyoutPrice, 24);
    if (res.success) {
      showToast(res.message);
      setActiveTab('live');
    } else {
      showToast(res.message, true);
    }
  };

  const userListings = auctions.filter((a) => a.isUserListing);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-lg bg-[#0F1420] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-white font-sans">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#151C2C]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Home className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span>Sanctuary Adoption Shelter</span>
                <span className="text-[10px] bg-emerald-400 text-black font-mono px-2 py-0.5 rounded-full font-black">
                  100% Free-to-Play
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Adopt, re-home & sponsor companion pets using earned Slam Credits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-xl border border-white/10 text-xs font-mono text-[#CCFF00]">
              <Coins className="w-3.5 h-3.5" />
              <span>{credits.toLocaleString()}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 100% Free Community Shelter Banner */}
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 flex items-center justify-between text-xs font-mono text-emerald-300">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Community Shelter: Adopt companion pets using earned gameplay tokens!</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
            Fair Play
          </span>
        </div>

        {/* Navigation Tabs + Rival AI Switch */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#0B0E17] px-4 pt-2 gap-2 text-xs font-mono font-bold overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('live')}
              className={`pb-2 px-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'live'
                  ? 'border-[#CCFF00] text-[#CCFF00]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              Adoptable Pets ({auctions.length})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`pb-2 px-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'border-[#CCFF00] text-[#CCFF00]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              + Offer Pet
            </button>
            <button
              onClick={() => setActiveTab('my_listings')}
              className={`pb-2 px-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'my_listings'
                  ? 'border-[#CCFF00] text-[#CCFF00]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              My Re-Homed ({userListings.length})
            </button>
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div
            className={`mx-4 mt-3 p-2.5 rounded-xl text-xs font-mono flex items-center gap-2 ${
              toastMessage.isError
                ? 'bg-red-500/20 border border-red-500/40 text-red-300'
                : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
            }`}
          >
            {toastMessage.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {/* TAB 1: Live Auctions */}
          {activeTab === 'live' && (
            <div className="space-y-3">
              {auctions.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#121824] border border-white/5 hover:border-white/20 rounded-2xl p-3 flex items-center justify-between transition-all"
                >
                  {/* Left: Authentic Pet Portrait & Details */}
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      <img
                        src={getPetPhoto(item.pet)}
                        alt={item.pet.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{item.pet.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                            item.pet.category === 'cat'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {getPetBreedName(item.pet)} · Lv.{item.pet.level}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#CCFF00]">
                        CP {item.pet.stats.cp} · Stage {item.pet.stage}
                      </div>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                        <span>Seller: {item.sellerName}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5 text-amber-400">
                          <Clock className="w-3 h-3" />
                          <span>42m left</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Adoption Controls */}
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="text-right">
                      <div className="text-[10px] text-neutral-400 uppercase font-mono">Adoption Fee</div>
                      <div className="text-xs font-bold text-white font-mono flex items-center gap-1 justify-end">
                        <Coins className="w-3 h-3 text-amber-400" />
                        <span>{item.buyoutPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAdopt(item)}
                      className="px-3 py-1.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black rounded-lg text-[11px] font-mono font-black uppercase cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      Adopt Companion
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Create Listing Form */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateListing} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">
                  Select Pet from Your Kennel:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {kennelPets.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedKennelPetId(p.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        selectedKennelPetId === p.id
                          ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-white'
                          : 'border-white/5 bg-black/40 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                        <img
                          src={getPetPhoto(p)}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold truncate text-white">{p.name}</div>
                        <div className="text-[10px] text-[#CCFF00]">CP {p.stats.cp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Fixed Adoption Fee (Credits):</label>
                <input
                  type="number"
                  min="500"
                  step="100"
                  value={buyoutPrice}
                  onChange={(e) => setBuyoutPrice(Number(e.target.value))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-lg active:scale-95 transition-transform"
              >
                Publish Companion to Adoption Shelter
              </button>
            </form>
          )}

          {/* TAB 3: My Listings */}
          {activeTab === 'my_listings' && (
            <div className="space-y-3">
              {userListings.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 font-mono text-xs">
                  You currently have no pets offered for adoption. Select "+ Offer Pet" to re-home a companion!
                </div>
              ) : (
                userListings.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#121824] border border-[#CCFF00]/20 rounded-2xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        <img
                          src={getPetPhoto(item.pet)}
                          alt={item.pet.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{item.pet.name}</span>
                          <span className="text-[9px] px-1 rounded bg-white/10 text-neutral-300 font-mono">
                            {getPetBreedName(item.pet)}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#CCFF00] font-mono">
                          Current Bid: {item.currentBid.toLocaleString()} Credits ({item.bidCount} bids)
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          Highest Bidder: {item.highestBidder}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => cancelUserAuction(item.id)}
                      className="px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl text-[10px] font-mono font-bold cursor-pointer"
                    >
                      Cancel Listing
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
