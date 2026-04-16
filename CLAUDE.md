# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A two-page boutique clearance sale web app. No build tools, no npm, no framework — pure HTML/CSS/JS files opened directly in a browser.

- `shop.html` — customer-facing storefront
- `admin.html` — admin panel (orders + inventory management)

## Development

No build or install step. Open either HTML file directly in a browser. Both pages use Firebase SDK loaded from CDN (`https://www.gstatic.com/firebasejs/11.6.0/`), so an internet connection is required.

To test locally with live Firestore data, simply open the file in a browser. All Firestore reads use `onSnapshot` for real-time updates.

## Architecture

### Backend: Firebase Firestore

Both pages share the same Firebase project (`boutique-sale-2b5db`) and connect directly from the browser using the public Firebase config (this is intentional for client-side Firebase apps — security is enforced via Firestore rules on the Firebase console).

**Firestore collections:**

- `products` — each document has: `id` (SKU string), `cat` (one of `wallets`/`perfume`/`accessories`/`other`), `emoji`, `price` (number, Georgian Lari ₾), `sold` (boolean), `name` (`{ru, en, ge}`), `desc` (`{ru, en, ge}`), `photoUrl` (optional), `createdAt`
- `orders` — each document has: `orderId` (string `ORD-<timestamp>`), `status` (`pending`/`confirmed`/`rejected`), `items` (array of `{id, qty, name, price}`), `total`, `lang`, `createdAt`

### Order Flow

1. Customer adds items to in-memory cart in `shop.html`
2. On "Send order", an order document is written to Firestore, then the user is redirected to Facebook Messenger with a pre-filled message (`MESSENGER_URL` constant at top of `shop.html` — **needs to be updated to the actual Messenger link**)
3. Admin sees the order in `admin.html` in real time; confirming an order sets all ordered products to `sold: true`

### Multilingual System (`shop.html`)

The `T` object holds all UI strings in `en`, `ru`, `ge`. Elements with `data-t="key"` are updated by `applyT()`. Product `name` and `desc` fields are objects keyed by language code; fallback is `ru`.

### Admin Panel (`admin.html`)

Two tabs — Orders and Inventory — both driven by `onSnapshot` listeners. Confirming an order also marks products sold. "Undo" on a confirmed order restores products to available.

## Key Customization Point

```js
const MESSENGER_URL = "https://m.me/me"; // ✏️ замени на ссылку мамы
```

This line in `shop.html` must be set to the actual Facebook Messenger page URL before going live.
