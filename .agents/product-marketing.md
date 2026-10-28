# Product Marketing Context: PET SLAM

**Document version:** v1.0.0  
**Last updated:** 2026-10-28  
**Live Application:** [https://www.petslam.app](https://www.petslam.app)  
**Repository:** [https://github.com/ylc27nirnaitulsian-glitch/petslam](https://github.com/ylc27nirnaitulsian-glitch/petslam)

---

## 1. Product Overview

- **One-liner:** Turn your real pet into an esports battle champion and a living desktop browser companion.
- **What it does:** PET SLAM is a next-gen web and desktop gaming experience that bridges real-world pet ownership with 60 FPS procedural esports fighting, Tamagotchi-style pet care, a Gemini-powered AI Pet Photo Studio, procedural Chimera breeding, a real-world GPS rescue radar, and an exportable Talking Tom-style Chrome browser companion extension.
- **Product category:** Web3-grade Casual Gaming, Virtual Pet Simulator, Browser Companion, Esports Arcade.
- **Product type:** Web Application (React 19 / Canvas 60 FPS) + Chrome Browser Extension (Manifest V3) + Mobile Responsive Web Game.
- **Business model & pricing (via Dodo Payments):**
  - **Free Tier:** Core sanctuary feeding, casual radar encounters, starter battle arena.
  - **Pet Avatar Studio Pass:** $0.99 (Gemini multimodal photo scan transforms real pet photos into combatants).
  - **Browser Extension Lifetime Pass:** $1.99 (Downloadable Chrome extension companion with audio repeat & health alerts).
  - **Auction House VIP License:** $1.99 (P2P pet trading and bidding).
  - **All-Access Genesis VIP Bundle:** $4.99 (Unlocks all premium features + 5,000 Slam Credits).

---

## 2. Target Audience & ICPs

### Primary Persona: "The Pet Parent Gamer" (Liam / Maya, Age 18–34)
- **Profile:** Gen Z / Millennial pet owner (dog or cat parent) who loves gaming (Pokémon, Neopets, Smash Bros, Tamagotchi, Marvel Snap) and spends 6–10 hours daily on their laptop or phone.
- **Channels & Watering Holes:**
  - Reddit: `r/aww`, `r/rarepuppers`, `r/cats`, `r/dogs`, `r/cozygames`, `r/webgames`, `r/IndieGaming`.
  - TikTok & Instagram Reels: Pet humor, "my dog if he were a game character", desk setups, cozy gaming aesthetics.
  - Twitter/X: Indie dev showcase, Chrome extension highlights, cozy gaming tags.
- **Primary Job to Be Done (JTBD):**
  - *Functional:* See what their real-life dog or cat looks like as an animated fighting game hero, and have a playful digital version of their pet hanging out on their screen while working or studying.
  - *Emotional:* Pure delight, affection, humor, and pride in their pet; relieving workday stress and loneliness.
  - *Social:* Share their pet's game card or custom Chimera fusion with friends or on social media ("Look at my cat's combat stats!").

### Secondary Persona: "The Cozy / Casual Competitive Gamer"
- **Profile:** Loves monster collection, breeding, and battle mechanics (Pokémon, Palworld, Auto Battlers), but wants a zero-friction, browser-playable game with instant gratification.
- **Primary JTBD:** Collect rare and Mythic hybrid Chimeras, level up their kennel roster, and climb the battle leaderboards.

---

## 3. Core Features & Architecture

1. **60 FPS Procedural Canvas Combat Arena:** Real-time 2D canvas engine with Euler physics, dynamic tag-in squads, signature moves (Quick Pounce, Sonic Bark, Iron Guard, Fierce Bite, PET SLAM Overdrive), and multiple thematic stadiums (Championship Stadium, Cyber Colosseum, Moonlight Dojo).
2. **AI Pet Avatar Photo Studio:** Users upload a photo of their real-life pet; Google Gemini 2.5/3.0 multimodal vision extracts breed, markings, coat palette, and calibrated stats (HP, ATK, DEF, Agility, Combat Power).
3. **Breeding Lab & Chimera Fusion:** Dual-parent genetic breeding system combining 6-tone color palettes, facial traits (rosettes, muzzle masks, eyebrow dots), and a 5-tier weighted rarity ascension ladder (Common → Rare → Epic → Legendary → Mythic).
4. **Pet Radar (GPS World Map):** Powered by Geoapify maps with dark/bright vector tiles; allows players to explore real-world radar sweeps and rescue wild pets with physics-based swipe capture.
5. **Exportable Chrome Companion Extension (Manifest V3):** One-click JSZip download of a desktop companion with screen-roaming pet, pitch-shifted Web Audio voice mimicry, contextual Bark 🐶 & Meow 🐱 triggers, laptop battery reactions, and posture/hydration reminders.
6. **Live P2P Auction House:** Real-time kennel bidding, listings, and pedigree trading.
7. **Production Stack:** Dodo Payments (MoR checkout), Google Search Console, Microsoft Clarity telemetry, Cloudflare Pages hosting (`https://www.petslam.app`).

---

## 4. Problems & Pain Points

- **The "Boring Desktop" Syndrome:** People spend 8+ hours working or studying alone on laptops; workdays feel isolating and sterile.
- **Loss of Connection to Real Pets at Work:** Pet parents at school or in offices miss their pets and love digital representations of them.
- **Stale, High-Friction Mobile Games:** Most pet games require 2GB downloads, aggressive ads, or pay-to-win lootboxes. PET SLAM runs instantly in any modern web browser or as a lightweight desktop extension with zero installation barriers.

---

## 5. Competitive Landscape

| Competitor | Why It Falls Short | How PET SLAM Wins |
| :--- | :--- | :--- |
| **Traditional Tamagotchi / Pou** | Pixelated, outdated 90s gameplay, no combat, no real pet customization. | 60 FPS real-time fighting arena + Gemini photo scan of real pets. |
| **Desktop Goose / Virtual Desktop Pets** | Annoying troll behavior or static animations without actual game progression. | Full RPG progression, leveling, breeding, and companion health reminders. |
| **Pokémon Showdown / Web Battlers** | Strictly text/turn-based, complex spreadsheet meta, no emotional pet attachment. | Fast-paced real-time action, instant visual tag-in combat, emotional pet connection. |

---

## 6. Differentiation & Value Proposition

- **"Your Real Pet, Reimagined as an Esports Legend":** No other game allows you to upload a photo of your golden retriever or tuxedo cat and instantly fight with them in a 60 FPS arena within 5 seconds.
- **Zero Install Friction:** Instant play on `petslam.app` without downloading an app store client.
- **Dual Life:** Plays both as an active esports fighter on the web AND as a passive, helpful desktop companion in your browser.

---

## 7. Brand Voice & Tone

- **Voice Attributes:**
  - **Energetic & Playful:** High enthusiasm, punchy, fun ("Ready to Rumble!").
  - **Heartwarming & Pet-Obsessed:** Celebrates the quirks of real dogs and cats (tail wags, zoomies, purrs, barks).
  - **Crisp & Modern:** Clean indie game aesthetic; no cringe marketing jargon, no crypto/NFT hype language, no corporate fluff.
- **Banned Words & AI Tells:** Never use "Revolutionize", "Game changer", "In today's fast-paced world", "It's not just a game, it's an experience".
- **Approved Taglines:**
  - *"Turn your pet into an esports legend."*
  - *"The battle arena where your real pet takes the crown."*
  - *"Adopt. Battle. Breed. Keep them on your desktop."*

---

## 8. Growth & Publishing Goals

- **North Star Metric:** Daily Active Pets (Battles fought + Extension companion active minutes).
- **Primary Conversion Actions:**
  1. Complete first battle or rescue first pet on radar.
  2. Upload photo in AI Avatar Studio to create custom fighter.
  3. Export Chrome Extension companion.
  4. Unlock Genesis VIP Bundle ($4.99) via Dodo Payments.
