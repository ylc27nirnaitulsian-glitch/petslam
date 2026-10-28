---
title: "Breeding Lab Rarity Fusion, Companion Audio & Live Dodo Monetization - Plan"
type: "feat"
date: "2026-10-28"
topic: "breeding-lab-rarity-fusion"
artifact_contract: "ce-unified-plan/v1"
product_contract_source: "ce-brainstorm"
execution: "code"
---

## Goal Capsule

- **Objective:** Enable players to hand-select parent pets from their sanctuary kennel and fuse them into novel, procedural Chimera hybrid breeds with escalating rarity tiers, while providing context-aware audio (barks/meows) on companions and enforcing live Dodo Payments paywalls.
- **Means:** Interactive dual-parent pet selector drawer, weighted rarity ascension ladder with affection/level scaling, canvas Chimera phenotype blending, context-aware audio triggers, and live Dodo license verification.
- **Product Authority:** Product decisions confirmed via interactive brainstorm on 2026-10-28.
- **Open Blockers:** None.

## Product Contract

### Problem & Framing

Players currently experience the Breeding Lab as a static simulation: Parent 1 and Parent 2 are hardcoded to the first two kennel slots without any player choice, and the resulting baby pet is merely a 50/50 clone of one parent's existing species rather than an exciting, personalized offspring. Furthermore, there is no progression tied to breeding rarer pets.

At the same time, users expect natural auditory feedback (barks for dogs, meows for cats) from their on-screen and desktop companions, and the game currently allows access to monetization features (Auction House VIP, Custom DNA Studio, and Browser Extension downloads) in developer simulation mode without requiring confirmed payment once Dodo Payments goes live.

### Scope & Boundaries

#### In-Scope

- **Parent Pet Selectors:** Interactive Parent 1 and Parent 2 selection drawers allowing players to pick any two pets from their kennel or battle roster.
- **Procedural Chimera Hybrid Fusions:** Combining physical characteristics from both parent breeds (facial masks, ear structures, tail types, patterns, and blended 6-tone fur palettes) with procedural hybrid titles (e.g., "Husky-Bengal Chimera", "Shepherd-Doberman Cross").
- **Rarity Fusion Progression Ladder:** Weighted inheritance where offspring inherits the highest parent's base rarity with a 30% baseline chance to ascend to the next rarity tier (Common → Rare → Epic → Legendary → Mythic), amplified by parent Level and Affection Hearts.
- **Sanctuary Daycare Model:** Parents are preserved in the player's kennel; breeding costs in-game Slam Tokens or Berries and initiates a recovery cooldown timer.
- **Context-Aware Companion Audio:** Explicit Bark SFX for canines, Meow SFX for felines, and dual audio triggers for cross-species Chimera hybrids on both the floating screen pet and Chrome browser extension.
- **Live Dodo Paywall Gating:** Enforcing strict license verification in live mode so that unverified accounts cannot bypass the paywall for Auction House trading, Custom Pet DNA creation, or Browser Extension exports.

#### Non-Goals

- Replacing the 60 FPS canvas combat engine or battle action cards.
- Adding real-money costs to standard pet breeding (breeding uses in-game Slam Tokens / Berries; real money is reserved for Dodo VIP passes and token packs).
- Full 3D skeletal rigging (all Chimera phenotypes remain rendered via the procedural 2D canvas engine).

### Key Decisions

- KTD1. session-settled: **Procedural Chimera Fusion over Static Species:** When two breeds are paired, the offspring does not copy one parent's species; it generates a procedural hybrid combining the facial markings, ear geometry, and blended hex palette of both parents with a generated hybrid name.
- KTD2. session-settled: **Weighted Rarity Ladder with Heart/Level Scaling:** Offspring rarity starts at the higher parent's tier with a 30% base chance to ascend (+1 tier). High parent levels and affection hearts add up to +20% bonus ascension probability, rewarding pet training.
- KTD3. session-settled: **Sanctuary Daycare Retention:** Parent pets remain in the kennel and are never destroyed or consumed upon breeding. Breeding incurs an in-game currency fee (Slam Tokens / Berries) and a recovery rest timer.
- KTD4. session-settled: **Context-Aware Audio Triggers:** Companion sound controls adapt dynamically to the pet's species—dogs expose Bark, cats expose Meow, and Chimera hybrids expose both options.
- KTD5. session-settled: **Strict Live Dodo Gate Enforcement:** In live mode (`dodo_live_`), developer bypasses and simulated pass unlocks are disabled. Unlocking VIP features strictly requires verified payment session completion or sufficient earned Slam Credits.

### Requirements

- R1. The Breeding Lab must render two interactive parent selection slots ("Parent 1" and "Parent 2") that open a kennel picker grid displaying each pet's 2D canvas avatar, species, CP, level, and rarity badge.
- R2. A player must not be allowed to select the exact same pet instance as both Parent 1 and Parent 2.
- R3. The breeding algorithm in `src/utils/Genetics.ts` must generate a genuine hybrid entity when parents differ, combining parent markings (e.g. rosettes, muzzle masks, eyebrow dots) and blending parent palettes across fur, belly, ears, eyes, and nose.
- R4. Offspring must receive a hybrid title combining both parent breed heritages (e.g., "Husky-Bengal Hybrid") and custom signature moves that reflect both physical disciplines.
- R5. Rarity determination must implement the 5-tier ascension ladder: Common, Rare, Epic, Legendary, and Mythic.
- R6. If both parents share a tier (e.g. Epic + Epic), offspring base tier is Epic with a 30% baseline chance (up to 50% with max level/hearts) to hatch as Legendary.
- R7. Initiating breeding must deduct an in-game breeding fee (500 Slam Tokens or 5 Berries) and keep both parents safely inside the kennel.
- R8. The on-screen pet companion radial menu and the Chrome extension popup must expose a dedicated "Bark 🐶" button for canines, a "Meow 🐱" button for felines, and both buttons for Chimera hybrids.
- R9. Audio triggers must play crisp, high-fidelity Web Audio sound effects for barks and meows matching pet mood and stage.
- R10. When `DODO_PAYMENTS_ENVIRONMENT` is `live_mode` or API keys start with `dodo_live_`, frontend modals (`PetAuctionHouseModal`, `PetAvatarPhotoStudioModal`, `ExtensionExporterModal`) must block feature access unless `hasPass` is verified via backend payment session receipt or valid in-game credit redemption.

### Key Flows

- F1. Interactive Parent Selection & Compatibility Check
  - **Trigger:** Player clicks Parent 1 or Parent 2 slot in `BreedingLabModal`.
  - **Actors:** Player, Sanctuary Kennel.
  - **Steps:** Modal opens displaying all owned kennel pets with rarity badges; player taps a candidate; slot updates with live 2D preview, predicted stat ranges, and hybrid compatibility rating.
  - **Covered by:** R1, R2, R7.

- F2. Rarity Ascension Egg Hatching
  - **Trigger:** Player initiates breeding and egg incubation finishes.
  - **Actors:** Breeding Lab, Genetics Engine.
  - **Steps:** Egg cracks with celebratory particle effects; offspring identity is revealed displaying hybrid phenotype, blended coat colors, CP calculation, and rarity tier upgrade callout.
  - **Covered by:** R3, R4, R5, R6.

- F3. Companion Voice Action
  - **Trigger:** Player taps sound button in on-screen pet menu or browser extension.
  - **Actors:** Floating Screen Pet, Browser Extension.
  - **Steps:** Species-appropriate audio plays (bark or meow); pet triggers speech bubble and playful animation state.
  - **Covered by:** R8, R9.

- F4. Live Dodo VIP Paywall Gate
  - **Trigger:** Unlicensed player clicks "Place Live Bid", "Export Extension ZIP", or "Create Custom Pet Avatar".
  - **Actors:** Player, Dodo Payments Edge Gateway.
  - **Steps:** System checks license status; if unverified in live mode, displays VIP License modal offering Dodo hosted checkout or credit purchase; simulated developer auto-unlock is blocked.
  - **Covered by:** R10.

### Acceptance Examples

- AE1. Cross-Breed Pet Selection
  - **Given:** A player owns a Rare Bengal Cat and an Epic Siberian Husky.
  - **When:** The player selects Bengal as Parent 1 and Husky as Parent 2 in the Breeding Lab.
  - **Then:** Both parent slots display active previews with "Chimera Hybrid" compatibility, and stat variance reflects the weighted average of both parents.

- AE2. Rarity Tier Jump
  - **Given:** Two Rare parents with Level 15 and 4 Affection Hearts are bred.
  - **When:** The egg hatches.
  - **Then:** The offspring has a ~42% chance to ascend to Epic rarity, generating a higher base CP multiplier and rare mutant trait potential.

- AE3. Contextual Companion Audio
  - **Given:** An active Bengal Cat on screen.
  - **When:** The player opens the radial interaction menu.
  - **Then:** A "Meow 🐱" sound button is present and triggers a feline meow; when switching to a Husky, the button dynamically updates to "Bark 🐶".

- AE4. Live Paywall Enforcement
  - **Given:** The app runs with live Dodo credentials.
  - **When:** A player without an Auction License attempts to place a bid on a rare pet auction.
  - **Then:** The bid is blocked and the player is prompted to complete a live Dodo checkout session or unlock with 1,500 Slam Credits; no instant free bypass occurs.

### Outstanding Questions

#### Resolve Before Planning

None. All core requirements, progression mechanics, audio triggers, and paywall rules are settled.

#### Deferred to Planning

- Q1. Should Mythic Chimera hybrids display an exclusive animated glowing aura particle effect in both the sanctuary and battle arena?
- Q2. Should players be able to rename their Chimera offspring freely at hatch time?
