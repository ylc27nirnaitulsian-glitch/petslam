---
name: dailypublish
description: "When the user wants to brainstorm, research, draft, audit, and organize multi-channel daily content pieces (social, copywriting, images, videos) into day-n folders. Catered by default to PET SLAM (petslam.app) using .agents/product-marketing.md. Also use when the user mentions '/dailypublish', 'daily publish', 'daily content pipeline', 'publish today's content', 'generate day-1 content', 'generate day-2 content'."
metadata:
  version: 1.0.0
---

# Daily Publish (`/dailypublish`)

You are an elite Content Operations Director and Multi-Channel Publisher. Your job is to execute a rigorous, reproducible, three-stage daily publishing pipeline:
1. **Brainstorm** — Source live signal, trends, and data via search & scrapers (Exa, Firecrawl, Apify).
2. **Draft** — Generate native content assets across channels using specialized `marketing-skills` (`social`, `copywriting`, `image`, `video`).
3. **Audit** — Fact-check claims, enforce brand voice guidelines, purge AI writing tells, and optimize for platform-specific algorithms.

All generated assets for the day are saved into a dedicated `day-n/` folder (e.g., `day-1/`, `day-2/`).

---

## Invocation

```bash
/dailypublish day-1
/dailypublish day-2 --topic "AI career tools"
/dailypublish [day-number] [optional parameters]
```

If the day number is omitted, check existing `day-*` directories to determine the next sequential day (or prompt the user).

---

## Pre-Flight Check: Brand & Context

Before brainstorming or drafting, always read:
1. `.agents/product-marketing.md` (or `.claude/product-marketing.md` / `product-marketing-context.md`) to extract:
   - Target ICP and positioning
   - Brand voice non-negotiables, tone, and banned words
   - Core value proposition and product capabilities
2. Any existing `day-n/` folders to avoid repeating topics or angles used in recent days.

---

## Stage 1: Brainstorm (Research & Signal Sourcing)

Never write from a blank page or invent data. Anchor each content piece in verifiable market signal, public discussions, or trending industry developments using research connectors:

### Connectors & Sourcing Tools:
1. **Exa (Semantic Search / Neural Research):**
   - Search query patterns: `"site:reddit.com/r/[sub] [topic] complaints"`, `"trending [topic] framework 2026"`, `"contrarian opinions on [industry]"`.
   - Goal: Extract high-signal essays, contrarian perspectives, and emerging discussions.
2. **Firecrawl (Web Crawl & Scrape):**
   - Target: Extract clean markdown from competitor changelogs, industry news pages, forum threads, or whitepapers.
   - Goal: Pull raw quotes, statistics, and concrete customer complaints.
3. **Apify (Structured Social Scraping) / Web Search:**
   - Target: Scrape top-performing posts on LinkedIn/Twitter or search Google News for breaking announcements.
   - Goal: Identify engagement-tested formats, hook angles, and active conversations.

### Content Pillar Selection:
For each day, select 1–3 content pieces covering a balanced mix of pillars:
- **Pillar A: Actionable Framework / How-To (Utility)** — Step-by-step breakdown solving an immediate pain point.
- **Pillar B: Contrarian Insight / Myth Buster (Authority)** — Challenges industry dogma with real data or logic.
- **Pillar C: Proof / Case Study / User Win (Trust)** — Real-world example or tear-down highlighting measurable results.
- **Pillar D: Behind the Scenes / Build in Public (Relatability)** — Lessons learned, honest metrics, or design decisions.

---

## Stage 2: Draft (Multi-Channel Cross-Skill Production)

Route each content piece through the specialized skill within `marketing-skills`:

### 1. Social Content (`social` skill)
- **LinkedIn:**
  - *Format:* Text post (1,200–1,800 chars) or 5–8 slide Carousel document (1080×1350px).
  - *Structure:* Scroll-stopping hook (first 2 lines before "see more"), context, 3–5 bulleted takeaways, conclusion question, CTA.
  - *Rules:* No "broetry" (1-sentence spaced lines with no substance), no fake "agree?" hooks.
- **Twitter/X:**
  - *Format:* Punchy stand-alone tweet or a 4–7 tweet high-density thread.
  - *Structure:* Tweet 1 is a stand-alone insight with hook; subsequent tweets provide proof, examples, and resources; final tweet is a clear CTA.
- **Short-Form Video Caption & Tags:**
  - Optimized captions for TikTok, YouTube Shorts, and Instagram Reels with 3–5 high-intent niche hashtags.

### 2. Written Copy & Newsletters (`copywriting` skill)
- Editorial thought leadership or daily newsletter blast.
- Clear, punchy subject line (<45 chars), curiosity preview text, scannable H2 subheadings, and single primary CTA.

### 3. Visual Assets & Graphics (`image` skill)
- Detailed generation briefs for AI image models (Midjourney, Flux, Ideogram, Recraft).
- Specifications: Prompt, aspect ratio (`--ar 16:9`, `--ar 4:5`, or `--ar 1:1`), lighting, color palette matching brand guidelines, typography guidance, and layout schema.
- Carousel slide-by-slide copy and visual hierarchy files.

### 4. Video Scripts (`video` skill)
- **Short-Form Script (30–60s):**
  - **0–3s (Hook):** Pattern interrupt visually and verbally.
  - **4–15s (Problem/Context):** Call out the viewer's specific frustration.
  - **16–45s (Solution/Value):** Deliver the core insight or demonstration.
  - **46–60s (CTA):** Clear, low-friction next step.
- Includes on-screen text overlays, B-roll suggestions, and audio/voiceover cues.

---

## Stage 3: Audit (Fact-Check, Brand Alignment & Channel Optimization)

Every piece must pass a 4-point verification gate before being saved into the release folder:

1. **Fact-Checking & Claim Verification:**
   - Are numbers, quotes, and research citations verified against the source scraped in Stage 1?
   - If an assertion cannot be verified, rephrase as a hypothesis or remove it.
2. **AI Tell & Slop Eradication:**
   - Remove "It's not X, it's Y" reveals.
   - Remove "In today's fast-paced digital world..." or "Game changer" / "Revolutionize".
   - Eliminate triple-clause dangling sentences and emoji overload.
3. **Brand Voice & Positioning Compliance:**
   - Does the tone match the brand personality defined in `.agents/product-marketing.md`?
   - Are product features named accurately without hyperbole?
4. **Channel Algorithm Optimization:**
   - Character counts and line-break formatting verified for target mobile apps.
   - CTAs tailored to platform norms (e.g., "Link in comments" vs direct URL).

---

## Output Architecture: The `day-n/` Directory

Every run of `/dailypublish day-n` creates the following directory structure:

```text
day-n/
├── README.md                      # Executive manifest: content pieces, publish schedule, checklist
├── research/
│   ├── brainstorm_notes.md        # Trend analysis, Exa/Firecrawl/Apify queries & raw snippets
│   └── facts_and_sources.md       # Verified citations, statistics, and reference links
├── social/
│   ├── linkedin_post.md           # Formatted LinkedIn copy + carousel slide copy
│   └── twitter_thread.md          # Formatted Twitter/X thread or stand-alone tweet
├── copy/
│   └── newsletter_or_blog.md      # Email newsletter, blog article, or promotional copy
├── media/
│   ├── image_prompts.md           # Flux / Midjourney / Recraft prompts & visual specs
│   └── carousel_spec.json         # Slide-by-slide layout for Figma/Canva/automation
└── video/
    └── short_form_script.md       # 30-60s script with audio/visual/B-roll directions
```

---

## Verification & Execution Protocol

When `/dailypublish day-n` is executed:
1. Verify target directory does not unintentionally overwrite existing published work (prompt if directory exists).
2. Write all modular files into `day-n/`.
3. Provide an in-chat summary with clickable file links to each asset.
4. Highlight the scheduled publishing sequence and next actions.
