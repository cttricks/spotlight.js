import { SpotlightTheme, SpotlightOptions } from '../types/spotlight.types.js';

export class ThemeManager {
  private currentTheme: SpotlightTheme = 'auto';
  private mediaQuery: MediaQueryList | null = null;
  private mediaListener: ((e: MediaQueryListEvent) => void) | null = null;
  private rootElement: HTMLElement | null = null;

  constructor(theme: SpotlightTheme = 'auto') {
    this.currentTheme = theme;
  }

  init(rootElement: HTMLElement, options: SpotlightOptions): void {
    this.rootElement = rootElement;
    this.applyTheme(this.currentTheme);
    this.applyCustomVariables(options);

    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaListener = (e: MediaQueryListEvent) => {
        if (this.currentTheme === 'auto') {
          this.resolveAutoTheme(e.matches);
        }
      };
      if (this.mediaQuery.addEventListener) {
        this.mediaQuery.addEventListener('change', this.mediaListener);
      } else {
        (this.mediaQuery as any).addListener(this.mediaListener);
      }
    }
  }

  setTheme(theme: SpotlightTheme | string): void {
    this.currentTheme = (theme as SpotlightTheme) || 'auto';
    this.applyTheme(this.currentTheme);
  }

  getResolvedTheme(): 'light' | 'dark' {
    if (this.currentTheme === 'light' || this.currentTheme === 'dark') {
      return this.currentTheme;
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  private applyTheme(theme: SpotlightTheme): void {
    if (!this.rootElement) return;

    if (theme === 'auto') {
      const isDark = typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;
      this.resolveAutoTheme(isDark);
    } else {
      this.rootElement.setAttribute('data-spotlight-theme', theme);
    }
  }

  private resolveAutoTheme(isDark: boolean): void {
    if (!this.rootElement) return;
    this.rootElement.setAttribute('data-spotlight-theme', isDark ? 'dark' : 'light');
  }

  applyCustomVariables(options: SpotlightOptions): void {
    if (!this.rootElement) return;

    const s = this.rootElement.style;
    const anyOpts = options as any;

    // Highlight & Accent
    const highlight = options.highlightColor || anyOpts.layout?.highlightColor;
    if (highlight) {
      s.setProperty('--sl-highlight-stroke', highlight);
      s.setProperty('--sl-accent', highlight);
    }

    const strokeWidth = options.highlightStrokeWidth ?? anyOpts.layout?.highlighterBorderWidth;
    if (strokeWidth !== undefined) {
      s.setProperty('--sl-highlight-stroke-width', `${strokeWidth}px`);
    }

    const radius = options.highlightRadius ?? anyOpts.layout?.highlighterBorderRadius ?? anyOpts.modal?.borderRadius;
    if (radius !== undefined) {
      s.setProperty('--sl-highlight-radius', `${radius}px`);
      s.setProperty('--sl-popover-radius', `${radius}px`);
    }

    const overlayOpacity = options.overlayOpacity ?? anyOpts.layout?.overlayOpacity;
    if (overlayOpacity !== undefined) {
      s.setProperty('--sl-overlay-opacity', `${overlayOpacity}`);
    }

    if (options.overlayColor) {
      s.setProperty('--sl-overlay-color', options.overlayColor);
    }

    if (options.backdropBlur !== undefined) {
      if (typeof options.backdropBlur === 'boolean') {
        s.setProperty('--sl-backdrop-blur', options.backdropBlur ? '6px' : '0px');
      } else {
        s.setProperty('--sl-backdrop-blur', `${options.backdropBlur}px`);
      }
    }

    const zIndex = options.zIndex ?? anyOpts.layout?.zIndex;
    if (zIndex !== undefined) {
      s.setProperty('--sl-z-index', `${zIndex}`);
    }

    if (options.animationDuration !== undefined) {
      s.setProperty('--sl-transition-duration', `${options.animationDuration}ms`);
    }

    // Modal overrides
    if (anyOpts.modal?.background) {
      s.setProperty('--sl-popover-bg', anyOpts.modal.background);
    }
    if (anyOpts.modal?.text) {
      s.setProperty('--sl-popover-text', anyOpts.modal.text);
    }
    if (anyOpts.modal?.width) {
      s.setProperty('--sl-popover-width', anyOpts.modal.width);
    }

    // Button overrides
    if (anyOpts.button?.primary?.background) {
      s.setProperty('--sl-btn-primary-bg', anyOpts.button.primary.background);
    }
    if (anyOpts.button?.primary?.text) {
      s.setProperty('--sl-btn-primary-text', anyOpts.button.primary.text);
    }
    if (anyOpts.button?.secondary?.background) {
      s.setProperty('--sl-btn-secondary-bg', anyOpts.button.secondary.background);
    }
    if (anyOpts.button?.secondary?.text) {
      s.setProperty('--sl-btn-secondary-text', anyOpts.button.secondary.text);
    }
  }

  destroy(): void {
    if (this.mediaQuery && this.mediaListener) {
      if (this.mediaQuery.removeEventListener) {
        this.mediaQuery.removeEventListener('change', this.mediaListener);
      } else {
        (this.mediaQuery as any).removeListener(this.mediaListener);
      }
    }
    this.mediaListener = null;
    this.mediaQuery = null;
    this.rootElement = null;
  }
}
