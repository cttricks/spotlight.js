<div align="center">
  <img src="https://raw.githubusercontent.com/cttricks/spotlight.js/master/docs/assets/img/spotlight-js-banner.png" alt="Spotlight.js" />
  <h1>Spotlight JS</h1>
  <p>A mature, TypeScript-powered tour guide engine for any web project.</p>
  <p>
    <img src="https://img.shields.io/npm/v/spotlight-js" alt="npm version" />
    <img src="https://img.shields.io/github/license/cttricks/spotlight.js" alt="license" />
  </p>
</div>

---

**Spotlight JS** is a robust and fully adaptable pure JavaScript/TypeScript engine designed to direct user attention across your webpage. It is zero-dependency, ensuring high performance and compatibility with all modern browsers and frameworks.

### Why Spotlight JS?

- 🚀 **Framework Agnostic:** Works with React, Next.js, Astro, Vite, Vue, or simple HTML/CSS/JS.
- 🎨 **Fully Themeable:** Built-in Light/Dark modes and deep customization via configuration.
- 🏗️ **Modern Architecture:** Rewritten from the ground up in TypeScript for 2.0.0.
- 🪄 **Zero Config Mode:** Automatic start with "Magical Attributes".

---

## 🛠️ Installation

```bash
npm install spotlight-js
```

Or use via CDN:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/spotlight-js/src/spotlight.css" />
<script type="module" src="https://cdn.jsdelivr.net/npm/spotlight-js/dist/index.js"></script>
```

---

## 🚀 Quick Start

1. **Annotate your HTML:** Use comments to define steps.
```html
<!-- Spotlight #1; My Title; The description of this step. -->
<button>Target Feature</button>
```

2. **Initialize:**
```typescript
import { spotlight } from 'spotlight-js';
import 'spotlight-js/stylesheet';

const tour = await spotlight({
  theme: 'dark',
  borderRadius: 8
});
```

For detailed setup instructions, see [How-to-use.md](./How-to-use.md).

---

## 🤝 Contributing

We welcome contributions! Please see [Contribution.md](./Contribution.md) for guidelines and roadmap.

---

## 📄 License

MIT © [Tanish Raj](https://github.com/cttricks)
