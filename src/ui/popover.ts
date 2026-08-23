import { Spot } from '../types/spotlight.types.js';

let popover: HTMLDivElement;
let banner: HTMLDivElement;
let title: HTMLDivElement;
let description: HTMLDivElement;
let message: HTMLDivElement;
let btnPrevious: HTMLButtonElement;
let btnNext: HTMLButtonElement;

function createPopover() {
    if (document.querySelector('.sl-model')) return;

    popover = document.createElement('div');
    popover.classList.add('sl-model');
    popover.style.display = 'none';

    banner = document.createElement('div');
    banner.setAttribute('type', 'spotlight-banner');
    banner.classList.add('sl-banner');

    title = document.createElement('div');
    title.setAttribute('type', 'spotlight-title');
    title.classList.add('sl-title');

    description = document.createElement('div');
    description.setAttribute('type', 'spotlight-desc');
    description.classList.add('sl-description');

    const footer = document.createElement('div');
    footer.classList.add('sl-footer');

    message = document.createElement('div');
    message.setAttribute('type', 'spotlight-steps');
    message.classList.add('sl-spot');

    btnPrevious = document.createElement('button');
    btnPrevious.setAttribute('type', 'spotlight-button:previous');
    btnPrevious.classList.add('sl-button');
    btnPrevious.textContent = 'Previous';

    btnNext = document.createElement('button');
    btnNext.setAttribute('type', 'spotlight-button:next');
    btnNext.classList.add('sl-button');
    btnNext.textContent = 'Next';

    footer.appendChild(message);
    footer.appendChild(btnPrevious);
    footer.appendChild(btnNext);

    popover.appendChild(banner);
    popover.appendChild(title);
    popover.appendChild(description);
    popover.appendChild(footer);
    document.body.appendChild(popover);
}

export function displayPopover(type: boolean): void {
    createPopover();
    popover.style.display = type ? 'block' : 'none';
}

export function showPopover(position: DOMRect, spot: Spot, index: number, totalComments: number, options: any): void {
    createPopover();

    // Update content
    banner.innerHTML = spot.image ? `<img src="${spot.image}" style="width: 100%; border-radius: ${options.borderRadius}px; margin-bottom: 12px; pointer-events: none;">` : '';
    title.innerHTML = spot.title;
    description.innerHTML = spot.description;

    // Update footer
    message.textContent = `${index + 1} of ${totalComments}`;
    btnPrevious.classList.toggle('hidden', index < 1);
    btnPrevious.textContent = options.previousText || 'Previous';

    if ((index + 1) === totalComments || index < 1) {
        btnNext.classList.add('done');
        btnNext.textContent = index < 1 ? 'Start' : options.doneText || 'Done';
    } else {
        btnNext.classList.remove('done');
        btnNext.textContent = options.nextText || 'Next';
    }

    // Position popover
    const padding = 20;
    popover.style.top = `${position.top + position.height + padding + document.documentElement.scrollTop}px`;
    popover.style.left = `${position.left + document.documentElement.scrollLeft}px`;

    // Show popover
    popover.style.display = 'block';
}

export function setPopoverStyles(options: any): void {
    createPopover();
    popover.style.borderRadius = `${options.modal?.borderRadius || 4}px`;
    popover.style.padding = `${options.modal?.paddingY || 15}px ${options.modal?.paddingX || 15}px`;
    popover.style.maxWidth = `${options.modal?.width || 300}px`;
    popover.style.transition = `all ${options.animationDuration || 300}ms ease`;
    popover.style.backgroundColor = options.modal?.background || '#fcfcfc';
    popover.style.color = options.modal?.text || '#2d2d2d';
    popover.style.border = `${options.modal?.borderWidth || 0}px solid ${options.modal?.borderColor || 'transparent'}`;
    popover.style.boxShadow = `4px 10px ${options.modal?.shadowBlur || 20}px ${options.modal?.shadowColor || 'rgba(0, 0, 0, 0.2)'}`;
    popover.style.gap = `${options.modal?.gap || 16}px`;

    if (options.shadowColor) {
        popover.style.boxShadow = `4px 10px ${options.modal?.shadowBlur || 20}px ${options.shadowColor}`;
    }

    if (options.content?.title) {
        Object.assign(title.style, {
            fontSize: options.content.title.fontSize || '20px',
            fontWeight: options.content.title.fontWeight || '600',
            lineHeight: options.content.title.lineHeight || '1.5',
            letterSpacing: options.content.title.letterSpacing || '0px',
            marginBottom: options.content.title.marginBottom || '0px'
        });
    }

    if (options.content?.description) {
        Object.assign(description.style, {
            fontSize: options.content.description.fontSize || '14px',
            fontWeight: options.content.description.fontWeight || '400',
            lineHeight: options.content.description.lineHeight || '1.5',
            letterSpacing: options.content.description.letterSpacing || '0px',
            marginBottom: options.content.description.marginBottom || '0px'
        });
    }

    if (options.progress) {
        message.style.display = options.progress.enabled ? 'block' : 'none';
        message.style.fontSize = options.progress.fontSize || '13px';
        message.style.fontWeight = options.progress.fontWeight || '400';
        message.style.opacity = options.progress.opacity?.toString() || '0.7';
    }

    if (options.arrow) {
        const arrow = popover.querySelector(':before') as HTMLElement;
        if (arrow) {
            arrow.style.display = options.arrow.enabled ? 'block' : 'none';
            arrow.style.height = `${options.arrow.size || 16}px`;
            arrow.style.width = `${options.arrow.size || 16}px`;
        }
    }
}