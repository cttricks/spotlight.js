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
    theme?: 'light' | 'dark' | string;
    devMode?: boolean;
    nextText?: string;
    previousText?: string;
    doneText?: string;
    layout?: {
        highlightColor?: string;
        highlighterBorderWidth?: number;
        highlighterBorderRadius?: number;
        highlighterPadding?: number;
        overlayOpacity?: number;
        zIndex?: number;
    };
    button?: {
        primary?: {
            background?: string;
            text?: string;
            borderColor?: string;
            borderWidth?: number;
            borderRadius?: number;
            fontSize?: string;
            fontWeight?: string;
            paddingX?: string;
            paddingY?: string;
        };
        secondary?: {
            background?: string;
            text?: string;
            borderColor?: string;
            borderWidth?: number;
            borderRadius?: number;
            fontSize?: string;
            fontWeight?: string;
            paddingX?: string;
            paddingY?: string;
        };
    };
    content?: {
        title?: {
            fontSize?: string;
            fontWeight?: string;
            lineHeight?: string;
            letterSpacing?: string;
            marginBottom?: string;
        };
        description?: {
            fontSize?: string;
            fontWeight?: string;
            lineHeight?: string;
            letterSpacing?: string;
            marginBottom?: string;
        };
    };
    modal?: {
        background?: string;
        text?: string;
        borderColor?: string;
        borderWidth?: number;
        borderRadius?: number;
        shadowColor?: string;
        shadowBlur?: number;
        shadowSpread?: number;
        paddingX?: string;
        paddingY?: string;
        width?: string;
        gap?: string;
    };
    progress?: {
        enabled?: boolean;
        fontSize?: string;
        fontWeight?: string;
        opacity?: number;
    };
    arrow?: {
        enabled?: boolean;
        size?: number;
    };
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
    setPrimaryButtonColor: (color: string) => void;
    setSecondaryButtonColor: (color: string) => void;
}