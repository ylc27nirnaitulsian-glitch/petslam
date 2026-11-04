# CLAUDE.md - PET SLAM Developer & Agent Guide

> **Project Name:** PET SLAM  
> **Domain / Live URL:** [https://www.petslam.app](https://www.petslam.app)  
> **Repository:** [https://github.com/ylc27nirnaitulsian-glitch/petslam](https://github.com/ylc27nirnaitulsian-glitch/petslam)  
> **Description:** Next-gen Web3/Web2 esports pet battle game, breeding lab, and living desktop Chrome companion extension. Bridge real-world pets with 60 FPS procedural combat, Gemini AI photo-to-fighter conversion, real-world GPS radar, and neural TTS.

---

## 1. Quick Start & Common Commands

```bash
# Install dependencies
npm install

# Start full-stack development server (Express backend + Vite middleware on port 3000)
npm run dev

# Start production server
npm start

# Type check without emitting
npm run lint

# Production build (Vite client bundle into /dist)
npm run build

# Preview production build
npm run preview

# Clean build artifacts
npm run clean

# Re-export entire codebase context bundle for Claude
npm run export:claude

# Run Playwright end-to-end tests
npx playwright test
```

> **IMPORTANT PORT NOTE:**  
> In local development and container environments (such as AI Studio / Nginx proxy), the server **must** bind to port `3000` (Nginx proxies `8080 -> 3000`). Do not change the default port in `server.ts` unless overridden by `APP_PORT` or `-p` CLI arguments.

---

## 2. Tech Stack & Key Libraries

- **Frontend Core:** React 19 (`react`, `react-dom`), TypeScript (`^7.0.2`), Vite 8 (`@vitejs/plugin-react`).
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`, `tailwindcss`), Lucide React icons (`lucide-react`), Framer Motion / Motion One (`motion`).
- **Graphics & Simulation:**
  - Procedural Canvas (60 FPS Euler physics, custom rendering engine in `src/components/game/arena/PetBattleSceneCanvas.tsx`).
  - Three.js (`three`, `@types/three`) for 3D stadium simulations (`ThreeArenaSimulation.tsx`).
  - Leaflet (`leaflet`, `@types/leaflet`) for real-world GPS pet rescue radar.
  - Canvas Confetti (`canvas-confetti`).
- **Backend & Networking:**
  - Express 4 (`express`, `tsx`) serving REST APIs, Vite middleware, and static production assets.
  - WebSockets (`ws`, `@types/ws`) running an authoritative 20-tick netcode server (`authoritativeCombatServer.ts`).
  - Supabase (`@supabase/supabase-js`) for cloud synchronization and player data.
- **AI & Neural Capabilities:**
  - `@google/genai` (Gemini 2.5 / 3.8 Flash multimodal vision) analyzing real pet photos into combat stats, palettes, and traits.
  - `kokoro-js` (Kokoro-82M-v1.0-ONNX) for real-time neural text-to-speech pet voices.
  - `exa-js` (Exa API) for real-world pet lore, breed history, and fact retrieval.
- **Monetization & Commercial:**
  - `dodopayments` (Dodo Payments SDK) as Merchant of Record for software passes, AI studio credits, and extension licenses.
- **Client Deployment Targets:**
  - Web: Cloudflare Pages (`petslam.app`) via `functions/api` edge handlers.
  - Mobile: Capacitor 8 (`@capacitor/cli`, `@capacitor/core`, `@capacitor/haptics`) targeting Android/iOS (`app.petslam.game`).
  - Desktop: Tauri (`src-tauri/tauri.conf.json`) and Chrome Extension (Manifest V3 generated via `jszip`).

---

## 3. Architecture & File Layout

```
.
├── .agents/                    # Product marketing context and specialized agent skills
│   └── product-marketing.md    # Canonical product positioning, ICPs, and tone of voice
├── data/                       # Local JSON storage for waitlist & payment records
│   ├── payments.json           # Audit log of Dodo checkout sessions
│   └── waitlist.json           # Alpha waitlist signups and granted credits
├── docs/                       # Deployment guides, edge rules, and payment appeal specs
├── functions/api/              # Cloudflare Pages Functions (serverless Dodo endpoints)
│   └── dodo/                   # /api/dodo/config, /api/dodo/create-checkout, /api/dodo/webhook
├── public/                     # Static icons, favicons, audio assets
├── scripts/                    # Build, maintenance, and export scripts
│   └── export-claude-bundle.mjs# Packs repository files into CLAUDE_CODEBASE_BUNDLE.md
├── src/
│   ├── assets/                 # High-resolution pet character cards & stadium art
│   ├── components/             # Reusable UI widgets and marketing landing sections
│   │   ├── diagnostic/         # SystemDiagnosticsModal (Ctrl+Shift+D admin telemetry)
│   │   ├── game/               # Core gaming screens, modals, and canvas engine
│   │   │   ├── arena/          # PetBattleSceneCanvas (60 FPS procedural combat engine)
│   │   │   ├── liveops/        # Battle passes, daily quests, and live events
│   │   │   ├── pet/            # BreedingLab, PhotoStudio, ExtensionExporter, ProceduralCanvas
│   │   │   └── screens/        # ArenaScreen, SanctuaryScreen, ArmoryScreen, MarketScreen
│   │   ├── layout/             # DualOrientationShell, DesktopNavRail, TelemetryDock
│   │   └── Leaderboards/       # LeaderboardModal and competitive ladders
│   ├── context/
│   │   ├── GameContext.tsx     # Player currency, audio preferences, beasts, and battle state
│   │   └── PetCompanionContext.tsx # Active companion pet stats, hunger, mood, and interactions
│   ├── data/                   # Static mock data (animals, armory gear, leaderboard seeds)
│   ├── server/                 # Authoritative backend game logic
│   │   └── authoritativeCombatServer.ts # 20-tick WebSocket loop, hitboxes, combat state
│   ├── services/               # Client-side API gateways
│   │   ├── dodo.ts             # Dodo Payments checkout sessions & webhook hooks
│   │   ├── multiplayerNetcode.ts# WebSocket client with client prediction & reconciliation
│   │   ├── supabaseClient.ts   # Supabase client singleton
│   │   └── waitlist.ts         # Waitlist registration service
│   ├── types/
│   │   └── pet.ts              # Core domain models (PetSpecies, PetStats, PetRarity, Chimera)
│   ├── utils/
│   │   ├── audio.ts            # Web Audio API sound effects, BGM synthesizer, retro chiptunes
│   │   ├── Genetics.ts         # Mendelian allele inheritance & Chimera breeding engine
│   │   ├── kokoroTTS.ts        # Kokoro neural TTS synthesis client
│   │   ├── voiceChat.ts        # WebRTC peer voice chat & room signaling
│   │   └── voiceMimic.ts       # Pitch-shifted Talking Tom audio buffer analyzer
│   ├── App.tsx                 # Root application router (Title, Game Shell, System Details)
│   ├── main.tsx                # React DOM root entry point
│   └── index.css               # Tailwind CSS v4 styling & theme configuration
├── server.ts                   # Master Express backend + WebSocket netcode server
├── capacitor.config.ts         # Capacitor mobile wrapper configuration
├── vite.config.ts              # Vite bundler configuration
└── wrangler.toml               # Cloudflare Pages deployment configuration
```

---

## 4. Key Subsystems & Implementation Rules

### A. 60 FPS Canvas Combat Engine (`PetBattleSceneCanvas.tsx`)
- Renders directly on HTML5 `<canvas>` using Euler physics (`position += velocity * dt`).
- Tag-in squad battle mechanics (switch beasts mid-fight).
- Moves: Quick Pounce, Sonic Bark, Iron Guard, Fierce Bite, Overdrive PET SLAM.
- Avoid placing heavy React state updates inside the `requestAnimationFrame` loop. Store mutable physics vectors in refs.

### B. Authoritative Netcode (`authoritativeCombatServer.ts` & `multiplayerNetcode.ts`)
- Runs a 20-tick server loop (50ms tick rate).
- Validates player input timestamps, sequence numbers, and cooldowns server-side to prevent tampering.
- Client performs predictive movement and smoothly reconciles position on authoritative packet receipt.

### C. Gemini AI Pet Avatar Studio (`PetAvatarPhotoStudioModal.tsx` & `/api/pet/analyze-photo`)
- Accepts a base64 image of a real dog or cat.
- Sends multimodal prompt to Gemini (`gemini-3.8-flash` / `gemini-2.5-flash`).
- Returns a structured JSON schema: category, species, breedName, 6-point hex palette (primary, secondary, belly, ear, eye, nose), earType, collarColor, personalityTraits, and combat stats.
- **Fallback Rule:** If `GEMINI_API_KEY` is not present, the server seamlessly calls `generateProceduralFallback()`, ensuring the UI never crashes or halts.

### D. Genetics & Chimera Breeding (`Genetics.ts` & `BreedingLabModal.tsx`)
- Combines two parent pet cards.
- Computes Mendelian dominance for ear types, fur patterns (rosettes, stripes, eye patch, muzzle mask), and blends 6-point hex palettes.
- Rarity rolls ascend: Common (60%) → Rare (25%) → Epic (10%) → Legendary (4%) → Mythic (1%).

### E. Dodo Payments Integration (`dodopayments` & `server.ts`)
- Uses official `dodopayments` SDK.
- Products (strictly 2 payment points across entire app):
  - `avatar` ($1.00 AI Pet Studio Pass)
  - `extension` ($1.99 Lifetime Companion License)
- Webhooks verify cryptographic signatures via `dodoClient.webhooks.unwrap()`. Note: `server.ts` preserves `req.rawBody` for webhook verification.
- In test environments without API keys, a realistic simulated checkout completes successfully.

### F. Desktop Chrome Extension Exporter (`ExtensionExporterModal.tsx`)
- Bundles a complete standalone Chrome Extension (Manifest V3) dynamically on the client using `JSZip`.
- Injects the player's active pet palette, stats, and audio files.
- Users download the `.zip`, unzip it, and load unpacked in `chrome://extensions`.

---

## 5. Coding & Contribution Conventions

1. **TypeScript Strictness:** Always maintain strong typing. Avoid `any` where possible. Check `src/types/pet.ts` for domain definitions before creating ad-hoc types.
2. **React 19 Compatibility:** Use hooks idiomatic to modern React. Do not mix obsolete React lifecycle methods.
3. **Tailwind v4:** Uses `@tailwindcss/vite`. Styling classes use standard Tailwind v4 syntax with custom neon accent `#CCFF00` (PET SLAM Lime).
4. **Resilience & Graceful Degradation:** All external services (Gemini, Exa, Dodo Payments, Kokoro TTS, Resend, Supabase) must have client or procedural fallbacks so the app operates cleanly in offline/sandbox mode.
5. **Security:** Never commit raw API keys or secrets. Keep all sensitive credentials in `.env` (gitignored).

---

## 6. Admin Telemetry & Diagnostic Tools

- Press **`Ctrl + Shift + D`** (or **`Cmd + Shift + D`**) anywhere in the game to toggle the `SystemDiagnosticsModal`.
- Alternatively, append `?admin=true` to any URL.
- Diagnostic modal provides real-time telemetry for:
  - Active audio engine state and Web Audio buffers
  - WebSocket netcode latency and packet loss
  - Dodo Payments webhook audit log
  - Supabase connectivity and waitlist counter
