export type SpotlightTheme = 'light' | 'dark' | 'auto';

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export interface SpotStep {
  /** Target DOM element or CSS selector string */
  target?: Element | string;
  /** Unique identifier or step number */
  id?: string | number;
  /** Step title (from data-spot-name or programmatic config) */
  title?: string;
  /** Step summary / description (from data-spot-summary or programmatic config) */
  summary?: string;
  /** Media URL (Image, animated GIF, or Video MP4/WebM) */
  media?: string;
  /** Preferred popover placement */
  position?: PopoverPosition;
  /** Clearance in pixels around the target */
  padding?: number;
  /** Cutout corner radius in pixels */
  radius?: number;
  /** Multi-tour group tag */
  group?: string;
  /** Sorting order */
  order?: number;
  /** Resolved target DOM element */
  element?: HTMLElement;
  /** Index in the active tour sequence */
  index?: number;
}

export interface SpotlightOptions {
  /** Active theme preset ('light', 'dark', or 'auto' for OS preference) */
  theme?: SpotlightTheme | string;
  /** Multi-tour group name to filter declarative elements by (default: 'default') */
  group?: string;
  /** Programmatic list of steps (merged with or overriding declarative elements) */
  steps?: SpotStep[];
  /** Whether to automatically scan the DOM for data-spot-* attributes (default: true) */
  autoScan?: boolean;
  /** Highlight cutout border color */
  highlightColor?: string;
  /** Highlight cutout border stroke width in px (default: 3) */
  highlightStrokeWidth?: number;
  /** Default cutout border radius in px (default: 8) */
  highlightRadius?: number;
  /** Default padding in px around highlighted elements (default: 8) */
  highlightPadding?: number;
  /** Overlay backdrop color (e.g. 'rgba(0, 0, 0, 0.65)') */
  overlayColor?: string;
  /** Overlay backdrop opacity (0 to 1, default: 0.65) */
  overlayOpacity?: number;
  /** Backdrop blur in px or boolean (e.g. 4 for 4px blur, default: 4) */
  backdropBlur?: number | boolean;
  /** z-index for the overlay and popover (default: 9999) */
  zIndex?: number;
  /** Animation duration in milliseconds for cutout and popover transitions (default: 320) */
  animationDuration?: number;
  /** Whether to prompt user confirmation before exiting mid-tour (default: false) */
  confirmOnExit?: boolean;
  /** Exit confirmation message */
  confirmExitMessage?: string;
  /** Whether clicking the backdrop exits the tour (default: true) */
  exitOnBackdropClick?: boolean;
  /** Enable keyboard controls (Escape to exit, Arrow keys to navigate) (default: true) */
  keyboardNavigation?: boolean;
  /** Whether to display step counter / progress indicator (default: true) */
  showProgress?: boolean;
  /** Next step button label (default: 'Next') */
  nextText?: string;
  /** Previous step button label (default: 'Back') */
  previousText?: string;
  /** Tour completion button label (default: 'Finish') */
  doneText?: string;
  /** Skip / exit button label (default: 'Skip') */
  skipText?: string;
  /** Start button label for step 0 if applicable */
  startText?: string;
  /** Enable console debugging logs */
  devMode?: boolean;

  /** Callbacks */
  onStart?: (data: { step: SpotStep; total: number }) => void;
  onChange?: (data: { step: SpotStep; index: number; total: number; previousIndex: number | null }) => void;
  onNext?: (data: { step: SpotStep; index: number; total: number }) => void;
  onPrevious?: (data: { step: SpotStep; index: number; total: number }) => void;
  onComplete?: () => void;
  onExit?: (data: { reason: 'esc' | 'backdrop' | 'button' | 'api'; step: SpotStep | null; index: number }) => void;
}

export type SpotlightEventMap = {
  'start': { step: SpotStep; total: number };
  'change': { step: SpotStep; index: number; total: number; previousIndex: number | null };
  'next': { step: SpotStep; index: number; total: number };
  'previous': { step: SpotStep; index: number; total: number };
  'complete': undefined;
  'exit': { reason: 'esc' | 'backdrop' | 'button' | 'api'; step: SpotStep | null; index: number };
  'spots-updated': { total: number };
};

export interface SpotlightControls {
  /** Start the tour, optionally specifying the initial step index or identifier */
  start: (options?: { from?: number | string; highlightOnly?: boolean }) => Promise<void>;
  /** Advance to the next step */
  next: () => Promise<void>;
  /** Navigate back to the previous step */
  previous: () => Promise<void>;
  /** Jump directly to a specific step index (0-based) or step ID */
  goTo: (step: number | string) => Promise<void>;
  /** Exit / terminate the tour */
  end: (reason?: 'button' | 'api' | 'backdrop') => void;
  /** Alias for end() */
  stop: () => void;
  /** Re-scan the DOM for dynamic data-spot-* attributes */
  updateSpots: () => Promise<void>;
  /** Change theme dynamically ('light' | 'dark' | 'auto') */
  setTheme: (theme: SpotlightTheme | string) => void;
  /** Listen to lifecycle events */
  on: <K extends keyof SpotlightEventMap>(event: K, callback: (data: SpotlightEventMap[K]) => void) => () => void;
  /** Remove event listener */
  off: <K extends keyof SpotlightEventMap>(event: K, callback: (data: SpotlightEventMap[K]) => void) => void;
  /** Legacy addEventListener compatibility */
  addEventListener: (eventName: string, callback: (data: any) => void) => void;
  /** Clean up DOM artifacts and event listeners */
  destroy: () => void;
  /** Get current tour state snapshot */
  getState: () => {
    isActive: boolean;
    currentIndex: number;
    totalSteps: number;
    currentStep: SpotStep | null;
  };
  /** Dynamically apply or update options */
  applyOptions: (options: Partial<SpotlightOptions>) => void;
  /** Legacy setters for backwards compatibility */
  setHighlightColor: (color: string) => void;
  setHighlightStrokeWidth: (width: number) => void;
  setBorderRadius: (radius: number) => void;
}