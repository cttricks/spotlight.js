// Compose SVG
// This will be our cover & elemnt highlighter

const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("id", "spotlight-cover");
svg.setAttribute("width", "100vw");
svg.setAttribute("height", "100vh");
svg.setAttribute("style", "position:fixed;top:0;left:0;z-index:999;display:none");
svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

// Create the mask element
const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
mask.setAttribute("id", "clipped-region");

// Create the white rectangle for the mask
const rectWhite = document.createElementNS("http://www.w3.org/2000/svg", "rect");
rectWhite.setAttribute("width", "100%");
rectWhite.setAttribute("height", "100%");
rectWhite.setAttribute("fill", "#fff");

// Create the small rectangle inside the mask (spotlight area)
const rectSpotlight = document.createElementNS("http://www.w3.org/2000/svg", "rect");
rectSpotlight.setAttribute("id", "spotlight-rect");
rectSpotlight.setAttribute("x", "0");
rectSpotlight.setAttribute("y", "0");
rectSpotlight.setAttribute("width", "0");
rectSpotlight.setAttribute("height", "0");

// Append rectangles to the mask
mask.appendChild(rectWhite);
mask.appendChild(rectSpotlight);

// Create the dark overlay rectangle
const rectOverlay = document.createElementNS("http://www.w3.org/2000/svg", "rect");
rectOverlay.setAttribute("type", "spotlight-button:exit");
rectOverlay.setAttribute("width", "100%");
rectOverlay.setAttribute("height", "100%");
rectOverlay.setAttribute("fill", "rgba(0, 0, 0, 0.5)");
rectOverlay.setAttribute("mask", "url(#clipped-region)");

// Create the border rectangle for the spotlight
const rectBorder = document.createElementNS("http://www.w3.org/2000/svg", "rect");
rectBorder.setAttribute("x", "0");
rectBorder.setAttribute("y", "0");
rectBorder.setAttribute("width", "0");
rectBorder.setAttribute("height", "0");
rectBorder.setAttribute("fill", "none");
rectBorder.setAttribute("stroke", "#ffce5c");
rectBorder.setAttribute("stroke-width", "3");

// Append all elements to the SVG
svg.appendChild(mask);
svg.appendChild(rectOverlay);
svg.appendChild(rectBorder);

// Append the SVG to the body
document.body.appendChild(svg);

export function displayCover(type) {
    svg.style.display = (type) ? 'block' : 'none';
}

export function setCoverBg(color) {
    rectOverlay.setAttribute('fill', color);
}

export function setStroke(color) {
    rectBorder.setAttribute("stroke", color);
}

export function hilight(position) {
    rectSpotlight.setAttribute('x', (position.x - 5));
    rectSpotlight.setAttribute('y', (position.y - 5));
    rectSpotlight.setAttribute('width', (position.width + 10));
    rectSpotlight.setAttribute('height', (position.height + 10));

    rectBorder.setAttribute('x', (position.x - 5));
    rectBorder.setAttribute('y', (position.y - 5));
    rectBorder.setAttribute('width', (position.width + 10));
    rectBorder.setAttribute('height', (position.height + 10));

    svg.style.display = 'block';
}