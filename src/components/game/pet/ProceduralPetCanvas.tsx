import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PetSpecies, PetStage, PetAnimationState, PetMood, PetCustomPalette, PetCustomFeatures } from '../../../types/pet';
import { PET_SPECIES_PHOTOS } from '../../../data/animals';

interface ProceduralPetCanvasProps {
  species: PetSpecies;
  stage: PetStage;
  animationState?: PetAnimationState;
  mood?: PetMood;
  talkingVolume?: number; // 0 to 1 for live lip-sync mouth movement
  width?: number;
  height?: number;
  interactive?: boolean;
  onStroke?: () => void;
  onPokeHead?: () => void;
  onTickleBelly?: () => void;
  onFeedClick?: () => void;
  className?: string;
  showAura?: boolean;
  customPalette?: PetCustomPalette;
  customFeatures?: PetCustomFeatures;
  avatarImageUrl?: string;
  renderMode?: 'cute' | 'photo';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  life: number;
  color: string;
  type: 'heart' | 'sparkle' | 'crumb' | 'sleep' | 'sweat' | 'star' | 'bubble' | 'milk';
  size: number;
  text?: string;
}

export const ProceduralPetCanvas: React.FC<ProceduralPetCanvasProps> = ({
  species = 'shiba',
  stage = 1,
  animationState = 'idle',
  mood = 'playful',
  talkingVolume = 0,
  width = 240,
  height = 240,
  interactive = true,
  onStroke,
  onPokeHead,
  onTickleBelly,
  onFeedClick,
  className = '',
  showAura = false,
  customPalette,
  customFeatures,
  avatarImageUrl,
  renderMode = 'cute',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Keep references to customPalette and customFeatures for 60 FPS reactive updates without re-mounting
  const customPaletteRef = useRef(customPalette);
  customPaletteRef.current = customPalette;

  const customFeaturesRef = useRef(customFeatures);
  customFeaturesRef.current = customFeatures;

  // Determine photo URL: ONLY used when renderMode is explicitly 'photo'
  const effectiveImageUrl = renderMode === 'photo' ? (avatarImageUrl || PET_SPECIES_PHOTOS[species] || '') : '';

  useEffect(() => {
    if (!effectiveImageUrl) {
      imgRef.current = null;
      setImgLoaded(false);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
    };
    img.onerror = () => {
      imgRef.current = null;
      setImgLoaded(false);
    };
    img.src = effectiveImageUrl;
  }, [effectiveImageUrl]);

  // Motion and physics state
  const stateRef = useRef({
    time: 0,
    blinkTimer: 0,
    isBlinking: false,
    eyeGazeX: 0,
    eyeGazeY: 0,
    currentAnimation: animationState,
    talkingVolume: talkingVolume,
    pettingIntensity: 0,
    squashX: 1,
    squashY: 1,
    bounceY: 0,
    walkCycle: 0,
    mouthOpen: 0,
    tailWag: 0,
    particles: [] as Particle[],
    isHovered: false,
    isPointerDown: false,
    pointerStartPos: { x: 0, y: 0 },
    pointerLastPos: { x: 0, y: 0 },
    strokeDistance: 0,
    dragTime: 0,
  });

  // Keep stateRef synced with props
  useEffect(() => {
    stateRef.current.currentAnimation = animationState;
  }, [animationState]);

  useEffect(() => {
    stateRef.current.talkingVolume = talkingVolume;
  }, [talkingVolume]);

  // Spawn particle helper
  const spawnParticle = useCallback(
    (type: Particle['type'], x: number, y: number, color?: string, text?: string) => {
      const defaultColors: Record<Particle['type'], string> = {
        heart: '#FF4D8D',
        sparkle: '#CCFF00',
        crumb: '#F59E0B',
        sleep: '#93C5FD',
        sweat: '#38BDF8',
        star: '#FBBF24',
        bubble: '#67E8F9',
        milk: '#FFFFFF',
      };

      stateRef.current.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * (type === 'bubble' ? 1.2 : 2.5),
        vy:
          type === 'sleep'
            ? -0.8
            : type === 'bubble'
            ? -1.2 - Math.random() * 1.5
            : -1.5 - Math.random() * 2,
        alpha: 1,
        life: 1,
        color: color || defaultColors[type],
        type,
        size: type === 'heart' ? 14 : type === 'bubble' ? 12 : type === 'star' ? 10 : 8,
        text,
      });
    },
    []
  );

  // Mouse / Touch handlers for Talking Tom interactive zones
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    stateRef.current.isPointerDown = true;
    stateRef.current.pointerStartPos = { x: clickX, y: clickY };
    stateRef.current.pointerLastPos = { x: clickX, y: clickY };
    stateRef.current.strokeDistance = 0;
    stateRef.current.dragTime = performance.now();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const currX = e.clientX - rect.left;
    const currY = e.clientY - rect.top;

    // Track gaze
    const centerX = width / 2;
    const centerY = height / 2 - 20;
    stateRef.current.eyeGazeX = Math.max(-1, Math.min(1, (currX - centerX) / (width * 0.4)));
    stateRef.current.eyeGazeY = Math.max(-1, Math.min(1, (currY - centerY) / (height * 0.4)));

    if (stateRef.current.isPointerDown && interactive) {
      const dx = currX - stateRef.current.pointerLastPos.x;
      const dy = currY - stateRef.current.pointerLastPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      stateRef.current.strokeDistance += dist;
      stateRef.current.pointerLastPos = { x: currX, y: currY };

      // Petting stroke detected (rubbing)
      if (stateRef.current.strokeDistance > 22) {
        stateRef.current.strokeDistance = 0;
        stateRef.current.pettingIntensity = 1;
        stateRef.current.currentAnimation = 'pet';

        spawnParticle('heart', currX, currY);
        if (Math.random() > 0.4) {
          spawnParticle('sparkle', currX, currY);
        }

        onStroke?.();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!stateRef.current.isPointerDown) return;
    stateRef.current.isPointerDown = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const rect = e.currentTarget.getBoundingClientRect();
    const upX = e.clientX - rect.left;
    const upY = e.clientY - rect.top;
    const clickDuration = performance.now() - stateRef.current.dragTime;

    // Detect distinct tap vs stroke for Talking Tom interactions!
    if (clickDuration < 280 && stateRef.current.strokeDistance < 15) {
      // Zone 1: Head Tap / Poke (y < height * 0.42)
      if (upY < height * 0.42) {
        onPokeHead?.();
        stateRef.current.currentAnimation = 'dizzy';
        for (let i = 0; i < 4; i++) {
          spawnParticle('star', width / 2 + (Math.random() - 0.5) * 40, height * 0.25);
        }
        setTimeout(() => {
          if (stateRef.current.currentAnimation === 'dizzy') {
            stateRef.current.currentAnimation = animationState;
          }
        }, 1800);
        return;
      }

      // Zone 2: Belly Tickle (height * 0.45 <= y <= height * 0.78)
      if (upY >= height * 0.42 && upY <= height * 0.8) {
        onTickleBelly?.();
        stateRef.current.currentAnimation = 'laugh';
        spawnParticle('heart', upX, upY);
        setTimeout(() => {
          if (stateRef.current.currentAnimation === 'laugh') {
            stateRef.current.currentAnimation = animationState;
          }
        }, 1600);
        return;
      }
    }

    setTimeout(() => {
      if (stateRef.current.currentAnimation === 'pet') {
        stateRef.current.currentAnimation = animationState;
      }
    }, 600);
  };

  // Main 60 FPS Canvas Drawing Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina / High-DPI crisp rendering
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const s = stateRef.current;
      s.time += dt;

      // Handle Blinking logic
      s.blinkTimer += dt;
      if (s.isBlinking) {
        if (s.blinkTimer > 0.14) {
          s.isBlinking = false;
          s.blinkTimer = 0;
        }
      } else {
        if (s.blinkTimer > 3.2 + Math.sin(s.time * 0.5) * 1.5) {
          s.isBlinking = true;
          s.blinkTimer = 0;
        }
      }

      // Handle Petting decay
      if (s.pettingIntensity > 0) {
        s.pettingIntensity = Math.max(0, s.pettingIntensity - dt * 2);
      }

      // Harmonic Animation Math (Natural Subtle Volume-Preserving Physics)
      let anim = s.currentAnimation;
      let breathCycle = Math.sin(s.time * 2.8);
      let walkBob = 0;
      let wagAngle = Math.sin(s.time * 6) * 0.25;
      let squashX = 1;
      let squashY = 1;
      let headTilt = Math.sin(s.time * 1.4) * 0.05;
      let mouthHeight = 0;

      // Species category check
      const isCat = [
        'tabby',
        'calico',
        'siamese',
        'blackcat',
        'bagheera',
        'bengal',
        'mainecoon',
        'british',
        'scottish',
      ].includes(species);
      const isDog = [
        'shiba',
        'retriever',
        'husky',
        'bulldog',
        'ignis',
        'germanshepherd',
        'rottweiler',
        'doberman',
        'corgi',
      ].includes(species);

      if (anim === 'idle') {
        squashX = 1 + breathCycle * 0.02;
        squashY = 1 - breathCycle * 0.02;
        s.bounceY = -breathCycle * 2.5;
        if (isDog) {
          wagAngle = Math.sin(s.time * 4) * 0.2; // Gentle puppy wag
        }
      } else if (anim === 'walk' || anim === 'fetch') {
        s.walkCycle += dt * 8;
        walkBob = Math.abs(Math.sin(s.walkCycle)) * 8;
        s.bounceY = -walkBob;
        wagAngle = Math.sin(s.walkCycle * 1.2) * 0.4;
        squashX = 1 + Math.sin(s.walkCycle) * 0.025;
        squashY = 1 - Math.sin(s.walkCycle) * 0.025;
      } else if (anim === 'pet') {
        squashX = 1.03;
        squashY = 0.97;
        s.bounceY = 3;
        headTilt = 0.08;
        wagAngle = Math.sin(s.time * 16) * 0.5; // Fast happy wagging
      } else if (anim === 'eat') {
        mouthHeight = (Math.sin(s.time * 12) + 1) * 5; // Fast munching
        squashY = 1 + Math.sin(s.time * 12) * 0.03;
        squashX = 1 - Math.sin(s.time * 12) * 0.02;
        if (Math.random() < 0.2) {
          spawnParticle('crumb', width / 2, height / 2 + 10);
        }
      } else if (anim === 'drink_milk') {
        mouthHeight = (Math.sin(s.time * 14) + 1) * 6;
        squashY = 1 + Math.sin(s.time * 14) * 0.03;
        squashX = 1 - Math.sin(s.time * 14) * 0.02;
        s.bounceY = 5;
        if (Math.random() < 0.25) {
          spawnParticle('milk', width / 2 + (Math.random() - 0.5) * 16, height / 2 + 30);
        }
      } else if (anim === 'bath') {
        squashX = 1 + Math.sin(s.time * 5) * 0.03;
        squashY = 1 - Math.sin(s.time * 5) * 0.03;
        s.bounceY = -Math.abs(Math.sin(s.time * 5)) * 3;
        if (Math.random() < 0.3) {
          spawnParticle('bubble', width / 2 + (Math.random() - 0.5) * 70, height / 2 + 10);
        }
      } else if (anim === 'fart') {
        squashX = 1.04;
        squashY = 0.96;
        s.bounceY = -4;
        headTilt = -0.1;
      } else if (anim === 'talk') {
        // Talking Tom voice mimic lip-sync!
        const vol = s.talkingVolume > 0 ? s.talkingVolume : (Math.sin(s.time * 14) + 1) * 0.45;
        mouthHeight = vol * 12;
        headTilt = Math.sin(s.time * 8) * 0.08;
        s.bounceY = -vol * 4;
        squashY = 1 + vol * 0.04;
        squashX = 1 - vol * 0.02;
      } else if (anim === 'dizzy') {
        // Dizzy head wobble after poking
        headTilt = Math.sin(s.time * 10) * 0.18;
        squashX = 1 + Math.cos(s.time * 10) * 0.03;
        squashY = 1 - Math.cos(s.time * 10) * 0.03;
        s.bounceY = Math.sin(s.time * 8) * 4;
      } else if (anim === 'laugh') {
        // Laughing tickle bounce
        s.bounceY = -Math.abs(Math.sin(s.time * 16)) * 8;
        squashY = 1 + Math.sin(s.time * 16) * 0.04;
        squashX = 1 - Math.sin(s.time * 16) * 0.03;
        headTilt = Math.sin(s.time * 8) * 0.06;
        mouthHeight = 6 + Math.sin(s.time * 16) * 3;
        wagAngle = Math.sin(s.time * 20) * 0.5;
      } else if (anim === 'sleep') {
        squashX = 1.02;
        squashY = 0.98;
        s.bounceY = 4;
        if (Math.random() < 0.02) {
          spawnParticle('sleep', width / 2 + 30, height / 2 - 40, '#93C5FD', 'Z');
        }
      } else if (anim === 'celebrate') {
        const jumpPhase = Math.sin(s.time * 6);
        s.bounceY = jumpPhase < 0 ? jumpPhase * 18 : 0;
        squashY = jumpPhase > 0.8 ? 0.96 : 1.03;
        squashX = jumpPhase > 0.8 ? 1.03 : 0.97;
        if (Math.random() < 0.15) {
          spawnParticle('sparkle', width / 2 + (Math.random() - 0.5) * 80, height / 2);
        }
      } else if (anim === 'drag') {
        squashY = 1.04;
        squashX = 0.97;
        s.bounceY = -10;
      }

      // RESET DPR TRANSFORM AND CLEAR CANVAS
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // PROPORTIONAL UNIFORM GEOMETRY SCALING
      // Canonical reference bounding box is 220px. Both X & Y scale by uniformScale
      // to guarantee zero skewing regardless of container dimensions.
      const baseDim = 220;
      const uniformScale = Math.min(width, height) / baseDim;
      const stageScale = stage === 1 ? 0.88 : stage === 2 ? 1.0 : 1.15;
      const totalScaleX = uniformScale * stageScale * squashX;
      const totalScaleY = uniformScale * stageScale * squashY;

      // CENTER OF CREATURE
      const cx = width / 2;
      const cy = height * 0.53 + s.bounceY * uniformScale;

      // 1. SHADOW UNDER CREATURE
      const shadowWidth = 52 * uniformScale * squashX;
      const shadowHeight = 12 * uniformScale * squashY;
      const shadowY = cy + 42 * uniformScale;
      const shadowGrad = ctx.createRadialGradient(
        cx,
        shadowY,
        0,
        cx,
        shadowY,
        shadowWidth
      );
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(cx, shadowY, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. AURA (FOR TITAN STAGE OR BUFFED)
      if (stage === 3 || showAura) {
        ctx.save();
        const auraRadius = 85 * uniformScale;
        const auraGrad = ctx.createRadialGradient(cx, cy - 8 * uniformScale, 20 * uniformScale, cx, cy - 8 * uniformScale, auraRadius);
        const auraColor = isCat
          ? 'rgba(6, 182, 212, '
          : isDog
          ? 'rgba(234, 179, 8, '
          : 'rgba(204, 255, 0, ';
        const pulse = 0.25 + Math.sin(s.time * 3) * 0.12;
        auraGrad.addColorStop(0, `${auraColor}${pulse})`);
        auraGrad.addColorStop(0.7, `${auraColor}${pulse * 0.4})`);
        auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 8 * uniformScale, auraRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. DRAW PET BODY (REALISTIC PHOTO PORTRAIT OR PROCEDURAL FALLBACK)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(totalScaleX, totalScaleY);
      ctx.rotate(headTilt);

      if (renderMode === 'photo' && imgRef.current && imgLoaded) {
        // --- REALISTIC HIGH-FIDELITY PHOTO AVATAR ---
        const petRadius = 52;

        // Soft aura shadow
        ctx.save();
        ctx.shadowColor = isCat ? 'rgba(6, 182, 212, 0.45)' : 'rgba(204, 255, 0, 0.45)';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(0, -6, petRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#0F131D';
        ctx.fill();
        ctx.restore();

        // Draw clipped realistic photo
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, -6, petRadius, 0, Math.PI * 2);
        ctx.clip();

        const img = imgRef.current;
        const iAspect = img.width / img.height;
        let dw = petRadius * 2;
        let dh = petRadius * 2;
        let dx = -petRadius;
        let dy = -petRadius - 6;
        if (iAspect > 1) {
          dw = dh * iAspect;
          dx = -dw / 2;
        } else {
          dh = dw / iAspect;
          dy = -dh / 2 - 6;
        }
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();

        // Premium Neon Halo Ring
        ctx.strokeStyle = isCat ? '#06B6D4' : '#CCFF00';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, -6, petRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Talking Tom voice acoustic ripples
        if (s.talkingVolume > 0.05) {
          const waveRadius = petRadius + 6 + s.talkingVolume * 16;
          ctx.strokeStyle = `rgba(204, 255, 0, ${Math.min(1, s.talkingVolume * 1.6)})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, -6, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Accessories: Shades & Glasses
        if (customFeatures?.glasses === 'shades') {
          ctx.save();
          ctx.fillStyle = '#0F172A';
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2;
          [-16, 16].forEach((gx) => {
            ctx.beginPath();
            ctx.roundRect(gx - 13, -16, 26, 16, 5);
            ctx.fill();
            ctx.stroke();
          });
          ctx.beginPath();
          ctx.moveTo(-4, -9);
          ctx.lineTo(4, -9);
          ctx.stroke();
          ctx.restore();
        } else if (customFeatures?.glasses === 'vr') {
          ctx.save();
          ctx.fillStyle = '#1E1B4B';
          ctx.strokeStyle = '#CCFF00';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect(-26, -16, 52, 18, 5);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#00F0FF';
          ctx.beginPath();
          ctx.roundRect(-22, -9, 44, 5, 2);
          ctx.fill();
          ctx.restore();
        }

        // Accessories: Hats & Crowns
        if (customFeatures?.hat === 'crown') {
          ctx.save();
          ctx.fillStyle = '#F59E0B';
          ctx.strokeStyle = '#B45309';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-22, -petRadius - 2);
          ctx.lineTo(-24, -petRadius - 24);
          ctx.lineTo(-11, -petRadius - 10);
          ctx.lineTo(0, -petRadius - 28);
          ctx.lineTo(11, -petRadius - 10);
          ctx.lineTo(24, -petRadius - 24);
          ctx.lineTo(22, -petRadius - 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(0, -petRadius - 12, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (customFeatures?.hat === 'party') {
          ctx.save();
          ctx.fillStyle = '#EC4899';
          ctx.beginPath();
          ctx.moveTo(0, -petRadius - 32);
          ctx.lineTo(-16, -petRadius);
          ctx.lineTo(16, -petRadius);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#CCFF00';
          ctx.beginPath();
          ctx.arc(0, -petRadius - 34, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (customFeatures?.hat === 'detective') {
          ctx.save();
          ctx.fillStyle = '#78350F';
          ctx.beginPath();
          ctx.ellipse(0, -petRadius - 2, 26, 7, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(0, -petRadius - 7, 16, Math.PI, 0);
          ctx.fill();
          ctx.restore();
        }
      } else {
        // COLOR PALETTES FOR SPECIES
        let primaryColor = '#D97706'; // Shiba Inu default
      let secondaryColor = '#B45309';
      let bellyColor = '#FEF3C7';
      let earColor = '#F472B6'; // Pink inner ear
      let eyeColor = '#451A03';
      let noseColor = '#1C1917';

      // --- CATS ---
      if (species === 'tabby') {
        // Orange Tabby Cat
        primaryColor = '#EA580C';
        secondaryColor = '#C2410C';
        bellyColor = '#FFEDD5';
        earColor = '#FDA4AF';
        eyeColor = '#15803D'; // Emerald cat eyes
        noseColor = '#FB7185'; // Pink cat nose
      } else if (species === 'bengal') {
        // Bengal Leopard Cat
        primaryColor = '#D97706';
        secondaryColor = '#78350F';
        bellyColor = '#FEF3C7';
        earColor = '#FDA4AF';
        eyeColor = '#16A34A'; // Emerald green
        noseColor = '#FB7185';
      } else if (species === 'mainecoon') {
        // Maine Coon Giant Cat
        primaryColor = '#64748B';
        secondaryColor = '#334155';
        bellyColor = '#F1F5F9';
        earColor = '#FDA4AF';
        eyeColor = '#F59E0B'; // Rich gold
        noseColor = '#FB7185';
      } else if (species === 'british') {
        // British Shorthair
        primaryColor = '#64748B';
        secondaryColor = '#475569';
        bellyColor = '#94A3B8';
        earColor = '#FDA4AF';
        eyeColor = '#EA580C'; // Vivid copper
        noseColor = '#475569';
      } else if (species === 'scottish') {
        // Scottish Fold
        primaryColor = '#E2E8F0';
        secondaryColor = '#CBD5E1';
        bellyColor = '#FFFFFF';
        earColor = '#FDA4AF';
        eyeColor = '#FBBF24'; // Bright amber
        noseColor = '#FB7185';
      } else if (species === 'calico') {
        // Calico Cat
        primaryColor = '#F8FAFC'; // White body
        secondaryColor = '#EA580C'; // Ginger patch
        bellyColor = '#FFFFFF';
        earColor = '#FDA4AF';
        eyeColor = '#059669';
        noseColor = '#FB7185';
      } else if (species === 'siamese') {
        // Siamese Cat
        primaryColor = '#FEF3C7'; // Cream coat
        secondaryColor = '#451A03'; // Chocolate seal point
        bellyColor = '#FFFBEB';
        earColor = '#292524';
        eyeColor = '#0284C7'; // Sapphire blue eyes
        noseColor = '#292524';
      } else if (species === 'blackcat' || species === 'bagheera') {
        // Black Cat / Shadow Panther
        primaryColor = '#0F172A';
        secondaryColor = '#1E293B';
        bellyColor = '#334155';
        earColor = '#38BDF8';
        eyeColor = '#FACC15'; // Glowing gold eyes
        noseColor = '#0F172A';
      }
      // --- DOGS ---
      else if (species === 'germanshepherd') {
        // German Shepherd
        primaryColor = '#C27803';
        secondaryColor = '#1E293B';
        bellyColor = '#FEF3C7';
        earColor = '#92400E';
        eyeColor = '#78350F';
        noseColor = '#0F172A';
      } else if (species === 'rottweiler') {
        // Rottweiler
        primaryColor = '#0F172A';
        secondaryColor = '#B45309';
        bellyColor = '#1E293B';
        earColor = '#78350F';
        eyeColor = '#451A03';
        noseColor = '#020617';
      } else if (species === 'doberman') {
        // Doberman Pinscher
        primaryColor = '#0A0F1D';
        secondaryColor = '#B45309';
        bellyColor = '#1E293B';
        earColor = '#78350F';
        eyeColor = '#451A03';
        noseColor = '#020617';
      } else if (species === 'corgi') {
        // Welsh Corgi
        primaryColor = '#EA580C';
        secondaryColor = '#C2410C';
        bellyColor = '#FFFFFF';
        earColor = '#FDBA74';
        eyeColor = '#451A03';
        noseColor = '#1C1917';
      } else if (species === 'shiba') {
        // Shiba Inu
        primaryColor = '#D97706';
        secondaryColor = '#B45309';
        bellyColor = '#FEF3C7';
        earColor = '#FEF3C7';
        eyeColor = '#292524';
        noseColor = '#0F172A';
      } else if (species === 'retriever') {
        // Golden Retriever
        primaryColor = '#F59E0B';
        secondaryColor = '#D97706';
        bellyColor = '#FEF3C7';
        earColor = '#D97706';
        eyeColor = '#451A03';
        noseColor = '#1C1917';
      } else if (species === 'husky') {
        // Siberian Husky
        primaryColor = '#334155';
        secondaryColor = '#1E293B';
        bellyColor = '#F8FAFC';
        earColor = '#CBD5E1';
        eyeColor = '#38BDF8'; // Icy arctic blue eyes
        noseColor = '#0F172A';
      } else if (species === 'bulldog') {
        // French Bulldog
        primaryColor = '#94A3B8';
        secondaryColor = '#64748B';
        bellyColor = '#E2E8F0';
        earColor = '#F472B6';
        eyeColor = '#1E293B';
        noseColor = '#0F172A';
      }
      // --- MYTHIC BEASTS ---
      else if (species === 'kodiak') {
        primaryColor = '#854D0E';
        secondaryColor = '#A16207';
        bellyColor = '#FEF08A';
        earColor = '#713F12';
        eyeColor = '#0F172A';
        noseColor = '#1C1917';
      } else if (species === 'ignis') {
        primaryColor = '#B91C1C';
        secondaryColor = '#DC2626';
        bellyColor = '#FED7AA';
        earColor = '#7F1D1D';
        eyeColor = '#FBBF24';
        noseColor = '#450A0A';
      } else if (species === 'sultan') {
        primaryColor = '#D97706';
        secondaryColor = '#F59E0B';
        bellyColor = '#FEF3C7';
        earColor = '#92400E';
        eyeColor = '#10B981';
        noseColor = '#78350F';
      }

      const curPalette = customPaletteRef.current || customPalette;
      const curFeatures = customFeaturesRef.current || customFeatures;

      // Custom User Photo Avatar / DNA Builder Palette Override
      if (curPalette) {
        if (curPalette.primary) primaryColor = curPalette.primary;
        if (curPalette.secondary) secondaryColor = curPalette.secondary;
        if (curPalette.belly) bellyColor = curPalette.belly;
        if (curPalette.ear) earColor = curPalette.ear;
        if (curPalette.eye) eyeColor = curPalette.eye;
        if (curPalette.nose) noseColor = curPalette.nose;
      }

      // (Stage scaling is cleanly incorporated into totalScaleX / totalScaleY above)

      // A. TAIL (BEHIND BODY)
      ctx.save();
      ctx.translate(35, 15);
      ctx.rotate(wagAngle);
      ctx.fillStyle = primaryColor;
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 3;

      ctx.beginPath();
      if (isCat) {
        // Long sleek curled cat tail
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(25, -15, 38, -48, 22, -58);
        ctx.bezierCurveTo(16, -48, 12, -20, 0, 0);
        ctx.fill();
      } else if (species === 'shiba') {
        // Curled fluffy Shiba donut tail
        ctx.arc(0, -18, 16, 0, Math.PI * 1.6);
        ctx.lineWidth = 14;
        ctx.strokeStyle = primaryColor;
        ctx.stroke();
        // White tip
        ctx.fillStyle = bellyColor;
        ctx.beginPath();
        ctx.arc(14, -26, 7, 0, Math.PI * 2);
        ctx.fill();
      } else if (species === 'bulldog') {
        // Short cute stubby corkscrew tail
        ctx.beginPath();
        ctx.arc(6, -2, 8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Long bushy dog / wolf tail
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(35, -10, 45, -35);
        ctx.quadraticCurveTo(20, -15, 0, 0);
        ctx.fill();
      }
      ctx.restore();

      // B. BACK LEGS / PAWS
      ctx.fillStyle = secondaryColor;
      ctx.beginPath();
      ctx.ellipse(-38, 38, 16, 12, -0.2, 0, Math.PI * 2);
      ctx.ellipse(38, 38, 16, 12, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // C. MAIN BODY TORSO
      const bodyGrad = ctx.createLinearGradient(0, -40, 0, 45);
      bodyGrad.addColorStop(0, secondaryColor);
      bodyGrad.addColorStop(1, primaryColor);
      ctx.fillStyle = bodyGrad;

      ctx.beginPath();
      ctx.moveTo(-45, 25);
      ctx.bezierCurveTo(-55, -20, -35, -45, 0, -45);
      ctx.bezierCurveTo(35, -45, 55, -20, 45, 25);
      ctx.bezierCurveTo(40, 50, -40, 50, -45, 25);
      ctx.fill();

      // Calico patches
      if (species === 'calico') {
        ctx.fillStyle = '#EA580C'; // Ginger patch
        ctx.beginPath();
        ctx.ellipse(-24, 10, 16, 14, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0F172A'; // Black patch
        ctx.beginPath();
        ctx.ellipse(26, 18, 14, 12, -0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // D. BELLY PATCH
      ctx.fillStyle = bellyColor;
      ctx.beginPath();
      ctx.ellipse(0, 12, 25, 26, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tabby stripes
      if (species === 'tabby') {
        ctx.strokeStyle = '#9A3412';
        ctx.lineWidth = 2.5;
        [-12, 0, 12].forEach((offsetY) => {
          ctx.beginPath();
          ctx.moveTo(-38, offsetY);
          ctx.lineTo(-24, offsetY + 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(38, offsetY);
          ctx.lineTo(24, offsetY + 2);
          ctx.stroke();
        });
      }

      // E. HEAD
      const headGrad = ctx.createRadialGradient(0, -32, 10, 0, -32, 45);
      headGrad.addColorStop(0, secondaryColor);
      headGrad.addColorStop(1, primaryColor);
      ctx.fillStyle = headGrad;

      ctx.beginPath();
      ctx.ellipse(0, -32, 42, 36, 0, 0, Math.PI * 2);
      ctx.fill();

      // F. EARS
      const earTwitch = Math.sin(s.time * 8) * (s.pettingIntensity > 0 ? 0.2 : 0.05);

      if (curFeatures?.earType === 'floppy') {
        [-1, 1].forEach((side) => {
          ctx.save();
          ctx.translate(side * 36, -42);
          ctx.rotate(side * (0.15 + earTwitch));
          ctx.fillStyle = primaryColor;
          ctx.beginPath();
          ctx.ellipse(0, 16, 14, 26, side * 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = earColor;
          ctx.beginPath();
          ctx.ellipse(0, 15, 8, 17, side * 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else if (curFeatures?.earType === 'pointed') {
        [-1, 1].forEach((side) => {
          ctx.save();
          ctx.translate(side * 28, -58);
          ctx.rotate(side * (0.24 - earTwitch));
          ctx.fillStyle = primaryColor;
          ctx.beginPath();
          ctx.moveTo(-14, 15);
          ctx.lineTo(0, -26);
          ctx.lineTo(14, 15);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = earColor;
          ctx.beginPath();
          ctx.moveTo(-7, 12);
          ctx.lineTo(0, -18);
          ctx.lineTo(7, 12);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
      } else if (curFeatures?.earType === 'round') {
        [-1, 1].forEach((side) => {
          ctx.save();
          ctx.translate(side * 30, -56);
          ctx.fillStyle = primaryColor;
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = earColor;
          ctx.beginPath();
          ctx.arc(0, 2, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else if (isCat) {
        if (species === 'scottish') {
          // Scottish Fold flat-folded rounded ears
          [-1, 1].forEach((side) => {
            ctx.save();
            ctx.translate(side * 28, -52);
            ctx.rotate(side * 0.65);
            ctx.fillStyle = primaryColor;
            ctx.beginPath();
            ctx.ellipse(0, 0, 13, 11, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = earColor;
            ctx.beginPath();
            ctx.ellipse(0, 2, 7, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
        } else if (species === 'mainecoon') {
          // Pointed Maine Coon lynx ears with top fur tufts
          [-1, 1].forEach((side) => {
            ctx.save();
            ctx.translate(side * 28, -60);
            ctx.rotate(side * (0.22 - earTwitch));
            ctx.fillStyle = primaryColor;
            ctx.beginPath();
            ctx.moveTo(-16, 14);
            ctx.lineTo(0, -32);
            ctx.lineTo(16, 14);
            ctx.closePath();
            ctx.fill();

            // Fur tuft at ear tip
            ctx.strokeStyle = '#F1F5F9';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(0, -32);
            ctx.lineTo(side * 5, -40);
            ctx.stroke();

            // Pink inner
            ctx.fillStyle = earColor;
            ctx.beginPath();
            ctx.moveTo(-9, 10);
            ctx.lineTo(0, -22);
            ctx.lineTo(9, 10);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          });
        } else {
          // Pointed Cat Ears with Pink Inner Ear (Tabby, Bengal, British, Siamese, Blackcat)
          [-1, 1].forEach((side) => {
            ctx.save();
            ctx.translate(side * 28, -58);
            ctx.rotate(side * (0.25 - earTwitch));
            ctx.fillStyle = primaryColor;
            ctx.beginPath();
            ctx.moveTo(-14, 14);
            ctx.lineTo(0, -26);
            ctx.lineTo(14, 14);
            ctx.closePath();
            ctx.fill();

            // Pink inside
            ctx.fillStyle = earColor;
            ctx.beginPath();
            ctx.moveTo(-8, 10);
            ctx.lineTo(0, -18);
            ctx.lineTo(8, 10);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          });
        }
      } else if (species === 'corgi') {
        // Big perky Corgi fox ears!
        [-1, 1].forEach((side) => {
          ctx.save();
          ctx.translate(side * 30, -56);
          ctx.rotate(side * (0.22 - earTwitch));
          ctx.fillStyle = primaryColor;
          ctx.beginPath();
          ctx.ellipse(0, -12, 16, 26, side * 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = earColor;
          ctx.beginPath();
          ctx.ellipse(0, -10, 10, 18, side * 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else if (species === 'retriever' || species === 'rottweiler') {
        // Floppy Ears
        [-1, 1].forEach((side) => {
          ctx.save();
          ctx.translate(side * 36, -42);
          ctx.rotate(side * (0.15 + earTwitch));
          ctx.fillStyle = secondaryColor;
          ctx.beginPath();
          ctx.ellipse(0, 14, 14, 24, side * 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else if (species === 'bulldog') {
        // Big round bat ears (Frenchie style)
        [-1, 1].forEach((side) => {
          ctx.save();
          ctx.translate(side * 32, -62);
          ctx.rotate(side * 0.2);
          ctx.fillStyle = primaryColor;
          ctx.beginPath();
          ctx.ellipse(0, 0, 16, 22, side * 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = earColor;
          ctx.beginPath();
          ctx.ellipse(0, 2, 10, 15, side * 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else if (species === 'germanshepherd' || species === 'doberman') {
        // High alert tall perky ears
        [-1, 1].forEach((side) => {
          ctx.save();
          ctx.translate(side * 28, -62);
          ctx.rotate(side * (0.16 - earTwitch));
          ctx.fillStyle = primaryColor;
          ctx.beginPath();
          ctx.moveTo(-16, 16);
          ctx.lineTo(0, -32);
          ctx.lineTo(16, 16);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = earColor;
          ctx.beginPath();
          ctx.moveTo(-9, 10);
          ctx.lineTo(0, -22);
          ctx.lineTo(9, 10);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
      } else if (species === 'kodiak') {
        // Round Bear ears
        [-1, 1].forEach((side) => {
          ctx.fillStyle = primaryColor;
          ctx.beginPath();
          ctx.arc(side * 32, -62, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = bellyColor;
          ctx.beginPath();
          ctx.arc(side * 32, -62, 9, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        // Perky Puppy / Wolf / Shiba Ears
        [-1, 1].forEach((side) => {
          ctx.save();
          ctx.translate(side * 28, -58);
          ctx.rotate(side * (0.2 - earTwitch));
          ctx.fillStyle = primaryColor;
          ctx.beginPath();
          ctx.moveTo(-16, 12);
          ctx.lineTo(0, -28);
          ctx.lineTo(16, 12);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = bellyColor;
          ctx.beginPath();
          ctx.moveTo(-9, 8);
          ctx.lineTo(0, -18);
          ctx.lineTo(9, 8);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
      }

      // DISTINCT BREED MASKS & FACIAL MARKINGS
      if (species === 'husky') {
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.ellipse(0, -26, 32, 22, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (species === 'siamese') {
        ctx.fillStyle = '#451A03';
        ctx.beginPath();
        ctx.ellipse(0, -28, 26, 20, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (species === 'germanshepherd') {
        // German Shepherd black muzzle mask
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.ellipse(0, -24, 25, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (species === 'corgi') {
        // Corgi white blaze between eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(-6, -14);
        ctx.lineTo(0, -42);
        ctx.lineTo(6, -14);
        ctx.closePath();
        ctx.fill();
      } else if (species === 'rottweiler' || species === 'doberman') {
        // Distinct tan eyebrow dots above eyes
        ctx.fillStyle = '#B45309';
        ctx.beginPath();
        ctx.ellipse(-20, -50, 4.5, 3.2, -0.2, 0, Math.PI * 2);
        ctx.ellipse(20, -50, 4.5, 3.2, 0.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (species === 'bengal') {
        // Leopard rosettes on cheeks
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 2;
        [-1, 1].forEach((side) => {
          ctx.beginPath();
          ctx.arc(side * 25, -24, 4, 0, Math.PI * 1.5);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(side * 28, -34, 3.5, 0.5, Math.PI * 2);
          ctx.stroke();
        });
      }

      // G. MUZZLE & SNOUT
      ctx.fillStyle = bellyColor;
      ctx.beginPath();
      ctx.ellipse(0, -20, 22, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // CAT & CUSTOM WHISKERS
      const shouldDrawWhiskers = curFeatures?.hasWhiskers !== undefined ? curFeatures.hasWhiskers : isCat;
      if (shouldDrawWhiskers) {
        ctx.strokeStyle = species === 'blackcat' ? '#94A3B8' : '#78716C';
        ctx.lineWidth = 1.8;
        // Left whiskers
        [-6, 0, 6].forEach((dy, i) => {
          ctx.beginPath();
          ctx.moveTo(-14, -20 + dy);
          ctx.lineTo(-44, -24 + dy + i * 2);
          ctx.stroke();
        });
        // Right whiskers
        [-6, 0, 6].forEach((dy, i) => {
          ctx.beginPath();
          ctx.moveTo(14, -20 + dy);
          ctx.lineTo(44, -24 + dy + i * 2);
          ctx.stroke();
        });
      }

      // NOSE
      ctx.fillStyle = noseColor;
      ctx.beginPath();
      ctx.ellipse(0, -25, isCat ? 6 : 8, isCat ? 4.5 : 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // MOUTH & TONGUE
      ctx.strokeStyle = noseColor;
      ctx.lineWidth = 2.5;

      if ((anim === 'eat' || anim === 'talk' || anim === 'drink_milk') && mouthHeight > 1) {
        // Open talking / eating mouth
        ctx.fillStyle = '#991B1B';
        ctx.beginPath();
        ctx.ellipse(0, -17 + mouthHeight * 0.3, 9, mouthHeight, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pink tongue inside
        ctx.fillStyle = '#F472B6';
        ctx.beginPath();
        ctx.ellipse(0, -14 + mouthHeight * 0.4, 6, mouthHeight * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (isDog && (anim === 'idle' || anim === 'pet' || anim === 'laugh')) {
        // Smiling dog mouth with panting tongue!
        ctx.beginPath();
        ctx.moveTo(-10, -18);
        ctx.quadraticCurveTo(-4, -13, 0, -17);
        ctx.quadraticCurveTo(4, -13, 10, -18);
        ctx.stroke();

        // Adorable sticking out pink tongue
        ctx.fillStyle = '#FB7185';
        ctx.beginPath();
        const tongueBob = Math.sin(s.time * 8) * 2;
        ctx.ellipse(0, -12 + tongueBob, 6, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#E11D48';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -14 + tongueBob);
        ctx.lineTo(0, -9 + tongueBob);
        ctx.stroke();
      } else if (anim === 'sleep') {
        // Sleeping smile
        ctx.beginPath();
        ctx.arc(0, -19, 6, 0.2, Math.PI - 0.2);
        ctx.stroke();
      } else {
        // Cute cat / puppy 'w' mouth
        ctx.beginPath();
        ctx.moveTo(-9, -18);
        ctx.quadraticCurveTo(-4, -14, 0, -18);
        ctx.quadraticCurveTo(4, -14, 9, -18);
        ctx.stroke();
      }

      // H. EYES & GAZE
      const eyeSpacing = 20;
      const eyeY = -36;
      const eyeRadius = stage === 1 ? 9.5 : 8.5;

      const leftEyeX = -eyeSpacing;
      const rightEyeX = eyeSpacing;

      // Custom Eye Patch
      if (curFeatures?.eyePatch) {
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.ellipse(leftEyeX, eyeY, 15, 14, 0.1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Custom Collar
      if (curFeatures?.collarColor) {
        ctx.fillStyle = curFeatures.collarColor;
        ctx.beginPath();
        ctx.roundRect(-22, 0, 44, 7, 3);
        ctx.fill();
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, 8, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (anim === 'dizzy') {
        // Dizzy spiral / X eyes when poked!
        [-1, 1].forEach((dir) => {
          const ex = dir * eyeSpacing;
          ctx.strokeStyle = '#0F172A';
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';
          // X eyes
          ctx.beginPath();
          ctx.moveTo(ex - 6, eyeY - 6);
          ctx.lineTo(ex + 6, eyeY + 6);
          ctx.moveTo(ex + 6, eyeY - 6);
          ctx.lineTo(ex - 6, eyeY + 6);
          ctx.stroke();
        });

        // Circling stars above head
        for (let i = 0; i < 3; i++) {
          const starAngle = s.time * 6 + (i * Math.PI * 2) / 3;
          const sx = Math.cos(starAngle) * 36;
          const sy = Math.sin(starAngle) * 12 - 70;
          ctx.fillStyle = '#FBBF24';
          ctx.beginPath();
          ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (
        s.isBlinking ||
        anim === 'pet' ||
        anim === 'sleep' ||
        anim === 'laugh'
      ) {
        // Happy closed smiling eyes ^_^
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.arc(leftEyeX, eyeY, 8, 1.2 * Math.PI, 1.8 * Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(rightEyeX, eyeY, 8, 1.2 * Math.PI, 1.8 * Math.PI);
        ctx.stroke();

        // Cheerful pink blush on cheeks
        ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
        ctx.beginPath();
        ctx.ellipse(-28, -24, 7, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(28, -24, 7, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Open expressive eyes
        [-1, 1].forEach((dir) => {
          const ex = dir * eyeSpacing;

          // Eye base
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(ex, eyeY, eyeRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Iris
          const pupilOffsetX = s.eyeGazeX * 3.5;
          const pupilOffsetY = s.eyeGazeY * 3.5;

          ctx.fillStyle = eyeColor;
          ctx.beginPath();
          ctx.arc(ex + pupilOffsetX, eyeY + pupilOffsetY, eyeRadius * 0.75, 0, Math.PI * 2);
          ctx.fill();

          // Cat slit pupil vs Round puppy pupil
          ctx.fillStyle = '#0F172A';
          ctx.beginPath();
          if (isCat) {
            ctx.ellipse(
              ex + pupilOffsetX,
              eyeY + pupilOffsetY,
              eyeRadius * 0.28,
              eyeRadius * 0.62,
              0,
              0,
              Math.PI * 2
            );
          } else {
            ctx.arc(ex + pupilOffsetX, eyeY + pupilOffsetY, eyeRadius * 0.45, 0, Math.PI * 2);
          }
          ctx.fill();

          // Specular high shine
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(ex + pupilOffsetX - 2.5, eyeY + pupilOffsetY - 2.5, 2.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ex + pupilOffsetX + 2, eyeY + pupilOffsetY + 2, 1.2, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // I. FRONT PAWS (RESTING ON FRONT)
      ctx.fillStyle = secondaryColor;
      ctx.beginPath();
      ctx.ellipse(-20, 28, 12, 10, -0.1, 0, Math.PI * 2);
      ctx.ellipse(20, 28, 12, 10, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Pad details
      ctx.fillStyle = bellyColor;
      ctx.beginPath();
      ctx.arc(-20, 30, 4.5, 0, Math.PI * 2);
      ctx.arc(20, 30, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Milk Bowl (if drinking milk)
      if (anim === 'drink_milk') {
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.ellipse(0, 42, 28, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(0, 40, 22, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Soap Bubbles on Head (if bath)
      if (anim === 'bath') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        [-12, 0, 12].forEach((bx, idx) => {
          ctx.beginPath();
          ctx.arc(bx, -62 - (idx % 2) * 5, 10, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Glasses / Shades Accessory
      if (curFeatures?.glasses === 'shades') {
        ctx.save();
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        [-1, 1].forEach((dir) => {
          const ex = dir * eyeSpacing;
          ctx.beginPath();
          ctx.roundRect(ex - 12, eyeY - 8, 24, 16, 5);
          ctx.fill();
          ctx.stroke();
        });
        ctx.beginPath();
        ctx.moveTo(-eyeSpacing + 12, eyeY);
        ctx.lineTo(eyeSpacing - 12, eyeY);
        ctx.stroke();
        ctx.restore();
      } else if (curFeatures?.glasses === 'vr') {
        ctx.save();
        ctx.fillStyle = '#1E1B4B';
        ctx.strokeStyle = '#CCFF00';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-28, eyeY - 10, 56, 20, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#00F0FF';
        ctx.beginPath();
        ctx.roundRect(-24, eyeY - 3, 48, 6, 2);
        ctx.fill();
        ctx.restore();
      }

      // Hats Accessory
      if (curFeatures?.hat === 'crown') {
        ctx.save();
        ctx.fillStyle = '#F59E0B';
        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-18, -48);
        ctx.lineTo(-20, -68);
        ctx.lineTo(-10, -56);
        ctx.lineTo(0, -72);
        ctx.lineTo(10, -56);
        ctx.lineTo(20, -68);
        ctx.lineTo(18, -48);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(0, -56, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (curFeatures?.hat === 'party') {
        ctx.save();
        ctx.fillStyle = '#EC4899';
        ctx.beginPath();
        ctx.moveTo(0, -80);
        ctx.lineTo(-16, -48);
        ctx.lineTo(16, -48);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#CCFF00';
        ctx.beginPath();
        ctx.arc(0, -82, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (curFeatures?.hat === 'detective') {
        ctx.save();
        ctx.fillStyle = '#78350F';
        ctx.beginPath();
        ctx.ellipse(0, -50, 24, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -55, 15, Math.PI, 0);
        ctx.fill();
        ctx.restore();
      }

      // TITAN STAGE 3 CRYSTAL CREST / HORNS
      if (stage === 3) {
        ctx.save();
        ctx.fillStyle = '#CCFF00';
        ctx.shadowColor = '#CCFF00';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(0, -68);
        ctx.lineTo(-6, -50);
        ctx.lineTo(6, -50);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

      ctx.restore(); // Restore main transform

      // 4. PARTICLES RENDERING
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt * 1.5;
        p.alpha = Math.max(0, p.life);

        if (p.life <= 0) {
          s.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (p.type === 'heart') {
          ctx.fillStyle = p.color;
          ctx.translate(p.x, p.y);
          ctx.beginPath();
          const hs = p.size * 0.7;
          ctx.moveTo(0, -hs * 0.4);
          ctx.bezierCurveTo(-hs, -hs * 1.2, -hs * 1.6, hs * 0.4, 0, hs * 1.4);
          ctx.bezierCurveTo(hs * 1.6, hs * 0.4, hs, -hs * 1.2, 0, -hs * 0.4);
          ctx.fill();
        } else if (p.type === 'bubble') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.fillStyle = 'rgba(103, 232, 249, 0.25)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Bubble sheen
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'star') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'sleep' && p.text) {
          ctx.fillStyle = p.color;
          ctx.font = 'bold 16px monospace';
          ctx.fillText(p.text, p.x, p.y);
        } else if (p.type === 'sparkle') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'crumb' || p.type === 'milk') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [species, stage, interactive, onStroke, spawnParticle, width, height, showAura]);

  return (
    <div
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`touch-none ${
          interactive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
        }`}
      />
    </div>
  );
};
