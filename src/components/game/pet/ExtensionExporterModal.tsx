import React, { useState } from 'react';
import JSZip from 'jszip';
import { usePetCompanion, SPECIES_CONFIG } from '../../../context/PetCompanionContext';
import { useGame } from '../../../context/GameContext';
import { ProceduralPetCanvas } from './ProceduralPetCanvas';
import { getPetPhoto } from '../../../utils/petVisuals';
import { PetSpecies, CompanionPet } from '../../../types/pet';
import {
  X,
  Download,
  CheckCircle,
  Smartphone,
  Tv,
  AlertCircle,
  Sparkles,
  Heart,
  Gavel,
  Compass,
  Smile,
  Shield,
  Zap,
  Lock,
  Crown,
} from 'lucide-react';
import { sound } from '../../../utils/audio';
import { createDodoCheckout } from '../../../services/dodo';
import { trackClarityEvent } from '../../../utils/clarity';

interface ExtensionExporterModalProps {
  onClose: () => void;
}

// Generate the official PET SLAM logo icons in PNG format via Canvas
const generateAppLogoIcon = (size: number): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Background circle (Dark Obsidian)
    ctx.fillStyle = '#070A10';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Outer glow ring (Neon Volt)
    ctx.strokeStyle = '#CCFF00';
    ctx.lineWidth = Math.max(1.5, size * 0.08);
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.stroke();

    // Draw Official Pet Slam Paw Emblem
    ctx.save();
    ctx.translate(size / 2, size / 2);
    const s = size / 100;
    ctx.scale(s, s);

    // Cyan lightning claw accents
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    [-24, 0, 24].forEach((dx) => {
      ctx.beginPath();
      ctx.moveTo(dx * 0.6, -34);
      ctx.lineTo(dx * 0.7, -18);
      ctx.stroke();
    });

    // Main Paw Pad (Neon Volt)
    ctx.fillStyle = '#CCFF00';
    ctx.beginPath();
    ctx.ellipse(0, 10, 22, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4 Paw Toe Pads
    [-24, -8, 8, 24].forEach((tx, i) => {
      const ty = i === 0 || i === 3 ? -10 : -18;
      ctx.fillStyle = '#CCFF00';
      ctx.beginPath();
      ctx.ellipse(tx, ty, 7, 9, (tx / 24) * 0.25, 0, Math.PI * 2);
      ctx.fill();
    });

    // Inner Paw Core
    ctx.fillStyle = '#0B0E17';
    ctx.beginPath();
    ctx.ellipse(0, 11, 12, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // "SLAM" badge if size allows
    if (size >= 48) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SLAM', 0, 38);
    }

    ctx.restore();

    canvas.toBlob((blob) => {
      resolve(blob || new Blob());
    }, 'image/png');
  });
};

export const ExtensionExporterModal: React.FC<ExtensionExporterModalProps> = ({ onClose }) => {
  const { pet, kennelPets, isOverlayActive, toggleOverlay, switchSpecies } = usePetCompanion();
  const { hasExtensionPass, unlockPass } = useGame();
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'popup' | 'kennel' | 'radar' | 'install'>('popup');
  const [previewSpecies, setPreviewSpecies] = useState<PetSpecies>(pet.species);
  const [copiedExtensionUrl, setCopiedExtensionUrl] = useState(false);
  const [isExtensionLinked, setIsExtensionLinked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('petslam_extension_linked') === 'true';
  });

  // All 16 Pet Breeds (8 Dogs & 8 Cats) - 100% Uniform with App
  const allDogBreeds: { id: PetSpecies; name: string; breed: string; cp: number; tag: string }[] = [
    { id: 'germanshepherd', name: 'Kaiser', breed: 'German Shepherd', cp: 440, tag: 'Tactical Clamp' },
    { id: 'rottweiler', name: 'Vulkan', breed: 'Rottweiler', cp: 460, tag: 'Bone Crusher' },
    { id: 'retriever', name: 'Buddy', breed: 'Golden Retriever', cp: 410, tag: 'Loyal Guardian' },
    { id: 'husky', name: 'Ghost', breed: 'Siberian Husky', cp: 450, tag: 'Arctic Howler' },
    { id: 'bulldog', name: 'Rocky', breed: 'French Bulldog', cp: 430, tag: 'Iron Grip' },
    { id: 'shiba', name: 'Hachi', breed: 'Shiba Inu', cp: 380, tag: 'Doge Spirit' },
    { id: 'doberman', name: 'Titan', breed: 'Doberman Pinscher', cp: 470, tag: 'Apex Velocity' },
    { id: 'corgi', name: 'Biscuit', breed: 'Welsh Corgi', cp: 390, tag: 'Royal Nimble' },
  ];

  const allCatBreeds: { id: PetSpecies; name: string; breed: string; cp: number; tag: string }[] = [
    { id: 'bengal', name: 'Leonidas', breed: 'Bengal Cat', cp: 480, tag: 'Leopard Pounce' },
    { id: 'mainecoon', name: 'Thor', breed: 'Maine Coon', cp: 460, tag: 'Colossus Claws' },
    { id: 'siamese', name: 'Mochi', breed: 'Siamese Cat', cp: 420, tag: 'Sapphire Stare' },
    { id: 'tabby', name: 'Garfield', breed: 'Orange Tabby', cp: 400, tag: 'Agile Leap' },
    { id: 'british', name: 'Winston', breed: 'British Shorthair', cp: 430, tag: 'Velvet Armor' },
    { id: 'scottish', name: 'Luna', breed: 'Scottish Fold', cp: 410, tag: 'Stealth Reflex' },
    { id: 'calico', name: 'Cleo', breed: 'Calico Cat', cp: 390, tag: 'Lucky Tri-Color' },
    { id: 'blackcat', name: 'Shadow', breed: 'Bombay Black Cat', cp: 450, tag: 'Shadow Ambush' },
  ];

  // Generate the Single Unified Chrome Extension package containing ALL pets and ALL Buddy page features
  const handleDownloadZip = async () => {
    if (!hasExtensionPass) {
      setShowPassModal(true);
      return;
    }
    setIsGenerating(true);
    sound.playClick();

    try {
      const zip = new JSZip();

      // Generate official PET SLAM icons (16, 48, 128)
      const icon16Blob = await generateAppLogoIcon(16);
      const icon48Blob = await generateAppLogoIcon(48);
      const icon128Blob = await generateAppLogoIcon(128);

      zip.file('icons/icon16.png', icon16Blob);
      zip.file('icons/icon48.png', icon48Blob);
      zip.file('icons/icon128.png', icon128Blob);

      // Exact user active pet data sync (Packages exact name, breed, level, stats)
      const syncedPetData = {
        id: pet.id || `pet_${pet.species}_${Date.now()}`,
        species: pet.species,
        category: pet.category,
        name: pet.name,
        title: pet.title || 'Apex Companion',
        level: pet.level || 1,
        stage: pet.stage || 1,
        stats: pet.stats || { attack: 55, defense: 50, agility: 60, stamina: 55, cp: 440 },
        hunger: pet.hunger ?? 85,
        happiness: pet.happiness ?? 90,
        affectionHearts: pet.affectionHearts ?? 3,
      };
      zip.file('pet_data.json', JSON.stringify(syncedPetData, null, 2));

      // 1. Manifest V3: Unified single extension for all pets & features across ALL browser tabs
      const manifestContent = JSON.stringify(
        {
          manifest_version: 3,
          name: 'Pet Slam - Multi-Pet Sanctuary & Screen Companion',
          version: '3.1.0',
          description:
            'Interactive multi-pet screen companion with all Dog, Cat, and Beast breeds, voice mimic repeater, Pokemon GO wild catch radar, auction market, and persistent on-screen roaming across all tabs!',
          icons: {
            '16': 'icons/icon16.png',
            '48': 'icons/icon48.png',
            '128': 'icons/icon128.png',
          },
          action: {
            default_popup: 'popup.html',
            default_title: 'Pet Slam - Multi-Pet Sanctuary',
            default_icon: {
              '16': 'icons/icon16.png',
              '48': 'icons/icon48.png',
              '128': 'icons/icon128.png',
            },
          },
          permissions: ['storage', 'activeTab', 'scripting', 'tabs'],
          host_permissions: ['<all_urls>'],
          background: {
            service_worker: 'background.js',
          },
          content_scripts: [
            {
              matches: ['<all_urls>'],
              js: ['content_script.js'],
              run_at: 'document_idle',
              all_frames: false,
            },
          ],
        },
        null,
        2
      );
      zip.file('manifest.json', manifestContent);

      // 2. Background Service Worker (Multi-Tab Injection & Broadcast Sync)
      const backgroundScript = `// PET SLAM UNIFIED EXTENSION SERVICE WORKER - MULTI-TAB SYNC
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[Pet Slam] Unified Extension installed/updated:', details.reason);
  
  // Initialize default active pet and kennel if not set
  try {
    const data = await chrome.storage.local.get(['activePet', 'kennelPets', 'coins', 'isSummoned']);
    if (!data.activePet) {
      await chrome.storage.local.set({
        activePet: ${JSON.stringify(syncedPetData)},
        coins: 2450,
        isSummoned: true
      });
    } else if (data.isSummoned === undefined) {
      await chrome.storage.local.set({ isSummoned: true });
    }
  } catch (e) {}

  // Auto-inject into all open web tabs upon installation so pet appears immediately across all tabs!
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id && tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content_script.js'],
          });
        } catch (tabErr) {}
      }
    }
  } catch (e) {}
});

// Auto-inject when new tabs finish loading if summoned
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab && tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
    try {
      const data = await chrome.storage.local.get(['isSummoned']);
      if (data.isSummoned !== false) {
        chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
          if (chrome.runtime.lastError || !response) {
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              files: ['content_script.js']
            }).catch(() => {});
          }
        });
      }
    } catch (err) {}
  }
});

// Broadcast active pet change or summon commands to all open tabs
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'change_active_pet') {
    chrome.storage.local.set({ activePet: message.pet });
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((t) => {
        if (t.id) {
          chrome.tabs.sendMessage(t.id, { action: 'set_active_pet', pet: message.pet }, () => {
            if (chrome.runtime.lastError) {}
          });
        }
      });
    });
    sendResponse({ success: true });
    return true;
  }

  if (message.action === 'summon_all') {
    chrome.storage.local.set({ isSummoned: true });
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((t) => {
        if (t.id && t.url && (t.url.startsWith('http://') || t.url.startsWith('https://'))) {
          // Send summon, or inject if not yet loaded
          chrome.tabs.sendMessage(t.id, { action: 'summon', pet: message.pet }, (resp) => {
            if (chrome.runtime.lastError) {
              chrome.scripting.executeScript({
                target: { tabId: t.id },
                files: ['content_script.js']
              }).then(() => {
                chrome.tabs.sendMessage(t.id, { action: 'summon', pet: message.pet }).catch(() => {});
              }).catch(() => {});
            }
          });
        }
      });
    });
    sendResponse({ success: true });
    return true;
  }

  if (message.action === 'hide_all') {
    chrome.storage.local.set({ isSummoned: false });
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((t) => {
        if (t.id) {
          chrome.tabs.sendMessage(t.id, { action: 'hide' }, () => {
            if (chrome.runtime.lastError) {}
          });
        }
      });
    });
    sendResponse({ success: true });
    return true;
  }
});
`;
      zip.file('background.js', backgroundScript);

      // 3. Complete Procedural Drawing Engine Core (All 12 Species + Talking Tom Expressions)
      const petEngineCore = `
function createPetCanvas(species, stage, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width || 130;
  canvas.height = height || 130;
  const ctx = canvas.getContext('2d');
  
  let currentSpecies = species || 'shiba';
  let time = 0;
  let anim = 'idle';
  let blinkTimer = 0;
  let isBlinking = false;
  let eyeGazeX = 0;
  let eyeGazeY = 0;
  let walkCycle = 0;
  let bounceY = 0;
  let talkingVolume = 0;
  let particles = [];

  const palettes = {
    // Dogs
    shiba: { primary: '#D97706', secondary: '#B45309', belly: '#FEF3C7', ear: '#FEF3C7', eye: '#292524', nose: '#0F172A' },
    retriever: { primary: '#F59E0B', secondary: '#D97706', belly: '#FEF3C7', ear: '#D97706', eye: '#451A03', nose: '#1C1917' },
    husky: { primary: '#334155', secondary: '#1E293B', belly: '#F8FAFC', ear: '#CBD5E1', eye: '#38BDF8', nose: '#0F172A' },
    bulldog: { primary: '#94A3B8', secondary: '#64748B', belly: '#E2E8F0', ear: '#F472B6', eye: '#1E293B', nose: '#0F172A' },
    // Cats
    tabby: { primary: '#EA580C', secondary: '#C2410C', belly: '#FFEDD5', ear: '#FDA4AF', eye: '#15803D', nose: '#FB7185' },
    calico: { primary: '#F8FAFC', secondary: '#EA580C', belly: '#FFFFFF', ear: '#FDA4AF', eye: '#059669', nose: '#FB7185' },
    siamese: { primary: '#FEF3C7', secondary: '#451A03', belly: '#FFFBEB', ear: '#292524', eye: '#0284C7', nose: '#292524' },
    blackcat: { primary: '#0F172A', secondary: '#1E293B', belly: '#334155', ear: '#38BDF8', eye: '#FACC15', nose: '#0F172A' },
    // Mythic Beasts
    kodiak: { primary: '#854D0E', secondary: '#A16207', belly: '#FEF08A', ear: '#713F12', eye: '#0F172A', nose: '#1C1917' },
    bagheera: { primary: '#0F172A', secondary: '#1E293B', belly: '#334155', ear: '#0284C7', eye: '#22D3EE', nose: '#0284C7' },
    ignis: { primary: '#B91C1C', secondary: '#DC2626', belly: '#FED7AA', ear: '#7F1D1D', eye: '#FBBF24', nose: '#450A0A' },
    sultan: { primary: '#D97706', secondary: '#F59E0B', belly: '#FEF3C7', ear: '#92400E', eye: '#10B981', nose: '#78350F' }
  };

  function spawnParticle(type, px, py, text) {
    particles.push({
      x: px || width / 2,
      y: py || height / 2,
      vx: (Math.random() - 0.5) * 2,
      vy: -1.2 - Math.random() * 1.5,
      life: 1,
      type: type || 'heart',
      text: text
    });
  }

  function render() {
    time += 0.016;
    blinkTimer += 0.016;
    if (isBlinking && blinkTimer > 0.14) { isBlinking = false; blinkTimer = 0; }
    else if (!isBlinking && blinkTimer > 3.4) { isBlinking = true; blinkTimer = 0; }

    const pal = palettes[currentSpecies] || palettes.shiba;
    const isCat = ['tabby', 'calico', 'siamese', 'blackcat', 'bagheera'].includes(currentSpecies);
    const isDog = ['shiba', 'retriever', 'husky', 'bulldog', 'ignis'].includes(currentSpecies);
    
    // Proportional uniform scaling (base coordinate space is 130px)
    const baseDim = 130;
    const uniformScale = Math.min(canvas.width, canvas.height) / baseDim;

    // Subtle volume-preserving organic squash (Max +/- 3% to eliminate any skewed look)
    const breath = Math.sin(time * 2.8);
    let squashX = 1 + breath * 0.02;
    let squashY = 1 - breath * 0.02;
    bounceY = -breath * 2.5;
    
    if (anim === 'walk') {
      walkCycle += 0.18;
      bounceY = -Math.abs(Math.sin(walkCycle)) * 7;
      squashX = 1 + Math.sin(walkCycle) * 0.025;
      squashY = 1 - Math.sin(walkCycle) * 0.025;
    } else if (anim === 'celebrate') {
      bounceY = -Math.abs(Math.sin(time * 10)) * 14;
      squashX = 1.02; squashY = 0.98;
    } else if (anim === 'pet') {
      squashX = 1.03; squashY = 0.97; bounceY = 3;
    } else if (anim === 'eat') {
      squashY = 1 + Math.sin(time * 14) * 0.03;
      squashX = 1 - Math.sin(time * 14) * 0.02;
    } else if (anim === 'dizzy') {
      squashX = 1 + Math.sin(time * 18) * 0.03;
      squashY = 1 - Math.sin(time * 18) * 0.03;
      bounceY = Math.cos(time * 18) * 3;
    } else if (anim === 'laugh') {
      squashY = 1 + Math.sin(time * 22) * 0.03;
      squashX = 1 - Math.sin(time * 22) * 0.02;
      bounceY = -Math.abs(Math.sin(time * 22)) * 5;
    } else if (anim === 'talk') {
      squashY = 1 + Math.sin(time * 12) * (0.02 + talkingVolume * 0.03);
      squashX = 1 - Math.sin(time * 12) * (0.01 + talkingVolume * 0.02);
    } else if (anim === 'drink_milk') {
      bounceY = 5;
      squashY = 0.97; squashX = 1.02;
    } else if (anim === 'bath') {
      bounceY = Math.sin(time * 6) * 3;
      if (Math.random() < 0.1) spawnParticle('bubble', width/2 + (Math.random()-0.5)*30, height/2);
    } else if (anim === 'fart') {
      squashX = 1.04; squashY = 0.96;
      if (Math.random() < 0.12) spawnParticle('fart', width/2 + 20, height/2 + 10, '💨');
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.52 + bounceY * uniformScale;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, canvas.height - 10, 30 * uniformScale * squashX, 7 * uniformScale * squashY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body Transform with Uniform Scaling
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(uniformScale * squashX, uniformScale * squashY);

    // Tail
    ctx.fillStyle = pal.primary;
    ctx.beginPath();
    if (isCat) {
      ctx.moveTo(18, 5);
      ctx.bezierCurveTo(34, -10, 38, -35, 24, -42);
      ctx.bezierCurveTo(18, -35, 14, -15, 18, 5);
    } else {
      ctx.arc(20, 6, 9, 0, Math.PI * 2);
    }
    ctx.fill();

    // Torso
    ctx.fillStyle = pal.primary;
    ctx.beginPath();
    ctx.ellipse(0, 5, 26, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = pal.belly;
    ctx.beginPath();
    ctx.ellipse(0, 8, 16, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = pal.secondary;
    ctx.beginPath();
    ctx.ellipse(0, -18, 25, 21, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = pal.primary;
    if (isCat) {
      [-1, 1].forEach(side => {
        ctx.beginPath();
        ctx.moveTo(side * 12, -26);
        ctx.lineTo(side * 22, -44);
        ctx.lineTo(side * 28, -22);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = pal.ear;
        ctx.beginPath();
        ctx.moveTo(side * 14, -26);
        ctx.lineTo(side * 21, -38);
        ctx.lineTo(side * 25, -23);
        ctx.closePath();
        ctx.fill();
      });
    } else if (currentSpecies === 'retriever') {
      [-1, 1].forEach(side => {
        ctx.beginPath();
        ctx.ellipse(side * 24, -15, 7, 14, side * 0.2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      ctx.beginPath();
      ctx.arc(-16, -34, 9, 0, Math.PI * 2);
      ctx.arc(16, -34, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Snout
    ctx.fillStyle = pal.belly;
    ctx.beginPath();
    ctx.ellipse(0, -12, 12, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers for cats
    if (isCat) {
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1.2;
      [-4, 4].forEach(dy => {
        ctx.beginPath();
        ctx.moveTo(-10, -12 + dy); ctx.lineTo(-26, -14 + dy); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(10, -12 + dy); ctx.lineTo(26, -14 + dy); ctx.stroke();
      });
    }

    // Nose
    ctx.fillStyle = pal.nose;
    ctx.beginPath();
    ctx.ellipse(0, -15, 4.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mouth / Tongue / Talking Lip Sync
    if (anim === 'talk') {
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      const openH = Math.min(10, 4 + talkingVolume * 12);
      ctx.ellipse(0, -8, 6, openH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FB7185';
      ctx.beginPath();
      ctx.ellipse(0, -8 + openH * 0.3, 4, openH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (anim === 'laugh' || anim === 'celebrate' || isDog) {
      ctx.fillStyle = '#FB7185';
      ctx.beginPath();
      ctx.ellipse(0, -7, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Eyes
    if (anim === 'dizzy') {
      // Spinning dizzy spiral eyes
      [-10, 10].forEach(ex => {
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ex, -20, 5, time * 12, time * 12 + Math.PI * 1.5);
        ctx.stroke();
      });
    } else if (isBlinking || anim === 'pet' || anim === 'sleep' || anim === 'laugh') {
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-10, -20, 5, 1.2 * Math.PI, 1.8 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(10, -20, 5, 1.2 * Math.PI, 1.8 * Math.PI);
      ctx.stroke();
    } else {
      [-10, 10].forEach(ex => {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(ex, -20, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.eye;
        ctx.beginPath();
        ctx.arc(ex + eyeGazeX * 2, -20 + eyeGazeY * 2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(ex + eyeGazeX * 2 - 1, -21 + eyeGazeY * 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Paws
    ctx.fillStyle = pal.secondary;
    ctx.beginPath();
    ctx.ellipse(-12, 18, 7, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(12, 18, 7, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Render floating particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = p.life;
      if (p.type === 'heart') {
        ctx.fillStyle = '#EC4899';
        ctx.font = '14px sans-serif';
        ctx.fillText('❤️', p.x, p.y);
      } else if (p.type === 'star') {
        ctx.fillStyle = '#FBBF24';
        ctx.font = '12px sans-serif';
        ctx.fillText('⭐', p.x, p.y);
      } else if (p.type === 'bubble') {
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.text) {
        ctx.font = '14px sans-serif';
        ctx.fillText(p.text, p.x, p.y);
      }
      ctx.restore();
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  return {
    element: canvas,
    setAnimation: (a) => { anim = a; },
    setSpecies: (s) => { currentSpecies = s; },
    setGaze: (gx, gy) => { eyeGazeX = gx; eyeGazeY = gy; },
    setTalkingVolume: (v) => { talkingVolume = v; },
    spawnParticle: (t, px, py, text) => spawnParticle(t, px, py, text)
  };
}
`;
      zip.file('pet-engine.js', `(function(w){ ${petEngineCore}; w.PetSlamEngine = { createPetCanvas }; })(window);`);

      // 4. Popup HTML: Full multi-tab companion application (Buddy, Kennel, Radar Catch, Auctions)
      const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Pet Slam Sanctuary</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 380px;
      height: 570px;
      background: #07090E;
      color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      user-select: none;
    }
    .header {
      background: #0E131F;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 1px;
    }
    .logo img {
      width: 22px;
      height: 22px;
      border-radius: 50%;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .coins-badge {
      background: rgba(245,158,11,0.15);
      border: 1px solid rgba(245,158,11,0.3);
      color: #F59E0B;
      font-size: 10px;
      font-weight: bold;
      padding: 3px 8px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .summon-toggle-btn {
      background: #CCFF00;
      color: #000;
      border: none;
      font-size: 10px;
      font-weight: 900;
      padding: 4px 8px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      text-transform: uppercase;
    }
    .summon-toggle-btn:hover { background: #b8e600; }
    .tabs-nav {
      display: flex;
      background: #0B0E17;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      font-size: 11px;
      font-weight: bold;
    }
    .tab-btn {
      flex: 1;
      padding: 8px 4px;
      text-align: center;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: #94A3B8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      transition: all 0.15s;
    }
    .tab-btn.active {
      color: #CCFF00;
      border-bottom-color: #CCFF00;
      background: rgba(204,255,0,0.05);
    }
    .tab-content {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: none;
    }
    .tab-content.active { display: flex; flex-direction: column; }

    /* BUDDY TAB STAGE */
    .room-stage {
      position: relative;
      height: 200px;
      border-radius: 16px;
      background: radial-gradient(circle at center, #1E293B 0%, #07090E 80%);
      border: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      overflow: hidden;
      cursor: pointer;
    }
    .room-stage.night {
      background: radial-gradient(circle at center, #181534 0%, #040508 80%);
    }
    .light-switch {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0,0,0,0.6);
      border: 1px solid rgba(255,255,255,0.2);
      color: #FFF;
      border-radius: 8px;
      padding: 3px 6px;
      font-size: 10px;
      cursor: pointer;
      z-index: 10;
    }
    .speech-bubble {
      min-height: 22px;
      font-size: 11px;
      font-weight: bold;
      color: #CCFF00;
      text-align: center;
      margin-bottom: 6px;
    }
    .action-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin-bottom: 8px;
    }
    .action-btn {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      color: #FFF;
      padding: 6px 4px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      transition: all 0.15s;
    }
    .action-btn:hover {
      background: rgba(255,255,255,0.15);
      border-color: #CCFF00;
      color: #CCFF00;
    }
    .voice-bar {
      display: flex;
      gap: 6px;
      margin-bottom: 8px;
    }
    .mic-btn {
      flex: 1;
      background: #EF4444;
      color: #FFF;
      border: none;
      padding: 8px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 900;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }
    .mic-btn.recording {
      background: #DC2626;
      animation: pulse 1s infinite;
    }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }

    /* KENNEL TAB */
    .kennel-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .kennel-card {
      background: #0E1422;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: all 0.15s;
    }
    .kennel-card:hover {
      border-color: #CCFF00;
      transform: translateX(2px);
    }
    .kennel-card.active-pet {
      border-color: #CCFF00;
      background: rgba(204,255,0,0.06);
    }
    .pet-info h4 { font-size: 12px; font-weight: 900; color: #FFF; }
    .pet-info p { font-size: 10px; color: #94A3B8; }
    .pet-stats-pill {
      font-size: 9px;
      font-family: monospace;
      font-weight: bold;
      background: rgba(204,255,0,0.15);
      color: #CCFF00;
      padding: 2px 6px;
      border-radius: 6px;
    }

    /* RADAR CATCH TAB */
    .radar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .wild-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 8px;
    }
    .wild-item {
      background: #0F172A;
      border: 1px solid rgba(16,185,129,0.3);
      border-radius: 10px;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
    }
    .catch-arena {
      display: none;
      flex-direction: column;
      align-items: center;
      background: radial-gradient(circle at center, #064E3B 0%, #07090E 80%);
      border-radius: 14px;
      padding: 10px;
      border: 1px solid #10B981;
    }
    .ball-throw-area {
      position: relative;
      width: 100%;
      height: 180px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }
    .target-ring {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 2px solid #10B981;
      position: absolute;
      top: 15px;
      animation: contractRing 1.8s infinite linear;
    }
    @keyframes contractRing {
      0% { transform: scale(1.4); opacity: 1; }
      100% { transform: scale(0.6); opacity: 0.6; }
    }
    .pokeball-btn {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: radial-gradient(circle at top, #EF4444 48%, #1E293B 48%, #1E293B 54%, #FFFFFF 54%);
      border: 3px solid #000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.6);
      cursor: grab;
      position: relative;
    }
    .pokeball-btn::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 14px;
      height: 14px;
      background: #FFF;
      border: 3px solid #000;
      border-radius: 50%;
    }

    /* AUCTION TAB */
    .auction-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .auction-card {
      background: #0E1422;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 8px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-bid {
      background: #F59E0B;
      color: #000;
      font-size: 10px;
      font-weight: 900;
      padding: 4px 8px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
    }
    .btn-buyout {
      background: #CCFF00;
      color: #000;
      font-size: 10px;
      font-weight: 900;
      padding: 4px 8px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
    }

    .footer {
      background: #0B0E17;
      border-top: 1px solid rgba(255,255,255,0.08);
      padding: 6px 12px;
      font-size: 9px;
      color: #64748B;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <img src="icons/icon48.png" />
      <span>PET<span style="color:#CCFF00;">SLAM</span></span>
    </div>
    <div class="header-right">
      <div class="coins-badge">🪙 <span id="coinCount">2,450</span></div>
      <button class="summon-toggle-btn" id="headerSummonBtn">🐾 Walk on All Tabs</button>
    </div>
  </div>

  <div class="tabs-nav">
    <button class="tab-btn active" data-tab="buddy">🏠 Buddy</button>
    <button class="tab-btn" data-tab="kennel">🐾 Kennel (12)</button>
    <button class="tab-btn" data-tab="radar">🎯 Catch Radar</button>
    <button class="tab-btn" data-tab="auctions">⚖️ Market</button>
  </div>

  <!-- TAB 1: BUDDY (Interactive Sanctuary Stage) -->
  <div class="tab-content active" id="tab-buddy">
    <div class="speech-bubble" id="petSpeech">Hi! I'm your companion! Tap me or speak to me! 🐾</div>

    <div class="room-stage" id="stageContainer" title="Tap head to poke, belly to tickle, stroke to pet!">
      <button class="light-switch" id="lightSwitchBtn">☀️ Day</button>
    </div>

    <!-- Voice Mimic Bar -->
    <div class="voice-bar">
      <button class="mic-btn" id="micBtn">🎙️ Hold & Speak (Pet Voice Mimic)</button>
      <button class="action-btn" id="voicePresetBtn" style="flex:0.6;">📢 Say Hello</button>
    </div>

    <!-- Dedicated Bark & Meow Context-Aware Audio -->
    <div class="action-grid" style="margin-bottom:6px;">
      <button class="action-btn" id="barkBtn" style="border-color:#F59E0B;color:#F59E0B;">🐶 Bark<span style="font-size:8px;color:#FDE68A;">Woof!</span></button>
      <button class="action-btn" id="meowBtn" style="border-color:#F43F5E;color:#F43F5E;">🐱 Meow<span style="font-size:8px;color:#FDA4AF;">Purr~</span></button>
    </div>

    <!-- Companion Care Action Bar -->
    <div class="action-grid">
      <button class="action-btn" id="feedBerryBtn">🍓 Feed Berry<span style="font-size:8px;color:#CCFF00;">+50🪙</span></button>
      <button class="action-btn" id="bathBtn">🧼 Bubble Bath<span style="font-size:8px;color:#38BDF8;">+30❤️</span></button>
      <button class="action-btn" id="petStrokeBtn">❤️ Stroke Fur<span style="font-size:8px;color:#F43F5E;">Purr</span></button>
      <button class="action-btn" id="catchBtn">🎾 Play Catch<span style="font-size:8px;color:#CCFF00;">+35🪙</span></button>
    </div>

    <div class="action-grid">
      <button class="action-btn" id="gymWorkoutBtn">🏋️ Workout<span style="font-size:8px;color:#F59E0B;">+10 CP</span></button>
      <button class="action-btn" id="renamePetBtn">✏️ Rename</button>
      <button class="action-btn" id="screenRoamBtn" style="grid-column: span 2;color:#CCFF00;border-color:#CCFF00;">🐾 Roam on Screen</button>
    </div>
  </div>

  <!-- TAB 2: KENNEL (All 12 Pet Varieties) -->
  <div class="tab-content" id="tab-kennel">
    <div style="font-size:11px;font-weight:bold;color:#94A3B8;margin-bottom:8px;">
      Switch your active companion anytime:
    </div>
    <div class="kennel-list" id="kennelContainer"></div>
  </div>

  <!-- TAB 3: POKEMON GO CATCH RADAR -->
  <div class="tab-content" id="tab-radar">
    <div id="radarMain">
      <div class="radar-header">
        <span style="font-size:11px;font-weight:bold;color:#10B981;">📡 Wild Pets in Your Area</span>
        <button id="rescanRadarBtn" style="background:#1E293B;color:#FFF;border:none;padding:2px 8px;border-radius:6px;font-size:9px;cursor:pointer;">🔄 Scan Area</button>
      </div>
      <div class="wild-list" id="wildSpawnsContainer"></div>
    </div>

    <!-- Active Wild Encounter Arena -->
    <div class="catch-arena" id="catchArena">
      <div style="font-size:11px;font-weight:bold;color:#CCFF00;" id="wildTargetName">Wild Husky</div>
      <div id="wildCanvasBox" style="width:110px;height:110px;"></div>
      <div class="ball-throw-area">
        <div class="target-ring" id="targetRing"></div>
        <div style="margin-top:auto;display:flex;gap:12px;align-items:center;">
          <button id="throwBerryBtn" style="background:#EF4444;border:none;color:#FFF;padding:4px 8px;border-radius:8px;font-size:10px;cursor:pointer;">🍓 Razz (+Catch)</button>
          <div class="pokeball-btn" id="flickBallBtn" title="Click or flick to throw Beast-Ball!"></div>
        </div>
      </div>
      <div id="catchStatusText" style="font-size:10px;color:#CCFF00;margin-top:6px;min-height:16px;"></div>
      <button id="exitCatchBtn" style="background:none;border:none;color:#94A3B8;font-size:10px;cursor:pointer;margin-top:4px;">✕ Run Away</button>
    </div>
  </div>

  <!-- TAB 4: PET AUCTION MARKET -->
  <div class="tab-content" id="tab-auctions">
    <div style="font-size:11px;font-weight:bold;color:#F59E0B;margin-bottom:6px;">
      ⚖️ Live Pet Auctions & Marketplace
    </div>

    <!-- Quick List Form -->
    <div style="background:#0F1422;border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:8px;margin-bottom:8px;">
      <div style="font-size:10px;font-weight:bold;color:#F59E0B;margin-bottom:4px;display:flex;justify-content:space-between;">
        <span>➕ List Companion on Market</span>
        <span style="color:#94A3B8;" id="listingPetTag">Active: Hachi</span>
      </div>
      <div style="display:flex;gap:4px;margin-bottom:4px;">
        <input type="number" id="listStartBid" placeholder="Start Bid (🪙)" style="flex:1;background:#07090E;color:#FFF;border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:3px 6px;font-size:10px;" value="1200" />
        <input type="number" id="listBuyout" placeholder="Buyout (🪙)" style="flex:1;background:#07090E;color:#FFF;border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:3px 6px;font-size:10px;" value="2500" />
      </div>
      <button id="submitListingBtn" style="width:100%;background:#F59E0B;color:#000;border:none;border-radius:6px;padding:4px;font-size:10px;font-weight:bold;cursor:pointer;">List for Auction</button>
    </div>

    <!-- Activity Ticker -->
    <div id="marketTicker" style="font-size:9px;color:#10B981;font-weight:bold;background:rgba(16,185,129,0.1);padding:3px 6px;border-radius:6px;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
      ⚡ Live Market: 3 active auctions across community
    </div>

    <div class="auction-list" id="auctionListContainer"></div>
  </div>

  <div class="footer">
    <span id="footerPetName">Hachi (Lv.1)</span>
    <span>Affection: ❤️❤️❤️</span>
    <span id="screenStatusText">All Tabs: Roaming 🟢</span>
  </div>

  <script src="pet-engine.js"></script>
  <script src="popup.js"></script>
</body>
</html>`;
      zip.file('popup.html', popupHtml);

      // 5. Popup JS: Complete interactive state for all features and breeds
      const popupJs = `
// AUDIO ENGINE (Web Audio API synthesis for zero external file dependencies)
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new AudioContextClass();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playBark() {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.12);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.12);
}

function playMeow() {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(450, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.2);
  osc.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.45);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.45);
}

function playGiggle() {
  const ctx = getAudio();
  [520, 680, 820].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);
    gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.07);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.08);
    osc.stop(ctx.currentTime + i * 0.08 + 0.07);
  });
}

function playPoke() {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.35, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.15);
}

function playSlurp() {
  const ctx = getAudio();
  for (let i = 0; i < 4; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(600 + Math.random() * 300, ctx.currentTime + i * 0.08);
    gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.06);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.08);
    osc.stop(ctx.currentTime + i * 0.08 + 0.06);
  }
}

function playPop() {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.05);
}

function playToot() {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(95, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.25);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.25);
}

function playCoinSound() {
  const ctx = getAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(987, ctx.currentTime);
  osc.frequency.setValueAtTime(1318, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.35);
}

// ALL 12 PET VARIETIES
const ALL_PET_BREEDS = [
  // Dogs
  { id: 'shiba', name: 'Hachi', breed: 'Shiba Inu', category: 'dog', cp: 420, level: 1 },
  { id: 'retriever', name: 'Buddy', breed: 'Golden Retriever', category: 'dog', cp: 400, level: 1 },
  { id: 'husky', name: 'Ghost', breed: 'Arctic Husky', category: 'dog', cp: 460, level: 1 },
  { id: 'bulldog', name: 'Rocky', breed: 'French Bulldog', category: 'dog', cp: 440, level: 1 },
  // Cats
  { id: 'tabby', name: 'Ginger', breed: 'Orange Tabby', category: 'cat', cp: 410, level: 1 },
  { id: 'calico', name: 'Luna', breed: 'Calico Cat', category: 'cat', cp: 390, level: 1 },
  { id: 'siamese', name: 'Mochi', breed: 'Siamese Cat', category: 'cat', cp: 430, level: 1 },
  { id: 'blackcat', name: 'Midnight', breed: 'Shadow Black Cat', category: 'cat', cp: 450, level: 1 },
  // Mythic Beasts
  { id: 'kodiak', name: 'Kodiak', breed: 'Ursine Warden', category: 'beast', cp: 480, level: 1 },
  { id: 'bagheera', name: 'Bagheera', breed: 'Shadow Panther', category: 'beast', cp: 500, level: 1 },
  { id: 'ignis', name: 'Ignis', breed: 'Flame Hound', category: 'beast', cp: 520, level: 1 },
  { id: 'sultan', name: 'Sultan', breed: 'Royal Gryphon', category: 'beast', cp: 550, level: 1 },
];

let activePet = ALL_PET_BREEDS[0];
let petCanvas = null;
let roomLighting = 'day';
let coins = 2450;
let isSummoned = true;

// Initialize State
chrome.storage.local.get(['activePet', 'coins', 'isSummoned'], (res) => {
  if (res.activePet) {
    const found = ALL_PET_BREEDS.find(b => b.id === res.activePet.species || b.id === res.activePet.id) || res.activePet;
    activePet = found;
  }
  if (res.coins !== undefined) coins = res.coins;
  if (res.isSummoned !== undefined) isSummoned = res.isSummoned;
  
  document.getElementById('coinCount').textContent = coins.toLocaleString();
  updateSummonButtonUI();
  updateBuddyUI();
  initKennel();
  initRadar();
  initAuctions();
});

function updateSummonButtonUI() {
  const btn = document.getElementById('headerSummonBtn');
  const roamBtn = document.getElementById('screenRoamBtn');
  const statusEl = document.getElementById('screenStatusText');
  if (isSummoned) {
    if (btn) { btn.textContent = '✓ Roaming on All Tabs'; btn.style.background = '#10B981'; btn.style.color = '#FFF'; }
    if (roamBtn) { roamBtn.textContent = '🐾 Hide on All Tabs'; roamBtn.style.color = '#F59E0B'; }
    if (statusEl) { statusEl.textContent = 'All Tabs: Roaming 🟢'; }
  } else {
    if (btn) { btn.textContent = '🐾 Walk on All Tabs'; btn.style.background = '#CCFF00'; btn.style.color = '#000'; }
    if (roamBtn) { roamBtn.textContent = '🐾 Roam All Tabs'; roamBtn.style.color = '#CCFF00'; }
    if (statusEl) { statusEl.textContent = 'All Tabs: Hidden ⚪'; }
  }
}

// Setup Main Stage Canvas
const stage = document.getElementById('stageContainer');
petCanvas = PetSlamEngine.createPetCanvas(activePet.id, 1, 150, 150);
stage.appendChild(petCanvas.element);

function updateBuddyUI() {
  document.getElementById('petSpeech').textContent = "Hi! I'm " + activePet.name + "! Tap me or speak to me! 🐾";
  document.getElementById('footerPetName').textContent = activePet.name + " (" + activePet.breed + ")";
  const tag = document.getElementById('listingPetTag');
  if (tag) tag.textContent = 'Active: ' + activePet.name;
  if (petCanvas) petCanvas.setSpecies(activePet.id || activePet.species);
}

// Stage Click Zones (Talking Tom Head Poke vs Belly Tickle)
stage.addEventListener('click', (e) => {
  const rect = stage.getBoundingClientRect();
  const y = e.clientY - rect.top;
  if (y < rect.height * 0.42) {
    // Poke Head
    playPoke();
    petCanvas.setAnimation('dizzy');
    document.getElementById('petSpeech').textContent = "Ouch! My head is spinning! ⭐";
    petCanvas.spawnParticle('star');
    setTimeout(() => petCanvas.setAnimation('idle'), 2000);
  } else {
    // Tickle Belly
    playGiggle();
    petCanvas.setAnimation('laugh');
    document.getElementById('petSpeech').textContent = "Hahaha! That tickles so much! ❤️";
    petCanvas.spawnParticle('heart');
    setTimeout(() => petCanvas.setAnimation('idle'), 1800);
  }
});

// Day / Night Switch
document.getElementById('lightSwitchBtn').addEventListener('click', () => {
  if (roomLighting === 'day') {
    roomLighting = 'night';
    stage.classList.add('night');
    document.getElementById('lightSwitchBtn').textContent = '🌙 Night';
    petCanvas.setAnimation('sleep');
    document.getElementById('petSpeech').textContent = 'Goodnight... Zzz 😴🌙';
  } else {
    roomLighting = 'day';
    stage.classList.remove('night');
    document.getElementById('lightSwitchBtn').textContent = '☀️ Day';
    petCanvas.setAnimation('celebrate');
    document.getElementById('petSpeech').textContent = 'Good morning! Ready to play! ☀️';
    setTimeout(() => petCanvas.setAnimation('idle'), 1500);
  }
});

// Voice Mimicry (Web Audio / Speech Recognition + High Pitch Repeater)
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];

document.getElementById('micBtn').addEventListener('click', async () => {
  const btn = document.getElementById('micBtn');
  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const arrayBuf = await audioBlob.arrayBuffer();
        const ctx = getAudio();
        const decoded = await ctx.decodeAudioData(arrayBuf);
        const source = ctx.createBufferSource();
        source.buffer = decoded;
        source.playbackRate.value = 1.35; // Natural high-pitch companion voice
        source.connect(ctx.destination);
        
        petCanvas.setAnimation('talk');
        petCanvas.setTalkingVolume(0.8);
        document.getElementById('petSpeech').textContent = "Repeating in " + activePet.name + "'s voice! 🐾";
        source.start(0);
        source.onended = () => {
          petCanvas.setAnimation('idle');
          petCanvas.setTalkingVolume(0);
          document.getElementById('petSpeech').textContent = "Hehe! What a great conversation!";
        };
      };
      mediaRecorder.start();
      isRecording = true;
      btn.textContent = '⏹️ Listening... Click to Repeat!';
      btn.classList.add('recording');
      document.getElementById('petSpeech').textContent = 'Listening to your voice... 🎙️';
    } catch (err) {
      // High-pitch speech synthesis fallback
      document.getElementById('petSpeech').textContent = 'Hi! Voice mimic ready! 🐾';
      speakFallback("Hello! I am " + activePet.name + "! I love roaming with you in Pet Slam!");
    }
  } else {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(t => t.stop());
    }
    isRecording = false;
    btn.textContent = '🎙️ Hold & Speak (Pet Voice Mimic)';
    btn.classList.remove('recording');
  }
});

function speakFallback(text) {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.pitch = 1.5;
  u.rate = 1.25;
  petCanvas.setAnimation('talk');
  petCanvas.setTalkingVolume(0.8);
  u.onend = () => {
    petCanvas.setAnimation('idle');
    petCanvas.setTalkingVolume(0);
  };
  window.speechSynthesis.speak(u);
}

document.getElementById('voicePresetBtn').addEventListener('click', () => {
  const phrases = [
    "Hello there! I'm your best companion!",
    "I'm walking across all your browser tabs right now!",
    "Can you feed me a delicious berry please?",
    "Purrr, you are the absolute best trainer!"
  ];
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  document.getElementById('petSpeech').textContent = phrase;
  speakFallback(phrase);
});

// Meaningful Companion Care Action Handlers
document.getElementById('feedBerryBtn').addEventListener('click', async () => {
  playSlurp();
  petCanvas.setAnimation('eat');
  coins += 50;
  await chrome.storage.local.set({ coins });
  const countEl = document.getElementById('coinCount');
  if (countEl) countEl.textContent = coins.toLocaleString();
  document.getElementById('petSpeech').textContent = 'Munch munch! +50 Coins & +25 XP! 🍓';
  petCanvas.spawnParticle('heart');
  setTimeout(() => petCanvas.setAnimation('idle'), 2200);
});

document.getElementById('bathBtn').addEventListener('click', () => {
  playPop();
  petCanvas.setAnimation('bath');
  document.getElementById('petSpeech').textContent = 'Squeaky clean! +30 Affection Hearts! 🧼✨';
  setTimeout(() => petCanvas.setAnimation('idle'), 2400);
});

document.getElementById('petStrokeBtn').addEventListener('click', () => {
  if (activePet.category === 'cat') playMeow(); else playBark();
  petCanvas.setAnimation('pet');
  document.getElementById('petSpeech').textContent = 'Purrrrr! You give the best pets! +15 Affection ❤️';
  petCanvas.spawnParticle('heart');
  setTimeout(() => petCanvas.setAnimation('idle'), 1800);
});

const barkBtn = document.getElementById('barkBtn');
if (barkBtn) {
  barkBtn.addEventListener('click', () => {
    playBark();
    petCanvas.setAnimation('celebrate');
    document.getElementById('petSpeech').textContent = 'Woof woof! Arf! 🐶🐾';
    petCanvas.spawnParticle('heart');
    setTimeout(() => petCanvas.setAnimation('idle'), 1600);
  });
}

const meowBtn = document.getElementById('meowBtn');
if (meowBtn) {
  meowBtn.addEventListener('click', () => {
    playMeow();
    petCanvas.setAnimation('celebrate');
    document.getElementById('petSpeech').textContent = 'Meow meow! Purrrr~ 🐱✨';
    petCanvas.spawnParticle('heart');
    setTimeout(() => petCanvas.setAnimation('idle'), 1600);
  });
}

const catchBtn = document.getElementById('catchBtn');
if (catchBtn) {
  catchBtn.addEventListener('click', async () => {
    playCoinSound();
    petCanvas.setAnimation('celebrate');
    coins += 35;
    await chrome.storage.local.set({ coins });
    const countEl = document.getElementById('coinCount');
    if (countEl) countEl.textContent = coins.toLocaleString();
    document.getElementById('petSpeech').textContent = 'Great throw! Leaping catch! +35 Coins & +15 XP! 🎾';
    petCanvas.spawnParticle('heart');
    setTimeout(() => petCanvas.setAnimation('idle'), 2000);
  });
}

document.getElementById('gymWorkoutBtn').addEventListener('click', async () => {
  playPop();
  petCanvas.setAnimation('celebrate');
  activePet.cp = (activePet.cp || 400) + 10;
  await chrome.storage.local.set({ activePet });
  document.getElementById('petSpeech').textContent = 'Gym Workout complete! +10 Combat Power! (Total CP: ' + activePet.cp + ') 🏋️';
  setTimeout(() => petCanvas.setAnimation('idle'), 1800);
});

document.getElementById('renamePetBtn').addEventListener('click', () => {
  const newName = prompt('Enter a new name for your companion:', activePet.name);
  if (newName && newName.trim()) {
    activePet.name = newName.trim();
    chrome.storage.local.set({ activePet });
    updateBuddyUI();
    broadcastPetChange();
  }
});

// Global Cross-Tab Summon Toggle
async function toggleGlobalSummon() {
  isSummoned = !isSummoned;
  await chrome.storage.local.set({ isSummoned, activePet });
  updateSummonButtonUI();
  
  if (isSummoned) {
    playPop();
    chrome.runtime.sendMessage({ action: 'summon_all', pet: activePet });
  } else {
    chrome.runtime.sendMessage({ action: 'hide_all' });
  }
}

document.getElementById('headerSummonBtn').addEventListener('click', toggleGlobalSummon);
document.getElementById('screenRoamBtn').addEventListener('click', toggleGlobalSummon);

function broadcastPetChange() {
  chrome.storage.local.set({ activePet });
  chrome.runtime.sendMessage({ action: 'change_active_pet', pet: activePet });
}

// TAB 2: KENNEL (Select any of the 12 Varieties)
function initKennel() {
  const container = document.getElementById('kennelContainer');
  container.innerHTML = '';
  ALL_PET_BREEDS.forEach((breed) => {
    const card = document.createElement('div');
    const isCur = breed.id === activePet.id || breed.id === activePet.species;
    card.className = 'kennel-card ' + (isCur ? 'active-pet' : '');
    card.innerHTML = \`
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:20px;">\${breed.category === 'cat' ? '🐱' : breed.category === 'dog' ? '🐶' : '🦁'}</span>
        <div class="pet-info">
          <h4>\${breed.name} <span style="font-size:10px;color:#CCFF00;">(\${breed.breed})</span></h4>
          <p>CP \${breed.cp} · Lv.\${breed.level}</p>
        </div>
      </div>
      <button class="summon-toggle-btn" style="padding:3px 8px;font-size:9px;">
        \${isCur ? 'Active ✓' : 'Select'}
      </button>
    \`;
    card.addEventListener('click', () => {
      activePet = breed;
      chrome.storage.local.set({ activePet });
      updateBuddyUI();
      initKennel();
      broadcastPetChange();
      playPop();
    });
    container.appendChild(card);
  });
}

// TAB 3: POKEMON GO CATCH RADAR
const WILD_PETS = [
  { id: 'w1', species: 'husky', name: 'Wild Arctic Husky', cp: 520, rarity: 'Rare', category: 'dog' },
  { id: 'w2', species: 'tabby', name: 'Wild Striped Tabby', cp: 410, rarity: 'Common', category: 'cat' },
  { id: 'w3', species: 'bulldog', name: 'Wild Tank Bulldog', cp: 480, rarity: 'Uncommon', category: 'dog' },
  { id: 'w4', species: 'siamese', name: 'Wild Sapphire Siamese', cp: 540, rarity: 'Rare', category: 'cat' }
];

let wildCanvas = null;
let currentWildTarget = null;

function initRadar() {
  const spawnsBox = document.getElementById('wildSpawnsContainer');
  spawnsBox.innerHTML = '';
  WILD_PETS.forEach(w => {
    const item = document.createElement('div');
    item.className = 'wild-item';
    item.innerHTML = \`
      <div>
        <div style="font-size:11px;font-weight:bold;color:#FFF;">\${w.name}</div>
        <div style="font-size:9px;color:#10B981;">CP \${w.cp} · \${w.rarity}</div>
      </div>
      <button class="summon-toggle-btn" style="background:#10B981;color:#FFF;">Encounter 🎯</button>
    \`;
    item.addEventListener('click', () => startCatchEncounter(w));
    spawnsBox.appendChild(item);
  });
}

function startCatchEncounter(wild) {
  currentWildTarget = wild;
  document.getElementById('radarMain').style.display = 'none';
  document.getElementById('catchArena').style.display = 'flex';
  document.getElementById('wildTargetName').textContent = wild.name + ' (CP ' + wild.cp + ')';
  document.getElementById('catchStatusText').textContent = 'Swipe or click Beast-Ball to throw!';

  const box = document.getElementById('wildCanvasBox');
  box.innerHTML = '';
  wildCanvas = PetSlamEngine.createPetCanvas(wild.species, 1, 110, 110);
  box.appendChild(wildCanvas.element);
}

document.getElementById('exitCatchBtn').addEventListener('click', () => {
  document.getElementById('catchArena').style.display = 'none';
  document.getElementById('radarMain').style.display = 'block';
});

document.getElementById('throwBerryBtn').addEventListener('click', () => {
  playSlurp();
  document.getElementById('catchStatusText').textContent = 'Fed Razz Berry! Catch chance increased! 🍓';
});

document.getElementById('flickBallBtn').addEventListener('click', () => {
  playPop();
  document.getElementById('catchStatusText').textContent = 'Throwing Beast-Ball... 🌀';
  setTimeout(() => {
    document.getElementById('catchStatusText').textContent = '1... 2... 3...';
    setTimeout(() => {
      playCoinSound();
      document.getElementById('catchStatusText').textContent = '🎉 GOTCHA! ' + currentWildTarget.name + ' was caught!';
      // Add to kennel
      ALL_PET_BREEDS.push({
        id: currentWildTarget.species,
        name: currentWildTarget.name.replace('Wild ', ''),
        breed: currentWildTarget.name,
        category: currentWildTarget.category,
        cp: currentWildTarget.cp,
        level: 1
      });
      initKennel();
      setTimeout(() => {
        document.getElementById('catchArena').style.display = 'none';
        document.getElementById('radarMain').style.display = 'block';
      }, 1500);
    }, 1000);
  }, 800);
});

// TAB 4: AUCTIONS & MARKETPLACE
const AUCTIONS = [
  { id: 'a1', name: 'Tiger Tabby', species: 'tabby', cp: 580, bid: 1400, buyout: 2500, time: '35m', seller: 'Trainer_Red' },
  { id: 'a2', name: 'Titan Bulldog', species: 'bulldog', cp: 640, bid: 2100, buyout: 3800, time: '1h 10m', seller: 'BulldogBoss' },
  { id: 'a3', name: 'Ghost Husky', species: 'husky', cp: 610, bid: 1800, buyout: 3200, time: '2h', seller: 'FrostWolf' }
];

function initAuctions() {
  const container = document.getElementById('auctionListContainer');
  container.innerHTML = '';
  AUCTIONS.forEach(auc => {
    const item = document.createElement('div');
    item.className = 'auction-card';
    item.innerHTML = \`
      <div>
        <div style="font-size:11px;font-weight:bold;color:#FFF;">\${auc.name}</div>
        <div style="font-size:9px;color:#94A3B8;">CP \${auc.cp} · Bid: 🪙\${auc.bid} · Buy: 🪙\${auc.buyout}</div>
        <div style="font-size:8px;color:#F59E0B;">Seller: \${auc.seller || 'Trainer'} · \${auc.time} left</div>
      </div>
      <div style="display:flex;gap:4px;">
        <button class="btn-bid" data-id="\${auc.id}">Bid +100</button>
        <button class="btn-buyout" data-buy="\${auc.id}">Buy 🪙\${auc.buyout}</button>
      </div>
    \`;
    item.querySelector('.btn-bid').addEventListener('click', () => {
      if (coins >= 100) {
        coins -= 100;
        auc.bid += 100;
        chrome.storage.local.set({ coins });
        document.getElementById('coinCount').textContent = coins.toLocaleString();
        playCoinSound();
        const ticker = document.getElementById('marketTicker');
        if (ticker) ticker.textContent = "⚡ You raised bid on " + auc.name + " to 🪙" + auc.bid.toLocaleString() + "!";
        initAuctions();
      } else {
        alert('Not enough coins!');
      }
    });
    item.querySelector('.btn-buyout').addEventListener('click', () => {
      if (coins >= auc.buyout) {
        coins -= auc.buyout;
        chrome.storage.local.set({ coins });
        document.getElementById('coinCount').textContent = coins.toLocaleString();
        playCoinSound();
        alert('🎉 Purchased ' + auc.name + '! Added to your Kennel!');
        ALL_PET_BREEDS.push({
          id: auc.species,
          name: auc.name,
          breed: auc.name,
          category: 'dog',
          cp: auc.cp,
          level: 3
        });
        initKennel();
      } else {
        alert('Not enough coins to buyout!');
      }
    });
    container.appendChild(item);
  });
}

// Listing Active Companion
document.getElementById('submitListingBtn').addEventListener('click', () => {
  const startBid = parseInt(document.getElementById('listStartBid').value) || 1000;
  const buyout = parseInt(document.getElementById('listBuyout').value) || 2000;
  if (buyout <= startBid) {
    alert('Buyout price must be higher than start bid!');
    return;
  }
  const newListing = {
    id: 'user_' + Date.now(),
    name: activePet.name + ' (' + (activePet.breed || 'Pet') + ')',
    species: activePet.id || activePet.species,
    cp: activePet.cp || 420,
    bid: startBid,
    buyout: buyout,
    time: '3h',
    seller: 'You'
  };
  AUCTIONS.unshift(newListing);
  playCoinSound();
  const ticker = document.getElementById('marketTicker');
  if (ticker) ticker.textContent = '⚡ Listed ' + activePet.name + ' for 🪙' + startBid.toLocaleString() + ' starting bid!';
  initAuctions();
});

// Periodic simulated market activity
setInterval(() => {
  if (AUCTIONS.length > 0) {
    const target = AUCTIONS[Math.floor(Math.random() * AUCTIONS.length)];
    target.bid += 50;
    const ticker = document.getElementById('marketTicker');
    if (ticker) ticker.textContent = '⚡ Rival Trainer raised bid on ' + target.name + ' to 🪙' + target.bid.toLocaleString() + '!';
    initAuctions();
  }
}, 15000);

// Tab Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});
`;
      zip.file('popup.js', popupJs);

      // 6. Content Script: Dynamic On-Screen Roaming Companion with Cross-Tab Storage Sync
      const contentScript = `// PET SLAM FLOATING MULTI-PET SCREEN COMPANION - CROSS-TAB ROAMING
(function() {
  if (window.__petslam_companion_loaded) {
    // If already loaded, ensure visible
    const existingHost = document.getElementById('petslam-companion-host');
    if (existingHost) {
      existingHost.style.display = 'block';
    }
    return;
  }
  window.__petslam_companion_loaded = true;

  ${petEngineCore}

  let activePetData = {
    species: '${pet.species}',
    name: '${pet.name}',
    level: ${pet.level}
  };
  let isSummonedGlobally = true;
  let hostElement = null;
  let petInstance = null;
  let nameBadge = null;
  let bubbleEl = null;

  function initCompanion() {
    let host = document.getElementById('petslam-companion-host');
    if (host) {
      hostElement = host;
      if (isSummonedGlobally) host.style.display = 'block';
      return;
    }

    host = document.createElement('div');
    host.id = 'petslam-companion-host';
    hostElement = host;
    host.style.cssText = [
      'position: fixed !important',
      'top: 100px !important',
      'left: 100px !important',
      'z-index: 2147483647 !important',
      'display: ' + (isSummonedGlobally ? 'block' : 'none') + ' !important',
      'width: auto !important',
      'height: auto !important',
      'margin: 0 !important',
      'padding: 0 !important',
      'pointer-events: auto !important',
      'user-select: none !important',
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important',
      'line-height: normal !important',
      'box-sizing: border-box !important',
      'transform: none !important',
      'opacity: 1 !important',
      'visibility: visible !important'
    ].join(';');

    const targetParent = document.body || document.documentElement;
    if (targetParent) {
      targetParent.appendChild(host);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        (document.body || document.documentElement).appendChild(host);
      });
    }

    const shadow = host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = \`
      * { box-sizing: border-box; margin: 0; padding: 0; }
      .wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: grab;
        filter: drop-shadow(0 10px 25px rgba(0,0,0,0.65));
        transition: transform 0.15s ease;
      }
      .wrapper:active { cursor: grabbing; transform: scale(1.03); }
      .bubble {
        background: #0F172A;
        color: #FFFFFF;
        border: 1px solid #CCFF00;
        padding: 5px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: bold;
        white-space: nowrap;
        margin-bottom: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      }
      .badge {
        background: #0B0E17;
        color: #CCFF00;
        border: 1px solid rgba(204,255,0,0.4);
        font-size: 10px;
        font-weight: 900;
        padding: 2px 8px;
        border-radius: 10px;
        margin-bottom: 2px;
        letter-spacing: 0.5px;
      }
      .charging-halo {
        position: absolute;
        inset: -12px;
        border-radius: 50%;
        border: 2px solid #00F0FF;
        box-shadow: 0 0 22px #00F0FF, inset 0 0 15px rgba(0,240,255,0.45);
        animation: pulseCharging 1.4s infinite alternate;
        pointer-events: none;
        display: none;
      }
      @keyframes pulseCharging {
        0% { transform: scale(0.98); opacity: 0.5; }
        100% { transform: scale(1.06); opacity: 1; }
      }
      .minimized-pill {
        display: none;
        align-items: center;
        gap: 8px;
        background: #0B0E17;
        border: 2px solid #CCFF00;
        color: #FFFFFF;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 900;
        cursor: grab;
        box-shadow: 0 0 18px rgba(204,255,0,0.35);
        font-family: inherit;
        user-select: none;
      }
      .minimized-pill:hover { background: #1E293B; }
      .minimized-pill:active { cursor: grabbing; }
      .pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #CCFF00;
        box-shadow: 0 0 8px #CCFF00;
        animation: pulseDot 1s infinite alternate;
      }
      @keyframes pulseDot { 0% { opacity: 0.4; } 100% { opacity: 1; } }
      .toolbar {
        position: absolute;
        bottom: -28px;
        display: none;
        background: #0B0E17;
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 20px;
        padding: 2px 6px;
        gap: 6px;
        align-items: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
      }
      .wrapper:hover .toolbar { display: flex; }
      .tool-btn {
        background: none; border: none; color: #CCFF00;
        font-size: 11px; cursor: pointer; padding: 2px 4px; border-radius: 4px;
      }
      .tool-btn:hover { background: rgba(204,255,0,0.2); }
      .close-btn { color: #94A3B8; font-size: 11px; cursor: pointer; background: none; border: none; padding: 0 2px; }
      .close-btn:hover { color: #EF4444; }
    \`;
    shadow.appendChild(style);

    const wrapper = document.createElement('div');
    wrapper.className = 'wrapper';
    shadow.appendChild(wrapper);

    const chargingHalo = document.createElement('div');
    chargingHalo.className = 'charging-halo';
    wrapper.appendChild(chargingHalo);

    bubbleEl = document.createElement('div');
    bubbleEl.className = 'bubble';
    bubbleEl.textContent = activePetData.name + " is roaming here! 🐾";
    wrapper.appendChild(bubbleEl);
    setTimeout(() => { if (bubbleEl) bubbleEl.style.display = 'none'; }, 4500);

    nameBadge = document.createElement('div');
    nameBadge.className = 'badge';
    nameBadge.textContent = activePetData.name + " · Lv." + (activePetData.level || 1);
    wrapper.appendChild(nameBadge);

    petInstance = createPetCanvas(activePetData.species || activePetData.id || 'shiba', 1, 160, 160);
    wrapper.appendChild(petInstance.element);

    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';
    toolbar.innerHTML = \`
      <button class="tool-btn" id="feedTool" title="Feed Berry (+50🪙 +25XP)">🍓</button>
      <button class="tool-btn" id="petTool" title="Stroke Fur (+15❤️)">❤️</button>
      <button class="tool-btn" id="bathTool" title="Bubble Bath (+30❤️)">🧼</button>
      <button class="tool-btn" id="workoutTool" title="Gym Workout (+10 CP)">🏋️</button>
      <button class="tool-btn" id="catchTool" title="Play Catch (+35🪙)">🎾</button>
      <button class="tool-btn" id="minimizeTool" title="Minimize Companion">➖</button>
      <button class="close-btn" id="hideTool" title="Hide">✕</button>
    \`;
    wrapper.appendChild(toolbar);

    const minPill = document.createElement('button');
    minPill.className = 'minimized-pill';
    minPill.innerHTML = '<span class="pulse-dot"></span><span>' + activePetData.name + '</span> <span style="color:#94a3b8;font-weight:normal;">(Expand)</span> ⌃';
    shadow.appendChild(minPill);

    // Minimize toggle handlers
    shadow.getElementById('minimizeTool').addEventListener('click', (e) => {
      e.stopPropagation();
      wrapper.style.display = 'none';
      minPill.style.display = 'flex';
      if (bubbleEl) bubbleEl.style.display = 'none';
    });

    minPill.addEventListener('click', (e) => {
      e.stopPropagation();
      minPill.style.display = 'none';
      wrapper.style.display = 'flex';
      if (petInstance) {
        petInstance.setAnimation('celebrate');
        setTimeout(() => petInstance.setAnimation('idle'), 1500);
      }
    });

    // Pet canvas interactive click zones
    petInstance.element.addEventListener('click', (e) => {
      const rect = petInstance.element.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      if (clickY < rect.height * 0.42) {
        // Poke Head (Dizzy)
        petInstance.setAnimation('dizzy');
        bubbleEl.textContent = 'Ouch! My head is spinning! ⭐';
        bubbleEl.style.display = 'block';
        petInstance.spawnParticle('star');
        setTimeout(() => { if (bubbleEl) bubbleEl.style.display = 'none'; petInstance.setAnimation('idle'); }, 2000);
      } else {
        // Tickle Belly (Laugh)
        petInstance.setAnimation('laugh');
        bubbleEl.textContent = 'Hahaha! That tickles so much! ❤️';
        bubbleEl.style.display = 'block';
        petInstance.spawnParticle('heart');
        setTimeout(() => { if (bubbleEl) bubbleEl.style.display = 'none'; petInstance.setAnimation('idle'); }, 1800);
      }
    });

    shadow.getElementById('feedTool').addEventListener('click', (e) => {
      e.stopPropagation();
      petInstance.setAnimation('eat');
      bubbleEl.textContent = 'Munch munch! +50 Coins & +25 XP! 🍓';
      bubbleEl.style.display = 'block';
      petInstance.spawnParticle('heart');
      setTimeout(() => { petInstance.setAnimation('idle'); bubbleEl.style.display = 'none'; }, 2200);
    });

    shadow.getElementById('petTool').addEventListener('click', (e) => {
      e.stopPropagation();
      petInstance.setAnimation('pet');
      bubbleEl.textContent = 'Purrrrr! You give the best pets! ❤️';
      bubbleEl.style.display = 'block';
      petInstance.spawnParticle('heart');
      setTimeout(() => { petInstance.setAnimation('idle'); bubbleEl.style.display = 'none'; }, 2000);
    });

    shadow.getElementById('bathTool').addEventListener('click', (e) => {
      e.stopPropagation();
      petInstance.setAnimation('bath');
      bubbleEl.textContent = 'Pop pop! Squeaky clean bubbles! +30 Affection! 🧼✨';
      bubbleEl.style.display = 'block';
      setTimeout(() => { petInstance.setAnimation('idle'); bubbleEl.style.display = 'none'; }, 2200);
    });

    shadow.getElementById('workoutTool').addEventListener('click', (e) => {
      e.stopPropagation();
      petInstance.setAnimation('celebrate');
      bubbleEl.textContent = 'Gym workout! +10 Combat Power! 🏋️';
      bubbleEl.style.display = 'block';
      petInstance.spawnParticle('star');
      setTimeout(() => { petInstance.setAnimation('idle'); bubbleEl.style.display = 'none'; }, 2000);
    });

    shadow.getElementById('catchTool').addEventListener('click', (e) => {
      e.stopPropagation();
      petInstance.setAnimation('celebrate');
      bubbleEl.textContent = 'Great throw! Leaping catch! +35 Coins! 🎾';
      bubbleEl.style.display = 'block';
      petInstance.spawnParticle('heart');
      setTimeout(() => { petInstance.setAnimation('idle'); bubbleEl.style.display = 'none'; }, 2000);
    });

    shadow.getElementById('hideTool').addEventListener('click', (e) => {
      e.stopPropagation();
      host.style.display = 'none';
      try {
        chrome.storage.local.set({ isSummoned: false });
      } catch (err) {}
    });

    // Laptop Battery Charging Web API Integration (Cyan Pulsing Aura)
    if (navigator.getBattery) {
      navigator.getBattery().then(battery => {
        function onBatteryChange() {
          if (battery.charging) {
            chargingHalo.style.display = 'block';
            bubbleEl.textContent = '⚡ Laptop plugged in! Supercharging energy! 🔋';
            bubbleEl.style.display = 'block';
            petInstance.setAnimation('celebrate');
            petInstance.spawnParticle('star');
            setTimeout(() => { bubbleEl.style.display = 'none'; petInstance.setAnimation('idle'); }, 4000);
          } else {
            chargingHalo.style.display = 'none';
          }
        }
        battery.addEventListener('chargingchange', onBatteryChange);
        if (battery.charging) {
          chargingHalo.style.display = 'block';
          setTimeout(onBatteryChange, 2500);
        }
      }).catch(() => {});
    }

    // Screen-Time Hydration & Posture Reminders (every 15 minutes)
    let pageTimeSec = 0;
    setInterval(() => {
      pageTimeSec += 15;
      if (pageTimeSec > 0 && pageTimeSec % 900 === 0) {
        bubbleEl.textContent = '💧 Hydration Check! Stand up, stretch, and drink some water! 🧘';
        bubbleEl.style.display = 'block';
        petInstance.setAnimation('celebrate');
        petInstance.spawnParticle('heart');
        setTimeout(() => { bubbleEl.style.display = 'none'; petInstance.setAnimation('idle'); }, 5000);
      }
    }, 15000);

    // Eye gaze
    window.addEventListener('pointermove', (e) => {
      if (!host || !petInstance) return;
      const rect = host.getBoundingClientRect();
      const dx = Math.max(-1, Math.min(1, (e.clientX - (rect.left + rect.width / 2)) / 250));
      const dy = Math.max(-1, Math.min(1, (e.clientY - (rect.top + rect.height / 2)) / 250));
      petInstance.setGaze(dx, dy);
    });

    // Dragging (Direct 1:1 screen coordinates, zero axis-inversion)
    let isDragging = false;
    let dragOffsetX = 0, dragOffsetY = 0;
    let posX = Math.max(20, window.innerWidth - 220);
    let posY = Math.max(20, window.innerHeight - 260);

    host.style.left = posX + 'px';
    host.style.top = posY + 'px';
    host.style.right = 'auto';
    host.style.bottom = 'auto';

    wrapper.addEventListener('pointerdown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      dragOffsetX = e.clientX - posX;
      dragOffsetY = e.clientY - posY;
      petInstance.setAnimation('pet');
      try { wrapper.setPointerCapture(e.pointerId); } catch (err) {}
    });

    minPill.addEventListener('pointerdown', (e) => {
      isDragging = true;
      dragOffsetX = e.clientX - posX;
      dragOffsetY = e.clientY - posY;
      try { minPill.setPointerCapture(e.pointerId); } catch (err) {}
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      posX = Math.max(10, Math.min(window.innerWidth - 180, e.clientX - dragOffsetX));
      posY = Math.max(10, Math.min(window.innerHeight - 200, e.clientY - dragOffsetY));
      host.style.left = posX + 'px';
      host.style.top = posY + 'px';
    });

    window.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      petInstance.setAnimation('idle');
      try { wrapper.releasePointerCapture(e.pointerId); } catch (err) {}
      try { minPill.releasePointerCapture(e.pointerId); } catch (err) {}
    });

    // Autowander
    setInterval(() => {
      if (isDragging || host.style.display === 'none') return;
      if (Math.random() < 0.3) {
        petInstance.setAnimation('walk');
        setTimeout(() => petInstance.setAnimation('idle'), 2000);
      }
    }, 8500);
  }

  function applyPet(p) {
    activePetData = p;
    if (nameBadge) nameBadge.textContent = p.name + " · Lv." + (p.level || 1);
    if (petInstance) petInstance.setSpecies(p.species || p.id || 'shiba');
  }

  // Real-time synchronization across all tabs via chrome.storage
  try {
    chrome.storage.local.get(['activePet', 'isSummoned'], (res) => {
      if (res) {
        if (res.activePet) activePetData = res.activePet;
        if (typeof res.isSummoned === 'boolean') isSummonedGlobally = res.isSummoned;
      }
      initCompanion();
      if (activePetData) applyPet(activePetData);
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes.activePet && changes.activePet.newValue) {
          applyPet(changes.activePet.newValue);
          if (bubbleEl) {
            bubbleEl.textContent = "Switched to " + changes.activePet.newValue.name + "! 🐾";
            bubbleEl.style.display = 'block';
            setTimeout(() => { if (bubbleEl) bubbleEl.style.display = 'none'; }, 3000);
          }
        }
        if (changes.isSummoned) {
          isSummonedGlobally = changes.isSummoned.newValue;
          if (hostElement) {
            hostElement.style.display = isSummonedGlobally ? 'block' : 'none';
            if (isSummonedGlobally && petInstance) {
              petInstance.setAnimation('celebrate');
              setTimeout(() => petInstance.setAnimation('idle'), 1800);
            }
          }
        }
      }
    });
  } catch (e) {
    initCompanion();
  }

  // Direct runtime message listener from popup or service worker
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'ping') {
      sendResponse({ alive: true });
      return true;
    }
    if (msg.action === 'set_active_pet') {
      applyPet(msg.pet);
      sendResponse({ success: true });
      return true;
    }
    if (msg.action === 'summon') {
      if (hostElement) {
        hostElement.style.display = 'block';
        if (bubbleEl) {
          bubbleEl.textContent = (msg.pet ? msg.pet.name : activePetData.name) + " is here! 🐾";
          bubbleEl.style.display = 'block';
          setTimeout(() => { if (bubbleEl) bubbleEl.style.display = 'none'; }, 3000);
        }
        if (petInstance) {
          petInstance.setAnimation('celebrate');
          setTimeout(() => petInstance.setAnimation('idle'), 1800);
        }
      }
      sendResponse({ success: true });
      return true;
    }
    if (msg.action === 'hide') {
      if (hostElement) hostElement.style.display = 'none';
      sendResponse({ success: true });
      return true;
    }
    return true;
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCompanion);
  } else {
    initCompanion();
  }
})();
`;
      zip.file('content_script.js', contentScript);

      // 7. Readme Documentation
      const readme = `# Pet Slam - Multi-Pet Sanctuary & Chrome Extension

## 🐾 One Unified Extension For All Your Pets!
Includes:
- **All 16 Authentic Dog & Cat Breeds**:
  - Dogs: German Shepherd, Rottweiler, Golden Retriever, Siberian Husky, French Bulldog, Shiba Inu, Doberman, Welsh Corgi
  - Cats: Bengal Cat, Maine Coon, Siamese Cat, Orange Tabby, British Shorthair, Scottish Fold, Calico Cat, Bombay Black Cat
- **Custom Photo Avatar Support**: Upload your own dog or cat photo to roam across all Google tabs!
- **Voice Mimic Sanctuary Stage**: Microphone voice repeater (companion voice!), poke head, tickle belly, feed berries, bubble bath with soap physics, gym workouts, and day/night lights.
- **Pokemon GO Catch Radar**: Scan for wild pets, throw Beast-Balls with contracting target rings, and catch pets into your permanent kennel!
- **Pet Auction House**: Real-time bidding, buyouts, and trade market!
- **On-Screen Webpage Roaming**: Floats and roams across any website with drag physics, battery charging aura, and posture reminders!

## Quick 30-Second Install:
1. Extract this zip file.
2. In Google Chrome, Brave, or Edge, visit: \`chrome://extensions\`
3. Enable **Developer mode** (top-right).
4. Click **Load unpacked** (top-left) and select the extracted folder.
5. Click the **PET SLAM** icon in your toolbar to play!
`;
      zip.file('README.md', readme);

      // Generate Zip
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PetSlam-Companion-Unified-Extension.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsGenerating(false);
      setDownloadSuccess(true);
      sound.playVictory();
    } catch (err) {
      console.error('Failed to generate extension zip:', err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md select-none">
      <div className="relative w-full max-w-2xl bg-[#0F1420] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white font-sans">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#151C2C]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#070A10] border-2 border-[#CCFF00] flex items-center justify-center text-xs font-black text-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.5)]">
              PS
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span>Unified Pet Slam Chrome Extension</span>
                <span className="text-[10px] bg-[#CCFF00]/20 text-[#CCFF00] px-2 py-0.5 rounded-full font-mono">
                  All 16 Breeds Included
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Voice Mimic Sanctuary, Multi-Breed Kennel, Pokemon GO Catch Radar & Auction Market in one extension
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-white/10 bg-[#0B0E17] px-4 pt-2 gap-2 text-xs font-mono font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('popup')}
            className={`pb-2 px-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'popup'
                ? 'border-[#CCFF00] text-[#CCFF00]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            🏠 Buddy Stage
          </button>
          <button
            onClick={() => setActiveTab('kennel')}
            className={`pb-2 px-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'kennel'
                ? 'border-[#CCFF00] text-[#CCFF00]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            🐾 All 16 Varieties
          </button>
          <button
            onClick={() => setActiveTab('radar')}
            className={`pb-2 px-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'radar'
                ? 'border-[#CCFF00] text-[#CCFF00]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            🎯 Pokemon GO Radar
          </button>
          <button
            onClick={() => setActiveTab('install')}
            className={`pb-2 px-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'install'
                ? 'border-[#CCFF00] text-[#CCFF00]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            30s Setup Guide
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* TAB 1: BUDDY STAGE PREVIEW */}
          {activeTab === 'popup' && (
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              {/* Extension Window Simulation */}
              <div className="w-[310px] bg-[#07090E] border border-white/20 rounded-2xl p-3 shadow-2xl text-center">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5 text-xs font-black tracking-wider text-white">
                    <span className="w-5 h-5 rounded-full bg-[#070A10] border border-[#CCFF00] text-[#CCFF00] text-[9px] flex items-center justify-center font-bold">
                      PS
                    </span>
                    <span>PET<span className="text-[#CCFF00]">SLAM</span></span>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                    🪙 2,450 Coins
                  </span>
                </div>

                <div className="text-[11px] font-mono font-bold text-[#CCFF00] mb-2">
                  Hi! I'm {pet.name}! 🐾
                </div>

                {/* Animated Pet (Bigger Size) */}
                <div className="relative h-44 bg-[radial-gradient(circle,#1e293b_0%,#07090e_80%)] rounded-xl border border-white/10 flex items-center justify-center mb-2">
                  <ProceduralPetCanvas
                    species={previewSpecies}
                    stage={pet.stage}
                    width={150}
                    height={150}
                    interactive={true}
                  />
                </div>

                {/* Voice Mimic & Soundboard */}
                <div className="grid grid-cols-2 gap-1.5 mb-2 font-mono text-[10px]">
                  <button className="col-span-2 py-1.5 px-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-bold flex items-center justify-center gap-1 shadow-md">
                    🎙️ Hold & Speak (Pet Voice Mimic)
                  </button>
                  <button className="py-1.5 px-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold flex items-center justify-center gap-1">
                    🍓 Feed Berry (+50🪙)
                  </button>
                  <button className="py-1.5 px-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold flex items-center justify-center gap-1">
                    🧼 Bubble Bath (+30❤️)
                  </button>
                  <button className="py-1.5 px-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold flex items-center justify-center gap-1">
                    ❤️ Stroke Fur (Purr)
                  </button>
                  <button className="py-1.5 px-1 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold flex items-center justify-center gap-1">
                    🎾 Play Catch (+35🪙)
                  </button>
                  <button className="col-span-2 py-1.5 px-2 bg-[#CCFF00] text-black rounded-lg font-black uppercase text-[10px] shadow-lg flex items-center justify-center gap-1">
                    🐾 Roam on Screen Webpage
                  </button>
                </div>
              </div>

              {/* Explanatory Features */}
              <div className="flex-1 space-y-2 text-xs">
                <div className="bg-[#141A28] p-3 rounded-xl border border-white/10 space-y-1">
                  <h4 className="font-bold text-[#CCFF00] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>All Buddy Page Features In Toolbar</span>
                  </h4>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    The extension popup features the complete interactive companion sanctuary: natural pitched voice repeating, head poking, belly tickling, berry feeding (+50 Coins), bubble bath (+30 Affection), and leaping catch (+35 Coins).
                  </p>
                </div>

                <div className="bg-[#141A28] p-3 rounded-xl border border-white/10 space-y-1">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>Screen Roaming Companion</span>
                  </h4>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    Clicking <strong>"Walk on Screen"</strong> summons your pet over any webpage. Drag anywhere, hover to feed or pet, and watch it autowalk along the bottom!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ALL 12 PET VARIETIES */}
          {activeTab === 'kennel' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-300">
                All 12 varieties are packaged inside this <strong>single extension</strong>. Switch pets anytime with 1 click:
              </p>

              {/* Cats Grid */}
              <div>
                <h4 className="text-xs font-bold text-orange-400 mb-2 flex items-center gap-1">
                  <span>🐱</span> <span>Cat Breeds</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {allCatBreeds.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setPreviewSpecies(cat.id);
                        switchSpecies(cat.id);
                        sound.playClick();
                      }}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                        previewSpecies === cat.id
                          ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-white'
                          : 'border-white/10 bg-[#131824] hover:border-white/30 text-neutral-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                        <img
                          src={getPetPhoto({ species: cat.id, name: cat.name })}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">{cat.name}</div>
                        <div className="text-[10px] text-neutral-400 truncate">{cat.breed}</div>
                        <span className="text-[9px] text-[#CCFF00] font-mono">CP {cat.cp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dogs Grid */}
              <div>
                <h4 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1">
                  <span>🐶</span> <span>Dog Breeds</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {allDogBreeds.map((dog) => (
                    <div
                      key={dog.id}
                      onClick={() => {
                        setPreviewSpecies(dog.id);
                        switchSpecies(dog.id);
                        sound.playClick();
                      }}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                        previewSpecies === dog.id
                          ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-white'
                          : 'border-white/10 bg-[#131824] hover:border-white/30 text-neutral-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10">
                        <img
                          src={getPetPhoto({ species: dog.id, name: dog.name })}
                          alt={dog.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">{dog.name}</div>
                        <div className="text-[10px] text-neutral-400 truncate">{dog.breed}</div>
                        <span className="text-[9px] text-[#CCFF00] font-mono">CP {dog.cp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RADAR CATCH MINI-GAME */}
          {activeTab === 'radar' && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-300">
                The extension includes the Pokemon GO style wild pet encounter game built directly into the popup:
              </p>

              <div className="bg-[#0B101D] border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Compass className="w-4 h-4" />
                    <span>Beast-Ball Throw Physics & Catch Rings</span>
                  </div>
                  <div className="text-[11px] text-neutral-300 mt-1">
                    Contracting green/yellow/red bullseye rings, throw bonuses (Nice/Great/Excellent), Razz berry catch multipliers, and 3-wobble catch suspense!
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#141A28] p-2.5 rounded-xl border border-white/10">
                  <div className="font-bold text-white">🍓 Razz & Pinap Berries</div>
                  <div className="text-neutral-400 text-[10px] mt-0.5">Increases catch rate or doubles coins on capture</div>
                </div>
                <div className="bg-[#141A28] p-2.5 rounded-xl border border-white/10">
                  <div className="font-bold text-white">🎒 Permanent Kennel Add</div>
                  <div className="text-neutral-400 text-[10px] mt-0.5">Caught wild pets permanently join your extension collection</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VISUAL 3-STEP INSTALLATION WIZARD */}
          {activeTab === 'install' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <h3 className="font-display font-black text-white text-sm uppercase tracking-wide flex items-center gap-2">
                  <span>🚀</span>
                  <span>3-Step Browser Companion Setup</span>
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                    isExtensionLinked
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isExtensionLinked ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'
                    }`}
                  />
                  <span>{isExtensionLinked ? 'Companion Linked ✓' : 'Bridge Ready (+500 CR)'}</span>
                </span>
              </div>

              {/* 3 Step Visual Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Step 1 */}
                <div className="bg-[#141A28] border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#CCFF00] text-black font-black text-xs flex items-center justify-center">
                        1
                      </span>
                      <span className="font-bold text-white text-xs">Download & Extract</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-snug">
                      Download the tailored <code className="text-[#CCFF00]">pet-slam-buddy.zip</code> containing your exact active pet ({pet.name}). Unzip to any folder.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadZip}
                    disabled={isGenerating}
                    className="w-full py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[#CCFF00] font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isGenerating ? 'Packaging...' : 'Download ZIP'}</span>
                  </button>
                </div>

                {/* Step 2 */}
                <div className="bg-[#141A28] border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-400 text-black font-black text-xs flex items-center justify-center">
                        2
                      </span>
                      <span className="font-bold text-white text-xs">Open Extensions</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-snug">
                      In Chrome, Edge, or Brave, open extension settings and switch <strong className="text-white">Developer mode</strong> toggle to <span className="text-[#CCFF00]">ON</span>.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      navigator.clipboard.writeText('chrome://extensions');
                      setCopiedExtensionUrl(true);
                      setTimeout(() => setCopiedExtensionUrl(false), 2500);
                    }}
                    className="w-full py-2 px-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{copiedExtensionUrl ? 'Copied to Clipboard! ✓' : 'Copy "chrome://extensions"'}</span>
                  </button>
                </div>

                {/* Step 3 */}
                <div className="bg-[#141A28] border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between space-y-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-purple-400 text-black font-black text-xs flex items-center justify-center">
                        3
                      </span>
                      <span className="font-bold text-white text-xs">Load Unpacked</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 leading-snug">
                      Click <strong className="text-white">"Load unpacked"</strong>, select your extracted folder, and watch your companion appear across all browser tabs!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      window.postMessage({ type: 'PET_SLAM_EXTENSION_HANDSHAKE' }, '*');
                      setIsExtensionLinked(true);
                    }}
                    className="w-full py-2 px-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Test Handshake (+500 CR)</span>
                  </button>
                </div>
              </div>

              {/* In-Page Live Preview Banner */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-950/60 via-[#10192A] to-cyan-950/60 border border-[#CCFF00]/30 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center text-lg font-bold shrink-0">
                    🐾
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">
                      Try Roaming Desktop Buddy Live on Screen
                    </h4>
                    <p className="text-[11px] text-neutral-300">
                      You can interact with your pet, test pitch-shifting voice mimicry, and test hydration alerts directly on this page!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    toggleOverlay();
                  }}
                  className={`py-2 px-3.5 rounded-xl font-mono text-xs font-bold cursor-pointer transition-all shrink-0 ${
                    isOverlayActive
                      ? 'bg-cyan-500 text-black shadow-md'
                      : 'bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black'
                  }`}
                >
                  {isOverlayActive ? 'Dock Pet ✕' : 'Preview Live on Screen 🐾'}
                </button>
              </div>

              <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <strong className="text-amber-300">Important Chrome Note:</strong>
                  <p className="mt-0.5 text-[11px] leading-relaxed">
                    Chrome prohibits overlays on internal system pages (<code className="text-[#CCFF00]">chrome://extensions</code>). After loading unpacked, open any regular website (Google, YouTube, Reddit) — your pet will appear and roam automatically!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#121824] flex items-center justify-between">
          <div className="text-xs text-neutral-400">
            {downloadSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                Unified Extension ZIP Downloaded! Check downloads.
              </span>
            ) : (
              <span className="font-mono text-[11px]">Single unified package · Includes all 12 Cats, Dogs & Beasts</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                toggleOverlay();
              }}
              className={`text-xs py-2 px-3 rounded-xl border flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                isOverlayActive
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                  : 'bg-white/10 hover:bg-white/15 border-white/20 text-white'
              }`}
              title="Test the floating companion right here in this browser tab"
            >
              <span>{isOverlayActive ? '🐾 Companion Roaming 🟢' : '🐾 Test Roaming in Tab'}</span>
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isGenerating}
              className="bg-[#CCFF00] hover:bg-[#b8e600] text-black font-black text-xs py-2 px-4 rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50 font-mono uppercase tracking-wider"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Packaging...' : 'Download Unified Extension (.zip)'}</span>
            </button>
          </div>
        </div>

        {/* Lifetime Pass Unlock Modal */}
        {showPassModal && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#121728] border border-[#CCFF00]/40 rounded-3xl p-5 max-w-sm w-full shadow-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center mx-auto">
                <Tv className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg uppercase text-white">
                Browser Extension Lifetime Pass
              </h3>
              <p className="text-xs text-neutral-300">
                Unlock lifetime desktop companion, screen roaming, battery charging detector & Chrome extension package!
              </p>
              <div className="p-2.5 bg-black/40 rounded-xl border border-white/10 text-xs font-mono font-bold text-[#CCFF00]">
                $1.99 USD or 1,500 Slam Credits
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={async () => {
                    try {
                      trackClarityEvent('extension_pass_dodo_click');
                      const checkout = await createDodoCheckout({ passType: 'extension' });
                      if (checkout.checkoutUrl && !checkout.simulated) {
                        window.location.href = checkout.checkoutUrl;
                      } else if (checkout.simulated && checkout.mode === 'test_sandbox') {
                        unlockPass('extension', false);
                        setShowPassModal(false);
                        handleDownloadZip();
                      } else if (checkout.checkoutUrl) {
                        window.location.href = checkout.checkoutUrl;
                      }
                    } catch (e: any) {
                      alert(e?.message || 'Failed to connect to Dodo Payments');
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs uppercase cursor-pointer"
                >
                  Pay $1.99 (Dodo)
                </button>
                <button
                  onClick={() => {
                    const res = unlockPass('extension', true);
                    if (res.success) {
                      setShowPassModal(false);
                      handleDownloadZip();
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
                onClick={() => setShowPassModal(false)}
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
