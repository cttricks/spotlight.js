let svg = document.getElementById('spotlight-cover') as unknown as SVGSVGElement;
let rectOverlay: SVGRectElement;
let rectSpotlight: SVGRectElement;
let rectBorder: SVGRectElement;

function createOverlay() {
    if (document.getElementById('spotlight-cover')) return;

    const newSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    newSvg.setAttribute("id", "spotlight-cover");
    newSvg.setAttribute("width", "100vw");
    newSvg.setAttribute("height", "100vh");
    newSvg.setAttribute("style", "position:fixed;top:0;left:0;z-index:9998;display:none;pointer-events:none;");
    
    const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
    mask.setAttribute("id", "clipped-region");

    const rectWhite = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rectWhite.setAttribute("width", "100%");
    rectWhite.setAttribute("height", "100%");
    rectWhite.setAttribute("fill", "#fff");

    rectSpotlight = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rectSpotlight.setAttribute("id", "spotlight-rect");
    rectSpotlight.setAttribute("rx", "4"); // Default radius
    
    mask.appendChild(rectWhite);
    mask.appendChild(rectSpotlight);

    rectOverlay = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rectOverlay.setAttribute("type", "spotlight-button:exit");
    rectOverlay.setAttribute("width", "100%");
    rectOverlay.setAttribute("height", "100%");
    rectOverlay.setAttribute("fill", "rgba(0, 0, 0, 0.5)");
    rectOverlay.setAttribute("mask", "url(#clipped-region)");
    rectOverlay.setAttribute("style", "pointer-events: auto;");

    rectBorder = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rectBorder.setAttribute("fill", "none");
    rectBorder.setAttribute("stroke", "#ffce5c");
    rectBorder.setAttribute("stroke-width", "3");
    rectBorder.setAttribute("rx", "4");

    newSvg.appendChild(mask);
    newSvg.appendChild(rectOverlay);
    newSvg.appendChild(rectBorder);
    document.body.appendChild(newSvg);
    svg = newSvg;
}

export function displayCover(type: boolean): void {
    createOverlay();
    svg.style.display = type ? 'block' : 'none';
}

export function setCoverBg(color: string): void {
    createOverlay();
    rectOverlay.setAttribute('fill', color);
}

export function setStroke(color: string): void {
    createOverlay();
    rectBorder.setAttribute("stroke", color);
}

export function setStrokeWidth(width: number): void {
    createOverlay();
    rectBorder.setAttribute("stroke-width", width.toString());
}

export function setHighlightRadius(radius: number): void {
    createOverlay();
    rectSpotlight.setAttribute("rx", radius.toString());
    rectBorder.setAttribute("rx", radius.toString());
}

export function hilight(position: DOMRect): void {
    createOverlay();
    const padding = 5;
    const x = position.x - padding;
    const y = position.y - padding;
    const width = position.width + (padding * 2);
    const height = position.height + (padding * 2);

    rectSpotlight.setAttribute('x', x.toString());
    rectSpotlight.setAttribute('y', y.toString());
    rectSpotlight.setAttribute('width', width.toString());
    rectSpotlight.setAttribute('height', height.toString());

    rectBorder.setAttribute('x', x.toString());
    rectBorder.setAttribute('y', y.toString());
    rectBorder.setAttribute('width', width.toString());
    rectBorder.setAttribute('height', height.toString());

    svg.style.display = 'block';
}