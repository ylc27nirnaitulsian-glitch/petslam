# PET SLAM — Comprehensive Project Context for Claude

**Application Name:** PET SLAM  
**Live Production URL:** [https://www.petslam.app](https://www.petslam.app)  
**Public Repository:** [https://github.com/ylc27nirnaitulsian-glitch/petslam](https://github.com/ylc27nirnaitulsian-glitch/petslam)  
**Document Purpose:** Master system architecture, domain models, backend APIs, client game engine, and operational workflows for Anthropic Claude (Claude Projects, Claude Code CLI, and Claude Chat).

---

## 1. Executive Summary & Vision

### What is PET SLAM?
PET SLAM bridges real-world pet ownership with competitive esports arcade gaming. It turns real dogs and cats into stylized 2D battle champions and living desktop Chrome browser companions.

### Key Value Pillars
1. **Real Pet to Esports Legend:** Players snap or upload a photo of their dog or cat. Google Gemini 3.8 / 2.5 multimodal vision extracts breed, unique markings, custom 6-point hex palettes, and calibrated RPG combat stats in under 5 seconds.
2. **60 FPS Procedural Combat Engine:** An in-browser HTML5 `<canvas>` Euler physics engine featuring real-time tag-in squads, momentum, knockbacks, signature moves (*Quick Pounce*, *Sonic Bark*, *Iron Guard*, *Fierce Bite*, *PET SLAM Overdrive*), and multiple thematic stadiums (*Championship Stadium*, *Cyber Colosseum*, *Moonlight Dojo*).
3. **Mendelian Genetics & Chimera Fusion:** A dual-parent breeding laboratory allowing players to combine canine and feline genetics, cross-pollinating facial traits (rosettes, stripes, muzzle masks, eyebrow dots) and ascending through a 5-tier rarity ladder (Common → Rare → Epic → Legendary → Mythic).
4. **Exportable Chrome Desktop Companion (Manifest V3):** Using client-side `JSZip`, players can export their pet as an unpackable Chrome Web Extension that roams their browser screen, mimics voice with pitch-shifted Web Audio, reacts to laptop battery levels, and reminds them to hydrate and fix their posture.
5. **Real-World GPS Pet Radar:** Powered by Leaflet vector maps, players conduct radar sweeps of their physical location to rescue and adopt wild pets via physics-based swipe capture mechanics.
6. **Zero-Friction Web Delivery:** Runs directly in any modern browser without app store friction, while maintaining native cross-platform support via Capacitor (iOS/Android) and Tauri (Desktop).

---

## 2. System Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER                               │
│  React 19  │  Vite 8  │  Tailwind CSS v4  │  Motion  │  Lucide Icons   │
├────────────────────────────────────────────────────────────────────────┤
│  Game Loop: 60 FPS Canvas (Euler Physics) │ 3D Simulation (Three.js)  │
│  State: GameContext (Slam credits, inventory) │ PetCompanionContext   │
│  Audio: Web Audio API (Chiptune/SFX) │ Kokoro Neural TTS │ Voice Mimic │
│  Maps: Leaflet GPS Radar │ Client Exporter: JSZip (Chrome MV3 Ext)     │
└───────────────────▲────────────────────────────────┬───────────────────┘
                    │ HTTP REST / SSE                │ WebSocket Netcode
                    │                                │ (20-tick authoritative)
┌───────────────────▼────────────────────────────────▼───────────────────┐
│                              SERVER TIER                               │
│  Express 4 (tsx) running on Node.js (strictly bound to port 3000)      │
├────────────────────────────────────────────────────────────────────────┤
│  Authoritative Combat Engine (authoritativeCombatServer.ts)            │
│  Gemini Vision API (gemini-3.8-flash multimodal photo analysis)        │
│  Exa API (Semantic pet lore & breed research)                          │
│  Kokoro Neural TTS (ONNX 82M CPU synthesis)                            │
│  Dodo Payments SDK (Merchant of Record & cryptographic webhooks)       │
│  Local JSON DB / Supabase Client (Waitlist, purchases, profiles)       │
└────────────────────────────────────────────────────────────────────────┘
```

### Complete Dependency Matrix
- **Core Runtime:** React 19 (`react`, `react-dom`), TypeScript (`^7.0.2`), Node.js (via `tsx`).
- **Styling:** `@tailwindcss/vite`, `tailwindcss` (v4), `lucide-react`.
- **Canvas & Visuals:** HTML5 2D Canvas context, `three` (`^0.186.1`), `canvas-confetti`.
- **Audio & Speech:** Web Audio API, `kokoro-js` (`^1.2.1`), WebRTC peer voice audio.
- **Networking:** `express` (`^4.21.2`), `ws` (`^8.22.0`), `dotenv`.
- **AI & Data Intelligence:** `@google/genai` (`^2.4.0`), `exa-js` (`^2.26.0`).
- **Monetization:** `dodopayments` (`^2.57.0`).
- **Storage & Backend:** `@supabase/supabase-js` (`^2.118.0`).
- **Packaging & Cross-Platform:** `jszip` (`^3.10.2`), `@capacitor/core`, `@capacitor/cli`, `@capacitor/haptics`, `@playwright/test`.

---

## 3. Core Domain Models & Types (`src/types/pet.ts`)

### Pet Species & Breeds
```typescript
export type PetSpecies =
  // Cat Breeds
  | 'bengal' | 'mainecoon' | 'siamese' | 'tabby' | 'british' | 'scottish' | 'calico' | 'blackcat'
  // Dog Breeds
  | 'germanshepherd' | 'rottweiler' | 'retriever' | 'husky' | 'bulldog' | 'shiba' | 'doberman' | 'corgi'
  // Legacy Titan Aliases
  | 'kodiak' | 'bagheera' | 'ignis' | 'sultan';

export type PetCategory = 'cat' | 'dog';
export type PetStage = 1 | 2 | 3; // 1 = Baby Kitten/Puppy, 2 = Prime, 3 = Champion Titan
export type PetRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
```

### Combat Stats & Modifiers
```typescript
export interface PetStats {
  attack: number;   // 10 - 100
  defense: number;  // 10 - 100
  agility: number;  // 10 - 100
  stamina: number;  // 10 - 100
  cp: number;       // Combat Power (Pokemon GO style CP rating, 300 - 1000+)
}

export interface PetBattleBuff {
  name: string;
  description: string;
  effectType: 'elixir_rate' | 'crit_chance' | 'damage_shield';
  potency: number; // e.g. 15 for +15%
}
```

### Visual Genetics & Palettes
```typescript
export interface PetCustomPalette {
  primary: string;    // Main body coat hex
  secondary: string;  // Markings, patches, outer ear hex
  belly: string;      // Chest & belly underfur hex
  ear: string;        // Inner ear pinkish/tan hex
  eye: string;        // Iris color hex
  nose: string;       // Nose / muzzle leather hex
}

export interface PetCustomFeatures {
  isCat?: boolean;
  earType?: 'pointed' | 'floppy' | 'round';
  hasWhiskers?: boolean;
  eyePatch?: boolean;
  collarColor?: string;
  fluffyTail?: boolean;
  hat?: 'crown' | 'party' | 'detective' | 'none';
  glasses?: 'shades' | 'vr' | 'none';
  isChimera?: boolean;
  hybridSpeciesName?: string;
  hasRosettes?: boolean;
  hasStripes?: boolean;
  hasMuzzleMask?: boolean;
  hasEyebrowDots?: boolean;
}
```

---

## 4. Key Subsystems Deep Dive

### 1. 60 FPS Procedural Canvas Combat Engine (`PetBattleSceneCanvas.tsx`)
- High-performance 2D Canvas rendering loop decoupled from React state triggers.
- Utilizes Euler integration: each frame updates position via `pos += vel * dt`, damping with friction coefficients.
- Dynamic tag-in squad mechanic: Player team of 3 pets can swap in with cooldowns, preserving buffs.
- Special move animations (Overdrive screenshakes, particle bursts, hit sparks, combo counters).

### 2. Authoritative Netcode (`authoritativeCombatServer.ts` & `multiplayerNetcode.ts`)
- **Tick Rate:** 20 Hz (every 50ms).
- **Architecture:** Client predicts local inputs immediately; transmits numbered input frames over WebSocket (`/ws`).
- **Server:** Validates movement bounds, ability cooldowns, and collision hitboxes. Broadcasts world snapshot to both players.
- **Reconciliation:** Client compares server-confirmed sequence with predicted state and applies linear interpolation correction if delta exceeds error threshold.

### 3. Gemini Multimodal AI Photo Studio (`PetAvatarPhotoStudioModal.tsx`)
- User snaps or uploads a photo of their real-life pet.
- Server receives base64 encoded image, passes it to Google Gemini 3.8 / 2.5 Flash with a strict JSON schema prompt.
- Extracts breed, facial features (ear floppy vs pointed, whiskers, eye patches), generates a cohesive 6-color palette sampled from fur, and balances RPG stats.
- Includes high-fidelity procedural fallback if offline or if `GEMINI_API_KEY` is omitted.

### 4. Genetics & Chimera Breeding Lab (`Genetics.ts` & `BreedingLabModal.tsx`)
- Implements Mendelian allele inheritance:
  - Dominant vs recessive traits for ear types, markings (rosettes, stripes, eye patch).
  - Hex color blending via RGB vector interpolation with a ±10% mutation factor.
  - Chimera Fusion mode: Can hybridize Cat + Dog into a mythical "Chimeric Beast" with dual ear shapes and dual buffs.
  - Tier ascension probability: Common (60%), Rare (25%), Epic (10%), Legendary (4%), Mythic (1%).

### 5. Chrome Extension Companion Exporter (`ExtensionExporterModal.tsx`)
- Builds an unpackable Chrome Web Extension (Manifest V3) on the fly in the browser.
- Packaged using `JSZip`, containing:
  - `manifest.json` (V3 compliant with side-panel & content scripts).
  - Injected procedural canvas pet renderer configured with the user's active pet palette and stats.
  - Interactive triggers: roaming across web pages, sleeping on keyboard, reacting to battery API status, posture/hydration alerts.
  - Standalone audio assets and voice mimicry scripts.

### 6. Neural TTS & Voice Mimicry (`kokoroTTS.ts` & `voiceMimic.ts`)
- `KokoroTTS`: 82-million parameter neural TTS running via ONNX WebAssembly / WebGPU or server fallback for hyper-realistic pet speech.
- `voiceMimic`: Uses the Web Audio API AnalyserNode to record mic input, detect speech boundaries, and playback at a higher pitch (Talking Tom effect) with custom formant shifts.

### 7. Monetization with Dodo Payments (`server.ts` & `src/services/dodo.ts`)
- Configured as Merchant of Record (MoR) for global digital goods and software licensing:
  - Extension Pass: `$2.99` (Lifetime license)
  - AI Avatar Pass: `$0.99` (Generative photo scan pass)
  - Genesis Supporter Bundle: `$4.99` (Founder cosmetics + Extension)
  - 5,000 Slam Credits Pack: `$4.99` (In-game progression items)
- Webhooks verify cryptographic signatures (`webhook-signature`, `webhook-id`, `webhook-timestamp`) using raw request body buffers.
- Offline Sandbox Mode: Automatically activates simulated checkouts when credentials are in test mode or unconfigured.

---

## 5. Master API Catalog

| Method | Endpoint | Purpose | Request Body / Query | Expected Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/dodo/config` | Returns Dodo checkout config & product list | None | `{ enabled, configured, products, environment }` |
| `POST` | `/api/dodo/create-checkout` | Initializes checkout session with Dodo | `{ passType, customerEmail, returnUrl }` | `{ checkoutUrl, sessionId, mode, simulated }` |
| `POST` | `/api/dodo/webhook` | Receives payment events from Dodo | Webhook event payload (with rawBody verification) | `{ received: true }` |
| `GET` | `/api/dodo/payments` | Returns audit log of recent payments | None | `PaymentRecord[]` |
| `GET` | `/api/waitlist/status` | Current signups count & Resend email status | None | `{ totalSignups, emailConfigured, timestamp }` |
| `POST` | `/api/waitlist` | Joins early-bird alpha waitlist | `{ email }` | `{ success, entry, totalSignups, perksAwarded }` |
| `POST` | `/api/pet/analyze-photo` | Gemini multimodal pet photo extraction | `{ imageBase64, mimeType, userGivenName }` | `{ success, avatar, source }` |
| `POST` | `/api/pet/lore-search` | Exa semantic pet lore search | `{ query, breedName, species }` | `{ success, query, results, cost }` |
| `POST` | `/api/tts/speak` | Kokoro-82M neural TTS voice synthesis | `{ text, voice }` | `{ success, samplingRate, audioLength }` |
| `WS` | `/ws` | Authoritative 20-tick multiplayer netcode | WebSocket frames: input, ping, tag-in | World state snapshots & event packets |

---

## 6. Directory Layout & Critical File Map

```
Remix-Remix-Remix-PET-SLAM/
├── server.ts                             # Full-stack Express & WebSocket server
├── vite.config.ts                        # Vite config with React & Tailwind plugins
├── package.json                          # Scripts & npm dependencies
├── capacitor.config.ts                   # Mobile wrapper configuration (app.petslam.game)
├── src-tauri/tauri.conf.json             # Desktop native app wrapper
├── CLAUDE.md                             # Quick reference & developer rules for Claude
├── CLAUDE_CODEBASE_BUNDLE.md             # Complete source code export for Claude (auto-generated)
├── scripts/export-claude-bundle.mjs      # Exporter script to update the bundle
├── src/
│   ├── App.tsx                           # Master routing & orientation wrapper
│   ├── main.tsx                          # App mount point
│   ├── index.css                         # Tailwind v4 directives & font imports
│   ├── context/
│   │   ├── GameContext.tsx               # Currencies, beasts roster, audio settings
│   │   └── PetCompanionContext.tsx       # Active pet state, hunger, happiness, stamina
│   ├── components/
│   │   ├── layout/DualOrientationShell.tsx # Responsive shell (portrait mobile & desktop rail)
│   │   ├── game/
│   │   │   ├── arena/PetBattleSceneCanvas.tsx # 60 FPS combat physics engine
│   │   │   ├── pet/BreedingLabModal.tsx       # Genetics breeding UI
│   │   │   ├── pet/PetAvatarPhotoStudioModal.tsx # Gemini photo upload & scan
│   │   │   ├── pet/ExtensionExporterModal.tsx # JSZip Chrome Extension builder
│   │   │   ├── pet/PetWorldMapView.tsx        # Leaflet GPS radar view
│   │   │   ├── screens/ArenaScreen.tsx        # Combat lobby & battle controller
│   │   │   └── screens/PetSanctuaryScreen.tsx # Tamagotchi pet care sanctuary
│   │   └── diagnostic/SystemDiagnosticsModal.tsx # Ctrl+Shift+D admin telemetry modal
│   ├── server/authoritativeCombatServer.ts# 20-tick authoritative combat loop
│   ├── services/
│   │   ├── dodo.ts                       # Client Dodo payment service
│   │   ├── multiplayerNetcode.ts         # Client WebSocket netcode
│   │   └── supabaseClient.ts             # Supabase cloud database
│   ├── types/pet.ts                      # Canonical TypeScript interfaces
│   └── utils/
│       ├── audio.ts                      # Web Audio synth & retro sound effects
│       ├── Genetics.ts                   # Mendelian genetics algorithm
│       └── kokoroTTS.ts                  # Kokoro neural TTS helper
```

---

## 7. Developer Instructions for Claude

When working on this project:
1. **Preserve Port 3000:** The development server must run on port 3000 (`tsx server.ts`). AI Studio container proxies `8080 -> 3000`.
2. **Do Not Break Fallbacks:** Every third-party integration (Gemini, Dodo, Kokoro, Supabase, Exa) has a local or procedural fallback. Always verify fallbacks continue to function if API keys are missing.
3. **Canvas Performance:** Never trigger React component re-renders inside `requestAnimationFrame` loops in `PetBattleSceneCanvas.tsx` or `ProceduralPetCanvas.tsx`. Use mutable refs for positions, velocities, and timers.
4. **Re-Exporting Context:** If you modify codebase structure or add major files, run:
   ```bash
   npm run export:claude
   ```
   to update `CLAUDE_CODEBASE_BUNDLE.md`.
