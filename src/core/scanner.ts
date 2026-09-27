import { SpotStep } from '../types/spotlight.types.js';

const imagePattern = /\.(jpeg|jpg|gif|png|svg|bmp|webp)$/i;

/**
 * Parses legacy comment nodes: <!-- SPOTLIGHT#1; Title; Description -->
 */
function parseLegacyComment(node: Comment): SpotStep | null {
  if (!node.nodeValue) return null;
  const content = node.nodeValue.replace(/;/g, '\n');
  const lines = content
    .split('\n')
    .map((s) => s.replace(/\s{2,}/g, ' ').trim())
    .filter((s) => s.length > 1);

  if (lines.length === 0 || !lines[0].toUpperCase().startsWith('SPOTLIGHT')) {
    return null;
  }

  let targetEl: Node | null = node.nextSibling;
  while (targetEl && targetEl.nodeType !== Node.ELEMENT_NODE) {
    targetEl = targetEl.nextSibling;
  }
  if (!targetEl || !(targetEl instanceof HTMLElement)) return null;

  let index = 9999;
  if (lines[0].includes('#')) {
    const parsed = parseInt(lines[0].split('#')[1], 10);
    if (!isNaN(parsed)) index = parsed;
  }
  lines.shift();

  let media = '';
  if (lines.length > 0 && imagePattern.test(lines[0])) {
    media = lines.shift() || '';
  }

  let title = '';
  if (lines.length > 0) {
    title = lines.shift() || '';
  }

  let summary = '';
  if (lines.length > 0) {
    summary = lines.join(' ');
  }

  if (!summary && title) {
    summary = title;
    title = '';
  }

  return {
    id: index,
    order: index,
    title,
    summary,
    media,
    element: targetEl,
    target: targetEl
  };
}

/**
 * Scans the DOM for data-spot-* decorated elements, legacy comments,
 * and merges them with programmatic steps.
 */
export function scanElements(
  root: Document | HTMLElement = document,
  options: {
    group?: string;
    programmaticSteps?: SpotStep[];
    includeLegacyComments?: boolean;
  } = {}
): SpotStep[] {
  if (typeof window === 'undefined' || !root) return [];

  const targetGroup = options.group || 'default';
  const declarativeSteps: SpotStep[] = [];

  // 1. Scan modern data-spot-* attributes
  const elements = root.querySelectorAll<HTMLElement>(
    '[data-spot-name], [data-spot-summary], [data-spot-id], [data-spot-title], [data-spot-desc]'
  );

  elements.forEach((el, domIndex) => {
    // Check group
    const group = el.getAttribute('data-spot-group') || 'default';
    if (group !== targetGroup && targetGroup !== '*') return;

    // Attributes
    const idAttr = el.getAttribute('data-spot-id');
    const name = el.getAttribute('data-spot-name') || el.getAttribute('data-spot-title') || '';
    const summary = el.getAttribute('data-spot-summary') || el.getAttribute('data-spot-desc') || '';
    const media = el.getAttribute('data-spot-media') || undefined;
    const position = (el.getAttribute('data-spot-position') as any) || 'auto';
    const paddingAttr = el.getAttribute('data-spot-padding');
    const radiusAttr = el.getAttribute('data-spot-radius');
    const orderAttr = el.getAttribute('data-spot-order');

    let numericOrder: number | undefined;
    if (orderAttr !== null && !isNaN(Number(orderAttr))) {
      numericOrder = Number(orderAttr);
    } else if (idAttr !== null && !isNaN(Number(idAttr))) {
      numericOrder = Number(idAttr);
    }

    const padding = paddingAttr !== null && !isNaN(Number(paddingAttr)) ? Number(paddingAttr) : undefined;
    const radius = radiusAttr !== null && !isNaN(Number(radiusAttr)) ? Number(radiusAttr) : undefined;

    declarativeSteps.push({
      id: idAttr || `spot-${domIndex + 1}`,
      title: name,
      summary,
      media,
      position,
      padding,
      radius,
      group,
      order: numericOrder !== undefined ? numericOrder : 1000 + domIndex,
      element: el,
      target: el
    });
  });

  // 2. Scan legacy HTML comments if enabled
  if (options.includeLegacyComments !== false && typeof document !== 'undefined') {
    const iterator = document.createNodeIterator(
      root instanceof Document ? root.body : root,
      NodeFilter.SHOW_COMMENT,
      null
    );

    let currentNode: Node | null;
    while ((currentNode = iterator.nextNode()) !== null) {
      const legacyStep = parseLegacyComment(currentNode as Comment);
      if (legacyStep && legacyStep.element) {
        // Only add if not already targeted by a data-spot element
        const alreadyExists = declarativeSteps.some((s) => s.element === legacyStep.element);
        if (!alreadyExists) {
          declarativeSteps.push(legacyStep);
        }
      }
    }
  }

  // 3. Process programmatic steps
  const programmatic: SpotStep[] = [];
  if (options.programmaticSteps && Array.isArray(options.programmaticSteps)) {
    options.programmaticSteps.forEach((step, idx) => {
      let resolvedElement: HTMLElement | null = null;
      if (step.element instanceof HTMLElement) {
        resolvedElement = step.element;
      } else if (typeof step.target === 'string') {
        resolvedElement = document.querySelector<HTMLElement>(step.target);
      } else if (step.target instanceof HTMLElement) {
        resolvedElement = step.target;
      }

      if (resolvedElement) {
        programmatic.push({
          ...step,
          id: step.id ?? `prog-step-${idx + 1}`,
          order: step.order ?? (typeof step.id === 'number' ? step.id : idx + 1),
          element: resolvedElement,
          target: resolvedElement
        });
      }
    });
  }

  // 4. Merge declarative and programmatic steps
  // Programmatic steps take precedence if they share the same element or ID
  const merged: SpotStep[] = [...declarativeSteps];

  for (const prog of programmatic) {
    const existingIndex = merged.findIndex(
      (s) => s.element === prog.element || (prog.id && s.id === prog.id)
    );
    if (existingIndex !== -1) {
      merged[existingIndex] = { ...merged[existingIndex], ...prog };
    } else {
      merged.push(prog);
    }
  }

  // 5. Filter out detached or invisible elements
  const visible = merged.filter((step) => {
    if (!step.element || !step.element.isConnected) return false;
    const rect = step.element.getBoundingClientRect();
    // Element must have some render footprint or be inside document
    return rect.width > 0 || rect.height > 0 || step.element.getClientRects().length > 0;
  });

  // 6. Sort in ascending order
  visible.sort((a, b) => {
    const orderA = a.order ?? 9999;
    const orderB = b.order ?? 9999;
    return orderA - orderB;
  });

  // Assign index
  return visible.map((step, idx) => ({ ...step, index: idx }));
}
