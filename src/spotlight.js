import { setCoverBg, setStroke, hilight, displayCover } from "./overlay.js";
import { displayPopover, showPopover } from "./popover.js";
import { hexToRGBA, parseComment, bodyScroll, scrollTo } from "./utility.js";

import "./spotlight.css";

const conf = {
    comments: [],
    callbacks: { 'all': ((e) => {})},
    startFrom: 0,
    confirmOnExit: false,
    highlightOnly: false,
    coverBg: 'rgba(0, 0, 0, 0.5)',
    devMode: false
}

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

// Custom console log for dev-mode
function dC(message) {
    if (!conf.devMode || !message) return;
    console.log('%c[SPOTLIGHT] ' + `%c${message}`, 'color: #bada55', 'color: #fff');
}

// Emmit event
function emmitEvent(data = {}) {

    if (!data.type) throw new Error(`'type' is not defined, to fire callback for this event.`);
    if (!clientEvents.includes(data.type)) throw new Error(`'${type}' is not assigned on clientEvents`);

    let callback = conf.callbacks[data.type];
    

    if (!callback) {
        callback = conf.callbacks['all'];
        data.event_name = data.type;
    }

    delete data['type'];
    callback(data);
}

// Hilight Element
async function hilightElement(event) {

    let index = conf.startFrom;
    let totalComments = conf.comments.length;

    displayPopover(false);
    bodyScroll(false);

    if (conf.startFrom >= totalComments) {

        // Hide cover, model & enable body scroll
        displayCover(false);
        bodyScroll(true);
        if (event !== 'exit' && (index + 1) >= totalComments) event = 'end';
        emmitEvent({ type: event });
        return;
    }

    let spot = conf.comments[index];
    let position = spot.element.getBoundingClientRect();

    // Scroll to the target element
    await scrollTo(position.top);

    // get the updated position of the target element
    position = spot.element.getBoundingClientRect();

    // Hilight the position
    hilight(position);

    // Isert popover data & show
    if (!conf.highlightOnly) showPopover(position, spot, index, totalComments);

    // Emmmit event
    delete spot.index;
    index++;
    emmitEvent({
        steps: {
            total: totalComments,
            current: index,
            previous: ((index - 1) < 1) ? null : (index - 1),
            is_first: (index == 1),
            is_last: (index == totalComments)
        },
        spot,
        type: (index < 1) ? 'start' : event,
    });

}

export async function spotlight({ devMode = false } = {}) {

    // Assign event
    if (devMode && typeof devMode === 'boolean') conf.devMode = devMode;

    // Cotrollers
    async function updateSpots() {
        let comments = [];
        var iterator = document.createNodeIterator(document.body, NodeFilter.SHOW_COMMENT, null, false);

        var currentNode;

        while (currentNode = iterator.nextNode()) {

            let data = await parseComment(currentNode);
            if (!data) continue; // Skip

            comments.push(data);
        }

        // Short in ascending order
        conf.comments = comments.sort((a, b) => a.index - b.index);
        dC(`Found ${conf.comments.length} #comment node/s`);
        emmitEvent({ type: 'spots-updated', total_spots: conf.comments.length });
    }

    async function addEventListener(eventName = null, callback = null) {

        // check event
        if (typeof eventName !== 'string') throw new Error(`Invalid eventName value\nExpected: string\nGiven: ${typeof eventName}`);
        if (!clientEvents.includes(eventName)) throw new Error(`Unsupported eventName '${eventName}'\nHere is the list of all supported eventNames.\n${clientEvents.join(', ')}`);

        // check callback
        if (!callback || typeof callback !== 'function') throw new Error(`You must define a callback function to listen ${eventName} events`);

        // Hoook it
        conf.callbacks[eventName] = callback;

    }

    async function setCover({
        hex = null,
        alpha = 0.5
    } = {}) {

        // Check input
        if (!hex || !alpha) return;
        if (typeof hex !== 'string') throw new Error(`Invalid hex value.\nExpected: string\nGiven: ${typeof hex}`);
        if (typeof alpha !== 'number') throw new Error(`Invalid alpha value.\nExpected: number\nGiven: ${typeof alpha}`);
        if (alpha < 0 || alpha > 1) throw new Error('Invalid alpha value it must be between 0 - 1, example: 0.5');

        // Check color
        let color = await hexToRGBA(hex, alpha);
        if (!color) throw new Error(`Given color hex '${hex}' is not valid!`);

        // update cover
        setCoverBg(color);

        // Emmit event
        emmitEvent({ type: 'cover-updated', color: { current: color, previous: conf.coverBg } });

        // Update config for future reference
        conf.coverBg = color;
    }

    function next() {
        conf.startFrom++;
        hilightElement('next');
    }

    function previous() {
        conf.startFrom--;
        if (conf.startFrom < 0) return end();
        hilightElement('previous');
    }

    function end(event = 'end') {
        if (event === 'exit' && conf.confirmOnExit) {
            let concent = confirm('Are you sure? You want to exit.');
            if (!concent) return;
        }
        conf.startFrom = (conf.comments.length + 1);
        hilightElement(event);
    }

    function start({
        from = null,
        confirmOnExit = null,
        highlightOnly = null,
    } = {}) {

        // Check input type
        if (highlightOnly) {
            if (typeof highlightOnly !== 'boolean') throw new Error(`Invalid input for highlightOnly\n Expected: boolean\nGiven: ${typeof highlightOnly}\n Example: true`);

        }

        if (confirmOnExit) {
            if (typeof confirmOnExit !== 'boolean') throw new Error(`Invalid input for confirmOnExit\n Expected: boolean\nGiven: ${typeof highlightOnly}\n Example: false`);
        }

        if (from) {

            if (typeof from !== 'number') throw new Error(`Invalid input for from\n Expected: number ( >= 1 )\nGiven: ${typeof highlightOnly}\n Example: 1`);

            from--;
            if (from < 0) from = 0;
        }

        // Update Configuration
        conf.startFrom = from ?? 0;
        conf.confirmOnExit = confirmOnExit ?? false;
        conf.highlightOnly = highlightOnly ?? false;

        // Hilight the spot
        hilightElement('start');

    }

    // Initialize
    await updateSpots();

    // Attach a body click listener
    document.addEventListener('click', (e) => {

        let type = e.target.getAttribute('type');

        if (!type) return;
        if (!type.startsWith('spotlight')) return;

        dC(`Click Event : ${type}`);

        // Handel click events
        e.preventDefault();
        type = type.replace(/\s{1,}/g, '');
        if (type === 'spotlight-button:start') return start();
        if (type === 'spotlight-button:stop') return end();
        if (type === 'spotlight-button:done') return end();
        if (type === 'spotlight-button:previous') return previous();
        if (type === 'spotlight-button:next') return next();
        if (type === 'spotlight-button:exit') return end('exit');

        // On popover element click
        if (['spotlight-desc', 'spotlight-title', 'spotlight-banner'].includes(type)) {
            emmitEvent({ type: 'click', target: e.target });
        }
    });

    // Return control methods to client
    return {
        start,
        end,
        next,
        previous,
        setCover,
        updateSpots,
        addEventListener,
    };
}

// This piece of code is or a special attribute to auto start SpotlightJS
if (document.querySelector('script[lights-on]')) {
    document.addEventListener('DOMContentLoaded', async () => {

        let scriptPath = document.querySelector('script[lights-on]').getAttribute('src');
        let script = document.createElement('script');
        script.setAttribute('type', 'module');
        script.innerHTML = `import { spotlight } from '${scriptPath}'; spotlight();`;
        document.body.appendChild(script);

    });
}