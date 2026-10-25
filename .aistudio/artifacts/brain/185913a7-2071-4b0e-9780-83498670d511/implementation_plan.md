# PET SLAM: Monetisation Strategy & Audience Acquisition Refinement

Refine the commercial strategy, go-to-market execution, and scope boundaries for PET SLAM to ensure a bulletproof Week 8 launch.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following parameters were confirmed during requirements clarification:
> - **First-Customer Path**: Free playable alpha access launched first to competitive gaming communities to establish trust and retention, followed by optional paid Genesis Founder cosmetic packs ($19.99) once players have experienced the core gameplay loop.
> - **Target Communities (3–5 Named Channels)**:
>   1. **Smogon VGC Discord & Forums**: ~120k competitive creature collection & battle strategists.
>   2. **Teamfight Tactics (TFT) Competitive Discord**: ~85k positioning and stat optimization players.
>   3. **Auto-Chess & Tactical Battler Discords**: ~60k auto-combat mechanics enthusiasts.
>   4. **`r/CompetitiveGaming` & `r/webgaming`**: Targeted Reddit discussions and browser alpha showcases.
> - **Display Location**: A dedicated **"Go-To-Market & 8-Week Outreach Sequence"** interactive card embedded directly within the MVP Scope Section (`MvpScopeSection.tsx`), supported by clear scope delineation banners.

---

## 1. Overview & Core Enhancements

### A. The 8-Week Audience Acquisition & Monetisation Sequence
- **Weeks 1–2 (Community Seeding & Dev Logs)**:
  - Engage community moderators in Smogon VGC and TFT strategy channels.
  - Release unedited gameplay clips of the biological stat progression engine and bite-force physics.
  - Distribute 250 exclusive VIP Alpha testing vouchers with Founder badges.
- **Weeks 3–4 (Free Playable Alpha Access Giveaways)**:
  - Open free single-player training and combat sandbox access to the first 1,500 players across the 4 named communities.
  - Run community tournaments scoring the highest single-player training conditioning scores.
- **Weeks 5–6 (Genesis Founder Pack Pre-Orders)**:
  - Introduce the paid **Genesis Founder Cosmetic Pack ($19.99 / 2,500 credits)**: tactical dark-carbon harnesses, gilded coat insignias, and custom kennel livery.
  - Reiterate the zero pay-to-win pledge: cosmetics provide 0% stat boost.
- **Weeks 7–8 (Genesis Deployment & Target Conversion)**:
  - Launch the full Week 8 build: Marketplace UI, single-player training routines, and personal stable custody.
  - Commercial conversion goal: 10% conversion of the 5,000 engaged alpha community into 500 paying Genesis Founder pack supporters ($10,000 gross revenue).

### B. Strict Scope Separation: Week 8 MVP vs. Post-Launch
- **Week 8 Genesis MVP (In Scope · 100% Digital Software)**:
  - Animal Marketplace UI & Genesis Minting (inspect biological dossiers, filter species, spend starter credits).
  - Single-Player Training & Evolution Module (dietary caloric conditioning, sprint agility drills, Level 1 → 10 attribute scaling).
  - Personal Stable & Kennel Inventory (multi-beast custody, signature loadouts).
  - Combat Stance Sandbox & Stat Auditing (local offline simulation testing bite force, agility, and stamina).
  - *Digital-Only*: Zero physical animal custody, zero veterinary dependencies, zero real-world meetups.
- **Deferred Post-Launch Roadmap (Out of Scope for Week 8)**:
  - **Real-Time PvP Arena Battles**: Deferred to **Week 14 (Season 01)** to allow players to train starter beasts to competitive baselines and complete deterministic netcode stress testing.
  - **Live Weekly Player Auctions**: Deferred to **Week 16** to allow sufficient trained beasts in circulation to support balanced market liquidity.
  - **Global Sanctioned Esports Leaderboard**: Deferred to **Week 14** to activate directly alongside ranked PvP duels.
  - **IRL Proximity Radar Matchmaking**: Deferred to **Post-Launch Phase 2** for thorough privacy and location fuzzing compliance. IRL Mode is **not required for the MVP to function**.

---

## 2. Technical Implementation Steps

1. **Update `src/components/MvpScopeSection.tsx`**:
   - Add the dedicated **Go-To-Market & 8-Week Outreach Sequence** table/card detailing Weeks 1–2, Weeks 3–4, Weeks 5–6, and Weeks 7–8.
   - Name the 4 specific target communities (Smogon VGC, TFT Competitive Discord, Auto-Chess Discords, `r/CompetitiveGaming`).
   - Feature the concrete conversion funnel: 5,000 free alpha players → 500 paying Founder pack adopters ($10k revenue target).
   - Emphasize the clear division between Week 8 single-player/marketplace and deferred PvP/auctions/IRL features.
2. **Update Hero & Waitlist Copy**:
   - Ensure the hero kicker and waitlist descriptions clearly reflect the free alpha rollout sequence: *"Launching free playable alpha to competitive gaming communities on Discord and Reddit, with cosmetic founder packs available at launch."*
3. **Build & Lint Verification**:
   - Run `lint_applet` (`tsc --noEmit`) and `npm run build` to verify zero compile or runtime regressions.

---

## 3. Verification Plan

- Confirm `MvpScopeSection.tsx` displays the named communities and weekly breakdown with high visual fidelity.
- Confirm that the Week 8 digital-only boundary and deferred PvP/auctions/IRL features are unmistakably clear.
- Confirm static production build compiles with 0 errors.
