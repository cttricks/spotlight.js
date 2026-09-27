# How to Use Spotlight JS

**Spotlight JS** is a modern, zero-dependency tour guide library written in pure TypeScript. It works with both modern package managers and bundlers (Next.js, React, Vite, Vue, Astro) as well as direct CDN script tags.

---

## 1. Using via NPM / Package Managers

### Installation
```bash
npm install spotlight-js
# or
pnpm add spotlight-js
# or
yarn add spotlight-js
```

### Import Stylesheet & JS
```typescript
import { spotlight } from 'spotlight-js';
import 'spotlight-js/styles';

const tour = await spotlight({
  theme: 'auto',              // 'light' | 'dark' | 'auto'
  highlightColor: '#6366f1',  // Custom accent / stroke color
  highlightRadius: 8,         // Corner radius in px
  backdropBlur: 4,            // Subtle glassmorphism blur
  confirmOnExit: false        // Whether to prompt before closing
});

tour.start();
```

### Annotating Target Elements
Annotate any element in your HTML or JSX using declarative `data-spot-*` attributes:

```html
<nav 
  data-spot-id="1"
  data-spot-name="Main Navigation"
  data-spot-summary="Browse all workspaces, channels, and direct messages."
  data-spot-media="/assets/nav-preview.gif"
  data-spot-position="right">
  ...
</nav>

<button 
  data-spot-id="2"
  data-spot-name="Create New Project"
  data-spot-summary="Start a new document or workspace in one click."
  data-spot-media="/assets/demo.mp4"
  data-spot-position="bottom">
  New Project
</button>
```

---

## 2. Using via CDN (Static HTML Pages)

### Standalone Bundle
Include the stylesheet and standalone global bundle directly:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Web Site</title>
  <!-- 1. Spotlight Stylesheet -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/spotlight-js/dist/styles/spotlight.css" />
</head>
<body>

  <!-- Elements with data-spot-* attributes -->
  <h1 data-spot-id="1" data-spot-name="Welcome" data-spot-summary="Let's take a quick look around.">My App</h1>
  <button data-spot-id="2" data-spot-name="Action" data-spot-summary="Click here to deploy.">Deploy</button>

  <!-- 2. Spotlight Global Bundle -->
  <script src="https://cdn.jsdelivr.net/npm/spotlight-js/dist/spotlight.global.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const tour = Spotlight.create({
        theme: 'auto',
        highlightColor: '#10b981'
      });

      // Launch programmatically or via button
      tour.start();
    });
  </script>
</body>
</html>
```

### Automatic Zero-Config Start via CDN
Simply add `data-spotlight-auto="true"` on the script tag:

```html
<script 
  src="https://cdn.jsdelivr.net/npm/spotlight-js/dist/spotlight.global.js" 
  data-spotlight-auto="true"
  data-spotlight-theme="auto">
</script>
```

---

## 3. Data Attributes Reference

| Attribute | Type | Description |
|---|---|---|
| `data-spot-id` | `string \| number` | Step order (if numeric) or unique identifier. |
| `data-spot-name` | `string` | Step title displayed in the popover header. |
| `data-spot-summary` | `string` | Descriptive explanation text. Supports HTML markup. |
| `data-spot-media` | `string` (URL) | Media URL. Automatically detects and embeds Images, animated GIFs, or looping HTML5 Videos (`.mp4`, `.webm`). |
| `data-spot-position` | `'top' \| 'bottom' \| 'left' \| 'right' \| 'auto'` | Preferred placement. Engine auto-flips if space is constrained. |
| `data-spot-padding` | `number` | Custom padding clearance in px around this target. |
| `data-spot-radius` | `number` | Custom cutout corner radius in px for this target. |
| `data-spot-group` | `string` | Multi-tour group tag (e.g. `'onboarding'`, `'feature-tour'`). |

---

## 4. Configuration Options

| Option | Type | Default | Description |
|---|---|---|---|
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | UI theme preset. `'auto'` dynamically tracks OS system color preference. |
| `highlightColor` | `string` | `'#6366f1'` | Accent color for the cutout border glow and primary buttons. |
| `highlightStrokeWidth` | `number` | `3` | Stroke thickness in pixels for the highlight cutout border. |
| `highlightRadius` | `number` | `8` | Default corner radius in pixels for the cutout rectangle. |
| `highlightPadding` | `number` | `8` | Default clearance in pixels around target elements. |
| `overlayColor` | `string` | `'rgba(15, 23, 42, 0.65)'` | Overlay backdrop fill color. |
| `overlayOpacity` | `number` | `1` | Overlay opacity (0 to 1). |
| `backdropBlur` | `number \| boolean` | `4` | Backdrop blur filter in pixels. |
| `animationDuration` | `number` | `320` | Duration in milliseconds for cutout and popover morphing. |
| `confirmOnExit` | `boolean` | `false` | Prompts browser confirmation dialog before exiting mid-tour. |
| `exitOnBackdropClick` | `boolean` | `true` | Allows closing the tour by clicking the dark backdrop. |
| `keyboardNavigation` | `boolean` | `true` | Enables `Escape` to close and `ArrowRight`/`ArrowLeft` to navigate. |
| `showProgress` | `boolean` | `true` | Displays step counter (`Step X of Y`) in the popover footer. |
| `nextText` | `string` | `'Next'` | Custom label for next button. |
| `previousText` | `string` | `'Back'` | Custom label for previous button. |
| `doneText` | `string` | `'Finish'` | Custom label for the final completion button. |
| `skipText` | `string` | `'Skip'` | Custom label for the skip button. |

---

## 5. Event Listeners

```typescript
// Subscribe
const unsubscribe = tour.on('change', ({ step, index, total, previousIndex }) => {
  console.log(`Navigated to step ${index + 1}/${total}:`, step.title);
});

tour.on('complete', () => {
  console.log('User completed the entire tour!');
});

tour.on('exit', ({ reason, step, index }) => {
  console.log(`Tour exited via ${reason} at step ${index + 1}`);
});
```
