# PET SLAM Cloudflare Edge Cache & Routing Guide

This document specifies the exact Page Rules and Cache Rules for `https://petslam.app/` on Cloudflare.

---

## 1. Page Rules / Cache Rules Configuration

Navigate to **Cloudflare Dashboard -> petslam.app -> Caching -> Cache Rules** (or **Rules -> Page Rules**):

### Rule 1: Static Assets Cache Everything (1 Month TTL)
* **Rule Name**: `Cache Assets 1-Month Immutable`
* **Incoming Request Matching**:
  * `URI Path` starts with `/assets/`
* **Cache Eligibility**:
  * **Eligible for cache**
* **Edge TTL**:
  * Override origin: `1 month` (30 days)
* **Browser TTL**:
  * Override origin: `1 month` (30 days)
* **Custom Headers**:
  * `Cache-Control: public, max-age=2592000, immutable`

### Rule 2: Dynamic API Cache Bypass
* **Rule Name**: `Bypass API Endpoints`
* **Incoming Request Matching**:
  * `URI Path` starts with `/api/`
* **Cache Eligibility**:
  * **Bypass cache**
* **Origin Cache Control**:
  * Respect origin `no-cache, no-store, must-revalidate`

### Rule 3: WebSocket Upgrade Protocol
* **Rule Name**: `Allow Authoritative Netcode WebSockets`
* **Incoming Request Matching**:
  * `URI Path` equals `/socket`
* **Cache Eligibility**:
  * **Bypass cache**
* **WebSockets**:
  * Enabled (Cloudflare Dashboard -> Network -> WebSockets = ON)

---

## 2. Speed & Optimization Settings
* **HTTP/3 (with QUIC)**: Enabled
* **0-RTT Connection Resumption**: Enabled
* **Brotli Compression**: Enabled
* **Early Hints**: Enabled
* **Auto Minify**: HTML, CSS, JavaScript = Checked

---

## 3. Edge Security Headers
Configured natively in `public/_headers`:
* `X-Content-Type-Options: nosniff`
* `X-Frame-Options: SAMEORIGIN`
* `Referrer-Policy: strict-origin-when-cross-origin`
* `Permissions-Policy: camera=(self), microphone=(self), geolocation=()`
