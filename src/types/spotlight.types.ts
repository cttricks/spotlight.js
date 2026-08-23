export interface Spot {
    image: string;
    title: string;
    description: string;
    element: Element;
    index: number;
}

export interface Comment {
    nodeValue: string | null;
    nextSibling: Node | null;
}

export interface SpotlightOptions {
    devMode?: boolean;
    theme?: 'light' | 'dark' | string;
    borderRadius?: number;
    modalPadding?: number;
    modalWidth?: number;
    highlightColor?: string;
    highlightStrokeWidth?: number;
    animationDuration?: number;
    backdropOpacity?: number;
    nextText?: string;
    previousText?: string;
    doneText?: string;
}

export interface SpotlightControls {
    start: (options?: { from?: number; confirmOnExit?: boolean; highlightOnly?: boolean }) => void;
    end: (event?: string) => void;
    next: () => void;
    previous: () => void;
    setCover: (options: { hex: string; alpha?: number }) => Promise<void>;
    updateSpots: () => Promise<void>;
    addEventListener: (eventName: string, callback: (data: any) => void) => void;
    setTheme: (theme: 'light' | 'dark' | string) => void;
    setBorderRadius: (radius: number) => void;
    setHighlightColor: (color: string) => void;
    setHighlightStrokeWidth: (width: number) => void;
}