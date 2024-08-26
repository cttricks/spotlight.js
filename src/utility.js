const imagePattern = /\.(jpeg|jpg|gif|png|svg|bmp|webp)$/i;

export async function hexToRGBA(hex, alpha) {
    let sudoElm = document.createElement('div');
    sudoElm.style.color = hex;

    // Check for valid color value
    if (sudoElm.style.color.length < 1) return null;

    // Include alpha & return color
    return sudoElm.style.color.toString().replace('rgb', 'rgba').replace(')', `, ${alpha})`);
}

export async function scrollTo(top) {
    return new Promise((resolve) => {
        let isScrolling;
        let scrollDetected = false;

        const onScroll = () => {
            scrollDetected = true;
            window.clearTimeout(isScrolling);
            isScrolling = setTimeout(() => {
                resolve();
                window.removeEventListener('scroll', onScroll);
            }, 150);
        };

        // Add the scroll event listener
        window.addEventListener('scroll', onScroll, { passive: true });

        // Trigger the scroll
        window.scrollTo({
            top: (top - 79 + document.documentElement.scrollTop),
            behavior: 'smooth'
        });

        // Fallback timeout to resolve the promise if no scroll happens
        setTimeout(() => {
            if (!scrollDetected) {
                resolve();
                window.removeEventListener('scroll', onScroll);
            }
        }, 300);

    });
}

export async function parseComment(spotValueIn) {
    // Convert single line coments to multi-line
    spotValueIn.nodeValue = spotValueIn.nodeValue.split(';').join('\n');

    // Get spotValue as clean array
    let spotValue = spotValueIn.nodeValue.split('\n').map(data => { return data.replace(/\s{2,}/g, ' ').trim(); }).filter(data => data.length > 1);

    // Check if this sport is assigned to spotlight
    if (spotValue[0].length < 1 || !spotValue[0].toUpperCase().startsWith('SPOTLIGHT')) return null;

    // Get Element to hilight for this spotValue
    let targetElement = spotValueIn.nextSibling;
    if (targetElement.nodeName === '#text') targetElement = spotValueIn.nextSibling.nextSibling;
    if (targetElement.nodeName === '#text') return null;

    // Create an object of this spot
    let data = {
        index: 9999,
        image: '',
        title: '',
        description: '',
        element: targetElement
    };

    // Format data to get index at which this element is set to display;
    if (spotValue[0].includes('#')) {
        let index = parseInt(spotValue[0].split('#')[1]);
        index = isNaN(index) ? 0 : index;
        data.index = index;
    }

    spotValue.shift();

    // Get image if given as path or link
    if (spotValue.length > 0 && imagePattern.test(spotValue[0])) {
        data.image = spotValue[0];
        spotValue.shift();
    }

    // Get title
    if (spotValue.length > 0) {
        data.title = spotValue[0];
        spotValue.shift();
    }

    // Get description
    if (spotValue.length > 0) {
        data.description = spotValue[0];
    }

    // In case only title is there, 
    // Then make it description and keep the title blank
    if (data.description.length < 1 && data.title.length > 0) {
        data.description = data.title;
        data.title = '';
    }

    return data;
}

export async function bodyScroll(enable = true){
    document.body.style.overflow = (enable) ? 'auto' : 'hidden';
}