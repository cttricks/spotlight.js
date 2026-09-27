# Spotlight.js — Agent & Developer Guide (`AGENT.md`)

Welcome to the **Spotlight.js** codebase. This document serves as the primary technical blueprint and operating guide for AI agents and human developers contributing to this project.

---

## 1. Project Mission & North Star

**Spotlight.js** is a lightweight, zero-dependency site tour and onboarding engine built in TypeScript.
The goal is to provide a tour guide solution that:
1. **Feels Polished & Production-Ready:** Smooth animated cutout transitions, glassmorphic adaptive UI, and collision-aware popover positioning (no glitchy jumping or off-screen overflows).
2. **Embraces Declarative Markup:** Allows developers to decorate elements with intuitive HTML attributes (`data-spot-name`, `data-spot-summary`, `data-spot-media`, `data-spot-id`, etc.).
3. **Works Universally:** Runs flawlessly across modern server-rendered frameworks (Next.js App/Pages router, Remix, Astro), client SPAs (React, Vue, Vite), and simple static HTML pages via CDN `<script>` tag.
4. **Zero Runtime Dependencies:** Delivers full functionality without external libraries, keeping bundles tiny and lightning fast.

---

## 2. Critical Operational Rules

> [!CAUTION]
> **NEVER OPEN OR ACCESS THE `.trash` FOLDER.**
> The `.trash` folder is strictly quarantined and must never be read, listed, edited, or explored under any circumstances.

> [!IMPORTANT]
> **SSR Safety First:** Always guard browser DOM objects (`window`, `document`, `HTMLElement`, `ResizeObserver`) with `typeof window !== 'undefined'`. Module imports must never execute DOM operations at file evaluation time.

> [!TIP]
> **Zero External Runtime Dependencies:** Keep the core engine pure TypeScript/CSS. Do not introduce heavy dependencies like Popper.js, lodash, or framer-motion.

---

## 3. Current State vs. Production Target

### Current State (v2.0.0 Prototype)
- **Targeting:** DOM comment node traversal (`<!-- SPOTLIGHT#1 ... -->`). Comment nodes are often stripped by modern frameworks/minifiers.
- **Visuals & Motion:** Cutout coordinates jump instantaneously (`setAttribute` on SVG rects). Popover is rigidly placed below the element without boundary checks, overflowing offscreen on mobile or bottom elements.
- **Media:** Only basic static image parsing based on file extensions.
- **Theming:** Minimal dark theme class toggle on `<html>`.
- **Packaging:** Outputs unbundled raw ES modules. Loading via CDN causes waterfall HTTP requests and requires bundlers or `<script type="module">`.

### Target State (Production v2.1+)
- **Targeting:** Standard `data-spot-*` attributes + programmatic `steps: [...]` configuration.
- **Visuals & Motion:** Smooth CSS-interpolated SVG cutout transitions (`x`, `y`, `width`, `height`, `rx`), backdrop blur, subtle border glow, and coordinated smooth scrolling.
- **Smart Positioning:** Viewport collision detection, auto-flipping (`bottom` <-> `top`, `right` <-> `left`), boundary clamping, and dynamic directional arrow tethering.
- **Rich Media:** Dedicated media container supporting Images, GIFs, and HTML5 `<video>` (`.mp4`, `.webm`) with responsive aspect ratios.
- **Adaptive Theming:** Tokenized CSS system supporting `light`, `dark`, and `auto` (auto-detects system `prefers-color-scheme`).
- **Universal Distribution:** Multi-format bundles (ESM, CJS, and Standalone IIFE / CDN global `window.Spotlight`).

---

## 4. Documentation Index & Deep Dives

Detailed technical guides and architectural specifications are organized in the [`docs/`](./docs) directory:

| Document | Purpose & Pointer |
|---|---|
| 📐 [**Architecture Specification**](./docs/architecture.md) | Class design, state machine, lifecycle hooks (`start`, `next`, `previous`, `end`, `destroy`), SSR safeguards, and event emission. |
| 🏷️ [**Data Attributes Specification**](./docs/data-attributes-spec.md) | Complete reference for `data-spot-*` attributes (`data-spot-name`, `data-spot-summary`, `data-spot-media`, `data-spot-id`, `data-spot-position`, `data-spot-padding`, `data-spot-radius`), priority sorting, and group filtering. |
| 🎨 [**UI, Animation & Theme Design**](./docs/ui-animation-design.md) | SVG cutout morphing mechanics, collision-aware popover positioner, glassmorphism design tokens, and reduced-motion accessibility. |
| 🚀 [**Framework & CDN Integration Guide**](./docs/framework-cdn-guide.md) | Setup instructions for Next.js, React, Vite, Vue, Astro, and direct CDN script tag usage with zero-config auto-start. |
| 🗺️ [**Migration & Engineering Roadmap**](./docs/roadmap-migration.md) | Step-by-step phased execution plan to transform the prototype into a production-grade library. |

---

## 5. Repository Structure

```
spotlight-js/
├── .github/              # CI/CD workflows
├── docs/                 # Detailed architectural and design documentation
│   ├── architecture.md
│   ├── data-attributes-spec.md
│   ├── ui-animation-design.md
│   ├── framework-cdn-guide.md
│   └── roadmap-migration.md
├── src/                  # Core library source code (TypeScript)
│   ├── core/             # State machine, scanner, event emitter, positioning
│   ├── styles/           # Design system tokens and component styles
│   ├── types/            # TypeScript interfaces and option definitions
│   ├── ui/               # Overlay (SVG cutout) and Popover components
│   └── index.ts          # Main library entry point
├── dist/                 # Built distribution artifacts
├── example/              # Local interactive testbed and playground
├── AGENT.md              # AI agent guidelines & architecture overview
├── package.json          # Package manifest, scripts, and exports
└── tsconfig.json         # TypeScript compiler configuration
```

---

## 6. Development Commands

```bash
# Build TypeScript and copy styles to dist/
npm run build

# Start local server to preview CDN distribution on http://localhost:3000
npm run cdn

# Start example testbed on http://localhost:3001
npm start

# Clean build output
npm run clean
```

---

## 7. How to Work on Tasks

When picking up an implementation task:
1. **Consult the relevant specification** in `docs/` (e.g. read `docs/data-attributes-spec.md` for scanner changes, or `docs/ui-animation-design.md` for overlay/popover changes).
2. **Preserve SSR safety**: Never introduce unguarded browser globals.
3. **Verify locally**: Rebuild (`npm run build`) and test against the testbed in `example/index.html`.
4. **Keep bundles lean**: Do not add external npm dependencies without explicit justification.
