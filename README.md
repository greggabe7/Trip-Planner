# Gabriel Family Trip Planner

A self-contained PWA for managing packing lists across multiple family trips. Built as a single HTML file with Firebase Realtime Database for live sync across devices.

## Features

- **Multi-trip support** — Create, clone, rename, and delete trips from a home screen
- **Packing list** — Add items with categories, quantities, family member assignment
- **Shopping list** — Toggle items as "need to buy", separate shopping view with share
- **Bulk import** — Paste lists from Google Docs with duplicate detection
- **Custom categories** — Add your own categories with emoji icons
- **Offline-first** — Works without internet, syncs automatically when reconnected
- **Installable PWA** — Add to home screen on iOS and Android
- **Swipe gestures** — Swipe left to delete, swipe right to toggle shopping list
- **Progress tracking** — Per-category and global packing progress bars
- **Reset & undo** — Reset all packed states for next trip with 24-hour undo window
- **Deep linking** — Direct URLs to specific trips (`/#/trip/{id}`)
- **Data migration** — Automatically migrates from single-trip to multi-trip format

## Project Structure

```
index.html      — Entire app (HTML + CSS + JS, ~3700 lines)
manifest.json   — PWA manifest with inline SVG icons
sw.js           — Service worker for offline caching (v3)
README.md       — This file
```

## Setup

### 1. Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project (or use existing)
3. Go to **Project Settings > General > Your Apps > Web**
4. Click "Add app" and register it
5. Copy the `firebaseConfig` object
6. Paste it into `index.html` replacing the placeholder config
7. Go to **Build > Realtime Database > Create Database**
8. Set rules to allow access:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

> For production, use Firebase Authentication and restrict rules to `"auth != null"`.

### 2. Deploy to Netlify

1. Push this repo to GitHub
2. Go to [Netlify](https://app.netlify.com) > **Add new site > Import from Git**
3. Connect GitHub and select this repo
4. Build command: *(leave empty)*
5. Publish directory: `/`
6. Click **Deploy site**

Netlify auto-deploys on every push to `main`.

### 3. Install as PWA

- **iOS Safari**: Share > "Add to Home Screen"
- **Android Chrome**: Menu > "Add to Home Screen"

## Configuration

At the top of the `<script>` section in `index.html`:

```js
// Set to your family website URL to show a "Back to Family Site" link in Settings.
// Leave empty string to hide the link.
const FAMILY_SITE_URL = "";
```

## URL Patterns

| URL | Behavior |
|-----|----------|
| `/` | Home screen (trip list) |
| `/#/trip/{id}` | Opens a specific trip |
| `/?trip={id}` | Redirects to `/#/trip/{id}` |
| Invalid trip ID | Shows "Trip not found" toast, redirects home |

## Linking from an External Site

The app is fully self-contained. Link to it from any website:

```html
<a href="https://your-app.netlify.app">Trip Planner</a>
<a href="https://your-app.netlify.app/#/trip/TRIP_ID">Mammoth Winter Trip</a>
```

Link previews (Open Graph) are included for social sharing.

## Data Structure (Firebase)

```
trips/
  {tripId}/
    name: "Mammoth Winter"
    icon: "❄️"
    color: "#1a3a5c"
    createdAt: timestamp
    lastUsedAt: timestamp
    itemCount: 12
    items/
      {itemId}/
        name: "Snow boots"
        category: "Clothes and Gear"
        quantity: 1
        packed: false
        needToBuy: false
        alwaysBring: true
        assignedTo: "Greg"
        createdAt: timestamp
    categories/
      {catId}/
        name: "Cooking Supplies"
        icon: "🍳"
        requiresAssignment: false
    appState/
      lastResetSnapshot/
        items: { ... }
        timestamp: ...
```

## Default Categories

| Category | Icon | Per-person |
|----------|------|------------|
| Refrigerated Foods | 🧊 | No |
| Dry Foods | 🥫 | No |
| Clothes and Gear | 👕 | Yes |
| Miscellaneous | 📦 | No |

## Tech Stack

- Vanilla HTML/CSS/JS (no build step)
- Firebase Realtime Database (sync + offline persistence)
- Service Worker (asset caching)
- PWA (installable, offline-capable)
