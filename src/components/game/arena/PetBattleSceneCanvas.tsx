import React, { useEffect, useRef, useCallback } from 'react';
import { Animal } from '../../../data/animals';
import { mapBeastToSpecies } from '../../../utils/petVisuals';
import { PetSpecies } from '../../../types/pet';
import { sound } from '../../../utils/audio';

export type ArenaTheme = 'stadium' | 'cyber' | 'dojo';

export interface BattleAction {
  id: number;
  attacker: 'player' | 'opponent';
  type: 'pounce' | 'bite' | 'shield' | 'bark' | 'slam';
  damage?: number;
  isCrit?: boolean;
  isBlocked?: boolean;
}

export interface PetBattleSceneCanvasProps {
  playerPet: Animal;
  opponentPet: Animal;
  playerHp: number;
  maxPlayerHp: number;
  opponentHp: number;
  maxOpponentHp: number;
  isPlayerShielded: boolean;
  isOpponentShielded: boolean;
  arenaTheme: ArenaTheme;
  currentAction: BattleAction | null;
  onActionComplete?: () => void;
  className?: string;
  battleMode?: '1v1' | '2v2';
  playerAllyPet?: Animal | null;
  opponentAllyPet?: Animal | null;
  playerAllyHp?: number;
  maxPlayerAllyHp?: number;
  opponentAllyHp?: number;
  maxOpponentAllyHp?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'dust' | 'shockwave' | 'sonic' | 'petal' | 'text' | 'slash' | 'ember';
  text?: string;
  angle?: number;
  spin?: number;
}

interface Afterimage {
  x: number;
  y: number;
  jumpY: number;
  facingRight: boolean;
  scaleX: number;
  scaleY: number;
  species: PetSpecies;
  color: string;
  alpha: number;
}

interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  angle: number;
  spin: number;
}

export const PetBattleSceneCanvas: React.FC<PetBattleSceneCanvasProps> = ({
  playerPet,
  opponentPet,
  playerHp,
  maxPlayerHp,
  opponentHp,
  maxOpponentHp,
  isPlayerShielded,
  isOpponentShielded,
  arenaTheme = 'stadium',
  currentAction,
  onActionComplete,
  className = '',
  battleMode = '1v1',
  playerAllyPet,
  opponentAllyPet,
  playerAllyHp = 1000,
  maxPlayerAllyHp = 1000,
  opponentAllyHp = 1000,
  maxOpponentAllyHp = 1000,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Combat Animation, Dynamic Camera & Physics State
  const stateRef = useRef({
    time: 0,
    particles: [] as Particle[],
    afterimages: [] as Afterimage[],
    weatherParticles: [] as WeatherParticle[],
    afterimageSpawnTimer: 0,

    // Dynamic Action Camera
    cameraShake: 0,
    cameraShakeX: 0,
    cameraShakeY: 0,
    cameraZoom: 1.0,
    targetZoom: 1.0,
    cameraPanX: 0,
    cameraPanY: 0,
    targetPanX: 0,
    targetPanY: 0,

    // Hit-Stop Freeze Frame (45ms - 70ms visceral impact pause)
    hitStopTimer: 0,

    // Chromatic Aberration flash timer
    chromaticFlash: 0,

    action: null as BattleAction | null,
    actionProgress: 0, // 0 to 1
    actionDuration: 0.7, // seconds
    hasDealtDamage: false,

    // Player Fighter Physics & Skeletal Animation
    player: {
      xRatio: 0.25,
      yRatio: 0.72,
      baseX: 0,
      baseY: 0,
      currentX: 0,
      currentY: 0,
      jumpY: 0,
      recoilX: 0,
      scaleX: 1,
      scaleY: 1,
      isFlinching: false,
      flinchTimer: 0,
      breathCycle: 0,
      tailAngle: 0,
      blinkTimer: 0,
      isBlinking: false,
    },

    // Opponent Fighter Physics & Skeletal Animation
    opponent: {
      xRatio: 0.75,
      yRatio: 0.60,
      baseX: 0,
      baseY: 0,
      currentX: 0,
      currentY: 0,
      jumpY: 0,
      recoilX: 0,
      scaleX: 1,
      scaleY: 1,
      isFlinching: false,
      flinchTimer: 0,
      breathCycle: 0,
      tailAngle: 0,
      blinkTimer: 0,
      isBlinking: false,
    },
  });

  // Watch for incoming action triggers & adjust Action Camera Targets
  useEffect(() => {
    if (!currentAction) return;
    const s = stateRef.current;
    s.action = currentAction;
    s.actionProgress = 0;
    s.hasDealtDamage = false;

    // Set duration and camera dynamics based on attack type
    if (currentAction.type === 'slam') {
      s.actionDuration = 0.95;
      s.targetZoom = 1.24; // Dramatic zoom in during PET SLAM Overdrive
      // Pan camera toward impact target
      s.targetPanX = currentAction.attacker === 'player' ? 35 : -35;
      s.targetPanY = -15;
    } else if (currentAction.type === 'bite') {
      s.actionDuration = 0.85;
      s.targetZoom = 1.16; // Moderate zoom in on Fierce Bite
      s.targetPanX = currentAction.attacker === 'player' ? 25 : -25;
      s.targetPanY = -10;
    } else if (currentAction.type === 'bark') {
      s.actionDuration = 0.75;
      s.targetZoom = 1.08;
      s.targetPanX = currentAction.attacker === 'player' ? -15 : 15;
      s.targetPanY = 0;
    } else if (currentAction.type === 'shield') {
      s.actionDuration = 0.6;
      s.targetZoom = 1.04;
      s.targetPanX = 0;
      s.targetPanY = 0;
    } else {
      // Pounce
      s.actionDuration = 0.65;
      s.targetZoom = 1.1;
      s.targetPanX = currentAction.attacker === 'player' ? 20 : -20;
      s.targetPanY = -5;
    }
  }, [currentAction]);

  // Spawn Particle Helper
  const spawnParticle = useCallback((p: Partial<Particle> & { x: number; y: number; type: Particle['type'] }) => {
    stateRef.current.particles.push({
      x: p.x,
      y: p.y,
      vx: p.vx ?? (Math.random() - 0.5) * 4,
      vy: p.vy ?? (Math.random() - 0.5) * 4,
      life: p.life ?? 0.6,
      maxLife: p.maxLife ?? (p.life ?? 0.6),
      size: p.size ?? 8,
      color: p.color ?? '#CCFF00',
      type: p.type,
      text: p.text,
      angle: p.angle ?? Math.random() * Math.PI * 2,
      spin: p.spin ?? (Math.random() - 0.5) * 4,
    });
  }, []);

  // Main 60 FPS AAA Canvas Game Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const s = stateRef.current;
      s.time += dt;

      // Handle Device Pixel Ratio for crisp retina rendering
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // =======================================================================
      // HIT-STOP SYSTEM (Visceral Freeze Frame Impact)
      // =======================================================================
      let isHitStopActive = false;
      if (s.hitStopTimer > 0) {
        s.hitStopTimer -= dt;
        isHitStopActive = true;
      }

      // Camera Shake decay
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (s.cameraShake > 0) {
        shakeOffsetX = (Math.random() - 0.5) * s.cameraShake;
        shakeOffsetY = (Math.random() - 0.5) * s.cameraShake;
        s.cameraShake = Math.max(0, s.cameraShake - dt * 28);
      }

      // Spring-physics Camera Zoom & Pan Interpolation
      const zoomSpringRate = 6.5;
      s.cameraZoom += (s.targetZoom - s.cameraZoom) * Math.min(1, dt * zoomSpringRate);
      s.cameraPanX += (s.targetPanX - s.cameraPanX) * Math.min(1, dt * zoomSpringRate);
      s.cameraPanY += (s.targetPanY - s.cameraPanY) * Math.min(1, dt * zoomSpringRate);

      // When no action is running, smoothly return camera to default 1.0x & center
      if (!s.action) {
        s.targetZoom = 1.0;
        s.targetPanX = 0;
        s.targetPanY = 0;
      }

      // Chromatic Aberration flash decay
      if (s.chromaticFlash > 0) {
        s.chromaticFlash = Math.max(0, s.chromaticFlash - dt * 4);
      }

      ctx.save();

      // Apply Dynamic Action Camera: Zoom and Pan centered around battlefield focal point
      const focalCenterX = width * 0.5;
      const focalCenterY = height * 0.58;
      ctx.translate(focalCenterX + shakeOffsetX, focalCenterY + shakeOffsetY);
      ctx.scale(s.cameraZoom, s.cameraZoom);
      ctx.translate(-focalCenterX - s.cameraPanX, -focalCenterY - s.cameraPanY);

      // Setup Base Fighter Coordinates
      const p = s.player;
      const opp = s.opponent;
      p.baseX = width * p.xRatio;
      p.baseY = height * p.yRatio;
      opp.baseX = width * opp.xRatio;
      opp.baseY = height * opp.yRatio;

      // Harmonic Idle Animation with Organic Breathing Bob
      p.breathCycle = Math.sin(s.time * 3.6);
      opp.breathCycle = Math.sin(s.time * 3.4 + 1.2);
      p.tailAngle = Math.sin(s.time * 5.2) * 0.28;
      opp.tailAngle = Math.sin(s.time * 4.4) * 0.22;

      // Procedural Eye Blinking timers (~every 3.5 seconds, blink lasts 0.12s)
      p.blinkTimer += dt;
      if (p.blinkTimer > 3.6) {
        p.isBlinking = p.blinkTimer < 3.74;
        if (p.blinkTimer > 3.75) p.blinkTimer = 0;
      } else {
        p.isBlinking = false;
      }

      opp.blinkTimer += dt;
      if (opp.blinkTimer > 4.1) {
        opp.isBlinking = opp.blinkTimer < 4.24;
        if (opp.blinkTimer > 4.25) opp.blinkTimer = 0;
      } else {
        opp.isBlinking = false;
      }

      // Flinch Decay
      if (p.flinchTimer > 0) p.flinchTimer -= dt;
      if (opp.flinchTimer > 0) opp.flinchTimer -= dt;

      // =======================================================================
      // COMBAT ACTION SEQUENCE INTERPOLATION (WITH SQUASH & STRETCH)
      // =======================================================================
      let playerTargetX = p.baseX;
      let playerTargetY = p.baseY;
      let oppTargetX = opp.baseX;
      let oppTargetY = opp.baseY;
      p.jumpY = 0;
      opp.jumpY = 0;
      p.scaleX = 1;
      p.scaleY = 1;
      opp.scaleX = 1;
      opp.scaleY = 1;

      if (s.action) {
        // Freeze progress if hit-stop is active
        if (!isHitStopActive) {
          s.actionProgress += dt / s.actionDuration;
        }

        const progress = Math.min(1, s.actionProgress);
        const isPlayerAttacking = s.action.attacker === 'player';
        const type = s.action.type;

        // Spawn Afterimage Trail during fast rush/leaps
        s.afterimageSpawnTimer += dt;
        if (s.afterimageSpawnTimer > 0.045 && (type === 'pounce' || type === 'slam')) {
          s.afterimageSpawnTimer = 0;
          const activePet = isPlayerAttacking ? playerPet : opponentPet;
          const activeCoords = isPlayerAttacking
            ? { x: p.currentX, jumpY: p.jumpY, scaleX: p.scaleX, scaleY: p.scaleY, facingRight: true }
            : { x: opp.currentX, jumpY: opp.jumpY, scaleX: opp.scaleX, scaleY: opp.scaleY, facingRight: false };

          s.afterimages.push({
            x: activeCoords.x,
            y: (isPlayerAttacking ? p.baseY : opp.baseY),
            jumpY: activeCoords.jumpY,
            facingRight: activeCoords.facingRight,
            scaleX: activeCoords.scaleX,
            scaleY: activeCoords.scaleY,
            species: mapBeastToSpecies(activePet.breed || activePet.species),
            color: isPlayerAttacking ? '#CCFF00' : '#EF4444',
            alpha: 0.45,
          });
        }

        if (isPlayerAttacking) {
          // --- PLAYER ATTACKING OPPONENT ---
          if (type === 'pounce' || type === 'bite') {
            if (progress < 0.2) {
              // Windup: Anticipatory Crouch Squash
              const crouchPct = progress / 0.2;
              p.scaleY = 1 - crouchPct * 0.24; // 0.76
              p.scaleX = 1 + crouchPct * 0.22; // 1.22
              playerTargetX = p.baseX - crouchPct * 16;
            } else if (progress < 0.55) {
              // Forward Dash: Stretch along velocity vector
              const rushPct = (progress - 0.2) / 0.35;
              p.scaleX = 1.25 - rushPct * 0.2;
              p.scaleY = 0.85 + rushPct * 0.2;
              playerTargetX = p.baseX + (opp.baseX - p.baseX - 45) * rushPct;
              p.jumpY = -Math.sin(rushPct * Math.PI) * 28;

              // Strike Impact at rush apex (~0.55)
              if (!s.hasDealtDamage && rushPct > 0.85) {
                s.hasDealtDamage = true;
                opp.flinchTimer = 0.38;
                opp.recoilX = 38;
                s.cameraShake = type === 'bite' ? 10 : 7;
                s.hitStopTimer = type === 'bite' ? 0.065 : 0.05; // Hit-stop pause
                s.chromaticFlash = 0.25;

                // Flinch squash on opponent
                opp.scaleX = 0.82;
                opp.scaleY = 1.22;

                // Impact FX: Sparks & Slash
                const impactX = opp.baseX;
                const impactY = opp.baseY - 30;
                for (let i = 0; i < 16; i++) {
                  spawnParticle({
                    x: impactX,
                    y: impactY,
                    vx: (Math.random() - 0.3) * 8,
                    vy: (Math.random() - 0.5) * 7,
                    color: type === 'bite' ? '#EF4444' : '#CCFF00',
                    type: 'spark',
                    size: 4 + Math.random() * 4,
                  });
                }
                spawnParticle({
                  x: impactX,
                  y: impactY,
                  type: 'slash',
                  color: type === 'bite' ? '#EF4444' : '#CCFF00',
                  life: 0.38,
                  size: 50,
                });

                // Damage Popup Text
                if (s.action.damage) {
                  spawnParticle({
                    x: impactX,
                    y: impactY - 22,
                    type: 'text',
                    text: s.action.isCrit ? `💥 CRIT -${s.action.damage}!` : `-${s.action.damage}`,
                    color: s.action.isCrit ? '#CCFF00' : '#EF4444',
                    size: s.action.isCrit ? 20 : 16,
                    life: 0.95,
                  });
                }
              }
            } else {
              // Rebound Return: Settle back with landing squash
              const retPct = (progress - 0.55) / 0.45;
              playerTargetX = p.baseX + (opp.baseX - p.baseX - 45) * (1 - retPct);
              p.jumpY = -Math.sin(retPct * Math.PI) * 16;
              if (retPct > 0.8) {
                // Landing compression
                p.scaleY = 0.88;
                p.scaleX = 1.12;
              }
            }
          } else if (type === 'slam') {
            // ULTIMATE PET SLAM OVERDRIVE
            if (progress < 0.35) {
              // Rocket Jump: Extreme vertical stretch upwards
              const upPct = progress / 0.35;
              p.jumpY = -upPct * height * 1.35;
              playerTargetX = p.baseX + (opp.baseX - p.baseX) * (upPct * 0.55);
              p.scaleY = 1.35;
              p.scaleX = 0.78;
            } else if (progress < 0.65) {
              // Meteor Crash Downward
              const downPct = (progress - 0.35) / 0.3;
              p.jumpY = -height * 1.35 * (1 - downPct);
              playerTargetX = p.baseX + (opp.baseX - p.baseX) * (0.55 + downPct * 0.45);
              p.scaleY = 1.25;
              p.scaleX = 0.85;

              // Ground Zero Epic Meteor Impact!
              if (!s.hasDealtDamage && downPct > 0.9) {
                s.hasDealtDamage = true;
                opp.flinchTimer = 0.6;
                opp.recoilX = 58;
                s.cameraShake = 18;
                s.hitStopTimer = 0.07; // 70ms visceral hit-stop
                s.chromaticFlash = 0.45;
                sound.playImpact();

                // Heavy impact squash on opponent
                opp.scaleX = 1.35;
                opp.scaleY = 0.68;

                // Ground Zero Expanding Shockwave Ring
                spawnParticle({
                  x: opp.baseX,
                  y: opp.baseY + 10,
                  type: 'shockwave',
                  color: '#CCFF00',
                  size: 20,
                  life: 0.65,
                });

                // Secondary Cyan Shockwave
                spawnParticle({
                  x: opp.baseX,
                  y: opp.baseY + 10,
                  type: 'shockwave',
                  color: '#00E5FF',
                  size: 35,
                  life: 0.75,
                });

                // Explosive Multi-Color Sparks
                for (let i = 0; i < 32; i++) {
                  spawnParticle({
                    x: opp.baseX,
                    y: opp.baseY - 20,
                    vx: (Math.random() - 0.5) * 14,
                    vy: (Math.random() - 0.5) * 12 - 3,
                    color: Math.random() > 0.5 ? '#CCFF00' : '#F59E0B',
                    type: 'spark',
                    size: 5 + Math.random() * 6,
                  });
                }

                // Giant Slam Damage Popup
                if (s.action.damage) {
                  spawnParticle({
                    x: opp.baseX,
                    y: opp.baseY - 48,
                    type: 'text',
                    text: `💥 OVERDRIVE -${s.action.damage}!!`,
                    color: '#CCFF00',
                    size: 24,
                    life: 1.15,
                  });
                }
              }
            } else {
              // High Arc Backflip Return to base
              const bouncePct = (progress - 0.65) / 0.35;
              playerTargetX = opp.baseX + (p.baseX - opp.baseX) * bouncePct;
              p.jumpY = -Math.sin(bouncePct * Math.PI) * 38;
              p.scaleY = 1.05;
              p.scaleX = 0.95;
            }
          } else if (type === 'bark') {
            // Sonic Bark / Roar: Chest expands, shockwaves shoot
            p.scaleX = 1.28;
            p.scaleY = 1.12;
            if (!s.hasDealtDamage && progress > 0.25) {
              s.hasDealtDamage = true;
              s.cameraShake = 7;
              opp.flinchTimer = 0.42;
              opp.recoilX = 32;
              s.hitStopTimer = 0.045;

              // Concentric Sonic Rings
              for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                  spawnParticle({
                    x: p.baseX + 32,
                    y: p.baseY - 25,
                    vx: 8,
                    vy: 0,
                    type: 'sonic',
                    color: '#38BDF8',
                    size: 22,
                    life: 0.55,
                  });
                }, i * 65);
              }

              if (s.action.damage) {
                spawnParticle({
                  x: opp.baseX,
                  y: opp.baseY - 26,
                  type: 'text',
                  text: `📢 -${s.action.damage}`,
                  color: '#38BDF8',
                  size: 17,
                  life: 0.9,
                });
              }
            }
          } else if (type === 'shield') {
            // Iron Guard Brace Squash
            p.scaleY = 0.82;
            p.scaleX = 1.22;
            if (!s.hasDealtDamage && progress > 0.2) {
              s.hasDealtDamage = true;
              sound.playBlock();
              spawnParticle({
                x: p.baseX,
                y: p.baseY - 20,
                type: 'text',
                text: `🛡️ IRON GUARD!`,
                color: '#38BDF8',
                size: 15,
                life: 0.85,
              });
            }
          }
        } else {
          // --- OPPONENT ATTACKING PLAYER ---
          if (type === 'pounce' || type === 'bite') {
            if (progress < 0.2) {
              const crouchPct = progress / 0.2;
              opp.scaleY = 1 - crouchPct * 0.24;
              opp.scaleX = 1 + crouchPct * 0.22;
              oppTargetX = opp.baseX + crouchPct * 16;
            } else if (progress < 0.55) {
              const rushPct = (progress - 0.2) / 0.35;
              opp.scaleX = 1.25 - rushPct * 0.2;
              opp.scaleY = 0.85 + rushPct * 0.2;
              oppTargetX = opp.baseX - (opp.baseX - p.baseX - 45) * rushPct;
              opp.jumpY = -Math.sin(rushPct * Math.PI) * 28;

              if (!s.hasDealtDamage && rushPct > 0.85) {
                s.hasDealtDamage = true;
                p.flinchTimer = 0.38;
                p.recoilX = -38;
                s.cameraShake = 8;
                s.hitStopTimer = 0.055;
                s.chromaticFlash = 0.25;

                p.scaleX = 0.82;
                p.scaleY = 1.22;

                const impactX = p.baseX;
                const impactY = p.baseY - 30;
                for (let i = 0; i < 16; i++) {
                  spawnParticle({
                    x: impactX,
                    y: impactY,
                    vx: (Math.random() - 0.7) * 8,
                    vy: (Math.random() - 0.5) * 7,
                    color: '#EF4444',
                    type: 'spark',
                    size: 4 + Math.random() * 4,
                  });
                }
                spawnParticle({
                  x: impactX,
                  y: impactY,
                  type: 'slash',
                  color: '#EF4444',
                  life: 0.38,
                  size: 50,
                });

                if (s.action.damage) {
                  spawnParticle({
                    x: impactX,
                    y: impactY - 22,
                    type: 'text',
                    text: `-${s.action.damage}`,
                    color: '#EF4444',
                    size: 16,
                    life: 0.95,
                  });
                }
              }
            } else {
              const retPct = (progress - 0.55) / 0.45;
              oppTargetX = p.baseX + (opp.baseX - p.baseX) * retPct;
              opp.jumpY = -Math.sin(retPct * Math.PI) * 16;
              if (retPct > 0.8) {
                opp.scaleY = 0.88;
                opp.scaleX = 1.12;
              }
            }
          } else if (type === 'slam') {
            // Opponent Heavy Slam
            if (progress < 0.35) {
              const upPct = progress / 0.35;
              opp.jumpY = -upPct * height * 1.25;
              oppTargetX = opp.baseX - (opp.baseX - p.baseX) * (upPct * 0.55);
              opp.scaleY = 1.35;
              opp.scaleX = 0.78;
            } else if (progress < 0.65) {
              const downPct = (progress - 0.35) / 0.3;
              opp.jumpY = -height * 1.25 * (1 - downPct);
              oppTargetX = opp.baseX - (opp.baseX - p.baseX) * (0.55 + downPct * 0.45);
              opp.scaleY = 1.25;
              opp.scaleX = 0.85;

              if (!s.hasDealtDamage && downPct > 0.9) {
                s.hasDealtDamage = true;
                p.flinchTimer = 0.6;
                p.recoilX = -55;
                s.cameraShake = 16;
                s.hitStopTimer = 0.07;
                s.chromaticFlash = 0.45;
                sound.playImpact();

                p.scaleX = 1.35;
                p.scaleY = 0.68;

                spawnParticle({
                  x: p.baseX,
                  y: p.baseY + 10,
                  type: 'shockwave',
                  color: '#EF4444',
                  size: 20,
                  life: 0.65,
                });

                if (s.action.damage) {
                  spawnParticle({
                    x: p.baseX,
                    y: p.baseY - 48,
                    type: 'text',
                    text: `💥 OPPONENT SLAM -${s.action.damage}!`,
                    color: '#EF4444',
                    size: 22,
                    life: 1.15,
                  });
                }
              }
            } else {
              const bouncePct = (progress - 0.65) / 0.35;
              oppTargetX = p.baseX + (opp.baseX - p.baseX) * bouncePct;
              opp.jumpY = -Math.sin(bouncePct * Math.PI) * 32;
            }
          }
        }

        // Action Finished
        if (s.actionProgress >= 1) {
          s.action = null;
          s.actionProgress = 0;
          onActionComplete?.();
        }
      }

      // Smooth Recoil Return
      p.recoilX *= 0.88;
      opp.recoilX *= 0.88;

      p.currentX = playerTargetX + p.recoilX;
      p.currentY = playerTargetY + p.jumpY - p.breathCycle * 2.5;
      opp.currentX = oppTargetX + opp.recoilX;
      opp.currentY = oppTargetY + opp.jumpY - opp.breathCycle * 2.5;

      // =======================================================================
      // 1. DRAW DYNAMIC ARENA ENVIRONMENT & AMBIENT WEATHER
      // =======================================================================
      drawArenaEnvironment(ctx, width, height, arenaTheme, s.time);
      updateAndDrawWeather(ctx, width, height, arenaTheme, s.weatherParticles, dt, s.time);

      // =======================================================================
      // 2. DRAW FIGHTER PEDESTALS & DYNAMIC JUMP-SCALED SHADOWS
      // =======================================================================
      drawFighterPedestal(ctx, p.baseX, p.baseY, 'player', arenaTheme, p.jumpY, height);
      drawFighterPedestal(ctx, opp.baseX, opp.baseY, 'opponent', arenaTheme, opp.jumpY, height);

      if (battleMode === '2v2') {
        drawFighterPedestal(ctx, p.baseX - 42, p.baseY - 26, 'player', arenaTheme, 0, height);
        drawFighterPedestal(ctx, opp.baseX + 42, opp.baseY - 26, 'opponent', arenaTheme, 0, height);
      }

      // =======================================================================
      // 3. DRAW AFTERIMAGE GHOST TRAILS (Motion Blur Effect)
      // =======================================================================
      for (let i = s.afterimages.length - 1; i >= 0; i--) {
        const ai = s.afterimages[i];
        ai.alpha -= dt * 3.2;
        if (ai.alpha <= 0) {
          s.afterimages.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = ai.alpha;
        drawCombatant(ctx, {
          species: ai.species,
          x: ai.x,
          y: ai.y + ai.jumpY,
          facingRight: ai.facingRight,
          scaleX: ai.scaleX * 0.95,
          scaleY: ai.scaleY * 0.95,
          breathCycle: 0,
          tailAngle: 0,
          isFlinching: false,
          isShielded: false,
          isKO: false,
          isBlinking: false,
          time: s.time,
          accentColor: ai.color,
          silhouetteColor: ai.color,
        });
        ctx.restore();
      }

      // =======================================================================
      // 4. DRAW OPPONENT FIGHTERS (2v2 Flanker + Frontline)
      // =======================================================================
      if (battleMode === '2v2' && opponentAllyPet) {
        const oppAllyX = opp.baseX + 42 + opp.recoilX * 0.7;
        const oppAllyY = opp.baseY - 26 + opp.jumpY * 0.8 - Math.sin(s.time * 3.1 + 1) * 2;
        drawCombatant(ctx, {
          species: mapBeastToSpecies(opponentAllyPet.breed || opponentAllyPet.species),
          x: oppAllyX,
          y: oppAllyY,
          facingRight: false,
          scaleX: 0.8,
          scaleY: 0.8,
          breathCycle: Math.sin(s.time * 3.1 + 1),
          tailAngle: Math.sin(s.time * 2.7) * 0.25,
          isFlinching: opp.flinchTimer > 0,
          isShielded: isOpponentShielded,
          isKO: opponentAllyHp <= 0,
          isBlinking: opp.isBlinking,
          time: s.time,
          accentColor: '#F59E0B',
        });
      }

      drawCombatant(ctx, {
        species: mapBeastToSpecies(opponentPet.breed || opponentPet.species),
        x: opp.currentX,
        y: opp.currentY,
        facingRight: false,
        scaleX: opp.scaleX * 0.92,
        scaleY: opp.scaleY * 0.92,
        breathCycle: opp.breathCycle,
        tailAngle: opp.tailAngle,
        isFlinching: opp.flinchTimer > 0,
        isShielded: isOpponentShielded,
        isKO: opponentHp <= 0,
        isBlinking: opp.isBlinking,
        time: s.time,
        accentColor: '#EF4444',
      });

      // =======================================================================
      // 5. DRAW PLAYER FIGHTERS (2v2 Flanker + Frontline)
      // =======================================================================
      if (battleMode === '2v2' && playerAllyPet) {
        const isSlam = s.action?.type === 'slam';
        const pAllyX = p.baseX - 42 + (isSlam ? p.currentX - p.baseX : 0);
        const pAllyY = p.baseY - 26 + (isSlam ? p.jumpY : 0) - Math.sin(s.time * 3.6 + 0.7) * 2;
        drawCombatant(ctx, {
          species: mapBeastToSpecies(playerAllyPet.breed || playerAllyPet.species),
          x: pAllyX,
          y: pAllyY,
          facingRight: true,
          scaleX: 0.82,
          scaleY: 0.82,
          breathCycle: Math.sin(s.time * 3.6 + 0.7),
          tailAngle: Math.sin(s.time * 3.2) * 0.3,
          isFlinching: p.flinchTimer > 0,
          isShielded: isPlayerShielded,
          isKO: playerAllyHp <= 0,
          isBlinking: p.isBlinking,
          time: s.time,
          accentColor: '#00E5FF',
        });
      }

      drawCombatant(ctx, {
        species: mapBeastToSpecies(playerPet.breed || playerPet.species),
        x: p.currentX,
        y: p.currentY,
        facingRight: true,
        scaleX: p.scaleX * 0.98,
        scaleY: p.scaleY * 0.98,
        breathCycle: p.breathCycle,
        tailAngle: p.tailAngle,
        isFlinching: p.flinchTimer > 0,
        isShielded: isPlayerShielded,
        isKO: playerHp <= 0,
        isBlinking: p.isBlinking,
        time: s.time,
        accentColor: '#CCFF00',
      });

      // =======================================================================
      // 6. UPDATE & DRAW PARTICLE FX (Additive Blended Hit Sparks & Rings)
      // =======================================================================
      ctx.save();
      ctx.globalCompositeOperation = 'lighter'; // Additive blending for electric arcade feel

      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= dt;
        if (pt.spin) pt.angle = (pt.angle || 0) + pt.spin * dt;

        if (pt.type === 'spark') {
          pt.vy += 9.8 * dt * 4; // Gravity for sparks
        }

        if (pt.life <= 0) {
          s.particles.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, pt.life / pt.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;

        if (pt.type === 'spark') {
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (pt.type === 'slash') {
          ctx.strokeStyle = pt.color;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(pt.x - pt.size * 0.6, pt.y - pt.size * 0.5);
          ctx.lineTo(pt.x + pt.size * 0.6, pt.y + pt.size * 0.5);
          ctx.stroke();
          // Second claw slash
          ctx.beginPath();
          ctx.moveTo(pt.x - pt.size * 0.4, pt.y - pt.size * 0.7);
          ctx.lineTo(pt.x + pt.size * 0.8, pt.y + pt.size * 0.3);
          ctx.stroke();
        } else if (pt.type === 'shockwave') {
          const radius = (1 - alpha) * 125 + pt.size;
          ctx.strokeStyle = pt.color;
          ctx.lineWidth = 4 * alpha;
          ctx.beginPath();
          ctx.ellipse(pt.x, pt.y, radius, radius * 0.45, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (pt.type === 'sonic') {
          const ringR = (1 - alpha) * 85 + pt.size;
          ctx.strokeStyle = pt.color;
          ctx.lineWidth = 3.5 * alpha;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, ringR, -Math.PI * 0.42, Math.PI * 0.42);
          ctx.stroke();
        } else if (pt.type === 'text') {
          ctx.fillStyle = pt.color;
          ctx.font = `900 ${pt.size}px 'Barlow Condensed', sans-serif`;
          ctx.textAlign = 'center';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 10;
          ctx.lineWidth = 3.5;
          ctx.strokeText(pt.text || '', pt.x, pt.y);
          ctx.fillText(pt.text || '', pt.x, pt.y);
        }

        ctx.restore();
      }

      ctx.restore(); // Restore globalCompositeOperation

      // =======================================================================
      // 7. CHROMATIC ABERRATION FLASH ON HEAVY IMPACTS
      // =======================================================================
      if (s.chromaticFlash > 0.05) {
        ctx.save();
        ctx.globalAlpha = s.chromaticFlash * 0.35;
        ctx.fillStyle = '#FF0055';
        ctx.fillRect(-20, -20, width + 40, height + 40);
        ctx.restore();
      }

      ctx.restore(); // Restore Camera Transform

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    playerPet,
    opponentPet,
    arenaTheme,
    spawnParticle,
    isPlayerShielded,
    isOpponentShielded,
    onActionComplete,
    battleMode,
    playerAllyPet,
    opponentAllyPet,
    playerAllyHp,
    opponentAllyHp,
  ]);

  return (
    <div className={`relative w-full h-full select-none overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none cursor-default"
      />
    </div>
  );
};

// ===========================================================================
// ARENA ENVIRONMENT BACKGROUND DRAWING
// ===========================================================================
function drawArenaEnvironment(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: ArenaTheme,
  time: number
) {
  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  const horizonY = height * 0.36;

  if (theme === 'cyber') {
    // ⚡ CYBER COLOSSEUM THEME
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#040714');
    skyGrad.addColorStop(1, '#0C132B');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);

    // Sweeping Neon Searchlights
    const sweep1 = Math.sin(time * 1.5) * 0.3;
    const sweep2 = Math.cos(time * 1.2) * 0.3;
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#00E5FF';
    ctx.beginPath();
    ctx.moveTo(width * 0.2, 0);
    ctx.lineTo(width * 0.2 + sweep1 * width, horizonY);
    ctx.lineTo(width * 0.35 + sweep1 * width, horizonY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#CCFF00';
    ctx.beginPath();
    ctx.moveTo(width * 0.8, 0);
    ctx.lineTo(width * 0.8 + sweep2 * width, horizonY);
    ctx.lineTo(width * 0.65 + sweep2 * width, horizonY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Floor (Perspective Cyber Grid)
    const floorGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    floorGrad.addColorStop(0, '#0A0E1F');
    floorGrad.addColorStop(1, '#04060E');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // Glowing Neon Perspective Grid Lines
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
    ctx.lineWidth = 1;

    // Longitudinal grid lines converging to center horizon
    const centerX = width * 0.5;
    for (let x = -width * 0.5; x <= width * 1.5; x += width * 0.12) {
      ctx.beginPath();
      ctx.moveTo(centerX, horizonY);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Transverse horizontal grid lines with perspective spacing
    for (let i = 1; i <= 8; i++) {
      const py = horizonY + Math.pow(i / 8, 1.8) * (height - horizonY);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(width, py);
      ctx.stroke();
    }

    // Glowing Horizon Line
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(width, horizonY);
    ctx.stroke();
    ctx.restore();
  } else if (theme === 'dojo') {
    // 🏮 MIDNIGHT DOJO THEME
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#090514');
    skyGrad.addColorStop(1, '#1A0E2E');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);

    // Glowing Full Moon
    ctx.save();
    ctx.fillStyle = '#FEF3C7';
    ctx.shadowColor = '#FEF3C7';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(width * 0.82, horizonY * 0.5, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Floor: Dark Polished Tatami Wood
    const floorGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    floorGrad.addColorStop(0, '#1E1226');
    floorGrad.addColorStop(1, '#0C0612');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // Warm Japanese Lantern Glows on Perimeters
    ctx.save();
    [-1, 1].forEach((dir) => {
      const lx = dir === -1 ? width * 0.08 : width * 0.92;
      const lGrad = ctx.createRadialGradient(lx, horizonY + 20, 5, lx, horizonY + 20, 65);
      lGrad.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
      lGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lGrad;
      ctx.beginPath();
      ctx.arc(lx, horizonY + 20, 65, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  } else {
    // 🏟️ CHAMPIONSHIP STADIUM THEME (Default)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#060A14');
    skyGrad.addColorStop(1, '#0F1A30');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);

    // Stadium Floodlights
    ctx.save();
    [-1, 1].forEach((dir, idx) => {
      const lightX = dir === -1 ? width * 0.18 : width * 0.82;
      const angle = (idx === 0 ? 1 : -1) * (0.2 + Math.sin(time * 1.4 + idx) * 0.15);
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = '#CCFF00';
      ctx.beginPath();
      ctx.moveTo(lightX, 10);
      ctx.lineTo(lightX + angle * width * 0.4 - 40, height);
      ctx.lineTo(lightX + angle * width * 0.4 + 40, height);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();

    // Turf Battlefield Floor
    const floorGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    floorGrad.addColorStop(0, '#0C1C24');
    floorGrad.addColorStop(1, '#050D12');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // Stadium Ring Circle Markings on Floor
    ctx.save();
    ctx.strokeStyle = 'rgba(204, 255, 0, 0.35)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.65, width * 0.42, (height - horizonY) * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Midfield Center Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.5, horizonY + 10);
    ctx.lineTo(width * 0.5, height - 10);
    ctx.stroke();
    ctx.restore();
  }
}

// ===========================================================================
// AMBIENT WEATHER PARTICLE ENGINE (Cherry Blossoms / Neon Embers / Stadium Dust)
// ===========================================================================
function updateAndDrawWeather(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: ArenaTheme,
  particles: WeatherParticle[],
  dt: number,
  time: number
) {
  // Ensure ~22 weather particles active
  while (particles.length < 22) {
    if (theme === 'dojo') {
      // Pink cherry blossoms fluttering down
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.4,
        vx: -15 - Math.random() * 20,
        vy: 25 + Math.random() * 25,
        size: 3 + Math.random() * 4,
        color: Math.random() > 0.4 ? '#FDA4AF' : '#F43F5E',
        alpha: 0.3 + Math.random() * 0.5,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 3,
      });
    } else if (theme === 'cyber') {
      // Neon data embers floating upwards
      particles.push({
        x: Math.random() * width,
        y: height * 0.4 + Math.random() * (height * 0.6),
        vx: (Math.random() - 0.5) * 15,
        vy: -20 - Math.random() * 35,
        size: 1.5 + Math.random() * 2.5,
        color: Math.random() > 0.5 ? '#00E5FF' : '#CCFF00',
        alpha: 0.25 + Math.random() * 0.55,
        angle: 0,
        spin: 0,
      });
    } else {
      // Stadium dust / confetti motes
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 10,
        vy: -10 - Math.random() * 15,
        size: 1.5 + Math.random() * 2,
        color: '#CCFF00',
        alpha: 0.15 + Math.random() * 0.3,
        angle: 0,
        spin: 0,
      });
    }
  }

  // Update & Draw
  ctx.save();
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.angle += p.spin * dt;

    if (theme === 'dojo') {
      p.x += Math.sin(time * 2 + i) * 0.6;
    }

    // Wrap around screen bounds
    if (p.y > height + 20 || p.y < -20 || p.x < -20 || p.x > width + 20) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;

    if (theme === 'dojo') {
      // Cherry Blossom Petal (Elliptical curved shape)
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Glowing Dot Mote
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}

// ===========================================================================
// FIGHTER PEDESTAL FLOOR SHADOW (WITH INVERSE JUMP-HEIGHT SCALING)
// ===========================================================================
function drawFighterPedestal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: 'player' | 'opponent',
  theme: ArenaTheme,
  jumpY: number = 0,
  stageHeight: number = 400
) {
  ctx.save();
  const baseRadiusX = 48;
  const baseRadiusY = 18;

  // Jump Height Shadow Scaling: Shadow shrinks and fades as pet leaps up
  const jumpElevation = Math.max(0, -jumpY);
  const heightRatio = Math.max(0, 1 - jumpElevation / (stageHeight * 0.65));
  const radiusX = baseRadiusX * (0.35 + 0.65 * heightRatio);
  const radiusY = baseRadiusY * (0.35 + 0.65 * heightRatio);
  const shadowAlpha = 0.75 * Math.pow(heightRatio, 1.4);

  // Base Dynamic Drop Shadow
  const shadowGrad = ctx.createRadialGradient(x, y + 4, 3, x, y + 4, radiusX);
  shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${shadowAlpha})`);
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + 4, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Neon Pedestal Ring Glow (Stays grounded on arena turf)
  const glowColor = type === 'player' ? '#CCFF00' : '#EF4444';
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 2;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.ellipse(x, y + 2, baseRadiusX * 0.88, baseRadiusY * 0.88, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// ===========================================================================
// PROCEDURAL SKELETAL COMBATANT RENDERER
// ===========================================================================
interface CombatantRenderProps {
  species: PetSpecies;
  x: number;
  y: number;
  facingRight: boolean;
  scaleX: number;
  scaleY: number;
  breathCycle: number;
  tailAngle: number;
  isFlinching: boolean;
  isShielded: boolean;
  isKO: boolean;
  isBlinking: boolean;
  time: number;
  accentColor: string;
  silhouetteColor?: string;
}

function drawCombatant(ctx: CanvasRenderingContext2D, p: CombatantRenderProps) {
  ctx.save();
  ctx.translate(p.x, p.y);

  // Directional flip: Player faces right (+1), Opponent faces left (-1)
  const dirScale = p.facingRight ? 1 : -1;
  ctx.scale(dirScale * p.scaleX, p.scaleY);

  // Damage Flinch Effect: Flash White/Red & Jitter
  if (p.isFlinching) {
    ctx.shadowColor = '#FF3B30';
    ctx.shadowBlur = 16;
  }

  // Knocked Out (KO) State: Tumbled down with dizzy tilt
  if (p.isKO) {
    ctx.rotate(0.38);
    ctx.translate(0, 16);
  }

  // COLOR PALETTES FOR SPECIES
  let primaryColor = '#D97706'; // Shiba default
  let secondaryColor = '#B45309';
  let bellyColor = '#FEF3C7';
  let earColor = '#F472B6';
  let eyeColor = '#451A03';
  let noseColor = '#1C1917';

  const isCat = [
    'tabby',
    'bengal',
    'mainecoon',
    'british',
    'scottish',
    'calico',
    'siamese',
    'blackcat',
  ].includes(p.species);

  // Dog & Cat Breed Palettes
  if (p.species === 'germanshepherd') {
    primaryColor = '#C27803';
    secondaryColor = '#1E293B';
    bellyColor = '#FEF3C7';
    earColor = '#92400E';
    eyeColor = '#78350F';
    noseColor = '#0F172A';
  } else if (p.species === 'rottweiler' || p.species === 'doberman') {
    primaryColor = '#0F172A';
    secondaryColor = '#B45309';
    bellyColor = '#1E293B';
    earColor = '#78350F';
    eyeColor = '#451A03';
    noseColor = '#020617';
  } else if (p.species === 'corgi') {
    primaryColor = '#EA580C';
    secondaryColor = '#C2410C';
    bellyColor = '#FFFFFF';
    earColor = '#FDBA74';
    eyeColor = '#451A03';
    noseColor = '#1C1917';
  } else if (p.species === 'husky') {
    primaryColor = '#334155';
    secondaryColor = '#1E293B';
    bellyColor = '#F8FAFC';
    earColor = '#CBD5E1';
    eyeColor = '#38BDF8';
    noseColor = '#0F172A';
  } else if (p.species === 'retriever') {
    primaryColor = '#F59E0B';
    secondaryColor = '#D97706';
    bellyColor = '#FEF3C7';
    earColor = '#D97706';
    eyeColor = '#451A03';
    noseColor = '#1C1917';
  } else if (p.species === 'bengal') {
    primaryColor = '#D97706';
    secondaryColor = '#78350F';
    bellyColor = '#FEF3C7';
    earColor = '#FDA4AF';
    eyeColor = '#16A34A';
    noseColor = '#FB7185';
  } else if (p.species === 'mainecoon') {
    primaryColor = '#64748B';
    secondaryColor = '#334155';
    bellyColor = '#F1F5F9';
    earColor = '#FDA4AF';
    eyeColor = '#F59E0B';
    noseColor = '#FB7185';
  } else if (p.species === 'british' || p.species === 'scottish') {
    primaryColor = '#64748B';
    secondaryColor = '#475569';
    bellyColor = '#94A3B8';
    earColor = '#FDA4AF';
    eyeColor = '#EA580C';
    noseColor = '#475569';
  } else if (p.species === 'blackcat') {
    primaryColor = '#0F172A';
    secondaryColor = '#1E293B';
    bellyColor = '#334155';
    earColor = '#38BDF8';
    eyeColor = '#FACC15';
    noseColor = '#0F172A';
  }

  // Silhouette override for motion afterimages
  if (p.silhouetteColor) {
    primaryColor = p.silhouetteColor;
    secondaryColor = p.silhouetteColor;
    bellyColor = p.silhouetteColor;
  }

  // A. PROCEDURAL TAIL WITH INERTIAL SWAY
  ctx.save();
  ctx.translate(-24, -12);
  ctx.rotate(-p.tailAngle);
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  if (isCat) {
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-18, -12, -26, -35, -14, -42);
    ctx.bezierCurveTo(-10, -35, -8, -15, 0, 0);
  } else {
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-24, -8, -32, -26);
    ctx.quadraticCurveTo(-14, -10, 0, 0);
  }
  ctx.fill();
  ctx.restore();

  // B. BACK LEGS
  ctx.fillStyle = secondaryColor;
  ctx.beginPath();
  ctx.ellipse(-18, 12, 11, 8, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // C. PROCEDURAL TORSO & BREATHING CHEST
  const bodyGrad = ctx.createLinearGradient(0, -35, 0, 15);
  bodyGrad.addColorStop(0, secondaryColor);
  bodyGrad.addColorStop(1, primaryColor);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, -10, 26, 20, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Belly Patch
  ctx.fillStyle = bellyColor;
  ctx.beginPath();
  ctx.ellipse(4, -8, 14, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Front Paws
  ctx.fillStyle = secondaryColor;
  ctx.beginPath();
  ctx.ellipse(14, 12, 9, 7, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // D. HEAD WITH INERTIA & BREATHING BOB
  ctx.save();
  ctx.translate(14, -32 + p.breathCycle * 1.5);

  const headGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, 28);
  headGrad.addColorStop(0, secondaryColor);
  headGrad.addColorStop(1, primaryColor);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // EARS (Cat Pointed / Scottish Folded / Dog Floppy / Corgi Big)
  if (isCat) {
    if (p.species === 'scottish') {
      [-1, 1].forEach((dir) => {
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.ellipse(dir * 14, -14, 8, 6, dir * 0.4, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      [-1, 1].forEach((dir) => {
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.moveTo(dir * 8 - 7, -10);
        ctx.lineTo(dir * 14, -28);
        ctx.lineTo(dir * 8 + 7, -10);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = earColor;
        ctx.beginPath();
        ctx.moveTo(dir * 8 - 4, -10);
        ctx.lineTo(dir * 14, -22);
        ctx.lineTo(dir * 8 + 4, -10);
        ctx.closePath();
        ctx.fill();
      });
    }
  } else if (p.species === 'corgi') {
    [-1, 1].forEach((dir) => {
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.ellipse(dir * 12, -22, 9, 15, dir * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = earColor;
      ctx.beginPath();
      ctx.ellipse(dir * 12, -20, 5, 10, dir * 0.2, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (p.species === 'retriever' || p.species === 'rottweiler') {
    [-1, 1].forEach((dir) => {
      ctx.fillStyle = secondaryColor;
      ctx.beginPath();
      ctx.ellipse(dir * 16, -6, 8, 14, dir * 0.2, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    [-1, 1].forEach((dir) => {
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.moveTo(dir * 8 - 7, -10);
      ctx.lineTo(dir * 12, -27);
      ctx.lineTo(dir * 8 + 7, -10);
      ctx.closePath();
      ctx.fill();
    });
  }

  // SNOUT & NOSE
  ctx.fillStyle = bellyColor;
  ctx.beginPath();
  ctx.ellipse(10, 4, 12, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = noseColor;
  ctx.beginPath();
  ctx.ellipse(16, 2, 4.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // EYES WITH BLINKING & SPECULAR GLINT HIGHLIGHTS
  if (p.isKO) {
    // Dizzy X eyes
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(4 - 4, -4 - 4);
    ctx.lineTo(4 + 4, -4 + 4);
    ctx.moveTo(4 + 4, -4 - 4);
    ctx.lineTo(4 - 4, -4 + 4);
    ctx.stroke();
  } else if (p.isBlinking) {
    // Closed blinking eye arc
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(5.5, -3, 4.5, 0.1, Math.PI - 0.1);
    ctx.stroke();
  } else {
    // Fierce battle-ready eye with specular glint
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(4, -4, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(5.5, -4, 3.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(6, -4, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Primary Specular Glint
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(4.5, -5.5, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Secondary Micro Glint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(6.8, -3.2, 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Special breed markings (Rottweiler eyebrow dot, Corgi blaze)
  if (p.species === 'rottweiler' || p.species === 'doberman') {
    ctx.fillStyle = '#B45309';
    ctx.beginPath();
    ctx.arc(3, -11, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.species === 'corgi') {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(8, 2);
    ctx.lineTo(3, -14);
    ctx.lineTo(11, -14);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore(); // Restore head

  // ENERGY SHIELD FORCEFIELD (If shielded)
  if (p.isShielded) {
    ctx.save();
    const shieldR = 48;
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, -14, shieldR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hexagonal Runes on shield
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.2;
    for (let h = 0; h < 6; h++) {
      const a1 = (h * Math.PI) / 3 + p.time * 0.8;
      const a2 = ((h + 1) * Math.PI) / 3 + p.time * 0.8;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a1) * shieldR * 0.9, -14 + Math.sin(a1) * shieldR * 0.9);
      ctx.lineTo(Math.cos(a2) * shieldR * 0.9, -14 + Math.sin(a2) * shieldR * 0.9);
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.restore(); // Restore combatant
}
