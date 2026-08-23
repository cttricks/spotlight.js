import { SpotlightOptions } from '../types/spotlight.types.js';

const imagePattern = /\.(jpeg|jpg|gif|png|svg|bmp|webp)$/i;

export async function hexToRGBA(hex: string, alpha: number): Promise<string | null> {
    const sudoElm = document.createElement('div');
    sudoElm.style.color = hex;
    if (sudoElm.style.color.length < 1) return null;
    return sudoElm.style.color.toString().replace('rgb', 'rgba').replace(')', `, ${alpha})`);
}

export async function scrollTo(top: number): Promise<void> {
    return new Promise((resolve) => {
        let isScrolling: number | null = null;
        let scrollDetected = false;

        const onScroll = () => {
            scrollDetected = true;
            if (isScrolling !== null) window.clearTimeout(isScrolling);
            isScrolling = window.setTimeout(() => {
                resolve();
                window.removeEventListener('scroll', onScroll);
            }, 150);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.scrollTo({
            top: (top - 100 + document.documentElement.scrollTop),
            behavior: 'smooth'
        });

        setTimeout(() => {
            if (!scrollDetected) {
                resolve();
                window.removeEventListener('scroll', onScroll);
            }
        }, 300);
    });
}

export async function parseComment(spotValueIn: any): Promise<any> {
    if (spotValueIn.nodeValue === null) return null;
    spotValueIn.nodeValue = spotValueIn.nodeValue.split(';').join('\n');
    let spotValue = spotValueIn.nodeValue.split('\n').map((data: string) => data.replace(/\s{2,}/g, ' ').trim()).filter((data: string) => data.length > 1);

    if (spotValue[0].length < 1 || !spotValue[0].toUpperCase().startsWith('SPOTLIGHT')) return null;

    let targetElement = spotValueIn.nextSibling;
    if (targetElement === null) return null;
    if (targetElement.nodeName === '#text') targetElement = targetElement.nextSibling;
    if (targetElement === null || targetElement.nodeName === '#text' || !(targetElement instanceof Element)) return null;

    let data = {
        index: 9999,
        image: '',
        title: '',
        description: '',
        element: targetElement
    };

    if (spotValue[0].includes('#')) {
        let index = parseInt(spotValue[0].split('#')[1]);
        data.index = isNaN(index) ? 0 : index;
    }

    spotValue.shift();
    if (spotValue.length > 0 && imagePattern.test(spotValue[0])) {
        data.image = spotValue[0];
        spotValue.shift();
    }
    if (spotValue.length > 0) {
        data.title = spotValue[0];
        spotValue.shift();
    }
    if (spotValue.length > 0) {
        data.description = spotValue[0];
    }
    if (data.description.length < 1 && data.title.length > 0) {
        data.description = data.title;
        data.title = '';
    }
    return data;
}

export async function bodyScroll(enable: boolean = true): Promise<void> {
    document.body.style.overflow = enable ? 'auto' : 'hidden';
}