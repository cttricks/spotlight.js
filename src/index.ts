import { spotlight, Spotlight } from './core/spotlight.js';
import type {
  SpotStep,
  SpotlightOptions,
  SpotlightControls,
  SpotlightTheme,
  SpotlightEventMap,
  PopoverPosition
} from './types/spotlight.types.js';

export { spotlight, Spotlight };
export type {
  SpotStep,
  SpotlightOptions,
  SpotlightControls,
  SpotlightTheme,
  SpotlightEventMap,
  PopoverPosition
};

// Global window registration for CDN <script> inclusion
if (typeof window !== 'undefined') {
  const globalObj = window as any;
  globalObj.Spotlight = {
    spotlight,
    Spotlight,
    create: (options?: SpotlightOptions) => new Spotlight(options)
  };

  // Auto-start functionality for CDN scripts decorated with data-spotlight-auto or lights-on
  const initAutoStart = () => {
    const autoScript = document.querySelector('script[data-spotlight-auto], script[lights-on]');
    if (autoScript) {
      const theme = autoScript.getAttribute('data-spotlight-theme') || 'auto';
      const group = autoScript.getAttribute('data-spotlight-group') || 'default';
      const instance = new Spotlight({ theme: theme as any, group });
      instance.start();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoStart);
  } else {
    initAutoStart();
  }
}