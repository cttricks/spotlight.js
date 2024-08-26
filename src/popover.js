// Compose default popover
// It'll be displayed when an element is hilighted

let popover = document.createElement('div');
popover.classList.add('sl-model');
popover.style.display = 'none';

// Create the spotlight banner div
const banner = document.createElement('div');
banner.setAttribute('type', 'spotlight-banner');
banner.classList.add('sl-banner');

// Create the spotlight title div
const title = document.createElement('div');
title.setAttribute('type', 'spotlight-title');
title.classList.add('sl-title');
title.textContent = "";

// Create the spotlight description div
const description = document.createElement('div');
description.setAttribute('type', 'spotlight-desc');
description.classList.add('sl-description');
description.textContent = "";

// Create the spotlight footer div
const footer = document.createElement('div');
footer.classList.add('sl-footer');

// Create the spotlight steps div
const message = document.createElement('div');
message.setAttribute('type', 'spotlight-steps');
message.classList.add('sl-spot');
message.textContent = "";

// Create the previous button
const btnPrevious = document.createElement('button');
btnPrevious.setAttribute('type', 'spotlight-button:previous');
btnPrevious.classList.add('sl-button');
btnPrevious.textContent = "Previous";

// Create the next button
const btnNext = document.createElement('button');
btnNext.setAttribute('type', 'spotlight-button:next');
btnNext.classList.add('sl-button');
btnNext.textContent = "Next";

// Append the steps and buttons to the footer
footer.appendChild(message);
footer.appendChild(btnPrevious);
footer.appendChild(btnNext);

// Append banner, title, descritpion & footer to the popover
popover.appendChild(banner);
popover.appendChild(title);
popover.appendChild(description);
popover.appendChild(footer);

// Append popover in to the DOM
document.body.appendChild(popover);

export function displayPopover(type) {
    popover.style.display = (type) ? 'block' : 'none';
}

export function showPopover(position, spot, index, totalComments) {

    // Update Body
    banner.innerHTML = (spot.image.length < 1) ? '' : `<img src="${spot.image}" style="width: 100%; border-radius: 4px; margin-bottom: 12px; pointer-events: none;">`;
    title.innerHTML = spot.title;
    description.innerHTML = spot.description;

    // Update Footer
    message.textContent = `${(index + 1)} of ${totalComments}`;
    btnPrevious.classList.toggle('hidden', (index < 1));

    if ((index + 1) === totalComments || index < 1) {
        btnNext.classList.add('done');
        btnNext.innerHTML = (index < 1) ? 'Start' : 'Done';
    } else {
        btnNext.classList.remove('done');
        btnNext.innerHTML = 'Next';
    }

    // Updated position
    popover.style.top = `${(position.top + position.height + 20 + document.documentElement.scrollTop)}px`;
    popover.style.left = `${(position.left + document.documentElement.scrollLeft - 5)}px`;

    // Show updated popupover
    popover.style.display = 'block';

}