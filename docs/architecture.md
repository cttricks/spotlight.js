# Spotlight.js — Architecture Specification

## 1. Executive Summary

Spotlight.js is a zero-dependency, framework-agnostic site tour and onboarding engine for the modern web. It provides both declarative attribute-driven targeting (`data-spot-*`) and programmatic API controls. The engine is engineered to run seamlessly across server-rendered modern frameworks (Next.js, Remix, Astro), client-side Single Page Applications (React, Vue, Vite), and traditional static HTML sites via CDN.

---

## 2. Core Architectural Pillars

```
┌─────────────────────────────────────────────────────────────┐
│                       Spotlight Core                        │
│  ┌──────────────────────┐        ┌──────────────────────┐  │
│  │   Spot Scanner &     │        │   State & Event      │  │
│  │   Registry Engine    │        │   Controller         │  │
│  │  - data-spot-* attrs │        │  - start(), stop()   │  │
│  │  - programmatic opts │        │  - next(), prev()    │  │
│  │  - dynamic sorting   │        │  - on(), off(), emit │  │
│  └──────────┬───────────┘        └──────────┬───────────┘  │
│             │                               │              │
│  ┌──────────▼───────────────────────────────▼───────────┐  │
│  │                     Render Pipeline                  │  │
│  │  ┌────────────────────────┐ ┌─────────────────────┐  │  │
│  │  │     Overlay Layer      │ │    Popover Layer    │  │  │
│  │  │ - SVG Animated Mask    │ │ - Smart Positioner  │  │  │
│  │  │ - Backdrop blur & tint │ │ - Glassmorphism UI  │  │  │
│  │  │ - Smooth cutout morph  │ │ - Media (Img/Vid/GIF)│ │  │
│  │  └────────────────────────┘ └─────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                             │                              │
│  ┌──────────────────────────▼───────────────────────────┐  │
│  │           Observers & Interaction Handlers           │  │
│  │  - ResizeObserver & Window Resize                    │  │
│  │  - Keyboard Navigation (Esc, Arrow keys, Tab)        │  │
│  │  - Light-dismiss & Focus trapping                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Instance-Based Architecture
- Rather than relying on mutable module-level singletons (`conf`), Spotlight provides an instance factory (`spotlight(options)` or `new Spotlight(options)`).
- Multiple tours or isolated instances can be instantiated without state leakage.
- Clean lifecycle methods: `.start()`, `.next()`, `.previous()`, `.goTo(index)`, `.end()`, `.destroy()`.

### 2.2 SSR Safety & Framework Compatibility
- Universal runtime check: every browser DOM access (`window`, `document`, `ResizeObserver`) must be protected by `typeof window !== 'undefined'`.
- In Next.js (Server Components or SSR pages), importing Spotlight.js must never throw `ReferenceError: document is not defined`.
- Export cleanly formatted Dual-Package ESM (`.mjs` / `.js`) and CJS (`.cjs`), plus an IIFE bundle for CDN.

### 2.3 Discovery & Step Management
- **Declarative Scanner**: Traverses DOM elements decorated with `data-spot-*` attributes (see [`docs/data-attributes-spec.md`](./data-attributes-spec.md)).
- **Programmatic Options**: Developers can pass an explicit `steps` array in configuration, supporting dynamic single-page applications where components mount and unmount.
- **Hybrid Support**: Allows merging declarative elements with configuration overrides.

---

## 3. Module Breakdown

| Module | Location | Responsibility |
|---|---|---|
| `core/engine.ts` | `src/core/engine.ts` | Core class coordinating state, step navigation, and lifecycle hooks. |
| `core/scanner.ts` | `src/core/scanner.ts` | Scans DOM for `data-spot-*` attributes and compiles ordered `SpotStep` items. |
| `core/events.ts` | `src/core/events.ts` | Typed event emitter for lifecycle callbacks (`start`, `change`, `complete`, `exit`). |
| `core/positioner.ts` | `src/core/positioner.ts` | Calculates optimal popover coordinates with boundary clamping and auto-flip. |
| `ui/overlay.ts` | `src/ui/overlay.ts` | SVG overlay rendering with animated cutout morphing and backdrop effects. |
| `ui/popover.ts` | `src/ui/popover.ts` | Accessible popover component (`role="dialog"`) with media support, header, body, controls. |
| `ui/theme.ts` | `src/ui/theme.ts` | Dynamic theme engine (light, dark, system/auto) via CSS custom properties. |
| `styles/` | `src/styles/` | Modern CSS with theme variables, glassmorphic effects, and transitions. |

---

## 4. Lifecycle & Event System

### 4.1 Lifecycle States
- `IDLE`: Tour is initialized but inactive.
- `STARTING`: Preparing first step, measuring target element and positioning overlay.
- `ACTIVE`: Step is displayed, listening for user interactions, window resizes, and hotkeys.
- `TRANSITIONING`: Smoothly animating cutout and popover from Step N to Step N+1.
- `ENDED`: Tour completed or dismissed; DOM artifacts cleaned up or hidden.

### 4.2 Supported Events
```typescript
interface TourEvents {
  'start': (data: { step: SpotStep; total: number }) => void;
  'change': (data: { previousStep: SpotStep | null; currentStep: SpotStep; index: number; total: number }) => void;
  'next': (data: { step: SpotStep; index: number }) => void;
  'previous': (data: { step: SpotStep; index: number }) => void;
  'complete': () => void;
  'exit': (data: { reason: 'esc' | 'backdrop' | 'button' | 'api' }) => void;
}
```

---

## 5. Responsive Behavior & Observers

1. **ResizeObserver**: Observes the current target element. If the target resizes or reflows, the spotlight cutout and popover auto-adjust smoothly.
2. **Window Resize & Scroll**: Throttled with `requestAnimationFrame` to ensure zero lag or jitter during fast viewport changes.
3. **Accessibility**:
   - `Escape` key closes the tour.
   - Arrow keys (`ArrowRight`, `ArrowLeft`) navigate through steps.
   - Screen reader announcements via ARIA live regions and `aria-labelledby`.
