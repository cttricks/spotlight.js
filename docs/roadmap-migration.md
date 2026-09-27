# Spotlight.js — Migration & Engineering Roadmap

## 1. Current State vs. Target State

| Dimension | Legacy Prototype (v2.0.0) | Production Target (v2.1+) |
|---|---|---|
| **Element Targeting** | Comment nodes (`<!-- SPOTLIGHT#1 ... -->`) via DOM tree iterator | Declarative HTML data attributes (`data-spot-*`) + Programmatic steps array |
| **Animation & Transitions** | Abrupt instant jump (`setAttribute` on rects) | Smooth morphing SVG cutout (`transition: x, y, width, height, rx`) |
| **Popover Positioning** | Fixed offset below element (`position.top + height + 20`) without boundary checks | Smart collision detection, viewport clamping, auto-flip, dynamic arrow |
| **Media Support** | Static image regex check on comment string | Comprehensive media support: Image, GIF, and Video (`<video>` responsive embed) |
| **Theming** | Rudimentary dark mode toggling | Modern tokenized design system (`light`, `dark`, `auto` / system preference) |
| **Aesthetics** | Generic box, standard buttons | Glassmorphism, subtle borders, backdrop blur, modern typography |
| **SSR / Frameworks** | Module-level DOM calls (`ReferenceError` in Next.js/SSR) | Fully SSR-safe (`typeof window !== 'undefined'`), unmount/destroy lifecycles |
| **Distribution** | Unbundled ES modules requiring relative paths | Multi-format bundle: ESM, CJS, and Standalone IIFE / CDN (`spotlight.global.js`) |

---

## 2. Phased Execution Roadmap

### Phase 1: Core Architecture & SSR Safeguards
- Refactor `src/core/spotlight.ts` into a clean `SpotlightEngine` class.
- Eliminate module-level globals; ensure all browser DOM queries execute only in client browser context.
- Implement robust instance lifecycle: `start()`, `next()`, `previous()`, `goTo()`, `end()`, `destroy()`.
- Implement event emitter: `on(event, handler)`, `off(event, handler)`.

### Phase 2: Declarative Scanner & Step Registry
- Build `src/core/scanner.ts` to scan `data-spot-id`, `data-spot-name`, `data-spot-summary`, `data-spot-media`, `data-spot-position`, `data-spot-padding`, `data-spot-radius`.
- Implement sorting: numeric priority > DOM appearance order.
- Maintain fallback support for legacy comment format if needed for backward compatibility.

### Phase 3: Smooth Animated Overlay & SVG Morphing
- Re-engineer `src/ui/overlay.ts`:
  - Fullscreen SVG with mask cutout.
  - CSS hardware-accelerated transitions on `x`, `y`, `width`, `height`, `rx`.
  - Add optional backdrop blur (`backdrop-filter`) and animated border glow.
  - Non-blocking viewport scroll synchronization.

### Phase 4: Smart Popover & Rich Media
- Re-engineer `src/ui/popover.ts` and `src/core/positioner.ts`:
  - Viewport boundary calculations to avoid overflowing bottom or sides.
  - Auto-flip logic (`bottom` <-> `top`, `right` <-> `left`).
  - Dynamic arrow orientation and positioning.
  - Media container with automatic format detection:
    - Images & animated GIFs.
    - MP4 / WebM videos with muted auto-play and rounded corners.
  - Keyboard navigation: `Escape` (exit), `ArrowRight` / `Enter` (next), `ArrowLeft` (back).

### Phase 5: Modern Adaptive Themes & Tokens
- Refactor `src/styles/spotlight.css`:
  - Modern design tokens with clean CSS variables.
  - Auto theme detection via `window.matchMedia('(prefers-color-scheme: dark)')`.
  - Polished button designs with hover states, active transitions, and accessibility focus rings.

### Phase 6: Build System & Universal Distribution
- Enhance build configuration to output:
  - `dist/index.js` (ESM module for Vite/Next.js).
  - `dist/index.cjs` (CommonJS module).
  - `dist/spotlight.global.js` (Standalone UMD/IIFE bundle with embedded styles or companion CSS for instant CDN usage).
  - Update `package.json` exports map.

### Phase 7: Interactive Demo & Documentation
- Update `example/index.html` to showcase:
  - Real-world `data-spot-*` usage with images, videos, and GIFs.
  - Live theme switcher (Light / Dark / Auto).
  - Live controls playground.
- Update `README.md` and `How-to-use.md`.
