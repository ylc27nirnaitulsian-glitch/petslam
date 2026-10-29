---
title: "Pivot to Clean Digital Software & F2P Companion Monetization - Plan"
type: "feat"
date: "2026-10-29"
topic: "clean-monetization-software-utility-pivot"
artifact_contract: "ce-unified-plan/v1"
product_contract_source: "ce-pov"
execution: "code"
---

## Goal Capsule

- **Objective:** Pivot PET SLAM's commercial architecture and public terminology away from flagged "real-money auctions, competitive bidding, and paid leaderboard advantages" to an unassailable digital software model: a paid Chrome/Desktop Companion software license, an AI Photo Studio utility pass, and a 100% Free-to-Play, earned-currency in-game pet adoption center.
- **Means:** Purge all gambling/auction/bidding triggers across the frontend, backend APIs, and product descriptions; convert the Auction House to an earned-currency-only "Sanctuary Adoption Center"; re-architect Dodo product catalog around digital software utilities; and provide an authoritative compliance appeal dossier for Dodo Payments (with a zero-friction fallback to Stripe/LemonSqueezy).
- **Product Authority:** Product decisions confirmed via `/ce-pov` assessment on 2026-10-29 in response to Dodo Payments acceptance policy notice.
- **Open Blockers:** None.

---

## Product Contract

### Problem & Framing

Dodo Payments declined onboarding with the specific notice:
> *"After reviewing the offering, we found that the platform involves real-money competitive bidding, live auctions, and paid transactions to secure leaderboard rankings. These activities are not supported under our current acceptance policy."*

Standard payment processors and Merchants of Record (MoRs) like Dodo, Stripe, and LemonSqueezy operate under strict Visa/Mastercard MCC 7995 (Gambling) and MCC 6051 (Quasi-Cash / Secondary Market Trading) rules. The presence of words like **"Auction House VIP License"**, **"High-stakes live player pet auctions and bidding"**, and pay-to-win stat claims triggered automated and human compliance rejections.

To resolve this permanently—both for a successful Dodo appeal and for long-term platform viability—PET SLAM must cleanly separate **Monetized Digital Software** from **In-Game Play-to-Earn Mechanics**:
1. **The Game & Pets are 100% Free-to-Play:** Leaderboards and duels are strictly skill-based. In-game trading is an earned-currency Adoption Shelter using non-purchasable gameplay tokens.
2. **Paid Products are Digital Software Utilities:**
   - **Product 1: PET SLAM Browser & Desktop Companion (Lifetime Software License - $2.99 / $4.99)** — A downloadable browser extension and desktop productivity pet with battery monitoring, posture/hydration alerts, and speech mimicry.
   - **Product 2: AI Pet Photo Studio Scanner Pass ($0.99 / $1.99)** — Generative computer vision utility converting personal pet photos into digital trading cards via Gemini.
   - **Product 3: Genesis Founder Supporter Pack ($4.99)** — Purely cosmetic profile badges, golden UI flair, and custom arena themes with 0% stat advantage.

### Scope & Boundaries

#### In-Scope

- **Terminology & Copy Purge:** Remove all instances of "real-money bidding", "high-stakes auctions", "buyout valuations", and "paid leaderboard advantage" across `server.ts`, `functions/api/dodo/config.ts`, `dodo.ts`, `VipPassesModal.tsx`, `PetAuctionHouseModal.tsx`, and `.agents/product-marketing.md`.
- **Sanctuary Adoption Center Re-Skin:** Transform `PetAuctionHouseModal` from a speculative "Auction House" to the **"Sanctuary Adoption & Rescue Shelter"**, where pet transfers use **earned in-game Berries/Kibble**, eliminating all real-money bidding mechanics.
- **Re-Aligned Store Catalog:**
  - `extension`: *Browser & Desktop Companion Software License* ($2.99).
  - `avatar`: *AI Pet Photo Studio Scanner Pass* ($0.99).
  - `supporter`: *Genesis Founder Cosmetic Livery* ($4.99).
- **Payment Abstraction Layer:** Ensure the checkout flow works seamlessly with Dodo's appeal OR can flip to Stripe Checkout via a simple environment flag.
- **Dodo Appeal Dossier:** Draft a copy-pasteable compliance appeal statement explicitly detailing that the platform sells digital software utilities and generative AI tools, with zero real-money wagering or secondary market auctions.

#### Non-Goals

- Deprecating the 60 FPS battle arena, Chimera breeding, or radar features (these remain 100% free and playable).
- Introducing real-money cashouts or player-to-player fiat transfers (never allowed).
- Adding subscription billing until one-time licenses are approved.

### Key Decisions

- KTD1. **Browser Extension as the Anchor Commercial Product:** The Chrome extension and desktop companion are classified as digital software tools. Software utilities enjoy the lowest risk tier across all payment processors.
- KTD2. **Adoption Center Uses 100% Free Earned Currency:** In-game pet adoption strictly uses Slam Berries/Bones earned through battles, daily quests, and training. Real money cannot be used to bid against other players.
- KTD3. **AI Photo Studio Retained as AI Utility:** Selling access to compute-heavy Gemini multimodal vision scans is standard AI SaaS (analogous to headshot and avatar generators), fully permitted under digital goods policies.
- KTD4. **Strict Cosmetic-Only Monetization for the Arena:** No paid pass or purchase grants combat stats, attack power, or leaderboard placement (enforcing Fair Play).
- KTD5. **Prepare Dual-Path Appeal / Stripe Fallback:** Submit the formal compliance appeal to Dodo while keeping the checkout interface modular so Stripe Checkout can be activated if Dodo does not reverse within 48 hours.

### Requirements

- R1. `server.ts` and `functions/api/dodo/config.ts` must replace `auction` pass with `supporter` (Genesis Founder Cosmetic Pack) or remove it entirely from public endpoints.
- R2. `VipPassesModal.tsx` must display only compliant software and utility products:
  1. *Browser & Desktop Companion License* ($2.99)
  2. *AI Pet Photo Studio Pass* ($0.99)
  3. *Genesis Founder Cosmetic Pack* ($4.99)
- R3. All mentions of "auction", "bidding", "bids", and "buyout" in player-facing modals must be renamed to "Adoption Shelter", "Rescue Requests", and "Adoption Fee (Berries)".
- R4. The Adoption Shelter must exclusively accept in-game earned Berries/Tokens; real-money checkout buttons must be completely absent from pet trading.
- R5. `.agents/product-marketing.md` and `MvpScopeSection.tsx` must be updated to reflect the pure F2P + Software Utility business model.
- R6. Provide an official Dodo Payments Appeal Dossier markdown file (`docs/DODO_PAYMENTS_APPEAL.md`) containing the exact text for the merchant appeal form.

---

## Planning Contract

### Architecture & Data Flow

```
+-------------------------------------------------------------------+
|                        PET SLAM PLATFORM                          |
+-------------------------------------------------------------------+
          |                                       |
    [FREE-TO-PLAY GAME]               [DIGITAL SOFTWARE GOODS]
          |                                       |
  - 60 FPS Battle Arena                  - Browser Extension ($2.99)
  - Tamagotchi Sanctuary                 - AI Photo Studio ($0.99)
  - Chimera Genetic Breeding             - Founder Cosmetic Flair ($4.99)
  - Sanctuary Adoption Shelter                    |
    (Earned Berries Only)                         v
                                         [Dodo Payments / Stripe]
                                         - Merchant Category: Software/SaaS
                                         - 0% Gambling Risk
                                         - Instant Digital Delivery
```

---

## Implementation Units

### U1: Copy & Terminology Purge across Server and Edge Functions
- **Target Files:** `server.ts`, `functions/api/dodo/config.ts`, `src/services/dodo.ts`
- **Actions:**
  - Remove `Auction House VIP License` and descriptions referencing "high-stakes live player pet auctions and bidding".
  - Replace product definitions with:
    - `extension`: *Browser & Desktop Companion Software License*
    - `avatar`: *AI Pet Photo Studio Scanner Pass*
    - `bundle` / `supporter`: *Genesis Founder Cosmetic Supporter Pack*
  - Ensure API responses report compliant descriptions.

### U2: Re-Skin Pet Auction House to "Sanctuary Adoption Shelter"
- **Target Files:** `src/components/game/pet/PetAuctionHouseModal.tsx`, `DualOrientationShell.tsx`, `DesktopNavRail.tsx`, `MobileBottomDock.tsx`
- **Actions:**
  - Rename modal title and nav labels to "Adoption Shelter" / "Kennel Rescue".
  - Change all bid labels from "$" or "Slam Credits" to in-game "Berries 🍓" or "Kibble 🍖".
  - Remove any prompts linking to real-money VIP purchase for trading.

### U3: Overhaul VIP Store Modal (`VipPassesModal.tsx`)
- **Target Files:** `src/components/game/VipPassesModal.tsx`
- **Actions:**
  - Replace the "Auction House VIP License" card with the "Browser Extension Lifetime License" as the premier card.
  - Position "AI Pet Photo Studio Pass" as a creative generative tool.
  - Re-label the bundle as the "Genesis Founder Supporter Bundle (Cosmetics & Software)".
  - Add explicit "100% Fair Play: Zero Pay-To-Win / Non-Wagering Guarantee" badge.

### U4: Update Marketing & Scope Documentation
- **Target Files:** `.agents/product-marketing.md`, `src/components/MvpScopeSection.tsx`, `DEPLOYMENT_GUIDE.md`
- **Actions:**
  - Update product pricing matrix and business model description.
  - State clearly that the game is digital freemium with software utility monetization.

### U5: Create Dodo Payments Appeal Dossier
- **Target Files:** `docs/DODO_PAYMENTS_APPEAL.md`
- **Actions:**
  - Write a professional, structured appeal letter explaining the misunderstanding:
    1. The platform is an indie browser game and digital software utility.
    2. Real money was NEVER wagered; "auctions" were an in-game roleplay mechanic using earned game points, now fully renamed to "Adoption Shelter".
    3. The primary commercial product is a standalone Chrome Web Extension / Desktop productivity widget.
    4. Provide the updated live URL, terms, and merchant category verification (MCC 5734 - Computer Software / MCC 5818 - Digital Goods).

---

## Verification Contract

- **Automated Check:** Run `npm run lint` (`tsc --noEmit`) and verify 0 compiler errors.
- **Search Audit:** Run `grep -ri "auction" src/` and `grep -ri "bidding" src/` to ensure zero stray gambling or real-money bidding references remain in store/monetization contexts.
- **Runtime Check:** Verify `GET /api/dodo/config` returns clean product objects with zero flagged keywords.
- **Build Verification:** Run `npm run build` to confirm production bundle compiles cleanly.

---

## Definition of Done

- All real-money auction and competitive bidding terminology completely eliminated from public-facing code, APIs, and marketing context.
- Browser extension and AI photo studio positioned cleanly as compliant digital software goods.
- Ready-to-submit appeal document authored in `docs/DODO_PAYMENTS_APPEAL.md`.
- Static build passes without regressions.
