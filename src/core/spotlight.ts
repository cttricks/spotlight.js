import {
  SpotStep,
  SpotlightOptions,
  SpotlightControls,
  SpotlightTheme,
  SpotlightEventMap
} from '../types/spotlight.types.js';
import { EventEmitter } from './events.js';
import { scanElements } from './scanner.js';
import { ThemeManager } from '../ui/theme.js';
import { OverlayManager } from '../ui/overlay.js';
import { PopoverManager } from '../ui/popover.js';

export class Spotlight implements SpotlightControls {
  private options: SpotlightOptions;
  private steps: SpotStep[] = [];
  private currentIndex: number = 0;
  private isActive: boolean = false;
  private isHighlightOnly: boolean = false;

  private events: EventEmitter = new EventEmitter();
  private themeManager: ThemeManager;
  private overlayManager: OverlayManager;
  private popoverManager: PopoverManager;

  private rootEl: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private keyListener: ((e: KeyboardEvent) => void) | null = null;
  private scrollResizeHandler: (() => void) | null = null;
  private documentClickHandler: ((e: MouseEvent) => void) | null = null;
  private rafId: number | null = null;

  constructor(options: SpotlightOptions = {}) {
    this.options = {
      theme: 'auto',
      autoScan: true,
      highlightColor: '#6366f1',
      highlightStrokeWidth: 3,
      highlightRadius: 8,
      highlightPadding: 8,
      overlayColor: 'rgba(15, 23, 42, 0.65)',
      overlayOpacity: 1,
      backdropBlur: 4,
      zIndex: 99999,
      animationDuration: 320,
      confirmOnExit: false,
      exitOnBackdropClick: true,
      keyboardNavigation: true,
      showProgress: true,
      nextText: 'Next',
      previousText: 'Back',
      doneText: 'Finish',
      skipText: 'Skip',
      ...options
    };

    this.themeManager = new ThemeManager(this.options.theme as SpotlightTheme);
    this.overlayManager = new OverlayManager();
    this.popoverManager = new PopoverManager();

    if (typeof window !== 'undefined') {
      if (this.options.autoScan !== false) {
        this.updateSpots();
      }

      this.documentClickHandler = (e: MouseEvent) => {
        const target = (e.target as HTMLElement)?.closest(
          '[type^="spotlight-button"], [data-spotlight-start], [data-spotlight-stop], [data-spotlight-next], [data-spotlight-previous]'
        ) as HTMLElement | null;
        if (!target) return;

        const typeAttr = target.getAttribute('type') || '';
        if (target.hasAttribute('data-spotlight-start') || typeAttr === 'spotlight-button:start') {
          e.preventDefault();
          this.start();
        } else if (
          target.hasAttribute('data-spotlight-stop') ||
          typeAttr === 'spotlight-button:stop' ||
          typeAttr === 'spotlight-button:done'
        ) {
          e.preventDefault();
          this.end('button');
        } else if (target.hasAttribute('data-spotlight-next') || typeAttr === 'spotlight-button:next') {
          e.preventDefault();
          this.next();
        } else if (target.hasAttribute('data-spotlight-previous') || typeAttr === 'spotlight-button:previous') {
          e.preventDefault();
          this.previous();
        }
      };
      document.addEventListener('click', this.documentClickHandler);
    }
  }

  private mount(): void {
    if (typeof window === 'undefined' || this.rootEl) return;

    // Root wrapper
    const root = document.createElement('div');
    root.className = 'sl-spotlight-root';
    document.body.appendChild(root);
    this.rootEl = root;

    // Initialize Theme
    this.themeManager.init(root, this.options);

    // Mount Overlay
    this.overlayManager.mount(root, () => {
      if (this.options.exitOnBackdropClick !== false) {
        this.end('backdrop');
      }
    });

    // Mount Popover
    this.popoverManager.mount(root, this.options, {
      onNext: () => this.next(),
      onPrevious: () => this.previous(),
      onExit: () => this.end('button'),
      onSkip: () => this.end('button')
    });

    // Keyboard navigation
    if (this.options.keyboardNavigation !== false) {
      this.keyListener = (e: KeyboardEvent) => {
        if (!this.isActive) return;

        if (e.key === 'Escape') {
          e.preventDefault();
          this.end('esc' as any);
        } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
          e.preventDefault();
          this.next();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.previous();
        }
      };
      window.addEventListener('keydown', this.keyListener);
    }

    // Window resize & scroll sync with requestAnimationFrame throttle
    this.scrollResizeHandler = () => {
      if (!this.isActive || !this.getCurrentStep()?.element) return;
      if (this.rafId !== null) cancelAnimationFrame(this.rafId);
      this.rafId = requestAnimationFrame(() => {
        this.repositionCurrentStep();
      });
    };

    window.addEventListener('resize', this.scrollResizeHandler, { passive: true });
    window.addEventListener('scroll', this.scrollResizeHandler, { passive: true });

    // ResizeObserver on the target element
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.isActive) {
          this.scrollResizeHandler?.();
        }
      });
    }
  }

  async updateSpots(): Promise<void> {
    if (typeof window === 'undefined') return;

    this.steps = scanElements(document, {
      group: this.options.group,
      programmaticSteps: this.options.steps
    });

    this.events.emit('spots-updated', { total: this.steps.length });
  }

  async start(options: { from?: number | string; highlightOnly?: boolean } = {}): Promise<void> {
    if (typeof window === 'undefined') return;

    this.mount();
    await this.updateSpots();

    if (this.steps.length === 0) {
      if (this.options.devMode) {
        console.warn('[Spotlight.js] No spotlight elements found. Ensure elements have data-spot-* attributes or pass steps in options.');
      }
      return;
    }

    this.isHighlightOnly = options.highlightOnly ?? false;

    // Resolve starting index
    if (options.from !== undefined) {
      if (typeof options.from === 'number') {
        this.currentIndex = Math.max(0, Math.min(options.from, this.steps.length - 1));
      } else {
        const found = this.steps.findIndex((s) => s.id === options.from);
        this.currentIndex = found !== -1 ? found : 0;
      }
    } else {
      this.currentIndex = 0;
    }

    this.isActive = true;
    const step = this.steps[this.currentIndex];

    this.renderCurrentStep(true);

    this.events.emit('start', { step, total: this.steps.length });
    this.events.emit('change', {
      step,
      index: this.currentIndex,
      total: this.steps.length,
      previousIndex: null
    });

    this.options.onStart?.({ step, total: this.steps.length });
    this.options.onChange?.({
      step,
      index: this.currentIndex,
      total: this.steps.length,
      previousIndex: null
    });
  }

  async next(): Promise<void> {
    if (!this.isActive) return;

    const previousIndex = this.currentIndex;
    const nextIndex = this.currentIndex + 1;

    if (nextIndex >= this.steps.length) {
      this.end('button');
      this.events.emit('complete', undefined);
      this.options.onComplete?.();
      return;
    }

    this.currentIndex = nextIndex;
    const step = this.steps[this.currentIndex];

    this.renderCurrentStep(false);

    this.events.emit('next', { step, index: this.currentIndex, total: this.steps.length });
    this.events.emit('change', {
      step,
      index: this.currentIndex,
      total: this.steps.length,
      previousIndex
    });

    this.options.onNext?.({ step, index: this.currentIndex, total: this.steps.length });
    this.options.onChange?.({
      step,
      index: this.currentIndex,
      total: this.steps.length,
      previousIndex
    });
  }

  async previous(): Promise<void> {
    if (!this.isActive) return;

    if (this.currentIndex <= 0) return;

    const previousIndex = this.currentIndex;
    this.currentIndex--;
    const step = this.steps[this.currentIndex];

    this.renderCurrentStep(false);

    this.events.emit('previous', { step, index: this.currentIndex, total: this.steps.length });
    this.events.emit('change', {
      step,
      index: this.currentIndex,
      total: this.steps.length,
      previousIndex
    });

    this.options.onPrevious?.({ step, index: this.currentIndex, total: this.steps.length });
    this.options.onChange?.({
      step,
      index: this.currentIndex,
      total: this.steps.length,
      previousIndex
    });
  }

  async goTo(step: number | string): Promise<void> {
    if (!this.isActive) return;

    let targetIndex = -1;
    if (typeof step === 'number') {
      targetIndex = step;
    } else {
      targetIndex = this.steps.findIndex((s) => s.id === step);
    }

    if (targetIndex >= 0 && targetIndex < this.steps.length && targetIndex !== this.currentIndex) {
      const previousIndex = this.currentIndex;
      this.currentIndex = targetIndex;
      const currentStep = this.steps[this.currentIndex];

      this.renderCurrentStep(false);

      this.events.emit('change', {
        step: currentStep,
        index: this.currentIndex,
        total: this.steps.length,
        previousIndex
      });

      this.options.onChange?.({
        step: currentStep,
        index: this.currentIndex,
        total: this.steps.length,
        previousIndex
      });
    }
  }

  end(reason: 'button' | 'api' | 'backdrop' | 'esc' = 'api'): void {
    if (!this.isActive) return;

    if (this.options.confirmOnExit && reason !== 'button') {
      const msg = this.options.confirmExitMessage || 'Are you sure you want to exit the tour?';
      if (!window.confirm(msg)) {
        return;
      }
    }

    const currentStep = this.getCurrentStep();
    const index = this.currentIndex;

    this.isActive = false;
    this.overlayManager.hide();
    this.popoverManager.hide();

    // Disconnect ResizeObserver
    this.resizeObserver?.disconnect();

    this.events.emit('exit', {
      reason: reason as any,
      step: currentStep,
      index
    });

    this.options.onExit?.({
      reason: reason as any,
      step: currentStep,
      index
    });
  }

  stop(): void {
    this.end('api');
  }

  private getCurrentStep(): SpotStep | null {
    return this.steps[this.currentIndex] || null;
  }

  private renderCurrentStep(isFirst: boolean = false): void {
    const step = this.getCurrentStep();
    if (!step || !step.element) return;

    // Observe element for size reflows
    this.resizeObserver?.disconnect();
    this.resizeObserver?.observe(step.element);

    // Smooth scroll into viewport if needed
    this.scrollIntoView(step.element, () => {
      if (!this.isActive) return;

      const rect = step.element!.getBoundingClientRect();
      const padding = step.padding ?? this.options.highlightPadding ?? 8;
      const radius = step.radius ?? this.options.highlightRadius ?? 8;

      // Smoothly morph cutout overlay
      this.overlayManager.moveTo(rect, padding, radius, isFirst);

      // Render and position Popover
      if (!this.isHighlightOnly) {
        this.popoverManager.renderStep(step, this.currentIndex, this.steps.length);
        this.popoverManager.positionAt(rect, step.position);
        this.popoverManager.show();
      } else {
        this.popoverManager.hide();
      }
    });
  }

  private repositionCurrentStep(): void {
    const step = this.getCurrentStep();
    if (!step || !step.element) return;

    const rect = step.element.getBoundingClientRect();
    const padding = step.padding ?? this.options.highlightPadding ?? 8;
    const radius = step.radius ?? this.options.highlightRadius ?? 8;

    this.overlayManager.moveTo(rect, padding, radius, false);

    if (!this.isHighlightOnly) {
      this.popoverManager.positionAt(rect, step.position);
    }
  }

  private scrollIntoView(element: HTMLElement, callback: () => void): void {
    const rect = element.getBoundingClientRect();
    const isInViewport =
      rect.top >= 50 &&
      rect.bottom <= window.innerHeight - 50 &&
      rect.left >= 20 &&
      rect.right <= window.innerWidth - 20;

    if (isInViewport) {
      callback();
      return;
    }

    try {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    } catch {
      // Fallback
      element.scrollIntoView(true);
    }

    // Wait briefly for smooth scroll completion before latching coordinates
    setTimeout(() => {
      callback();
    }, 280);
  }

  setTheme(theme: SpotlightTheme | string): void {
    this.options.theme = theme;
    this.themeManager.setTheme(theme);
  }

  on<K extends keyof SpotlightEventMap>(event: K, callback: (data: SpotlightEventMap[K]) => void): () => void {
    return this.events.on(event, callback);
  }

  off<K extends keyof SpotlightEventMap>(event: K, callback: (data: SpotlightEventMap[K]) => void): void {
    this.events.off(event, callback);
  }

  addEventListener(eventName: string, callback: (data: any) => void): void {
    this.on(eventName as any, callback);
  }

  getState(): {
    isActive: boolean;
    currentIndex: number;
    totalSteps: number;
    currentStep: SpotStep | null;
  } {
    return {
      isActive: this.isActive,
      currentIndex: this.currentIndex,
      totalSteps: this.steps.length,
      currentStep: this.getCurrentStep()
    };
  }

  setHighlightColor(color: string): void {
    this.options.highlightColor = color;
    this.overlayManager.setHighlightColor(color);
    this.themeManager.applyCustomVariables({ highlightColor: color });
  }

  setHighlightStrokeWidth(width: number): void {
    this.options.highlightStrokeWidth = width;
    this.overlayManager.setHighlightStrokeWidth(width);
    this.themeManager.applyCustomVariables({ highlightStrokeWidth: width });
  }

  setBorderRadius(radius: number): void {
    this.options.highlightRadius = radius;
    this.overlayManager.setBorderRadius(radius);
    this.themeManager.applyCustomVariables({ highlightRadius: radius });
  }

  applyOptions(options: Partial<SpotlightOptions>): void {
    this.options = { ...this.options, ...options };
    if (this.rootEl) {
      this.themeManager.applyCustomVariables(this.options);
      if (options.theme) {
        this.setTheme(options.theme);
      }
    }
  }

  destroy(): void {
    this.end('api');

    if (this.documentClickHandler) {
      document.removeEventListener('click', this.documentClickHandler);
      this.documentClickHandler = null;
    }

    if (this.keyListener) {
      window.removeEventListener('keydown', this.keyListener);
      this.keyListener = null;
    }
    if (this.scrollResizeHandler) {
      window.removeEventListener('resize', this.scrollResizeHandler);
      window.removeEventListener('scroll', this.scrollResizeHandler);
      this.scrollResizeHandler = null;
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    this.overlayManager.destroy();
    this.popoverManager.destroy();
    this.themeManager.destroy();

    if (this.rootEl && this.rootEl.parentNode) {
      this.rootEl.parentNode.removeChild(this.rootEl);
      this.rootEl = null;
    }

    this.events.clear();
    this.steps = [];
  }
}

/**
 * Main Spotlight factory function.
 * @param options SpotlightOptions
 * @returns Promise<SpotlightControls>
 */
export async function spotlight(options: SpotlightOptions = {}): Promise<SpotlightControls> {
  const instance = new Spotlight(options);
  return instance;
}