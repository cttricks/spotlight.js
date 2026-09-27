export class OverlayManager {
  private container: HTMLElement | null = null;
  private svg: SVGSVGElement | null = null;
  private maskRectCutout: SVGRectElement | null = null;
  private borderRect: SVGRectElement | null = null;
  private backdropRect: SVGRectElement | null = null;
  private isVisible: boolean = false;
  private maskId: string;
  private onBackdropClick?: () => void;

  constructor(maskId: string = 'spotlight-mask-' + Math.random().toString(36).slice(2, 8)) {
    this.maskId = maskId;
  }

  mount(parent: HTMLElement, onBackdropClick?: () => void): void {
    if (this.svg) return;
    this.onBackdropClick = onBackdropClick;

    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'sl-overlay-svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('aria-hidden', 'true');

    // Defs & Mask
    const defs = document.createElementNS(ns, 'defs');
    const mask = document.createElementNS(ns, 'mask');
    mask.setAttribute('id', this.maskId);

    // Full white rect (opaque area of mask)
    const maskWhite = document.createElementNS(ns, 'rect');
    maskWhite.setAttribute('x', '0');
    maskWhite.setAttribute('y', '0');
    maskWhite.setAttribute('width', '100%');
    maskWhite.setAttribute('height', '100%');
    maskWhite.setAttribute('fill', '#ffffff');

    // Cutout rect (transparent hole in mask)
    const cutout = document.createElementNS(ns, 'rect');
    cutout.setAttribute('class', 'sl-cutout-rect');
    cutout.setAttribute('x', '0');
    cutout.setAttribute('y', '0');
    cutout.setAttribute('width', '0');
    cutout.setAttribute('height', '0');
    cutout.setAttribute('rx', '8');
    cutout.setAttribute('fill', '#000000');

    mask.appendChild(maskWhite);
    mask.appendChild(cutout);
    defs.appendChild(mask);
    svg.appendChild(defs);

    // Backdrop Rect (dark overlay with cutout applied)
    const backdrop = document.createElementNS(ns, 'rect');
    backdrop.setAttribute('class', 'sl-backdrop-rect');
    backdrop.setAttribute('x', '0');
    backdrop.setAttribute('y', '0');
    backdrop.setAttribute('width', '100%');
    backdrop.setAttribute('height', '100%');
    backdrop.setAttribute('mask', `url(#${this.maskId})`);

    // Border Rect (highlighter stroke around cutout)
    const border = document.createElementNS(ns, 'rect');
    border.setAttribute('class', 'sl-border-rect');
    border.setAttribute('x', '0');
    border.setAttribute('y', '0');
    border.setAttribute('width', '0');
    border.setAttribute('height', '0');
    border.setAttribute('rx', '8');

    svg.appendChild(backdrop);
    svg.appendChild(border);

    // Backdrop click handler
    backdrop.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.onBackdropClick) {
        this.onBackdropClick();
      }
    });

    svg.style.display = 'none';
    parent.appendChild(svg);

    this.container = parent;
    this.svg = svg;
    this.maskRectCutout = cutout;
    this.borderRect = border;
    this.backdropRect = backdrop;
  }

  show(): void {
    if (!this.svg) return;
    this.isVisible = true;
    this.svg.style.display = 'block';
    if (this.backdropRect) {
      this.backdropRect.style.pointerEvents = 'auto';
    }
    requestAnimationFrame(() => {
      this.svg?.classList.add('sl-visible');
    });
  }

  hide(): void {
    if (!this.svg) return;
    this.isVisible = false;
    this.svg.classList.remove('sl-visible');
    if (this.backdropRect) {
      this.backdropRect.style.pointerEvents = 'none';
    }
    this.svg.style.pointerEvents = 'none';
    setTimeout(() => {
      if (!this.isVisible && this.svg) {
        this.svg.style.display = 'none';
      }
    }, 320);
  }

  moveTo(rect: DOMRect, padding: number = 8, radius: number = 8, isFirst: boolean = false): void {
    if (!this.maskRectCutout || !this.borderRect || !this.svg) return;

    const x = Math.max(0, rect.left - padding);
    const y = Math.max(0, rect.top - padding);
    const width = rect.width + padding * 2;
    const height = rect.height + padding * 2;

    if (isFirst) {
      // Temporarily disable transition for the initial placement to prevent flying from (0,0)
      this.maskRectCutout.style.transition = 'none';
      this.borderRect.style.transition = 'none';
    }

    this.maskRectCutout.setAttribute('x', x.toString());
    this.maskRectCutout.setAttribute('y', y.toString());
    this.maskRectCutout.setAttribute('width', width.toString());
    this.maskRectCutout.setAttribute('height', height.toString());
    this.maskRectCutout.setAttribute('rx', radius.toString());

    this.borderRect.setAttribute('x', x.toString());
    this.borderRect.setAttribute('y', y.toString());
    this.borderRect.setAttribute('width', width.toString());
    this.borderRect.setAttribute('height', height.toString());
    this.borderRect.setAttribute('rx', radius.toString());

    if (isFirst) {
      // Force layout reflow and restore transition
      void this.maskRectCutout.getBoundingClientRect();
      this.maskRectCutout.style.transition = '';
      this.borderRect.style.transition = '';
    }

    if (!this.isVisible) {
      this.show();
    }
  }

  setHighlightColor(color: string): void {
    if (this.borderRect) {
      this.borderRect.style.stroke = color;
    }
  }

  setHighlightStrokeWidth(width: number): void {
    if (this.borderRect) {
      this.borderRect.style.strokeWidth = `${width}px`;
    }
  }

  setBorderRadius(radius: number): void {
    if (this.maskRectCutout && this.borderRect) {
      this.maskRectCutout.setAttribute('rx', radius.toString());
      this.borderRect.setAttribute('rx', radius.toString());
    }
  }

  destroy(): void {
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
    this.svg = null;
    this.maskRectCutout = null;
    this.borderRect = null;
    this.backdropRect = null;
    this.container = null;
  }
}