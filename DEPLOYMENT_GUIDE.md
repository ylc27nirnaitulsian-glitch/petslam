# PET SLAM: Complete GitHub Pages, Custom Domain & Student Pack Deployment Guide

This guide explains how to host PET SLAM on GitHub Pages using your **GitHub Student Developer Pack** custom domain (Namecheap `.me`, Name.com `.tech` / `.live`), push your code to your GitHub account, and enjoy free SSL/HTTPS with automatic CI/CD deployment on every commit.

---

## 🎓 GitHub Student Developer Pack: Free Domain Setup (Namecheap / Name.com)

With your GitHub Student Developer Pack, you get a **1-year free domain registration** (e.g., Namecheap gives a free `.me` domain; Name.com gives free `.live` or `.tech` domains):

### 1. Claim Your Free Domain
1. Visit [https://education.github.com/pack/offers](https://education.github.com/pack/offers).
2. Find the **Namecheap** offer (Free 1-year `.me` domain + SSL certificate) or **Name.com** offer.
3. Click the referral link, log in with your GitHub student credentials, and register your chosen domain (for example: `petslam.me` or `petslam-game.me`).

### 2. Configure DNS Records in Your Domain Registrar (Namecheap / Name.com)
In your domain management console (e.g. Namecheap Advanced DNS):

1. **Add 4 `A` Records** (points your root domain to GitHub Pages):
   - **Type**: `A Record` | **Host**: `@` | **Value**: `185.199.108.153` | **TTL**: Automatic
   - **Type**: `A Record` | **Host**: `@` | **Value**: `185.199.109.153` | **TTL**: Automatic
   - **Type**: `A Record` | **Host**: `@` | **Value**: `185.199.110.153` | **TTL**: Automatic
   - **Type**: `A Record` | **Host**: `@` | **Value**: `185.199.111.153` | **TTL**: Automatic

2. **Add 1 `CNAME` Record** (for the `www` subdomain):
   - **Type**: `CNAME Record` | **Host**: `www` | **Value**: `<YOUR_GITHUB_USERNAME>.github.io` | **TTL**: Automatic

---

## 🚀 Push Code to Your GitHub Account

Run these commands in your project root terminal:

```bash
# 1. Stage all project files
git add .

# 2. Commit the changes
git commit -m "feat: complete Pet Slam with pure dog & cat breeds, Clash Royale duel arena, fair play dojo, and GitHub Pages CI/CD"

# 3. Ensure branch is main
git branch -M main

# 4. Link your remote GitHub repository (replace with your username and repo name)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git

# 5. Push code to GitHub
git push -u origin main
```

---

## ⚙️ Enable GitHub Pages with 1-Click

1. Open your repository on GitHub (`https://github.com/<YOUR_USERNAME>/<YOUR_REPO>`).
2. Go to **Settings** (top tab) -> **Pages** (left sidebar under "Code and automation").
3. Under **Build and deployment**:
   - Change **Source** to **"GitHub Actions"**.
4. In the **Custom domain** box:
   - Enter your domain name from the Student Pack (e.g. `petslam.me`).
   - Click **Save**.
5. Once DNS resolves (~5 to 15 minutes), check the box for **"Enforce HTTPS"** to get a free automated SSL certificate!

GitHub Actions will automatically run `.github/workflows/deploy.yml` and publish the site live!

---

## 🎮 What Is Included in This Build

- **Pure Dog & Cat Breeds Only**: 16 realistic canine & feline breeds (German Shepherd, Rottweiler, Husky, Shiba Inu, Maine Coon, Bengal Cat, etc.). Zero irrelevant wild beasts.
- **Clash Royale 1v1 Battle Arena**: Elixir bar (0-10), dynamic cards (Pounce, Bark/Hiss, Guard, Bite/Slash, SLAM Overdrive), floating damage numbers, and tag-in squad mechanics.
- **Pokémon GO Interactive Map & Catch Radar**: Vector map radar with pulsing sonar, real meters distance, and ball-throw encounter screen.
- **Fair Play Dojo & Micro-Shop ($0.49 / 50¢)**: Free daily supply drops (kibble, workout drill, vitamin chew), cosmetic accessories (crown, shades, detective cap, party hat), and zero pay-to-win mechanics.
- **Sanctuary Pet Adoption Shelter**: Free-to-play community re-homing & adoption using earned in-game credits. Zero real-money bidding.
- **Custom Pet Photo Avatar**: Upload your personal dog or cat photo to fight in the arena, live in the sanctuary, and roam across all browser tabs.
- **Talking Tom Browser Extension**: Complete multi-tab screen companion with voice repeater, battery charging reaction, and bubble bath.
