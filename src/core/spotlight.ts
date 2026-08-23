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
    borderRadius: 4,
    modalPadding: 15,
    modalWidth: 300,
    highlightColor: '#ffce5c',
    highlightStrokeWidth: 3,
    animationDuration: 300,
    backdropOpacity: 0.5,
    nextText: 'Next',
    previousText: 'Previous',
    doneText: 'Done'
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
            borderRadius: conf.borderRadius || 4,
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
        root.style.setProperty('--sl-border-radius', `${conf.borderRadius || 4}px`);
        root.style.setProperty('--sl-modal-padding', `${conf.modalPadding || 15}px`);
        root.style.setProperty('--sl-modal-width', `${conf.modalWidth || 300}px`);
        root.style.setProperty('--sl-highlight-color', conf.highlightColor || '#ffce5c');
        root.style.setProperty('--sl-highlight-stroke-width', `${conf.highlightStrokeWidth || 3}px`);
        root.style.setProperty('--sl-animation-duration', `${conf.animationDuration || 300}ms`);
        root.style.setProperty('--sl-backdrop-opacity', (conf.backdropOpacity || 0.5).toString());

        if (conf.theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        } else {
            root.removeAttribute('data-theme');
        }

        setPopoverStyles(conf);
        setHighlightRadius(conf.borderRadius || 4);
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
            conf.borderRadius = radius;
            updateCSSVariables();
        },
        setHighlightColor: (color: string) => {
            conf.highlightColor = color;
            setStroke(color);
            updateCSSVariables();
        },
        setHighlightStrokeWidth: (width: number) => {
            conf.highlightStrokeWidth = width;
            setStrokeWidth(width);
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