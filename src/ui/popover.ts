import { SpotStep, SpotlightOptions } from '../types/spotlight.types.js';
import { computePopoverPosition } from '../core/positioner.js';

const videoPattern = /\.(mp4|webm|ogg|m4v)(\?.*)?$/i;

export interface PopoverCallbacks {
  onNext: () => void;
  onPrevious: () => void;
  onExit: () => void;
  onSkip?: () => void;
}

export class PopoverManager {
  private el: HTMLElement | null = null;
  private arrowEl: HTMLElement | null = null;
  private headerEl: HTMLElement | null = null;
  private titleEl: HTMLElement | null = null;
  private closeBtn: HTMLButtonElement | null = null;
  private mediaContainer: HTMLElement | null = null;
  private summaryEl: HTMLElement | null = null;
  private progressEl: HTMLElement | null = null;
  private prevBtn: HTMLButtonElement | null = null;
  private nextBtn: HTMLButtonElement | null = null;
  private skipBtn: HTMLButtonElement | null = null;
  private callbacks: PopoverCallbacks | null = null;
  private currentStep: SpotStep | null = null;
  private options: SpotlightOptions = {};

  mount(parent: HTMLElement, options: SpotlightOptions, callbacks: PopoverCallbacks): void {
    if (this.el) return;
    this.options = options;
    this.callbacks = callbacks;

    const popover = document.createElement('div');
    popover.className = 'sl-popover';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-modal', 'true');
    popover.setAttribute('aria-labelledby', 'sl-popover-title');
    popover.setAttribute('tabindex', '-1');

    // Arrow
    const arrow = document.createElement('div');
    arrow.className = 'sl-popover-arrow';
    popover.appendChild(arrow);

    // Header
    const header = document.createElement('div');
    header.className = 'sl-popover-header';

    const title = document.createElement('h3');
    title.id = 'sl-popover-title';
    title.className = 'sl-popover-title';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'sl-popover-close-btn';
    closeBtn.setAttribute('aria-label', 'Close tour');
    closeBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;

    header.appendChild(title);
    header.appendChild(closeBtn);
    popover.appendChild(header);

    // Media Container
    const mediaContainer = document.createElement('div');
    mediaContainer.className = 'sl-popover-media';
    popover.appendChild(mediaContainer);

    // Body / Summary
    const summary = document.createElement('div');
    summary.className = 'sl-popover-summary';
    popover.appendChild(summary);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'sl-popover-footer';

    const progress = document.createElement('div');
    progress.className = 'sl-popover-progress';

    const actions = document.createElement('div');
    actions.className = 'sl-popover-actions';

    const skipBtn = document.createElement('button');
    skipBtn.className = 'sl-btn sl-btn-secondary sl-btn-skip';
    skipBtn.textContent = options.skipText || 'Skip';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'sl-btn sl-btn-secondary sl-btn-prev';
    prevBtn.textContent = options.previousText || 'Back';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'sl-btn sl-btn-primary sl-btn-next';
    nextBtn.textContent = options.nextText || 'Next';

    actions.appendChild(skipBtn);
    actions.appendChild(prevBtn);
    actions.appendChild(nextBtn);

    footer.appendChild(progress);
    footer.appendChild(actions);
    popover.appendChild(footer);

    parent.appendChild(popover);

    // Event listeners
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks?.onExit();
    });

    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.callbacks?.onSkip) {
        this.callbacks.onSkip();
      } else {
        this.callbacks?.onExit();
      }
    });

    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks?.onPrevious();
    });

    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.callbacks?.onNext();
    });

    this.el = popover;
    this.arrowEl = arrow;
    this.headerEl = header;
    this.titleEl = title;
    this.closeBtn = closeBtn;
    this.mediaContainer = mediaContainer;
    this.summaryEl = summary;
    this.progressEl = progress;
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
    this.skipBtn = skipBtn;
  }

  show(): void {
    if (!this.el) return;
    this.el.classList.add('sl-visible');
    // Set focus to the next button for keyboard accessibility
    setTimeout(() => {
      this.nextBtn?.focus();
    }, 50);
  }

  hide(): void {
    if (!this.el) return;
    this.el.classList.remove('sl-visible');
  }

  renderStep(step: SpotStep, index: number, total: number): void {
    if (!this.el || !this.titleEl || !this.summaryEl || !this.progressEl || !this.nextBtn || !this.prevBtn) {
      return;
    }
    this.currentStep = step;

    // Title
    if (step.title) {
      this.titleEl.textContent = step.title;
      this.titleEl.style.display = 'block';
    } else {
      this.titleEl.style.display = 'none';
    }

    // Summary
    if (step.summary) {
      this.summaryEl.innerHTML = step.summary;
      this.summaryEl.style.display = 'block';
    } else {
      this.summaryEl.style.display = 'none';
    }

    // Media
    this.renderMedia(step.media);

    // Progress
    if (this.options.showProgress !== false) {
      this.progressEl.textContent = `${index + 1} of ${total}`;
      this.progressEl.style.display = 'block';
    } else {
      this.progressEl.style.display = 'none';
    }

    // Buttons
    const isFirst = index === 0;
    const isLast = index === total - 1;

    // Previous Button
    if (isFirst) {
      this.prevBtn.style.display = 'none';
    } else {
      this.prevBtn.style.display = 'inline-flex';
      this.prevBtn.textContent = this.options.previousText || 'Back';
    }

    // Next / Finish Button
    if (isLast) {
      this.nextBtn.textContent = this.options.doneText || 'Finish';
      this.nextBtn.classList.add('sl-btn-done');
    } else {
      this.nextBtn.textContent = this.options.nextText || 'Next';
      this.nextBtn.classList.remove('sl-btn-done');
    }

    // Skip button visibility
    if (this.skipBtn) {
      this.skipBtn.style.display = isLast ? 'none' : 'inline-flex';
    }
  }

  private renderMedia(mediaUrl?: string): void {
    if (!this.mediaContainer) return;
    this.mediaContainer.innerHTML = '';

    if (!mediaUrl || mediaUrl.trim() === '') {
      this.mediaContainer.style.display = 'none';
      return;
    }

    this.mediaContainer.style.display = 'block';

    if (videoPattern.test(mediaUrl)) {
      const video = document.createElement('video');
      video.className = 'sl-popover-media-video';
      video.src = mediaUrl;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('controlsList', 'nodownload');

      video.addEventListener('loadeddata', () => {
        // Recompute position after video metadata load to prevent layout shifts
        if (this.currentStep?.element) {
          this.positionAt(this.currentStep.element.getBoundingClientRect(), this.currentStep.position);
        }
      });

      this.mediaContainer.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.className = 'sl-popover-media-img';
      img.src = mediaUrl;
      img.alt = this.currentStep?.title || 'Spotlight Step Preview';
      img.loading = 'lazy';

      img.addEventListener('load', () => {
        // Recompute position after image load to prevent layout shifts
        if (this.currentStep?.element) {
          this.positionAt(this.currentStep.element.getBoundingClientRect(), this.currentStep.position);
        }
      });

      this.mediaContainer.appendChild(img);
    }
  }

  positionAt(targetRect: DOMRect, preferredPosition: any = 'auto'): void {
    if (!this.el) return;

    // Make popover temporarily visible to measure dimensions if hidden
    const wasHidden = !this.el.classList.contains('sl-visible');
    if (wasHidden) {
      this.el.style.visibility = 'hidden';
      this.el.style.display = 'block';
    }

    const popoverRect = this.el.getBoundingClientRect();
    const result = computePopoverPosition(
      targetRect,
      popoverRect.width || 320,
      popoverRect.height || 180,
      preferredPosition || 'auto'
    );

    this.el.style.top = `${result.top}px`;
    this.el.style.left = `${result.left}px`;
    this.el.setAttribute('data-placement', result.placement);

    if (this.arrowEl) {
      if (result.placement === 'top' || result.placement === 'bottom') {
        this.arrowEl.style.left = `${result.arrowOffsetPx}px`;
        this.arrowEl.style.top = '';
      } else {
        this.arrowEl.style.top = `${result.arrowOffsetPx}px`;
        this.arrowEl.style.left = '';
      }
    }

    if (wasHidden) {
      this.el.style.visibility = '';
      this.el.style.display = '';
    }
  }

  destroy(): void {
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this.el = null;
    this.arrowEl = null;
    this.headerEl = null;
    this.titleEl = null;
    this.closeBtn = null;
    this.mediaContainer = null;
    this.summaryEl = null;
    this.progressEl = null;
    this.prevBtn = null;
    this.nextBtn = null;
    this.skipBtn = null;
    this.callbacks = null;
    this.currentStep = null;
  }
}