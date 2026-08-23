import { SpotlightOptions, SpotlightControls, Spot } from '../types/spotlight.types.js';
import { setCoverBg, setStroke, hilight, displayCover, setStrokeWidth, setHighlightRadius } from '../ui/overlay.js';
import { displayPopover, showPopover, setPopoverStyles } from '../ui/popover.js';
import { hexToRGBA, parseComment, bodyScroll, scrollTo } from './utility.js';

interface Conf extends SpotlightOptions {
    comments: Spot[];
    callbacks: Record<string, (data: any) => void>;
    startFrom: number;
    confirmOnExit: boolean;
    highlightOnly: boolean;
    coverBg: string;
}

const conf: Conf = {
    comments: [],
    callbacks: { 'all': (() => {}) },
    startFrom: 0,
    confirmOnExit: false,
    highlightOnly: false,
    coverBg: 'rgba(0, 0, 0, 0.5)',
    devMode: false,
    theme: 'light',
    layout: {
        highlightColor: '#ffce5c',
        highlighterBorderWidth: 3,
        highlighterBorderRadius: 4,
        highlighterPadding: 4,
        overlayOpacity: 0.5,
        zIndex: 9999
    },
    button: {
        primary: {
            background: '#2196F3',
            text: '#ffffff',
            borderColor: 'transparent',
            borderWidth: 0,
            borderRadius: 4,
            fontSize: '13px',
            fontWeight: '400',
            paddingX: '12px',
            paddingY: '3px'
        },
        secondary: {
            background: 'transparent',
            text: 'inherit',
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 4,
            fontSize: '13px',
            fontWeight: '400',
            paddingX: '12px',
            paddingY: '3px'
        }
    },
    content: {
        title: {
            fontSize: '20px',
            fontWeight: '600',
            lineHeight: '1.5',
            letterSpacing: '0px',
            marginBottom: '0px'
        },
        description: {
            fontSize: '14px',
            fontWeight: '400',
            lineHeight: '1.5',
            letterSpacing: '0px',
            marginBottom: '0px'
        }
    },
    modal: {
        background: '#fcfcfc',
        text: '#2d2d2d',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 4,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowBlur: 20,
        shadowSpread: 0,
        paddingX: '15px',
        paddingY: '15px',
        width: '300px',
        gap: '16px'
    },
    progress: {
        enabled: true,
        fontSize: '13px',
        fontWeight: '400',
        opacity: 0.7
    },
    arrow: {
        enabled: true,
        size: 16
    }
};

const clientEvents = [
    'all',
    'start',
    'end',
    'exit',
    'next',
    'previous',
    'click',
    'spots-updated',
    'cover-updated'
];

function dC(message: string): void {
    if (!conf.devMode || !message) return;
    console.log('%c[SPOTLIGHT] ' + `%c${message}`, 'color: #bada55', 'color: #fff');
}

function emmitEvent<T extends { type: string }>(data: T): void {
    if (!data.type) throw new Error(`'type' is not defined, to fire callback for this event.`);
    if (!clientEvents.includes(data.type)) throw new Error(`'${data.type}' is not assigned on clientEvents`);

    let callback = conf.callbacks[data.type];
    if (!callback) {
        callback = conf.callbacks['all'];
        const eventData = { ...data } as Record<string, any>;
        delete eventData['type'];
        eventData.event_name = data.type;
        callback(eventData);
        return;
    }

    // @ts-ignore
    delete data.type;
    callback(data as Record<string, any>);
}

async function hilightElement(event: string): Promise<void> {
    const index = conf.startFrom;
    const totalComments = conf.comments.length;

    displayPopover(false);
    await bodyScroll(false);

    if (conf.startFrom >= totalComments) {
        displayCover(false);
        await bodyScroll(true);
        if (event !== 'exit' && (index + 1) >= totalComments) event = 'end';
        emmitEvent({ type: event });
        return;
    }

    const spot = conf.comments[index];
    let position = spot.element.getBoundingClientRect();
    await scrollTo(position.top);
    position = spot.element.getBoundingClientRect();
    hilight(position);

    if (!conf.highlightOnly) {
        showPopover(position, spot, index, totalComments, {
            borderRadius: conf.modal?.borderRadius || 4,
            nextText: conf.nextText || 'Next',
            previousText: conf.previousText || 'Previous',
            doneText: conf.doneText || 'Done'
        });
    }

    emmitEvent({
        steps: {
            total: totalComments,
            current: index + 1,
            previous: index > 0 ? index : null,
            is_first: index === 0,
            is_last: (index + 1) === totalComments
        },
        spot,
        type: index === 0 ? 'start' : event
    });
}

export async function spotlight(options: SpotlightOptions = {}): Promise<SpotlightControls> {
    // Apply options
    Object.assign(conf, options);
    updateCSSVariables();

    async function updateSpots(): Promise<void> {
        const comments: Spot[] = [];
        const iterator = document.createNodeIterator(document.body, NodeFilter.SHOW_COMMENT, null);

        let currentNode: Node | null;
        while ((currentNode = iterator.nextNode()) !== null) {
            const data = await parseComment(currentNode);
            if (!data) continue;
            comments.push(data);
        }

        conf.comments = comments.sort((a, b) => a.index - b.index);
        dC(`Found ${conf.comments.length} #comment node/s`);
        emmitEvent({ type: 'spots-updated', total_spots: conf.comments.length });
    }

    async function addEventListener(eventName: string, callback: (data: any) => void): Promise<void> {
        if (typeof eventName !== 'string') throw new Error(`Invalid eventName value\nExpected: string\nGiven: ${typeof eventName}`);
        if (!clientEvents.includes(eventName)) throw new Error(`Unsupported eventName '${eventName}'\nHere is the list of all supported eventNames.\n${clientEvents.join(', ')}`);
        if (!callback || typeof callback !== 'function') throw new Error(`You must define a callback function to listen ${eventName} events`);
        conf.callbacks[eventName] = callback;
    }

    async function setCover(options: { hex: string; alpha?: number }): Promise<void> {
        const { hex, alpha = 0.5 } = options;
        if (!hex) return;
        if (typeof hex !== 'string') throw new Error(`Invalid hex value.\nExpected: string\nGiven: ${typeof hex}`);
        if (typeof alpha !== 'number') throw new Error(`Invalid alpha value.\nExpected: number\nGiven: ${typeof alpha}`);
        if (alpha < 0 || alpha > 1) throw new Error('Invalid alpha value it must be between 0 - 1, example: 0.5');

        const color = await hexToRGBA(hex, alpha);
        if (!color) throw new Error(`Given color hex '${hex}' is not valid!`);
        setCoverBg(color);
        emmitEvent({ type: 'cover-updated', color: { current: color, previous: conf.coverBg } });
        conf.coverBg = color;
    }

    function next(): void {
        conf.startFrom++;
        hilightElement('next');
    }

    function previous(): void {
        conf.startFrom--;
        if (conf.startFrom < 0) return end();
        hilightElement('previous');
    }

    function end(event: string = 'end'): void {
        if (event === 'exit' && conf.confirmOnExit) {
            const concent = confirm('Are you sure? You want to exit.');
            if (!concent) return;
        }
        conf.startFrom = conf.comments.length + 1;
        hilightElement(event);
    }

    function start(options: { from?: number; confirmOnExit?: boolean; highlightOnly?: boolean } = {}): void {
        const { from, confirmOnExit, highlightOnly } = options;
        if (highlightOnly !== undefined && typeof highlightOnly !== 'boolean') throw new Error(`Invalid input for highlightOnly\n Expected: boolean\nGiven: ${typeof highlightOnly}\n Example: true`);
        if (confirmOnExit !== undefined && typeof confirmOnExit !== 'boolean') throw new Error(`Invalid input for confirmOnExit\n Expected: boolean\nGiven: ${typeof confirmOnExit}\n Example: false`);
        if (from !== undefined) {
            if (typeof from !== 'number') throw new Error(`Invalid input for from\n Expected: number ( >= 1 )\nGiven: ${typeof from}\n Example: 1`);
            if (from < 1) throw new Error('From must be >= 1');
            conf.startFrom = from - 1;
        } else {
            conf.startFrom = 0;
        }

        conf.confirmOnExit = confirmOnExit ?? false;
        conf.highlightOnly = highlightOnly ?? false;
        hilightElement('start');
    }

    function updateCSSVariables(): void {
        const root = document.documentElement;
        root.style.setProperty('--sl-theme', conf.theme || 'light');

        // Layout
        if (conf.layout) {
            if (conf.layout.highlightColor) root.style.setProperty('--sl-highlight-color', conf.layout.highlightColor);
            if (conf.layout.highlighterBorderWidth) root.style.setProperty('--sl-highlight-stroke-width', `${conf.layout.highlighterBorderWidth}px`);
            if (conf.layout.highlighterBorderRadius) root.style.setProperty('--sl-border-radius', `${conf.layout.highlighterBorderRadius}px`);
            if (conf.layout.overlayOpacity) root.style.setProperty('--sl-backdrop-opacity', conf.layout.overlayOpacity.toString());
            if (conf.layout.zIndex) root.style.setProperty('--sl-z-index', conf.layout.zIndex.toString());
        }

        // Buttons
        if (conf.button) {
            if (conf.button.primary) {
                if (conf.button.primary.background) root.style.setProperty('--sl-primary-btn-bg', conf.button.primary.background);
                if (conf.button.primary.text) root.style.setProperty('--sl-primary-btn-text', conf.button.primary.text);
                if (conf.button.primary.borderColor) root.style.setProperty('--sl-primary-btn-border-color', conf.button.primary.borderColor);
                if (conf.button.primary.borderWidth) root.style.setProperty('--sl-primary-btn-border-width', `${conf.button.primary.borderWidth}px`);
                if (conf.button.primary.borderRadius) root.style.setProperty('--sl-primary-btn-border-radius', `${conf.button.primary.borderRadius}px`);
                if (conf.button.primary.fontSize) root.style.setProperty('--sl-primary-btn-font-size', conf.button.primary.fontSize);
                if (conf.button.primary.fontWeight) root.style.setProperty('--sl-primary-btn-font-weight', conf.button.primary.fontWeight);
                if (conf.button.primary.paddingX) root.style.setProperty('--sl-primary-btn-padding-x', conf.button.primary.paddingX);
                if (conf.button.primary.paddingY) root.style.setProperty('--sl-primary-btn-padding-y', conf.button.primary.paddingY);
            }
            if (conf.button.secondary) {
                if (conf.button.secondary.background) root.style.setProperty('--sl-secondary-btn-bg', conf.button.secondary.background);
                if (conf.button.secondary.text) root.style.setProperty('--sl-secondary-btn-text', conf.button.secondary.text);
                if (conf.button.secondary.borderColor) root.style.setProperty('--sl-secondary-btn-border-color', conf.button.secondary.borderColor);
                if (conf.button.secondary.borderWidth) root.style.setProperty('--sl-secondary-btn-border-width', `${conf.button.secondary.borderWidth}px`);
                if (conf.button.secondary.borderRadius) root.style.setProperty('--sl-secondary-btn-border-radius', `${conf.button.secondary.borderRadius}px`);
                if (conf.button.secondary.fontSize) root.style.setProperty('--sl-secondary-btn-font-size', conf.button.secondary.fontSize);
                if (conf.button.secondary.fontWeight) root.style.setProperty('--sl-secondary-btn-font-weight', conf.button.secondary.fontWeight);
                if (conf.button.secondary.paddingX) root.style.setProperty('--sl-secondary-btn-padding-x', conf.button.secondary.paddingX);
                if (conf.button.secondary.paddingY) root.style.setProperty('--sl-secondary-btn-padding-y', conf.button.secondary.paddingY);
            }
        }

        // Content
        if (conf.content) {
            if (conf.content.title) {
                if (conf.content.title.fontSize) root.style.setProperty('--sl-title-font-size', conf.content.title.fontSize);
                if (conf.content.title.fontWeight) root.style.setProperty('--sl-title-font-weight', conf.content.title.fontWeight);
                if (conf.content.title.lineHeight) root.style.setProperty('--sl-title-line-height', conf.content.title.lineHeight);
                if (conf.content.title.letterSpacing) root.style.setProperty('--sl-title-letter-spacing', conf.content.title.letterSpacing);
                if (conf.content.title.marginBottom) root.style.setProperty('--sl-title-margin-bottom', conf.content.title.marginBottom);
            }
            if (conf.content.description) {
                if (conf.content.description.fontSize) root.style.setProperty('--sl-description-font-size', conf.content.description.fontSize);
                if (conf.content.description.fontWeight) root.style.setProperty('--sl-description-font-weight', conf.content.description.fontWeight);
                if (conf.content.description.lineHeight) root.style.setProperty('--sl-description-line-height', conf.content.description.lineHeight);
                if (conf.content.description.letterSpacing) root.style.setProperty('--sl-description-letter-spacing', conf.content.description.letterSpacing);
                if (conf.content.description.marginBottom) root.style.setProperty('--sl-description-margin-bottom', conf.content.description.marginBottom);
            }
        }

        // Modal
        if (conf.modal) {
            if (conf.modal.background) root.style.setProperty('--sl-modal-bg', conf.modal.background);
            if (conf.modal.text) root.style.setProperty('--sl-modal-text', conf.modal.text);
            if (conf.modal.borderColor) root.style.setProperty('--sl-modal-border-color', conf.modal.borderColor);
            if (conf.modal.borderWidth) root.style.setProperty('--sl-modal-border-width', `${conf.modal.borderWidth}px`);
            if (conf.modal.borderRadius) root.style.setProperty('--sl-modal-border-radius', `${conf.modal.borderRadius}px`);
            if (conf.modal.shadowColor) root.style.setProperty('--sl-shadow-color', conf.modal.shadowColor);
            if (conf.modal.shadowBlur) root.style.setProperty('--sl-shadow-blur', `${conf.modal.shadowBlur}px`);
            if (conf.modal.shadowSpread) root.style.setProperty('--sl-shadow-spread', `${conf.modal.shadowSpread}px`);
            if (conf.modal.paddingX) root.style.setProperty('--sl-modal-padding-x', conf.modal.paddingX);
            if (conf.modal.paddingY) root.style.setProperty('--sl-modal-padding-y', conf.modal.paddingY);
            if (conf.modal.width) root.style.setProperty('--sl-modal-width', conf.modal.width);
            if (conf.modal.gap) root.style.setProperty('--sl-modal-gap', conf.modal.gap);
        }

        // Progress
        if (conf.progress) {
            if (conf.progress.enabled !== undefined) root.style.setProperty('--sl-progress-enabled', conf.progress.enabled ? '1' : '0');
            if (conf.progress.fontSize) root.style.setProperty('--sl-progress-font-size', conf.progress.fontSize);
            if (conf.progress.fontWeight) root.style.setProperty('--sl-progress-font-weight', conf.progress.fontWeight);
            if (conf.progress.opacity) root.style.setProperty('--sl-progress-opacity', conf.progress.opacity.toString());
        }

        // Arrow
        if (conf.arrow) {
            if (conf.arrow.enabled !== undefined) root.style.setProperty('--sl-arrow-enabled', conf.arrow.enabled ? '1' : '0');
            if (conf.arrow.size) root.style.setProperty('--sl-arrow-size', `${conf.arrow.size}px`);
        }

        // Theme
        if (conf.theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
        }

        setPopoverStyles(conf);
        setHighlightRadius(conf.layout?.highlighterBorderRadius || 4);
    }

    // Initialize
    await updateSpots();

    // Event listeners
    document.addEventListener('click', (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        let type = target.getAttribute('type');
        if (!type || !type.startsWith('spotlight')) return;
        dC(`Click Event : ${type}`);
        e.preventDefault();
        type = type.replace(/\s{1,}/g, '');
        if (type === 'spotlight-button:start') return start();
        if (type === 'spotlight-button:stop') return end();
        if (type === 'spotlight-button:done') return end();
        if (type === 'spotlight-button:previous') return previous();
        if (type === 'spotlight-button:next') return next();
        if (type === 'spotlight-button:exit') return end('exit');
        if (['spotlight-desc', 'spotlight-title', 'spotlight-banner'].includes(type)) {
            emmitEvent({ type: 'click', target });
        }
    });

    return {
        start,
        end,
        next,
        previous,
        setCover,
        updateSpots,
        addEventListener,
        setTheme: (theme: 'light' | 'dark' | string) => {
            conf.theme = theme;
            updateCSSVariables();
        },
        setBorderRadius: (radius: number) => {
            if (!conf.modal) conf.modal = {};
            conf.modal.borderRadius = radius;
            updateCSSVariables();
        },
        setHighlightColor: (color: string) => {
            if (!conf.layout) conf.layout = {};
            conf.layout.highlightColor = color;
            setStroke(color);
            updateCSSVariables();
        },
        setHighlightStrokeWidth: (width: number) => {
            if (!conf.layout) conf.layout = {};
            conf.layout.highlighterBorderWidth = width;
            setStrokeWidth(width);
            updateCSSVariables();
        },
        setPrimaryButtonColor: (color: string) => {
            if (!conf.button) conf.button = {};
            if (!conf.button.primary) conf.button.primary = {};
            conf.button.primary.background = color;
            updateCSSVariables();
        },
        setSecondaryButtonColor: (color: string) => {
            if (!conf.button) conf.button = {};
            if (!conf.button.secondary) conf.button.secondary = {};
            conf.button.secondary.background = color;
            updateCSSVariables();
        }
    };
}

// Auto-start functionality
if (document.querySelector('script[lights-on]')) {
    document.addEventListener('DOMContentLoaded', async () => {
        const scriptTag = document.querySelector('script[lights-on]') as HTMLScriptElement;
        if (!scriptTag) return;
        let scriptPath = scriptTag.getAttribute('src');
        if (!scriptPath) return;

        const script = document.createElement('script');
        script.setAttribute('type', 'module');
        script.innerHTML = `import { spotlight } from '${scriptPath}'; spotlight();`;
        document.body.appendChild(script);
    });
}