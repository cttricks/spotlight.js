# Spotlight.js — Data Attributes Specification

## 1. Overview

Spotlight.js allows developers to mark up any HTML element directly in markup using modern `data-spot-*` attributes. This eliminates brittle comment parsing or complex selector arrays, enabling intuitive step targeting across React/Next.js JSX, Vue templates, Astro components, or static HTML.

---

## 2. Attribute Reference

| Attribute | Type | Default | Description | Example |
|---|---|---|---|---|
| `data-spot-id` | `string \| number` | auto index | Unique identifier or numeric step order. If numeric, steps are sorted in ascending order. | `data-spot-id="1"` or `data-spot-id="nav-search"` |
| `data-spot-name` | `string` | *(empty)* | Title displayed at the top of the tour popover. | `data-spot-name="Instant Search"` |
| `data-spot-summary` | `string` | *(empty)* | Main descriptive text explaining the feature to the user. | `data-spot-summary="Press Ctrl+K anytime to find pages, docs, and commands."` |
| `data-spot-media` | `string` (URL) | *(optional)* | Media URL to showcase (Image, GIF, or Video). The engine auto-detects the format and embeds the appropriate player/viewer. | `data-spot-media="/assets/demo.mp4"` or `data-spot-media="https://.../preview.gif"` |
| `data-spot-position` | `string` | `'auto'` | Preferred popover placement relative to the element: `'top'`, `'bottom'`, `'left'`, `'right'`, or `'auto'`. | `data-spot-position="top"` |
| `data-spot-padding` | `number` | `8` | Extra clearance (in pixels) around the target element for the spotlight cutout. | `data-spot-padding="12"` |
| `data-spot-radius` | `number` | `8` | Border-radius (in pixels) of the spotlight cutout for this specific element. | `data-spot-radius="16"` |
| `data-spot-group` | `string` | `'default'` | Multi-tour grouping tag. Allows grouping steps into different flows (e.g. `'onboarding'`, `'feature-walkthrough'`). | `data-spot-group="editor-tour"` |

---

## 3. Media Handling Rules (`data-spot-media`)

The engine inspects the value of `data-spot-media` and renders accordingly:

1. **Video (`.mp4`, `.webm`, `.ogg`, `data:video/*`)**:
   - Renders a responsive `<video>` element with `autoplay`, `loop`, `muted`, `playsinline`, and `controlsList="nodownload"`.
   - Popover dynamically waits for metadata or handles aspect-ratio to prevent layout shift.
2. **GIF / Image (`.gif`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`, `data:image/*`)**:
   - Renders an `<img>` tag with `loading="lazy"` and `object-fit: cover`.
3. **External Embeds (YouTube / Vimeo / iframe URLs)**:
   - Optional embed parser to render responsive iframe overlays.

---

## 4. DOM Parsing & Step Sorting Lifecycle

When `updateSpots()` or `scan()` is invoked:

1. **Query Selector**: Queries `[data-spot-name], [data-spot-summary], [data-spot-id]` within the document (or within a specified container).
2. **Filtering by Group**: If a tour is initialized with `group: 'dashboard'`, only elements with `data-spot-group="dashboard"` are registered.
3. **Ordering**:
   - Elements with numeric `data-spot-id` (e.g. `1`, `2`, `3`) are sorted numerically.
   - Elements without explicit IDs or with non-numeric IDs fall back to document tree order (DOM appearance).
4. **Visibility Check**:
   - If an element is hidden via `display: none`, `visibility: hidden`, or disconnected from the DOM, it is safely skipped or evaluated dynamically before activation.

---

## 5. Markup Examples

### Vanilla HTML / CDN
```html
<header>
  <button 
    data-spot-id="1"
    data-spot-name="Search Everything"
    data-spot-summary="Search documents, commands, and shortcuts with zero latency."
    data-spot-media="/assets/search-demo.gif"
    data-spot-position="bottom">
    Search (⌘K)
  </button>
</header>
```

### React / Next.js JSX
```tsx
export function ProfileMenu() {
  return (
    <div 
      data-spot-id="2"
      data-spot-name="Profile & Preferences"
      data-spot-summary="Configure your notification settings, API keys, and theme here."
      data-spot-position="left"
      data-spot-radius="12"
      className="avatar-container">
      <img src="/avatar.png" alt="Avatar" />
    </div>
  );
}
```
