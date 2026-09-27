<div align="center">
  <img src="https://raw.githubusercontent.com/cttricks/spotlight.js/master/docs/assets/img/spotlight-js-banner.png" alt="Spotlight.js" />
  <h1>Spotlight JS</h1>
  <p>A modern, zero-dependency tour guide & onboarding engine for any web project.</p>
  <p>
    <img src="https://img.shields.io/npm/v/spotlight-js" alt="npm version" />
    <img src="https://img.shields.io/github/license/cttricks/spotlight.js" alt="license" />
  </p>
</div>

---

**Spotlight JS** is a lightweight, zero-dependency site tour and feature onboarding engine written in TypeScript. It guides user attention across your web application with fluid SVG cutout morphing, modern glassmorphic card popovers, rich media embeds (Images, GIFs, and Videos), and seamless Light/Dark/Auto theme adaptation.

### ✨ Highlights

- 🏷️ **Declarative Markup:** Annotate elements directly using `data-spot-name`, `data-spot-summary`, `data-spot-media`, and `data-spot-id`.
- 🌊 **Fluid Motion & Morphing:** Smooth hardware-accelerated transitions glide the cutout between elements of any size.
- 📐 **Smart Collision Positioning:** Auto-flips (top, bottom, left, right) with boundary clamping and dynamically tethered directional arrows.
- 🎬 **Rich Media Support:** Embed images, animated GIFs, or autoplaying looping HTML5 videos (`.mp4`, `.webm`) directly inside steps.
- 🌗 **Adaptive Theming:** Built-in `'light'`, `'dark'`, and `'auto'` (dynamically tracks OS system color preference).
- 🚀 **Universal Compatibility:** Zero dependencies. Works with Next.js (App & Pages router, SSR safe), React, Vite, Vue, Astro, and plain HTML via CDN.

---

## 🛠️ Installation

```bash
npm install spotlight-js
# or
pnpm add spotlight-js
# or
yarn add spotlight-js
```

### Or via CDN (Instant / No Build)

```html
<!-- Stylesheet -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/spotlight-js/dist/styles/spotlight.css" />

<!-- Standalone IIFE Script -->
<script src="https://cdn.jsdelivr.net/npm/spotlight-js/dist/spotlight.global.js"></script>
```

---

## 🚀 Quick Start

### 1. Annotate your HTML with `data-spot-*`

```html
<header>
  <button 
    data-spot-id="1"
    data-spot-name="Instant Search"
    data-spot-summary="Press ⌘K anytime to quickly locate pages, documents, and settings."
    data-spot-media="/assets/search-demo.mp4"
    data-spot-position="bottom">
    Search (⌘K)
  </button>
</header>
```

### 2. Initialize in JavaScript / TypeScript

```typescript
import { spotlight } from 'spotlight-js';
import 'spotlight-js/styles';

const tour = await spotlight({
  theme: 'auto',              // 'light' | 'dark' | 'auto' (tracks system preference)
  highlightColor: '#6366f1',  // Accent border and button color
  backdropBlur: 4             // Subtle glassmorphism backdrop blur in px
});

// Launch the tour
tour.start();
```

---

## 🕹️ Controls & API

```typescript
tour.start();            // Starts tour from step 1
tour.start({ from: 2 }); // Starts tour from a specific step ID or index
tour.next();             // Advances to next step
tour.previous();         // Goes back to previous step
tour.goTo(3);            // Jumps to step index
tour.end();              // Closes the tour
tour.updateSpots();      // Re-scans DOM for dynamic elements
tour.setTheme('dark');   // Switches theme dynamically ('light' | 'dark' | 'auto')
tour.destroy();          // Unbinds listeners and removes DOM artifacts

// Event Listeners
tour.on('start', ({ step, total }) => { ... });
tour.on('change', ({ step, index, total }) => { ... });
tour.on('next', ({ step, index }) => { ... });
tour.on('complete', () => { ... });
tour.on('exit', ({ reason }) => { ... });
```

### Declarative Button Triggers
Any HTML element with `type="spotlight-button:start"` or `data-spotlight-start` will automatically launch the tour when clicked:

```html
<button data-spotlight-start>Take a Tour</button>
```

---

## 📚 Documentation

Detailed specifications and integration guides are available in [`docs/`](./docs):
- 📐 [**Architecture Specification**](./docs/architecture.md) — System design, lifecycle state machine, and SSR safety.
- 🏷️ [**Data Attributes Specification**](./docs/data-attributes-spec.md) — Reference for all `data-spot-*` attributes.
- 🎨 [**UI, Animation & Theme Design**](./docs/ui-animation-design.md) — Morphing cutout mechanics and CSS tokens.
- 🚀 [**Framework & CDN Integration Guide**](./docs/framework-cdn-guide.md) — Recipes for Next.js, React, Vue, and CDN.

---

## 🤝 Contributing

We welcome contributions! Please see [Contribution.md](./Contribution.md) for development setup and guidelines.

---

## 📄 License

MIT © [Tanish Raj](https://github.com/cttricks)
