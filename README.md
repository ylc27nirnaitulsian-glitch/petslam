# PET SLAM (petslam.app)

> **Turn your pet into a fighter. Virtual animal ownership meets competitive gaming in your browser.**

PET SLAM combines real-world domestic and wildlife species with competitive 60 FPS combat, procedural avatar generation from user photos, real-time map pet radar, and a zero-pay-to-win, fully compliant virtual economy.

---

## ⚡ Core Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Physics & Render Engine**: 60 FPS 2D Canvas & WebGL procedural pet renderer, 20-tick netcode state synchronizer.
- **Client AI & Voice**: On-device neural text-to-speech with ONNX Runtime Web (`kokoro-js`, Kokoro-82M), procedural Web Audio API sound synthesis.
- **Vision & Avatar Studio**: Multimodal real pet photo analysis via Google Gemini Vision API (`functions/api/pet/analyze-photo.ts`).
- **World Map Radar**: Leaflet map with **OpenFreeMap** (free, zero-key, unlimited tile CDN), CartoDB Dark Matter, and Geoapify fallback.
- **Database & Auth**: Supabase Auth (Google OAuth & Guest sessions) with Row Level Security (RLS), protected profiles, and progression tamper protection.
- **Payments & Compliance**: 100% compliant Merchant of Record architecture via **Dodo Payments** ($1.00 AI Studio Pass, $1.99 Companion License) with WebCrypto HMAC signature verification and server-side payment confirmation. Zero gambling, zero wagering, zero auctions.
- **Production Edge Hosting**: **Cloudflare Pages** + Cloudflare Pages Functions (`/functions/api/`), zero-dependency edge functions calling REST endpoints.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ylc27nirnaitulsian-glitch/petslam.git
cd petslam
npm install
```

### 2. Environment Configuration
Copy the template configuration:
```bash
cp .env.example .env
```
Fill in the following variables:
```ini
# Gemini API Key for photo avatar studio
GEMINI_API_KEY="your_gemini_api_key"

# Dodo Payments (Merchant of Record)
DODO_PAYMENTS_API_KEY="your_dodo_api_key"
DODO_PAYMENTS_WEBHOOK_SECRET="your_webhook_secret"
DODO_PAYMENTS_ENVIRONMENT="test_mode"

# Supabase Auth & Progression
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"

# Optional: Geoapify Vector Tiles (OpenFreeMap is used by default with zero keys)
VITE_GEOAPIFY_API_KEY=""

# Admin Protected Diagnostics
ADMIN_SECRET_KEY="your_secure_admin_key"
```

### 3. Run Development Server
```bash
# Starts both the local Express backend (port 3000) and Vite development client
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Build & Verification

```bash
# Typecheck TypeScript (0 errors required)
npm run lint

# Build client production bundle to /dist
npm run build

# Run automated Playwright tests
npm run test
```

---

## 🌐 Production Deployment (Cloudflare Pages)

PET SLAM deploys to Cloudflare Pages:
1. **Build Command**: `npm run build`
2. **Build Output Directory**: `dist`
3. **Functions Directory**: `functions` (Cloudflare automatically routes `/api/*` to edge functions)
4. **Environment Variables**: Configure `GEMINI_API_KEY`, `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_WEBHOOK_SECRET`, `ADMIN_SECRET_KEY`, and `VITE_GEOAPIFY_API_KEY` in the Cloudflare Pages Settings dashboard.

---

## 📜 License & Compliance

PET SLAM is operated in full compliance with Dodo Payments terms of service as a Merchant of Record selling fixed digital content and software licenses. All animal imagery is authentic and ethical; PET SLAM strictly advocates for wildlife conservation and responsible pet ownership.
