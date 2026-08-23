# How to Use Spotlight JS

Spotlight JS is a lightweight, zero-dependency tour library written in TypeScript. It supports both NPM module usage for frameworks (React, Next.js, Astro, Vue, Vite) and simple CDN script inclusion for static HTML pages.

---

## 1. Using via NPM / Package Managers

### Installation

```bash
npm install spotlight-js
# or
yarn add spotlight-js
# or
pnpm add spotlight-js
```

### Import Stylesheet & JS

Import the CSS stylesheet and initialize `spotlight` in your entry file or component:

```typescript
import { spotlight } from 'spotlight-js';
import 'spotlight-js/stylesheet';

// Initialize the tour engine
const tour = await spotlight({
  theme: 'dark', // 'light' | 'dark'
  borderRadius: 8,
  highlightColor: '#2196F3',
  devMode: false
});

// Control the tour programmatically
tour.start();
// tour.next();
// tour.previous();
// tour.end();
```

### Annotating Target Elements

Add HTML comments directly above the elements you want to highlight:

```html
<!-- Spotlight #1; Feature Title; Description text explaining the feature. -->
<div class="my-feature">
  ...
</div>
```

---

## 2. Using via CDN (Static Pages)

For HTML/CSS/JS or static sites, include Spotlight JS using a script tag:

```html
<!-- Load CSS Stylesheet -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/spotlight-js/src/spotlight.css" />

<!-- Load Module -->
<script type="module">
  import { spotlight } from 'https://cdn.jsdelivr.net/npm/spotlight-js/dist/index.js';

  document.addEventListener('DOMContentLoaded', async () => {
    const tour = await spotlight({
      theme: 'dark',
      borderRadius: 6
    });
  });
</script>
```

---

## Options & Config

| Option | Type | Default | Description |
|---|---|---|---|
| `theme` | `'light' \| 'dark'` | `'light'` | UI theme preset for popovers |
| `borderRadius` | `number` | `4` | Border radius in pixels for the popover card |
| `modalPadding` | `number` | `15` | Inner padding in pixels for popover content |
| `modalWidth` | `number` | `300` | Maximum width in pixels for the popover |
| `highlightColor` | `string` | `'#ffce5c'` | Color of the highlight box border |
| `highlightStrokeWidth` | `number` | `3` | Width of the highlight border in pixels |
| `devMode` | `boolean` | `false` | Enables debug logging in browser console |
