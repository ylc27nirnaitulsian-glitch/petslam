# Interactive 2D Procedural Pet Companion & Chrome Extension (Approach D)

A Pokémon Go–inspired interactive 2D companion platform powered by **Approach D (Procedural Canvas Math)**. Delivers a zero-asset, code-generated animated pet with tactile petting, feeding, evolution, desktop screen roaming, and a ready-to-load Chrome Web Extension package synced with arena battles.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **User Choice Confirmed: Prioritize Approach D (Procedural Canvas Math Engine)**.
> You explicitly instructed to move forward with **Approach D first**. We are building a pure code-generated 2D animation engine that draws and animates the pet entirely via HTML5 Canvas math (bezier curves, squash/stretch dynamics, and harmonic sine wave controllers). You do not need to design SVGs or draw sprites—the entire creature is programmatically rendered and animated by code.

- **Primary Engine**: **Approach D (Procedural Canvas Math)**
  - *Zero External Assets*: No PNGs, SVG files, or 3D models required.
  - *Instant Startup & Tiny Footprint*: Under 15 KB of JavaScript, running at 60 FPS with < 1% CPU utilization.
  - *Ideal for Browser Extension*: Can be injected into any browser tab via Shadow DOM without stylesheet conflicts or image loading delays.
- **Confirmed Features (All 3 Gameplay Loops)**:
  1. *Pokémon Go Buddy Loop*: Berry feeding, tactile petting, heart affection meter, mood states (Happy, Sleepy, Hungry, Battle-Ready).
  2. *Desktop Roaming Companion Loop*: Draggable floating screen widget, gravity and floor bounce physics, autonomous wandering, and quick radial interaction wheel.
  3. *Training Gym & Evolution Loop*: Stat training (Attack, Defense, Agility) and multi-stage evolution (Baby -> Primal Beast -> Titan) that directly boosts your cards in the Arena battle deck.
- **Extension Delivery**: Ready-to-unzip Chrome Extension package (Manifest V3) generated in-app with a 1-click download button and complete installation instructions.

---

## 1. Overview & Core Concept

### What It Delivers
1. **Procedural Pet Sanctuary (In-App Tab / View)**:
   - A cozy interactive habitat where your chosen companion (Bear, Panther, or Wolf) reacts dynamically to your mouse and touch.
   - Stroke to pet: Procedural squashing and leaning towards your hand with floating hearts and purr sound effects.
   - Feed berries: Drag-and-drop food; the pet detects proximity, opens its mouth, chews with crumbs, and refills its Hunger and Stamina bars.
   - Ball fetch / Play: Flick a toy across the screen; the pet sprints, leaps, catches it, and brings it back.
2. **Floating Desktop Screen Roamer (In-App Overlay Widget)**:
   - A floating pet that docks to the bottom edge of your screen or walks across the UI while you manage decks or battle.
   - Physics-based picking up: Click and hold to pick the pet up—its paws dangle and body sways with momentum; release to drop it with realistic gravity, terminal velocity, and ground bounce.
   - Quick Radial Wheel: Tap the pet anytime to trigger quick actions: Feed, Pet, Nap, Mini-Game, or Open Sanctuary.
3. **Training Gym & Evolution Sequence**:
   - Train pet attributes to unlock passive Arena Battle perks (e.g. +10% Elixir regeneration rate, +5% Critical Strike chance).
   - Once Buddy Level 3 is unlocked, trigger an animated Evolution Chamber sequence with radiant aura particles and enhanced procedural horns/armor.
4. **Chrome Web Extension Exporter**:
   - Downloads a complete `pet-companion-extension.zip` containing `manifest.json`, `content_script.js`, `popup.html`, and `pet-engine.js`.
   - Injects the floating companion onto any web page you browse.

---

## 2. Approach D Technical Exploration & Mechanics

### How Procedural Canvas Math Works

Instead of static image frames, the pet's entire visual anatomy and animation are rendered every frame via mathematical formulas:

```
          (\_/)  <- Dynamic ear rotation: sin(time * 3)
         ( • . • ) <- Eye blink timer + pupil cursor-tracking
        (   ><   ) <- Procedural squash-and-stretch breathing
        (  w  w  ) <- Alternating leg offset: sin(walkCycle)
         ~ ~ ~ ~   <- Multi-segment spring tail physics
```

1. **Procedural Anatomy Modules**:
   - **Body & Head**: Layered quadratic and cubic bezier curves (`ctx.bezierCurveTo`) with soft radial gradients for fur depth and warmth.
   - **Expressive Eyes**: Iris with specular highlights, responsive gaze tracking that looks at your mouse cursor, and randomized procedural blinks.
   - **Ears & Horns**: Dynamic joint rotations with secondary spring oscillation (e.g., ear twitches when petted).
   - **Multi-Segment Tail**: Inverse-kinematic chain of joint segments that sways fluidly with body velocity.
   - **Paws & Limbs**: Inverse kinematics for footsteps that stamp on ground collision.
2. **Harmonic State Controllers**:
   - *Idle Breathing*: `scaleY = 1.0 + 0.05 * Math.sin(time * 2.5)`, `scaleX = 1.0 - 0.03 * Math.sin(time * 2.5)`.
   - *Walking Gait*: `legAngleLeft = Math.sin(walkStep) * 0.4`, `bodyBob = Math.abs(Math.sin(walkStep)) * 6px`.
   - *Tactile Petting*: Cursor velocity applies localized shear and squish `ctx.transform(1, 0, shearX, 1, 0, 0)`, triggering radiant heart particles.
   - *Airborne Drop & Bounce*: Rigid-body Euler physics:
     $$v_y = v_y + g \cdot \Delta t$$
     $$y = y + v_y \cdot \Delta t$$
     On floor collision: $v_y = -v_y \cdot 0.6$ (elastic restitution) and trigger horizontal ground squash (`scaleX = 1.3`, `scaleY = 0.7`).

### Why Approach D Wins for This Use Case
- **No Art Assets Needed**: 100% created and maintained in code.
- **Infinite Resolution**: Crisp on standard 1080p, Retina 4K, or mobile screens without pixelation.
- **Micro-Footprint**: The complete pet engine is under 15 KB of code, loading instantly in both the main app and the Chrome extension.
- **Instant Customization**: Colors, eye shapes, ear types, and accessories (crowns, bandanas) are configured through simple parameter objects.

---

## 3. User Experience & Visual Design

### A. Companion Sanctuary & Buddy Dashboard
- **Visual Tone**: Warm, high-contrast, tactile game studio aesthetic matching the dark slate and neon-lime Pet Slam palette (`#0D111A`, `#1E293B`, `#CCFF00`, `#38BDF8`).
- **Heart Affinity Ring**:
  - Displays 4 milestone hearts: *Good Buddy* (Level 1) -> *Great Buddy* (Level 2) -> *Ultra Buddy* (Level 3) -> *Best Buddy* (Level 4).
  - Feeding and playing builds daily heart points with floating emoji feedback (`+3 ❤️ Affection`).
- **Interactive Action Bar**:
  - 🍓 **Feed Berry**: Spawns an interactive berry that follows the mouse or can be tossed into the pet's mouth.
  - ✋ **Pet Fur**: Interactive petting zone with heart trail particle emitter.
  - 🎾 **Toss Ball**: Interactive mini-game where the pet chases, catches, and brings back a bouncing ball.
  - ⚡ **Gym Training**: Quick-tap stamina workout mini-game to boost Attack/Defense stats.
  - 🧬 **Evolution Gate**: Unlocks stage evolution with aura shockwave animation.

### B. Floating Screen Overlay Companion
- Docked in the lower-right corner of the screen by default with a minimized footprint.
- **Toggle Controls**: Can be toggled on/off or minimized to a sleeping badge anytime.
- **Draggable Anywhere**: Click and drag to reposition anywhere on the viewport or toss it across the screen.
- **Autonomous Behaviors**: Roams along the bottom screen rail, snoozes after 30 seconds of inactivity, and greets you when you return to the tab.

### C. Chrome Extension Package
- **In-App Downloader**: A dedicated **"Export Browser Extension"** drawer.
- **Live Extension Simulator**: Test how the companion looks and behaves over a simulated web page (article, search, or video layout).
- **Download `.zip` Bundle**: Contains:
  - `manifest.json` (Chrome Manifest V3)
  - `content_script.js` (Injected procedural canvas with Shadow DOM isolation)
  - `popup.html` & `popup.js` (Extension toolbar button with quick buddy stats and feeding)
  - `pet-procedural-engine.js` (Stand-alone procedural renderer)
  - `README.md` (Step-by-step 30-second install guide for Chrome, Brave, and Edge)

---

## 4. Technical Architecture & System Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                   APPROACH D PROCEDURAL PET SYSTEM                     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │                 PetCompanionContext (State)                  │     │
│   │  - species: 'kodiak' (bear) | 'bagheera' (panther) | 'ignis' │     │
│   │  - stage: 1 (Baby) | 2 (Primal) | 3 (Titan)                  │     │
│   │  - stats: hunger (0-100), happiness (0-100), affection (0-4) │     │
│   │  - level & exp, gym trained attributes                       │     │
│   │  - active arena combat buff: { type: 'elixir_boost', +12% }  │     │
│   └───────────────┬──────────────────────────────┬───────────────┘     │
│                   │                              │                     │
│                   ▼                              ▼                     │
│   ┌──────────────────────────────┐┌──────────────────────────────┐     │
│   │ Procedural Canvas Engine     ││   Buddy Interaction System   │     │
│   │  - Bezier Curve Body Rig     ││  - Berry Feeding & Mouth Snip│     │
│   │  - Sine Harmonic Breath/Walk ││  - Cursor Stroking / Petting │     │
│   │  - Expressive Blink & Gaze   ││  - Ball Toss Mini-Game       │     │
│   │  - Drag, Gravity & Bounce    ││  - Gym Stat Upgrade Engine   │     │
│   └───────────────┬──────────────┘└──────────────┬───────────────┘     │
│                   │                              │                     │
│                   ▼                              ▼                     │
│   ┌──────────────────────────────┐┌──────────────────────────────┐     │
│   │ Floating Screen Overlay      ││ Arena Deck Synergy Bridge    │     │
│   │  - Screen-Edge Clamped Rails ││  - Live Buddy Combat Crest   │     │
│   │  - Drag & Toss Physics Loop  ││  - Passive Elixir/Crit Boost │     │
│   │  - Radial Quick Menu         ││  - Tag-in Battle Audio Roar  │     │
│   └───────────────┬──────────────┘└──────────────────────────────┘     │
│                   │                                                    │
│                   ▼                                                    │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ Chrome Extension Package Generator                           │     │
│   │  - Generates Manifest V3 + Shadow-DOM Content Script         │     │
│   │  - Bundles Procedural Engine into standalone JS file         │     │
│   │  - Client-side ZIP export via JSZip                          │     │
│   └──────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Step-by-Step Implementation Sequence

1. **State Store (`src/context/PetCompanionContext.tsx`)**:
   - Create pet companion state store with persistence (`localStorage`), affection calculation, hunger decay, mood transitions, and gym attribute upgrades.
2. **Procedural Canvas Engine (`src/components/game/pet/ProceduralPetCanvas.tsx`)**:
   - Implement the complete procedural anatomy renderer (Bear, Panther, Wolf), bezier curves, facial gaze tracking, breathing harmonics, and animation state machine (Idle, Walk, Pet, Eat, Sleep, Celebrate).
3. **Buddy Sanctuary Screen (`src/components/game/screens/PetSanctuaryScreen.tsx`)**:
   - Build the dedicated Sanctuary tab featuring Pokémon Go–style buddy hearts, feeding drag-and-drop, tactile fur petting, and gym training workouts.
4. **Floating Screen Companion Widget (`src/components/game/pet/FloatingPetOverlay.tsx`)**:
   - Implement the draggable floating companion widget with floor gravity, bounce physics, idle wandering, and quick radial menu.
5. **Arena Synergy Bridge**:
   - Connect active buddy buffs into `ArenaScreen.tsx` so your pet's trained stats enhance your battle cards with visible combat boosts.
6. **Chrome Extension Package Downloader (`src/components/game/pet/ExtensionExporterModal.tsx`)**:
   - Provide a 1-click ZIP export containing a complete, working Chrome Extension (Manifest V3) that runs the procedural companion on any real website.
