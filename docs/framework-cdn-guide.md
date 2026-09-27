# Spotlight.js — Framework & CDN Integration Guide

## 1. Installation

### Via NPM / Yarn / PNPM
```bash
npm install spotlight-js
# or
pnpm add spotlight-js
# or
yarn add spotlight-js
```

---

## 2. Using in Modern Frameworks

### 2.1 Next.js (App Router / Pages Router)

Because Next.js pre-renders components on the server, you should ensure Spotlight initializes client-side.

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { spotlight, SpotlightInstance } from 'spotlight-js';
import 'spotlight-js/dist/styles/spotlight.css';

export default function OnboardingTour() {
  const tourRef = useRef<SpotlightInstance | null>(null);

  useEffect(() => {
    // Initialize tour on client mount
    tourRef.current = spotlight({
      theme: 'auto',
      highlightColor: '#6366f1',
      confirmOnExit: false,
    });

    return () => {
      tourRef.current?.destroy();
    };
  }, []);

  return (
    <div>
      <button 
        onClick={() => tourRef.current?.start()}
        className="btn-start">
        Start Tour
      </button>

      <nav data-spot-id="1" data-spot-name="Main Menu" data-spot-summary="Browse all workspaces and team channels here.">
        {/* Navigation items */}
      </nav>

      <main data-spot-id="2" data-spot-name="Editor Canvas" data-spot-summary="Create and edit your documents in real time.">
        {/* Content */}
      </main>
    </div>
  );
}
```

### 2.2 React / Vite (SPA)

```tsx
import React, { useEffect, useState } from 'react';
import { spotlight } from 'spotlight-js';
import 'spotlight-js/dist/styles/spotlight.css';

export function App() {
  const [tour, setTour] = useState(null);

  useEffect(() => {
    const instance = spotlight({
      theme: 'dark',
      onStepChange: (step) => {
        console.log('Active step:', step.index, step.title);
      }
    });
    setTour(instance);
  }, []);

  return (
    <div>
      <button onClick={() => tour?.start()}>Take Tour</button>
      <div data-spot-id="1" data-spot-name="Welcome" data-spot-summary="Let's explore your new dashboard!">
        Dashboard Card
      </div>
    </div>
  );
}
```

### 2.3 Vue 3 (Composition API)

```vue
<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { spotlight } from 'spotlight-js';
import 'spotlight-js/dist/styles/spotlight.css';

const tour = ref(null);

onMounted(() => {
  tour.value = spotlight({ theme: 'auto' });
});

onUnmounted(() => {
  tour.value?.destroy();
});
</script>

<template>
  <div>
    <button @click="tour?.start()">Start Tour</button>
    <div 
      data-spot-id="1" 
      data-spot-name="Analytics Overview" 
      data-spot-summary="Real-time traffic and conversion graphs appear here.">
      Chart Component
    </div>
  </div>
</template>
```

---

## 3. CDN Usage (Vanilla HTML / No-Build)

### 3.1 Direct Script Tag Inclusion
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Web App</title>
  <!-- 1. Stylesheet -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/spotlight-js/dist/styles/spotlight.css">
</head>
<body>

  <header data-spot-id="1" data-spot-name="Header Bar" data-spot-summary="Your account settings and quick action buttons.">
    <h1>Welcome</h1>
    <button id="start-tour-btn">Guide Me</button>
  </header>

  <!-- 2. Spotlight JS Bundle -->
  <script src="https://cdn.jsdelivr.net/npm/spotlight-js/dist/spotlight.global.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const tour = Spotlight.create({
        theme: 'auto',
        highlightColor: '#10b981'
      });

      document.getElementById('start-tour-btn').addEventListener('click', () => {
        tour.start();
      });
    });
  </script>
</body>
</html>
```

### 3.2 Declarative Auto-Start via CDN
Add `data-spotlight-auto` directly onto the script tag to automatically scan and launch the tour on first visit:
```html
<script 
  src="https://cdn.jsdelivr.net/npm/spotlight-js/dist/spotlight.global.js" 
  data-spotlight-auto="true"
  data-spotlight-theme="dark">
</script>
```

---

## 4. Complete Programmatic API Reference

```typescript
const tour = spotlight({
  theme: 'auto', // 'light' | 'dark' | 'auto'
  highlightColor: '#6366f1',
  highlighterBorderRadius: 8,
  highlighterBorderWidth: 3,
  overlayOpacity: 0.7,
  confirmOnExit: false,
  showProgress: true,
  nextText: 'Next',
  previousText: 'Back',
  doneText: 'Finish',
  // Programmatic steps can also be defined without DOM attributes:
  steps: [
    {
      target: '#header-title',
      title: 'Welcome to our platform',
      summary: 'Here is how to get started quickly.',
      media: 'https://example.com/tour.mp4'
    }
  ]
});

// Controls
tour.start();               // Starts from first step (or step 1)
tour.start({ from: 2 });    // Starts from step 2
tour.next();                // Advances to next step
tour.previous();            // Moves to previous step
tour.goTo(3);               // Jumps to specific step index
tour.end();                 // Exits the tour cleanly
tour.updateSpots();         // Re-scans DOM for dynamically added data-spot elements
tour.destroy();             // Unbinds all listeners and cleans up DOM elements

// Event Listeners
tour.on('start', ({ step, total }) => { ... });
tour.on('change', ({ currentStep, index, total }) => { ... });
tour.on('complete', () => { ... });
tour.on('exit', ({ reason }) => { ... });
```
