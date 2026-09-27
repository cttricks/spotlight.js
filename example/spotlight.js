// src/core/events.ts
var EventEmitter = class {
  listeners = /* @__PURE__ */ new Map();
  on(event, handler) {
    const key = event;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, /* @__PURE__ */ new Set());
    }
    const set = this.listeners.get(key);
    set.add(handler);
    return () => this.off(event, handler);
  }
  off(event, handler) {
    const key = event;
    const set = this.listeners.get(key);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) {
      this.listeners.delete(key);
    }
  }
  emit(event, data) {
    const key = event;
    const set = this.listeners.get(key);
    if (!set || set.size === 0) return;
    set.forEach((handler) => {
      try {
        handler(data);
      } catch (err) {
        console.error(`[Spotlight.js] Error in event listener for "${key}":`, err);
      }
    });
  }
  clear() {
    this.listeners.clear();
  }
};

// src/core/scanner.ts
var imagePattern = /\.(jpeg|jpg|gif|png|svg|bmp|webp)$/i;
function parseLegacyComment(node) {
  if (!node.nodeValue) return null;
  const content = node.nodeValue.replace(/;/g, "\n");
  const lines = content.split("\n").map((s) => s.replace(/\s{2,}/g, " ").trim()).filter((s) => s.length > 1);
  if (lines.length === 0 || !lines[0].toUpperCase().startsWith("SPOTLIGHT")) {
    return null;
  }
  let targetEl = node.nextSibling;
  while (targetEl && targetEl.nodeType !== Node.ELEMENT_NODE) {
    targetEl = targetEl.nextSibling;
  }
  if (!targetEl || !(targetEl instanceof HTMLElement)) return null;
  let index = 9999;
  if (lines[0].includes("#")) {
    const parsed = parseInt(lines[0].split("#")[1], 10);
    if (!isNaN(parsed)) index = parsed;
  }
  lines.shift();
  let media = "";
  if (lines.length > 0 && imagePattern.test(lines[0])) {
    media = lines.shift() || "";
  }
  let title = "";
  if (lines.length > 0) {
    title = lines.shift() || "";
  }
  let summary = "";
  if (lines.length > 0) {
    summary = lines.join(" ");
  }
  if (!summary && title) {
    summary = title;
    title = "";
  }
  return {
    id: index,
    order: index,
    title,
    summary,
    media,
    element: targetEl,
    target: targetEl
  };
}
function scanElements(root = document, options = {}) {
  if (typeof window === "undefined" || !root) return [];
  const targetGroup = options.group || "default";
  const declarativeSteps = [];
  const elements = root.querySelectorAll(
    "[data-spot-name], [data-spot-summary], [data-spot-id], [data-spot-title], [data-spot-desc]"
  );
  elements.forEach((el, domIndex) => {
    const group = el.getAttribute("data-spot-group") || "default";
    if (group !== targetGroup && targetGroup !== "*") return;
    const idAttr = el.getAttribute("data-spot-id");
    const name = el.getAttribute("data-spot-name") || el.getAttribute("data-spot-title") || "";
    const summary = el.getAttribute("data-spot-summary") || el.getAttribute("data-spot-desc") || "";
    const media = el.getAttribute("data-spot-media") || void 0;
    const position = el.getAttribute("data-spot-position") || "auto";
    const paddingAttr = el.getAttribute("data-spot-padding");
    const radiusAttr = el.getAttribute("data-spot-radius");
    const orderAttr = el.getAttribute("data-spot-order");
    let numericOrder;
    if (orderAttr !== null && !isNaN(Number(orderAttr))) {
      numericOrder = Number(orderAttr);
    } else if (idAttr !== null && !isNaN(Number(idAttr))) {
      numericOrder = Number(idAttr);
    }
    const padding = paddingAttr !== null && !isNaN(Number(paddingAttr)) ? Number(paddingAttr) : void 0;
    const radius = radiusAttr !== null && !isNaN(Number(radiusAttr)) ? Number(radiusAttr) : void 0;
    declarativeSteps.push({
      id: idAttr || `spot-${domIndex + 1}`,
      title: name,
      summary,
      media,
      position,
      padding,
      radius,
      group,
      order: numericOrder !== void 0 ? numericOrder : 1e3 + domIndex,
      element: el,
      target: el
    });
  });
  if (options.includeLegacyComments !== false && typeof document !== "undefined") {
    const iterator = document.createNodeIterator(
      root instanceof Document ? root.body : root,
      NodeFilter.SHOW_COMMENT,
      null
    );
    let currentNode;
    while ((currentNode = iterator.nextNode()) !== null) {
      const legacyStep = parseLegacyComment(currentNode);
      if (legacyStep && legacyStep.element) {
        const alreadyExists = declarativeSteps.some((s) => s.element === legacyStep.element);
        if (!alreadyExists) {
          declarativeSteps.push(legacyStep);
        }
      }
    }
  }
  const programmatic = [];
  if (options.programmaticSteps && Array.isArray(options.programmaticSteps)) {
    options.programmaticSteps.forEach((step, idx) => {
      let resolvedElement = null;
      if (step.element instanceof HTMLElement) {
        resolvedElement = step.element;
      } else if (typeof step.target === "string") {
        resolvedElement = document.querySelector(step.target);
      } else if (step.target instanceof HTMLElement) {
        resolvedElement = step.target;
      }
      if (resolvedElement) {
        programmatic.push({
          ...step,
          id: step.id ?? `prog-step-${idx + 1}`,
          order: step.order ?? (typeof step.id === "number" ? step.id : idx + 1),
          element: resolvedElement,
          target: resolvedElement
        });
      }
    });
  }
  const merged = [...declarativeSteps];
  for (const prog of programmatic) {
    const existingIndex = merged.findIndex(
      (s) => s.element === prog.element || prog.id && s.id === prog.id
    );
    if (existingIndex !== -1) {
      merged[existingIndex] = { ...merged[existingIndex], ...prog };
    } else {
      merged.push(prog);
    }
  }
  const visible = merged.filter((step) => {
    if (!step.element || !step.element.isConnected) return false;
    const rect = step.element.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 || step.element.getClientRects().length > 0;
  });
  visible.sort((a, b) => {
    const orderA = a.order ?? 9999;
    const orderB = b.order ?? 9999;
    return orderA - orderB;
  });
  return visible.map((step, idx) => ({ ...step, index: idx }));
}

// src/ui/theme.ts
var ThemeManager = class {
  currentTheme = "auto";
  mediaQuery = null;
  mediaListener = null;
  rootElement = null;
  constructor(theme = "auto") {
    this.currentTheme = theme;
  }
  init(rootElement, options) {
    this.rootElement = rootElement;
    this.applyTheme(this.currentTheme);
    this.applyCustomVariables(options);
    if (typeof window !== "undefined" && window.matchMedia) {
      this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      this.mediaListener = (e) => {
        if (this.currentTheme === "auto") {
          this.resolveAutoTheme(e.matches);
        }
      };
      if (this.mediaQuery.addEventListener) {
        this.mediaQuery.addEventListener("change", this.mediaListener);
      } else {
        this.mediaQuery.addListener(this.mediaListener);
      }
    }
  }
  setTheme(theme) {
    this.currentTheme = theme || "auto";
    this.applyTheme(this.currentTheme);
  }
  getResolvedTheme() {
    if (this.currentTheme === "light" || this.currentTheme === "dark") {
      return this.currentTheme;
    }
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  }
  applyTheme(theme) {
    if (!this.rootElement) return;
    if (theme === "auto") {
      const isDark = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)").matches : false;
      this.resolveAutoTheme(isDark);
    } else {
      this.rootElement.setAttribute("data-spotlight-theme", theme);
    }
  }
  resolveAutoTheme(isDark) {
    if (!this.rootElement) return;
    this.rootElement.setAttribute("data-spotlight-theme", isDark ? "dark" : "light");
  }
  applyCustomVariables(options) {
    if (!this.rootElement) return;
    const s = this.rootElement.style;
    const anyOpts = options;
    const highlight = options.highlightColor || anyOpts.layout?.highlightColor;
    if (highlight) {
      s.setProperty("--sl-highlight-stroke", highlight);
      s.setProperty("--sl-accent", highlight);
    }
    const strokeWidth = options.highlightStrokeWidth ?? anyOpts.layout?.highlighterBorderWidth;
    if (strokeWidth !== void 0) {
      s.setProperty("--sl-highlight-stroke-width", `${strokeWidth}px`);
    }
    const radius = options.highlightRadius ?? anyOpts.layout?.highlighterBorderRadius ?? anyOpts.modal?.borderRadius;
    if (radius !== void 0) {
      s.setProperty("--sl-highlight-radius", `${radius}px`);
      s.setProperty("--sl-popover-radius", `${radius}px`);
    }
    const overlayOpacity = options.overlayOpacity ?? anyOpts.layout?.overlayOpacity;
    if (overlayOpacity !== void 0) {
      s.setProperty("--sl-overlay-opacity", `${overlayOpacity}`);
    }
    if (options.overlayColor) {
      s.setProperty("--sl-overlay-color", options.overlayColor);
    }
    if (options.backdropBlur !== void 0) {
      if (typeof options.backdropBlur === "boolean") {
        s.setProperty("--sl-backdrop-blur", options.backdropBlur ? "6px" : "0px");
      } else {
        s.setProperty("--sl-backdrop-blur", `${options.backdropBlur}px`);
      }
    }
    const zIndex = options.zIndex ?? anyOpts.layout?.zIndex;
    if (zIndex !== void 0) {
      s.setProperty("--sl-z-index", `${zIndex}`);
    }
    if (options.animationDuration !== void 0) {
      s.setProperty("--sl-transition-duration", `${options.animationDuration}ms`);
    }
    if (anyOpts.modal?.background) {
      s.setProperty("--sl-popover-bg", anyOpts.modal.background);
    }
    if (anyOpts.modal?.text) {
      s.setProperty("--sl-popover-text", anyOpts.modal.text);
    }
    if (anyOpts.modal?.width) {
      s.setProperty("--sl-popover-width", anyOpts.modal.width);
    }
    if (anyOpts.button?.primary?.background) {
      s.setProperty("--sl-btn-primary-bg", anyOpts.button.primary.background);
    }
    if (anyOpts.button?.primary?.text) {
      s.setProperty("--sl-btn-primary-text", anyOpts.button.primary.text);
    }
    if (anyOpts.button?.secondary?.background) {
      s.setProperty("--sl-btn-secondary-bg", anyOpts.button.secondary.background);
    }
    if (anyOpts.button?.secondary?.text) {
      s.setProperty("--sl-btn-secondary-text", anyOpts.button.secondary.text);
    }
  }
  destroy() {
    if (this.mediaQuery && this.mediaListener) {
      if (this.mediaQuery.removeEventListener) {
        this.mediaQuery.removeEventListener("change", this.mediaListener);
      } else {
        this.mediaQuery.removeListener(this.mediaListener);
      }
    }
    this.mediaListener = null;
    this.mediaQuery = null;
    this.rootElement = null;
  }
};

// src/ui/overlay.ts
var OverlayManager = class {
  container = null;
  svg = null;
  maskRectCutout = null;
  borderRect = null;
  backdropRect = null;
  isVisible = false;
  maskId;
  onBackdropClick;
  constructor(maskId = "spotlight-mask-" + Math.random().toString(36).slice(2, 8)) {
    this.maskId = maskId;
  }
  mount(parent, onBackdropClick) {
    if (this.svg) return;
    this.onBackdropClick = onBackdropClick;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "sl-overlay-svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("aria-hidden", "true");
    const defs = document.createElementNS(ns, "defs");
    const mask = document.createElementNS(ns, "mask");
    mask.setAttribute("id", this.maskId);
    const maskWhite = document.createElementNS(ns, "rect");
    maskWhite.setAttribute("x", "0");
    maskWhite.setAttribute("y", "0");
    maskWhite.setAttribute("width", "100%");
    maskWhite.setAttribute("height", "100%");
    maskWhite.setAttribute("fill", "#ffffff");
    const cutout = document.createElementNS(ns, "rect");
    cutout.setAttribute("class", "sl-cutout-rect");
    cutout.setAttribute("x", "0");
    cutout.setAttribute("y", "0");
    cutout.setAttribute("width", "0");
    cutout.setAttribute("height", "0");
    cutout.setAttribute("rx", "8");
    cutout.setAttribute("fill", "#000000");
    mask.appendChild(maskWhite);
    mask.appendChild(cutout);
    defs.appendChild(mask);
    svg.appendChild(defs);
    const backdrop = document.createElementNS(ns, "rect");
    backdrop.setAttribute("class", "sl-backdrop-rect");
    backdrop.setAttribute("x", "0");
    backdrop.setAttribute("y", "0");
    backdrop.setAttribute("width", "100%");
    backdrop.setAttribute("height", "100%");
    backdrop.setAttribute("mask", `url(#${this.maskId})`);
    const border = document.createElementNS(ns, "rect");
    border.setAttribute("class", "sl-border-rect");
    border.setAttribute("x", "0");
    border.setAttribute("y", "0");
    border.setAttribute("width", "0");
    border.setAttribute("height", "0");
    border.setAttribute("rx", "8");
    svg.appendChild(backdrop);
    svg.appendChild(border);
    backdrop.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.onBackdropClick) {
        this.onBackdropClick();
      }
    });
    parent.appendChild(svg);
    this.container = parent;
    this.svg = svg;
    this.maskRectCutout = cutout;
    this.borderRect = border;
    this.backdropRect = backdrop;
  }
  show() {
    if (!this.svg) return;
    this.isVisible = true;
    this.svg.classList.add("sl-visible");
  }
  hide() {
    if (!this.svg) return;
    this.isVisible = false;
    this.svg.classList.remove("sl-visible");
  }
  moveTo(rect, padding = 8, radius = 8, isFirst = false) {
    if (!this.maskRectCutout || !this.borderRect || !this.svg) return;
    const x = Math.max(0, rect.left - padding);
    const y = Math.max(0, rect.top - padding);
    const width = rect.width + padding * 2;
    const height = rect.height + padding * 2;
    if (isFirst) {
      this.maskRectCutout.style.transition = "none";
      this.borderRect.style.transition = "none";
    }
    this.maskRectCutout.setAttribute("x", x.toString());
    this.maskRectCutout.setAttribute("y", y.toString());
    this.maskRectCutout.setAttribute("width", width.toString());
    this.maskRectCutout.setAttribute("height", height.toString());
    this.maskRectCutout.setAttribute("rx", radius.toString());
    this.borderRect.setAttribute("x", x.toString());
    this.borderRect.setAttribute("y", y.toString());
    this.borderRect.setAttribute("width", width.toString());
    this.borderRect.setAttribute("height", height.toString());
    this.borderRect.setAttribute("rx", radius.toString());
    if (isFirst) {
      void this.maskRectCutout.getBoundingClientRect();
      this.maskRectCutout.style.transition = "";
      this.borderRect.style.transition = "";
    }
    if (!this.isVisible) {
      this.show();
    }
  }
  setHighlightColor(color) {
    if (this.borderRect) {
      this.borderRect.style.stroke = color;
    }
  }
  setHighlightStrokeWidth(width) {
    if (this.borderRect) {
      this.borderRect.style.strokeWidth = `${width}px`;
    }
  }
  setBorderRadius(radius) {
    if (this.maskRectCutout && this.borderRect) {
      this.maskRectCutout.setAttribute("rx", radius.toString());
      this.borderRect.setAttribute("rx", radius.toString());
    }
  }
  destroy() {
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
    this.svg = null;
    this.maskRectCutout = null;
    this.borderRect = null;
    this.backdropRect = null;
    this.container = null;
  }
};

// src/core/positioner.ts
function computePopoverPosition(targetRect, popoverWidth, popoverHeight, preferredPosition = "auto", offset = 14, viewportMargin = 16) {
  const vWidth = window.innerWidth;
  const vHeight = window.innerHeight;
  const spaceAbove = targetRect.top - offset - viewportMargin;
  const spaceBelow = vHeight - targetRect.bottom - offset - viewportMargin;
  const spaceLeft = targetRect.left - offset - viewportMargin;
  const spaceRight = vWidth - targetRect.right - offset - viewportMargin;
  let placement;
  if (preferredPosition !== "auto") {
    if (preferredPosition === "bottom" && spaceBelow >= popoverHeight) {
      placement = "bottom";
    } else if (preferredPosition === "top" && spaceAbove >= popoverHeight) {
      placement = "top";
    } else if (preferredPosition === "right" && spaceRight >= popoverWidth) {
      placement = "right";
    } else if (preferredPosition === "left" && spaceLeft >= popoverWidth) {
      placement = "left";
    } else {
      const verticalFits = spaceBelow >= popoverHeight || spaceAbove >= popoverHeight;
      if (verticalFits) {
        placement = spaceBelow >= spaceAbove ? "bottom" : "top";
      } else {
        placement = spaceRight >= spaceLeft ? "right" : "left";
      }
    }
  } else {
    if (spaceBelow >= popoverHeight) {
      placement = "bottom";
    } else if (spaceAbove >= popoverHeight) {
      placement = "top";
    } else if (spaceRight >= popoverWidth) {
      placement = "right";
    } else if (spaceLeft >= popoverWidth) {
      placement = "left";
    } else {
      placement = spaceBelow >= spaceAbove ? "bottom" : "top";
    }
  }
  let top = 0;
  let left = 0;
  if (placement === "bottom") {
    top = targetRect.bottom + offset;
    left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
  } else if (placement === "top") {
    top = targetRect.top - offset - popoverHeight;
    left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
  } else if (placement === "right") {
    left = targetRect.right + offset;
    top = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
  } else {
    left = targetRect.left - offset - popoverWidth;
    top = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
  }
  const maxLeft = vWidth - popoverWidth - viewportMargin;
  const minLeft = viewportMargin;
  left = Math.max(minLeft, Math.min(left, maxLeft));
  const maxTop = vHeight - popoverHeight - viewportMargin;
  const minTop = viewportMargin;
  top = Math.max(minTop, Math.min(top, maxTop));
  let arrowOffsetPx = 0;
  let arrowOffsetPercent = 50;
  if (placement === "top" || placement === "bottom") {
    const targetCenterX = targetRect.left + targetRect.width / 2;
    arrowOffsetPx = targetCenterX - left;
    arrowOffsetPx = Math.max(20, Math.min(arrowOffsetPx, popoverWidth - 20));
    arrowOffsetPercent = arrowOffsetPx / popoverWidth * 100;
  } else {
    const targetCenterY = targetRect.top + targetRect.height / 2;
    arrowOffsetPx = targetCenterY - top;
    arrowOffsetPx = Math.max(20, Math.min(arrowOffsetPx, popoverHeight - 20));
    arrowOffsetPercent = arrowOffsetPx / popoverHeight * 100;
  }
  return {
    top,
    left,
    placement,
    arrowOffsetPercent,
    arrowOffsetPx
  };
}

// src/ui/popover.ts
var videoPattern = /\.(mp4|webm|ogg|m4v)(\?.*)?$/i;
var PopoverManager = class {
  el = null;
  arrowEl = null;
  headerEl = null;
  titleEl = null;
  closeBtn = null;
  mediaContainer = null;
  summaryEl = null;
  progressEl = null;
  prevBtn = null;
  nextBtn = null;
  skipBtn = null;
  callbacks = null;
  currentStep = null;
  options = {};
  mount(parent, options, callbacks) {
    if (this.el) return;
    this.options = options;
    this.callbacks = callbacks;
    const popover = document.createElement("div");
    popover.className = "sl-popover";
    popover.setAttribute("role", "dialog");
    popover.setAttribute("aria-modal", "true");
    popover.setAttribute("aria-labelledby", "sl-popover-title");
    popover.setAttribute("tabindex", "-1");
    const arrow = document.createElement("div");
    arrow.className = "sl-popover-arrow";
    popover.appendChild(arrow);
    const header = document.createElement("div");
    header.className = "sl-popover-header";
    const title = document.createElement("h3");
    title.id = "sl-popover-title";
    title.className = "sl-popover-title";
    const closeBtn = document.createElement("button");
    closeBtn.className = "sl-popover-close-btn";
    closeBtn.setAttribute("aria-label", "Close tour");
    closeBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    header.appendChild(title);
    header.appendChild(closeBtn);
    popover.appendChild(header);
    const mediaContainer = document.createElement("div");
    mediaContainer.className = "sl-popover-media";
    popover.appendChild(mediaContainer);
    const summary = document.createElement("div");
    summary.className = "sl-popover-summary";
    popover.appendChild(summary);
    const footer = document.createElement("div");
    footer.className = "sl-popover-footer";
    const progress = document.createElement("div");
    progress.className = "sl-popover-progress";
    const actions = document.createElement("div");
    actions.className = "sl-popover-actions";
    const skipBtn = document.createElement("button");
    skipBtn.className = "sl-btn sl-btn-secondary sl-btn-skip";
    skipBtn.textContent = options.skipText || "Skip";
    const prevBtn = document.createElement("button");
    prevBtn.className = "sl-btn sl-btn-secondary sl-btn-prev";
    prevBtn.textContent = options.previousText || "Back";
    const nextBtn = document.createElement("button");
    nextBtn.className = "sl-btn sl-btn-primary sl-btn-next";
    nextBtn.textContent = options.nextText || "Next";
    actions.appendChild(skipBtn);
    actions.appendChild(prevBtn);
    actions.appendChild(nextBtn);
    footer.appendChild(progress);
    footer.appendChild(actions);
    popover.appendChild(footer);
    parent.appendChild(popover);
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.callbacks?.onExit();
    });
    skipBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.callbacks?.onSkip) {
        this.callbacks.onSkip();
      } else {
        this.callbacks?.onExit();
      }
    });
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.callbacks?.onPrevious();
    });
    nextBtn.addEventListener("click", (e) => {
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
  show() {
    if (!this.el) return;
    this.el.classList.add("sl-visible");
    setTimeout(() => {
      this.nextBtn?.focus();
    }, 50);
  }
  hide() {
    if (!this.el) return;
    this.el.classList.remove("sl-visible");
  }
  renderStep(step, index, total) {
    if (!this.el || !this.titleEl || !this.summaryEl || !this.progressEl || !this.nextBtn || !this.prevBtn) {
      return;
    }
    this.currentStep = step;
    if (step.title) {
      this.titleEl.textContent = step.title;
      this.titleEl.style.display = "block";
    } else {
      this.titleEl.style.display = "none";
    }
    if (step.summary) {
      this.summaryEl.innerHTML = step.summary;
      this.summaryEl.style.display = "block";
    } else {
      this.summaryEl.style.display = "none";
    }
    this.renderMedia(step.media);
    if (this.options.showProgress !== false) {
      this.progressEl.textContent = `${index + 1} of ${total}`;
      this.progressEl.style.display = "block";
    } else {
      this.progressEl.style.display = "none";
    }
    const isFirst = index === 0;
    const isLast = index === total - 1;
    if (isFirst) {
      this.prevBtn.style.display = "none";
    } else {
      this.prevBtn.style.display = "inline-flex";
      this.prevBtn.textContent = this.options.previousText || "Back";
    }
    if (isLast) {
      this.nextBtn.textContent = this.options.doneText || "Finish";
      this.nextBtn.classList.add("sl-btn-done");
    } else {
      this.nextBtn.textContent = this.options.nextText || "Next";
      this.nextBtn.classList.remove("sl-btn-done");
    }
    if (this.skipBtn) {
      this.skipBtn.style.display = isLast ? "none" : "inline-flex";
    }
  }
  renderMedia(mediaUrl) {
    if (!this.mediaContainer) return;
    this.mediaContainer.innerHTML = "";
    if (!mediaUrl || mediaUrl.trim() === "") {
      this.mediaContainer.style.display = "none";
      return;
    }
    this.mediaContainer.style.display = "block";
    if (videoPattern.test(mediaUrl)) {
      const video = document.createElement("video");
      video.className = "sl-popover-media-video";
      video.src = mediaUrl;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("controlsList", "nodownload");
      video.addEventListener("loadeddata", () => {
        if (this.currentStep?.element) {
          this.positionAt(this.currentStep.element.getBoundingClientRect(), this.currentStep.position);
        }
      });
      this.mediaContainer.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.className = "sl-popover-media-img";
      img.src = mediaUrl;
      img.alt = this.currentStep?.title || "Spotlight Step Preview";
      img.loading = "lazy";
      img.addEventListener("load", () => {
        if (this.currentStep?.element) {
          this.positionAt(this.currentStep.element.getBoundingClientRect(), this.currentStep.position);
        }
      });
      this.mediaContainer.appendChild(img);
    }
  }
  positionAt(targetRect, preferredPosition = "auto") {
    if (!this.el) return;
    const wasHidden = !this.el.classList.contains("sl-visible");
    if (wasHidden) {
      this.el.style.visibility = "hidden";
      this.el.style.display = "block";
    }
    const popoverRect = this.el.getBoundingClientRect();
    const result = computePopoverPosition(
      targetRect,
      popoverRect.width || 320,
      popoverRect.height || 180,
      preferredPosition || "auto"
    );
    this.el.style.top = `${result.top}px`;
    this.el.style.left = `${result.left}px`;
    this.el.setAttribute("data-placement", result.placement);
    if (this.arrowEl) {
      if (result.placement === "top" || result.placement === "bottom") {
        this.arrowEl.style.left = `${result.arrowOffsetPx}px`;
        this.arrowEl.style.top = "";
      } else {
        this.arrowEl.style.top = `${result.arrowOffsetPx}px`;
        this.arrowEl.style.left = "";
      }
    }
    if (wasHidden) {
      this.el.style.visibility = "";
      this.el.style.display = "";
    }
  }
  destroy() {
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
};

// src/core/spotlight.ts
var Spotlight = class {
  options;
  steps = [];
  currentIndex = 0;
  isActive = false;
  isHighlightOnly = false;
  events = new EventEmitter();
  themeManager;
  overlayManager;
  popoverManager;
  rootEl = null;
  resizeObserver = null;
  keyListener = null;
  scrollResizeHandler = null;
  documentClickHandler = null;
  rafId = null;
  constructor(options = {}) {
    this.options = {
      theme: "auto",
      autoScan: true,
      highlightColor: "#6366f1",
      highlightStrokeWidth: 3,
      highlightRadius: 8,
      highlightPadding: 8,
      overlayColor: "rgba(15, 23, 42, 0.65)",
      overlayOpacity: 1,
      backdropBlur: 4,
      zIndex: 99999,
      animationDuration: 320,
      confirmOnExit: false,
      exitOnBackdropClick: true,
      keyboardNavigation: true,
      showProgress: true,
      nextText: "Next",
      previousText: "Back",
      doneText: "Finish",
      skipText: "Skip",
      ...options
    };
    this.themeManager = new ThemeManager(this.options.theme);
    this.overlayManager = new OverlayManager();
    this.popoverManager = new PopoverManager();
    if (typeof window !== "undefined") {
      if (this.options.autoScan !== false) {
        this.updateSpots();
      }
      this.documentClickHandler = (e) => {
        const target = e.target?.closest(
          '[type^="spotlight-button"], [data-spotlight-start], [data-spotlight-stop], [data-spotlight-next], [data-spotlight-previous]'
        );
        if (!target) return;
        const typeAttr = target.getAttribute("type") || "";
        if (target.hasAttribute("data-spotlight-start") || typeAttr === "spotlight-button:start") {
          e.preventDefault();
          this.start();
        } else if (target.hasAttribute("data-spotlight-stop") || typeAttr === "spotlight-button:stop" || typeAttr === "spotlight-button:done") {
          e.preventDefault();
          this.end("button");
        } else if (target.hasAttribute("data-spotlight-next") || typeAttr === "spotlight-button:next") {
          e.preventDefault();
          this.next();
        } else if (target.hasAttribute("data-spotlight-previous") || typeAttr === "spotlight-button:previous") {
          e.preventDefault();
          this.previous();
        }
      };
      document.addEventListener("click", this.documentClickHandler);
    }
  }
  mount() {
    if (typeof window === "undefined" || this.rootEl) return;
    const root = document.createElement("div");
    root.className = "sl-spotlight-root";
    document.body.appendChild(root);
    this.rootEl = root;
    this.themeManager.init(root, this.options);
    this.overlayManager.mount(root, () => {
      if (this.options.exitOnBackdropClick !== false) {
        this.end("backdrop");
      }
    });
    this.popoverManager.mount(root, this.options, {
      onNext: () => this.next(),
      onPrevious: () => this.previous(),
      onExit: () => this.end("button"),
      onSkip: () => this.end("button")
    });
    if (this.options.keyboardNavigation !== false) {
      this.keyListener = (e) => {
        if (!this.isActive) return;
        if (e.key === "Escape") {
          e.preventDefault();
          this.end("esc");
        } else if (e.key === "ArrowRight" || e.key === "Enter") {
          e.preventDefault();
          this.next();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          this.previous();
        }
      };
      window.addEventListener("keydown", this.keyListener);
    }
    this.scrollResizeHandler = () => {
      if (!this.isActive || !this.getCurrentStep()?.element) return;
      if (this.rafId !== null) cancelAnimationFrame(this.rafId);
      this.rafId = requestAnimationFrame(() => {
        this.repositionCurrentStep();
      });
    };
    window.addEventListener("resize", this.scrollResizeHandler, { passive: true });
    window.addEventListener("scroll", this.scrollResizeHandler, { passive: true });
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.isActive) {
          this.scrollResizeHandler?.();
        }
      });
    }
  }
  async updateSpots() {
    if (typeof window === "undefined") return;
    this.steps = scanElements(document, {
      group: this.options.group,
      programmaticSteps: this.options.steps
    });
    this.events.emit("spots-updated", { total: this.steps.length });
  }
  async start(options = {}) {
    if (typeof window === "undefined") return;
    this.mount();
    await this.updateSpots();
    if (this.steps.length === 0) {
      if (this.options.devMode) {
        console.warn("[Spotlight.js] No spotlight elements found. Ensure elements have data-spot-* attributes or pass steps in options.");
      }
      return;
    }
    this.isHighlightOnly = options.highlightOnly ?? false;
    if (options.from !== void 0) {
      if (typeof options.from === "number") {
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
    this.events.emit("start", { step, total: this.steps.length });
    this.events.emit("change", {
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
  async next() {
    if (!this.isActive) return;
    const previousIndex = this.currentIndex;
    const nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.steps.length) {
      this.end("button");
      this.events.emit("complete", void 0);
      this.options.onComplete?.();
      return;
    }
    this.currentIndex = nextIndex;
    const step = this.steps[this.currentIndex];
    this.renderCurrentStep(false);
    this.events.emit("next", { step, index: this.currentIndex, total: this.steps.length });
    this.events.emit("change", {
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
  async previous() {
    if (!this.isActive) return;
    if (this.currentIndex <= 0) return;
    const previousIndex = this.currentIndex;
    this.currentIndex--;
    const step = this.steps[this.currentIndex];
    this.renderCurrentStep(false);
    this.events.emit("previous", { step, index: this.currentIndex, total: this.steps.length });
    this.events.emit("change", {
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
  async goTo(step) {
    if (!this.isActive) return;
    let targetIndex = -1;
    if (typeof step === "number") {
      targetIndex = step;
    } else {
      targetIndex = this.steps.findIndex((s) => s.id === step);
    }
    if (targetIndex >= 0 && targetIndex < this.steps.length && targetIndex !== this.currentIndex) {
      const previousIndex = this.currentIndex;
      this.currentIndex = targetIndex;
      const currentStep = this.steps[this.currentIndex];
      this.renderCurrentStep(false);
      this.events.emit("change", {
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
  end(reason = "api") {
    if (!this.isActive) return;
    if (this.options.confirmOnExit && reason !== "button") {
      const msg = this.options.confirmExitMessage || "Are you sure you want to exit the tour?";
      if (!window.confirm(msg)) {
        return;
      }
    }
    const currentStep = this.getCurrentStep();
    const index = this.currentIndex;
    this.isActive = false;
    this.overlayManager.hide();
    this.popoverManager.hide();
    this.resizeObserver?.disconnect();
    this.events.emit("exit", {
      reason,
      step: currentStep,
      index
    });
    this.options.onExit?.({
      reason,
      step: currentStep,
      index
    });
  }
  stop() {
    this.end("api");
  }
  getCurrentStep() {
    return this.steps[this.currentIndex] || null;
  }
  renderCurrentStep(isFirst = false) {
    const step = this.getCurrentStep();
    if (!step || !step.element) return;
    this.resizeObserver?.disconnect();
    this.resizeObserver?.observe(step.element);
    this.scrollIntoView(step.element, () => {
      if (!this.isActive) return;
      const rect = step.element.getBoundingClientRect();
      const padding = step.padding ?? this.options.highlightPadding ?? 8;
      const radius = step.radius ?? this.options.highlightRadius ?? 8;
      this.overlayManager.moveTo(rect, padding, radius, isFirst);
      if (!this.isHighlightOnly) {
        this.popoverManager.renderStep(step, this.currentIndex, this.steps.length);
        this.popoverManager.positionAt(rect, step.position);
        this.popoverManager.show();
      } else {
        this.popoverManager.hide();
      }
    });
  }
  repositionCurrentStep() {
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
  scrollIntoView(element, callback) {
    const rect = element.getBoundingClientRect();
    const isInViewport = rect.top >= 50 && rect.bottom <= window.innerHeight - 50 && rect.left >= 20 && rect.right <= window.innerWidth - 20;
    if (isInViewport) {
      callback();
      return;
    }
    try {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest"
      });
    } catch {
      element.scrollIntoView(true);
    }
    setTimeout(() => {
      callback();
    }, 280);
  }
  setTheme(theme) {
    this.options.theme = theme;
    this.themeManager.setTheme(theme);
  }
  on(event, callback) {
    return this.events.on(event, callback);
  }
  off(event, callback) {
    this.events.off(event, callback);
  }
  addEventListener(eventName, callback) {
    this.on(eventName, callback);
  }
  getState() {
    return {
      isActive: this.isActive,
      currentIndex: this.currentIndex,
      totalSteps: this.steps.length,
      currentStep: this.getCurrentStep()
    };
  }
  setHighlightColor(color) {
    this.options.highlightColor = color;
    this.overlayManager.setHighlightColor(color);
    this.themeManager.applyCustomVariables({ highlightColor: color });
  }
  setHighlightStrokeWidth(width) {
    this.options.highlightStrokeWidth = width;
    this.overlayManager.setHighlightStrokeWidth(width);
    this.themeManager.applyCustomVariables({ highlightStrokeWidth: width });
  }
  setBorderRadius(radius) {
    this.options.highlightRadius = radius;
    this.overlayManager.setBorderRadius(radius);
    this.themeManager.applyCustomVariables({ highlightRadius: radius });
  }
  applyOptions(options) {
    this.options = { ...this.options, ...options };
    if (this.rootEl) {
      this.themeManager.applyCustomVariables(this.options);
      if (options.theme) {
        this.setTheme(options.theme);
      }
    }
  }
  destroy() {
    this.end("api");
    if (this.documentClickHandler) {
      document.removeEventListener("click", this.documentClickHandler);
      this.documentClickHandler = null;
    }
    if (this.keyListener) {
      window.removeEventListener("keydown", this.keyListener);
      this.keyListener = null;
    }
    if (this.scrollResizeHandler) {
      window.removeEventListener("resize", this.scrollResizeHandler);
      window.removeEventListener("scroll", this.scrollResizeHandler);
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
};
async function spotlight(options = {}) {
  const instance = new Spotlight(options);
  return instance;
}

// src/index.ts
if (typeof window !== "undefined") {
  const globalObj = window;
  globalObj.Spotlight = {
    spotlight,
    Spotlight,
    create: (options) => new Spotlight(options)
  };
  const initAutoStart = () => {
    const autoScript = document.querySelector("script[data-spotlight-auto], script[lights-on]");
    if (autoScript) {
      const theme = autoScript.getAttribute("data-spotlight-theme") || "auto";
      const group = autoScript.getAttribute("data-spotlight-group") || "default";
      const instance = new Spotlight({ theme, group });
      instance.start();
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAutoStart);
  } else {
    initAutoStart();
  }
}

export { Spotlight, spotlight };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map