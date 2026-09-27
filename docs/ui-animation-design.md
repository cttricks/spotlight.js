# Spotlight.js — UI, Animation & Theme Design Specification

## 1. Design Vision

Spotlight.js transitions the tour experience from a disjointed utility into a polished, high-end product feature. It utilizes modern CSS techniques, glassmorphism surfaces, smooth path animations, and adaptive theming.

---

## 2. Smooth Cutout Morphing & Overlay Mechanics

### 2.1 The Issue with Instant Cutout Changes
In the legacy implementation, switching between steps immediately snapped SVG rect coordinates (`setAttribute('x', ...)`). This produced sudden visual jumps and jitter.

### 2.2 Modern Morphing Pipeline
1. **SVG Mask with Interpolated Geometry**:
   The spotlight cutout SVG `rect` and border `rect` are animated between targets:
   ```css
   #spotlight-cutout,
   #spotlight-border {
     transition: 
       x var(--sl-transition-duration, 350ms) cubic-bezier(0.16, 1, 0.3, 1),
       y var(--sl-transition-duration, 350ms) cubic-bezier(0.16, 1, 0.3, 1),
       width var(--sl-transition-duration, 350ms) cubic-bezier(0.16, 1, 0.3, 1),
       height var(--sl-transition-duration, 350ms) cubic-bezier(0.16, 1, 0.3, 1),
       rx var(--sl-transition-duration, 350ms) cubic-bezier(0.16, 1, 0.3, 1);
   }
   ```
2. **Smooth Scrolling Coordination**:
   Target element scrolling is synchronized with the cutout transition using `scrollIntoView({ behavior: 'smooth', block: 'center' })`.
3. **Backdrop Blur & Tint**:
   Modern overlay supports variable backdrop opacities and subtle backdrop blur (`backdrop-filter: blur(4px)`) where supported, creating depth.

---

## 3. Smart Popover Positioning Engine

### 3.1 Collision Detection & Auto-Flipping
The popover must never clip outside the viewport or overlap the highlighted element.

```
                  ┌──────────────┐
                  │ Top (Flip 1) │
                  └──────▲───────┘
                         │
┌──────────────┐  ┌──────┴───────┐  ┌──────────────┐
│ Left(Flip 3) │◄─┤Target Element├──►│Right (Flip 4)│
└──────────────┘  └──────┬───────┘  └──────────────┘
                         │
                  ┌──────▼────────┐
                  │Bottom (Flip 2)│
                  └───────────────┘
```

1. **Measurement**: Retrieve bounding rects for both the target element and the popover element.
2. **Space Available**: Calculate clearance for `top`, `bottom`, `left`, and `right` against the viewport boundaries (`window.innerWidth`, `window.innerHeight`).
3. **Placement Decision**:
   - If preferred position fits within viewport with at least `padding` margin, use it.
   - If preferred position overflows, flip to the opposite side (e.g. `bottom` -> `top`).
   - If neither vertical side fits, evaluate horizontal sides (`right`, `left`).
4. **Boundary Clamping**:
   - Clamp the `left` coordinate between `12px` and `window.innerWidth - popoverWidth - 12px`.
   - Prevent offscreen overflow on mobile screens.

### 3.2 Dynamic Arrow Tethering
- The popover arrow is dynamically placed on the side facing the target element (`top`, `bottom`, `left`, `right`).
- The arrow's offset along the edge tracks the center of the target element, ensuring the pointer accurately points to the feature.

---

## 4. Theme System & Adaptation

### 4.1 Supported Modes
- `'light'`: High-contrast, clean modern light surface.
- `'dark'`: Deep obsidian dark surface with subtle borders and shadows.
- `'auto'`: Dynamically monitors `window.matchMedia('(prefers-color-scheme: dark)')` and adapts in real-time when the user switches their OS or browser theme.

### 4.2 CSS Design Tokens
All styling is driven by customizable CSS custom properties on `.sl-spotlight-root` or `:root`:

```css
:root {
  /* Surface Tokens */
  --sl-surface-bg-light: rgba(255, 255, 255, 0.92);
  --sl-surface-bg-dark: rgba(24, 24, 27, 0.92);
  --sl-surface-border-light: rgba(0, 0, 0, 0.08);
  --sl-surface-border-dark: rgba(255, 255, 255, 0.12);
  --sl-surface-shadow-light: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --sl-surface-shadow-dark: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);

  /* Typography */
  --sl-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --sl-title-color-light: #18181b;
  --sl-title-color-dark: #f4f4f5;
  --sl-text-color-light: #52525b;
  --sl-text-color-dark: #a1a1aa;

  /* Accent & Highlight */
  --sl-accent: #6366f1;
  --sl-accent-hover: #4f46e5;
  --sl-highlight-stroke: #6366f1;
  --sl-highlight-radius: 8px;
  --sl-highlight-glow: 0 0 15px rgba(99, 102, 241, 0.4);

  /* Animation Durations */
  --sl-transition-duration: 320ms;
  --sl-transition-timing: cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 5. Accessibility & Motion Preferences

1. **`prefers-reduced-motion`**:
   When reduced motion is active, cutout and popover transitions are zeroed out (`--sl-transition-duration: 0ms`) and scrolling uses `behavior: 'auto'`.
2. **Focus Management**:
   Focus is trapped or directed into the primary button ("Next" / "Done") upon step activation to ensure full screen reader and keyboard accessibility.
