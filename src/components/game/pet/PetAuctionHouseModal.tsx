import React, { useState, useEffect } from 'react';
import { usePetCompanion } from '../../../context/PetCompanionContext';
import { useGame } from '../../../context/GameContext';
import { PetAuctionItem, CompanionPet } from '../../../types/pet';
import { getPetPhoto, getPetBreedName } from '../../../utils/petVisuals';
import { sound } from '../../../utils/audio';
import { triggerConfetti, triggerVictoryExplosion } from '../../../utils/confetti';
import { createDodoCheckout } from '../../../services/dodo';
import { trackClarityEvent } from '../../../utils/clarity';
import {
  Gavel,
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
  Lock,
  Crown,
} from 'lucide-react';

interface PetAuctionHouseModalProps {
  onClose: () => void;
}

export const PetAuctionHouseModal: React.FC<PetAuctionHouseModalProps> = ({ onClose }) => {
  const { auctions, placeAuctionBid, buyoutAuction, listPetForAuction, kennelPets, cancelUserAuction } =
    usePetCompanion();
  const { credits, addCredits, hasAuctionPass, unlockPass } = useGame();

  const [activeTab, setActiveTab] = useState<'live' | 'create' | 'my_listings'>('live');
  const [selectedAuction, setSelectedAuction] = useState<PetAuctionItem | null>(null);
  const [bidAmountInput, setBidAmountInput] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [showLicenseModal, setShowLicenseModal] = useState<boolean>(false);

  // Create listing form state
  const [selectedKennelPetId, setSelectedKennelPetId] = useState<string>(
    kennelPets[0]?.id || ''
  );
  const [startBid, setStartBid] = useState<number>(1200);
  const [buyoutPrice, setBuyoutPrice] = useState<number>(2500);
  const [durationHours, setDurationHours] = useState<number>(6);

  // Dynamic Simulated Rival AI Bidders State
  const [rivalBiddersEnabled, setRivalBiddersEnabled] = useState<boolean>(true);
  const [liveOutbidAlert, setLiveOutbidAlert] = useState<string | null>(null);

  // Simulated Dynamic Rival AI Bidders Floor (3-8s interval)
  useEffect(() => {
    if (!rivalBiddersEnabled || activeTab !== 'live' || auctions.length === 0) return;

    const RIVAL_NAMES = [
      'ShadowFang',
      'ApexPredator',
      'NeonKitsune',
      'VoltHound',
      'CyberTrainer99',
      'TitanShiba',
      'ValkyrieCat',
    ];

    const timer = setInterval(() => {
      const eligible = auctions.filter((a) => !a.isUserListing && a.currentBid < a.buyoutPrice);
      if (eligible.length === 0) return;

      const target = eligible[Math.floor(Math.random() * eligible.length)];
      const rival = RIVAL_NAMES[Math.floor(Math.random() * RIVAL_NAMES.length)];
      const increment = Math.floor(Math.random() * 3 + 1) * 50;
      const newBid = Math.min(target.buyoutPrice - 50, target.currentBid + increment);

      if (newBid > target.currentBid) {
        placeAuctionBid(target.id, newBid);

        const wasUserWinning = target.highestBidder === 'Trainer (You)';
        if (wasUserWinning) {
          sound.playLightHit();
          setLiveOutbidAlert(
            `⚠️ Outbid Alert! ${rival} just outbid you on ${target.pet.name} with ${newBid.toLocaleString()} CR!`
          );
          setTimeout(() => setLiveOutbidAlert(null), 4000);
        }
      }
    }, Math.floor(Math.random() * 4000 + 4000));

    return () => clearInterval(timer);
  }, [rivalBiddersEnabled, activeTab, auctions, placeAuctionBid]);

  const showToast = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenBidModal = (item: PetAuctionItem) => {
    if (!hasAuctionPass) {
      setShowLicenseModal(true);
      return;
    }
    setSelectedAuction(item);
    setBidAmountInput(item.minNextBid);
  };

  const handleConfirmBid = () => {
    if (!hasAuctionPass) {
      setShowLicenseModal(true);
      return;
    }
    if (!selectedAuction) return;

    if (credits < bidAmountInput) {
      showToast('Insufficient Credits in your wallet to place this bid!', true);
      sound.playClick();
      return;
    }

    const res = placeAuctionBid(selectedAuction.id, bidAmountInput);
    if (res.success) {
      // Deduct credits from user wallet
      addCredits(-bidAmountInput);
      triggerConfetti();
      showToast(res.message);
      setSelectedAuction(null);
    } else {
      showToast(res.message, true);
    }
  };

  const handleBuyout = (item: PetAuctionItem) => {
    if (!hasAuctionPass) {
      setShowLicenseModal(true);
      return;
    }
    if (credits < item.buyoutPrice) {
      showToast(
        `Insufficient Credits! You need ${item.buyoutPrice.toLocaleString()} Credits for Buyout.`,
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
      showToast(`🎉 Buyout Complete! ${item.pet.name} is now in your Kennel!`);
    } else {
      showToast(res.message, true);
    }
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAuctionPass) {
      setShowLicenseModal(true);
      return;
    }
    if (!selectedKennelPetId) {
      showToast('Please select a pet from your kennel to auction!', true);
      return;
    }

    if (buyoutPrice <= startBid) {
      showToast('Buyout price must be higher than starting bid!', true);
      return;
    }

    const res = listPetForAuction(selectedKennelPetId, startBid, buyoutPrice, durationHours);
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
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Gavel className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span>Pet Auction House</span>
                <span className="text-[10px] bg-[#CCFF00] text-black font-mono px-2 py-0.5 rounded-full font-black">
                  Live Market
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Bid, trade, and auction rare cats, dogs & pedigree companions
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

        {/* VIP Trading License Status Banner */}
        {!hasAuctionPass ? (
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-transparent border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-300">
              <Lock className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Free to browse! Active bidding & listing requires the <strong>$1.99 VIP License</strong>.</span>
            </div>
            <button
              onClick={() => setShowLicenseModal(true)}
              className="bg-amber-400 hover:bg-amber-300 text-black px-2.5 py-1 rounded-lg font-bold text-[11px] shrink-0 cursor-pointer shadow-sm transition-all"
            >
              Unlock ($1.99)
            </button>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-emerald-300">
            <span className="flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-emerald-400" />
              <span>VIP Auction Trading License: <strong>ACTIVE</strong> (0% Commission)</span>
            </span>
          </div>
        )}

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
              Live Auctions ({auctions.length})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`pb-2 px-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'border-[#CCFF00] text-[#CCFF00]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              + List Pet
            </button>
            <button
              onClick={() => setActiveTab('my_listings')}
              className={`pb-2 px-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'my_listings'
                  ? 'border-[#CCFF00] text-[#CCFF00]'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              My Listings ({userListings.length})
            </button>
          </div>

          {/* Rival AI Bidders Toggle */}
          <button
            onClick={() => setRivalBiddersEnabled(!rivalBiddersEnabled)}
            className={`mb-1.5 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer border shrink-0 ${
              rivalBiddersEnabled
                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                : 'bg-white/5 border-white/10 text-neutral-400'
            }`}
            title="Toggle simulated rival AI bidder floor"
          >
            <span>🤖 Rival Bots:</span>
            <span className={rivalBiddersEnabled ? 'text-[#CCFF00]' : 'text-neutral-500'}>
              {rivalBiddersEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Live Outbid Alert Notification */}
        {liveOutbidAlert && (
          <div className="mx-4 mt-2.5 p-2 rounded-xl text-xs font-mono bg-amber-500/20 border border-amber-400/60 text-amber-200 flex items-center gap-2 animate-bounce">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold">{liveOutbidAlert}</span>
          </div>
        )}

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

                  {/* Right: Bidding Controls */}
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="text-right">
                      <div className="text-[10px] text-neutral-400 uppercase">Current Bid</div>
                      <div className="text-xs font-bold text-white font-mono flex items-center gap-1 justify-end">
                        <Coins className="w-3 h-3 text-amber-400" />
                        <span>{item.currentBid.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenBidModal(item)}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-mono font-bold cursor-pointer"
                      >
                        Bid
                      </button>
                      <button
                        onClick={() => handleBuyout(item)}
                        className="px-2.5 py-1 bg-[#CCFF00] hover:bg-[#b8e600] text-black rounded-lg text-[10px] font-mono font-bold cursor-pointer shadow"
                      >
                        Buyout ({item.buyoutPrice.toLocaleString()})
                      </button>
                    </div>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Starting Bid (Credits):</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={startBid}
                    onChange={(e) => setStartBid(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Buyout Price (Credits):</label>
                  <input
                    type="number"
                    min="200"
                    step="100"
                    value={buyoutPrice}
                    onChange={(e) => setBuyoutPrice(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Auction Duration:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 6, 12, 24].map((hrs) => (
                    <button
                      type="button"
                      key={hrs}
                      onClick={() => setDurationHours(hrs)}
                      className={`py-1.5 rounded-xl border text-center cursor-pointer transition-all ${
                        durationHours === hrs
                          ? 'bg-[#CCFF00] text-black font-bold border-[#CCFF00]'
                          : 'bg-black/40 text-neutral-300 border-white/10 hover:bg-white/5'
                      }`}
                    >
                      {hrs} Hours
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-lg active:scale-95 transition-transform"
              >
                Publish Pet to Auction House
              </button>
            </form>
          )}

          {/* TAB 3: My Listings */}
          {activeTab === 'my_listings' && (
            <div className="space-y-3">
              {userListings.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 font-mono text-xs">
                  You currently have no active pet listings. Select "List Pet for Auction" to sell a companion!
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

        {/* Place Bid Modal Popover */}
        {selectedAuction && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xs bg-[#151C2C] border border-[#CCFF00]/40 rounded-2xl p-4 shadow-2xl text-white font-mono space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-bold text-xs uppercase">
                  Place Bid on {selectedAuction.pet.name}
                </span>
                <button
                  onClick={() => setSelectedAuction(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-neutral-300">
                Minimum Next Bid:{' '}
                <span className="text-[#CCFF00] font-bold">
                  {selectedAuction.minNextBid.toLocaleString()} Credits
                </span>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Your Bid Amount:</label>
                <input
                  type="number"
                  min={selectedAuction.minNextBid}
                  step="50"
                  value={bidAmountInput}
                  onChange={(e) => setBidAmountInput(Number(e.target.value))}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setBidAmountInput((prev) => prev + 100)}
                  className="flex-1 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-neutral-300"
                >
                  +100
                </button>
                <button
                  onClick={() => setBidAmountInput((prev) => prev + 500)}
                  className="flex-1 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-neutral-300"
                >
                  +500
                </button>
              </div>

              <button
                onClick={handleConfirmBid}
                className="w-full py-2 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black uppercase text-xs rounded-xl cursor-pointer"
              >
                Confirm Bid ({bidAmountInput.toLocaleString()} Credits)
              </button>
            </div>
          </div>
        )}
        {/* License Purchase Modal */}
        {showLicenseModal && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#121728] border border-amber-400/40 rounded-3xl p-5 max-w-sm w-full shadow-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Gavel className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg uppercase text-white">
                VIP Auction Trading License
              </h3>
              <p className="text-xs text-neutral-300">
                Unlock lifetime live bidding and listing for rare pedigree pets in the global Auction House!
              </p>
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/10 text-xs font-mono font-bold text-amber-300">
                $1.99 USD or 1,500 Slam Credits
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={async () => {
                    try {
                      trackClarityEvent('auction_pass_dodo_click');
                      const checkout = await createDodoCheckout({ passType: 'auction' });
                      if (checkout.checkoutUrl && !checkout.simulated) {
                        window.location.href = checkout.checkoutUrl;
                      } else if (checkout.simulated && checkout.mode === 'test_sandbox') {
                        unlockPass('auction', false);
                        setShowLicenseModal(false);
                        showToast('⚡ [Dodo Test Sandbox] VIP Auction License Activated!');
                      } else if (checkout.checkoutUrl) {
                        window.location.href = checkout.checkoutUrl;
                      }
                    } catch (e: any) {
                      alert(e?.message || 'Failed to connect to Dodo Payments');
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase cursor-pointer"
                >
                  Pay $1.99 (Dodo)
                </button>
                <button
                  onClick={() => {
                    const res = unlockPass('auction', true);
                    if (res.success) {
                      setShowLicenseModal(false);
                      showToast(res.message);
                    } else {
                      alert(res.message);
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase cursor-pointer border border-white/15"
                >
                  1,500 Credits
                </button>
              </div>

              <button
                onClick={() => setShowLicenseModal(false)}
                className="text-[11px] text-neutral-400 hover:text-white underline cursor-pointer mt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
