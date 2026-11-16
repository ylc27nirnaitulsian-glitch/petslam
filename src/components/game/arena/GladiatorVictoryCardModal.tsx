import React, { useRef, useEffect, useState } from 'react';
import {
  Trophy,
  Download,
  Copy,
  Share2,
  Check,
  X,
  Sparkles,
  Shield,
  Heart,
  Swords,
  Timer,
  Zap,
} from 'lucide-react';
import { Animal } from '../../../data/animals';
import { sound } from '../../../utils/audio';

interface GladiatorVictoryCardModalProps {
  playerPet: Animal;
  trainerName: string;
  opponentPet: Animal;
  matchDurationSec: number;
  playerHp: number;
  maxPlayerHp: number;
  parryCount: number;
  trophiesEarned: number;
  onClose: () => void;
}

export const GladiatorVictoryCardModal: React.FC<GladiatorVictoryCardModalProps> = ({
  playerPet,
  trainerName,
  opponentPet,
  matchDurationSec,
  playerHp,
  maxPlayerHp,
  parryCount,
  trophiesEarned,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Standard 4:5 vertical format (1080 x 1350)
    canvas.width = 1080;
    canvas.height = 1350;

    // Load Pet Image
    const petImg = new Image();
    petImg.crossOrigin = 'anonymous';
    petImg.src = playerPet.image;

    const renderCard = () => {
      // 1. Dark Obsidian Colosseum Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1350);
      bgGrad.addColorStop(0, '#040711');
      bgGrad.addColorStop(0.35, '#0B1120');
      bgGrad.addColorStop(0.7, '#070B14');
      bgGrad.addColorStop(1, '#020408');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1350);

      // 2. Atmospheric Gold Ambient Glow
      const centerGlow = ctx.createRadialGradient(540, 520, 50, 540, 520, 500);
      centerGlow.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
      centerGlow.addColorStop(0.5, 'rgba(217, 119, 6, 0.08)');
      centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, 1080, 1350);

      // 3. Hexagon Arena Grid Wireframe in Background
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.06)';
      ctx.lineWidth = 1.5;
      const hexR = 48;
      for (let y = -20; y < 1370; y += hexR * 1.5) {
        for (let x = -20; x < 1100; x += hexR * 1.732) {
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const hx = x + Math.cos(angle) * hexR;
            const hy = y + Math.sin(angle) * hexR;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      // 4. Gold Championship Frame & Corner Accents
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 6;
      ctx.strokeRect(45, 45, 990, 1260);

      ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(55, 55, 970, 1240);

      // Corner Brackets
      const corners = [
        [45, 45, 1, 1],
        [1035, 45, -1, 1],
        [45, 1305, 1, -1],
        [1035, 1305, -1, -1],
      ];
      corners.forEach(([cx, cy, sx, sy]) => {
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + sx * 45, cy);
        ctx.lineTo(cx + sx * 45, cy + sy * 12);
        ctx.lineTo(cx + sx * 12, cy + sy * 12);
        ctx.lineTo(cx + sx * 12, cy + sy * 45);
        ctx.lineTo(cx, cy + sy * 45);
        ctx.closePath();
        ctx.fill();
      });

      // 5. Header: PET SLAM CHAMPIONSHIP
      ctx.fillStyle = '#F59E0B';
      ctx.font = "900 32px 'Barlow Condensed', sans-serif";
      ctx.textAlign = 'center';
      ctx.letterSpacing = '6px';
      ctx.fillText('⚡ PET SLAM ARENA CHAMPIONSHIP ⚡', 540, 115);

      ctx.fillStyle = '#94A3B8';
      ctx.font = "600 20px 'Space Grotesk', sans-serif";
      ctx.letterSpacing = '2px';
      ctx.fillText('OFFICIAL GLADIATOR VICTORY RECORD', 540, 150);

      // 6. Central Pet Portrait with Gold Laurel Ring
      const pX = 540;
      const pY = 460;
      const pR = 210;

      // Outer gold glowing halo
      ctx.save();
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 45;
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(pX, pY, pR + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Pet Image Clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(pX, pY, pR, 0, Math.PI * 2);
      ctx.clip();

      if (petImg.complete && petImg.naturalWidth > 0) {
        ctx.drawImage(petImg, pX - pR, pY - pR, pR * 2, pR * 2);
      } else {
        // Fallback procedural gradient fill
        const petGrad = ctx.createLinearGradient(pX - pR, pY - pR, pX + pR, pY + pR);
        petGrad.addColorStop(0, '#F59E0B');
        petGrad.addColorStop(1, '#D97706');
        ctx.fillStyle = petGrad;
        ctx.fillRect(pX - pR, pY - pR, pR * 2, pR * 2);
      }
      ctx.restore();

      // 7. VICTORY K.O. Golden Banner
      const bY = 715;
      ctx.save();
      ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
      ctx.shadowBlur = 25;
      const bannerGrad = ctx.createLinearGradient(200, bY, 880, bY);
      bannerGrad.addColorStop(0, '#B45309');
      bannerGrad.addColorStop(0.5, '#F59E0B');
      bannerGrad.addColorStop(1, '#B45309');
      ctx.fillStyle = bannerGrad;
      ctx.fillRect(240, bY, 600, 68);
      ctx.restore();

      ctx.fillStyle = '#0B0F17';
      ctx.font = "900 38px 'Barlow Condensed', sans-serif";
      ctx.textAlign = 'center';
      ctx.letterSpacing = '4px';
      ctx.fillText('🏆 VICTORY K.O.! 🏆', 540, bY + 48);

      // 8. Pet Name & Archetype
      ctx.fillStyle = '#FFFFFF';
      ctx.font = "900 58px 'Barlow Condensed', sans-serif";
      ctx.letterSpacing = '3px';
      ctx.fillText(playerPet.name.toUpperCase(), 540, 840);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = "700 24px 'Space Grotesk', sans-serif";
      ctx.letterSpacing = '2px';
      ctx.fillText(
        `${(playerPet.breed || playerPet.species).toUpperCase()} · ${playerPet.combatArchetype.toUpperCase()}`,
        540,
        878
      );

      ctx.fillStyle = '#F59E0B';
      ctx.font = "600 20px 'Space Grotesk', sans-serif";
      ctx.fillText(`Trained by ${trainerName || 'Gladiator Trainer'}`, 540, 912);

      // 9. Match Statistics Cards Grid
      const statY = 960;
      const stats = [
        { label: 'K.O. TIME', val: `${matchDurationSec}s`, icon: '⏱️' },
        { label: 'HEALTH LEFT', val: `${Math.round(playerHp)}/${maxPlayerHp}`, icon: '❤️' },
        { label: 'PERFECT PARRIES', val: `${parryCount}`, icon: '⚡' },
        { label: 'TROPHIES', val: `+${trophiesEarned}`, icon: '🏆' },
      ];

      stats.forEach((st, idx) => {
        const sx = 140 + idx * 205;
        // Stat card box
        ctx.fillStyle = 'rgba(21, 28, 40, 0.85)';
        ctx.strokeStyle = '#2A364F';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(sx, statY, 190, 110, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#94A3B8';
        ctx.font = "700 14px 'Space Grotesk', sans-serif";
        ctx.textAlign = 'center';
        ctx.letterSpacing = '1px';
        ctx.fillText(st.label, sx + 95, statY + 36);

        ctx.fillStyle = idx === 3 ? '#F59E0B' : '#F8FAFC';
        ctx.font = "900 28px 'Barlow Condensed', sans-serif";
        ctx.fillText(`${st.icon} ${st.val}`, sx + 95, statY + 80);
      });

      // 10. Opponent Defeated Line
      ctx.fillStyle = '#94A3B8';
      ctx.font = "500 20px 'Space Grotesk', sans-serif";
      ctx.fillText(`Rival Defeated: ${opponentPet.name} (${opponentPet.breed || opponentPet.species})`, 540, 1120);

      // 11. Footer Branding & Link
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(180, 1170);
      ctx.lineTo(900, 1170);
      ctx.stroke();

      ctx.fillStyle = '#F59E0B';
      ctx.font = "900 26px 'Barlow Condensed', sans-serif";
      ctx.letterSpacing = '3px';
      ctx.fillText('PETSLAM.APP', 540, 1215);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = "500 18px 'Space Grotesk', sans-serif";
      ctx.letterSpacing = '1px';
      ctx.fillText('Scan or visit to battle this beast in the 60 FPS arena', 540, 1248);

      try {
        const outUrl = canvas.toDataURL('image/png');
        setDataUrl(outUrl);
        setIsGenerating(false);
      } catch (err) {
        console.warn('Canvas export failed:', err);
        setIsGenerating(false);
      }
    };

    petImg.onload = renderCard;
    petImg.onerror = renderCard;
    // Timeout fallback if image takes too long
    const fallbackTimer = setTimeout(renderCard, 600);
    return () => clearTimeout(fallbackTimer);
  }, [playerPet, trainerName, opponentPet, matchDurationSec, playerHp, maxPlayerHp, parryCount, trophiesEarned]);

  const handleDownload = () => {
    if (!dataUrl) return;
    sound.playClick();
    const link = document.createElement('a');
    link.download = `petslam-${playerPet.name.toLowerCase()}-gladiator-victory.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleCopyImage = async () => {
    sound.playClick();
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setCopied(true);
          sound.playLevelUp();
          setTimeout(() => setCopied(false), 2500);
        }
      });
    } catch {
      handleDownload();
    }
  };

  const handleNativeShare = async () => {
    sound.playClick();
    if (!canvasRef.current) return;
    try {
      if (navigator.share) {
        canvasRef.current.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `${playerPet.name}-victory.png`, { type: 'image/png' });
          await navigator.share({
            title: `PET SLAM: ${playerPet.name} Victory!`,
            text: `My beast ${playerPet.name} just claimed a Victory K.O. in PET SLAM! Challenge us at https://petslam.app/`,
            files: [file],
          });
        });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F17]/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in select-none">
      <div className="bg-[#151C28] border border-[#2A364F] rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl relative my-auto space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-[#2A364F]/60">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#F59E0B]" />
            <span className="font-display font-black text-lg text-[#F8FAFC] tracking-wide">
              GLADIATOR VICTORY CARD
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1E2738] hover:bg-[#2A364F] flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden 1080x1350 High-Res Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Card Preview Container */}
        <div className="relative rounded-2xl overflow-hidden border border-[#F59E0B]/40 shadow-xl bg-[#0B0F17] aspect-[4/5] flex items-center justify-center">
          {isGenerating || !dataUrl ? (
            <div className="flex flex-col items-center gap-2 text-[#CBD5E1]">
              <Sparkles className="w-8 h-8 text-[#F59E0B] animate-spin" />
              <span className="text-sm font-mono">Forging HD Victory Card...</span>
            </div>
          ) : (
            <img
              src={dataUrl}
              alt="Gladiator Victory Card"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleDownload}
            disabled={!dataUrl}
            className="w-full py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] active:scale-98 text-[#0B0F17] font-display font-bold text-base uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span>Download HD Card (1080x1350)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyImage}
              disabled={!dataUrl}
              className="py-2.5 px-3 rounded-xl bg-[#1E2738] hover:bg-[#2A364F] active:scale-98 border border-[#2A364F] text-[#F8FAFC] font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#10B981]" />
                  <span className="text-[#10B981]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#CBD5E1]" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            <button
              onClick={handleNativeShare}
              disabled={!dataUrl}
              className="py-2.5 px-3 rounded-xl bg-[#1E2738] hover:bg-[#2A364F] active:scale-98 border border-[#2A364F] text-[#F8FAFC] font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            >
              <Share2 className="w-4 h-4 text-[#F59E0B]" />
              <span>Share Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
