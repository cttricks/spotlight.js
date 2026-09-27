import { PopoverPosition } from '../types/spotlight.types.js';

export interface PositionResult {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
  arrowOffsetPercent: number;
  arrowOffsetPx: number;
}

export function computePopoverPosition(
  targetRect: DOMRect,
  popoverWidth: number,
  popoverHeight: number,
  preferredPosition: PopoverPosition = 'auto',
  offset: number = 14,
  viewportMargin: number = 16
): PositionResult {
  const vWidth = window.innerWidth;
  const vHeight = window.innerHeight;

  // Space available on all 4 sides of the target element in the viewport
  const spaceAbove = targetRect.top - offset - viewportMargin;
  const spaceBelow = vHeight - targetRect.bottom - offset - viewportMargin;
  const spaceLeft = targetRect.left - offset - viewportMargin;
  const spaceRight = vWidth - targetRect.right - offset - viewportMargin;

  let placement: 'top' | 'bottom' | 'left' | 'right';

  if (preferredPosition !== 'auto') {
    // Check if preferred position has enough space
    if (preferredPosition === 'bottom' && spaceBelow >= popoverHeight) {
      placement = 'bottom';
    } else if (preferredPosition === 'top' && spaceAbove >= popoverHeight) {
      placement = 'top';
    } else if (preferredPosition === 'right' && spaceRight >= popoverWidth) {
      placement = 'right';
    } else if (preferredPosition === 'left' && spaceLeft >= popoverWidth) {
      placement = 'left';
    } else {
      // Auto-flip: pick the side with the most space
      const verticalFits = spaceBelow >= popoverHeight || spaceAbove >= popoverHeight;
      if (verticalFits) {
        placement = spaceBelow >= spaceAbove ? 'bottom' : 'top';
      } else {
        placement = spaceRight >= spaceLeft ? 'right' : 'left';
      }
    }
  } else {
    // Auto: prioritize bottom, then top, then right, then left
    if (spaceBelow >= popoverHeight) {
      placement = 'bottom';
    } else if (spaceAbove >= popoverHeight) {
      placement = 'top';
    } else if (spaceRight >= popoverWidth) {
      placement = 'right';
    } else if (spaceLeft >= popoverWidth) {
      placement = 'left';
    } else {
      placement = spaceBelow >= spaceAbove ? 'bottom' : 'top';
    }
  }

  let top = 0;
  let left = 0;

  if (placement === 'bottom') {
    top = targetRect.bottom + offset;
    left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
  } else if (placement === 'top') {
    top = targetRect.top - offset - popoverHeight;
    left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
  } else if (placement === 'right') {
    left = targetRect.right + offset;
    top = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
  } else {
    // left
    left = targetRect.left - offset - popoverWidth;
    top = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
  }

  // Viewport containment: clamp coordinates so popover never leaves viewport
  const maxLeft = vWidth - popoverWidth - viewportMargin;
  const minLeft = viewportMargin;
  left = Math.max(minLeft, Math.min(left, maxLeft));

  const maxTop = vHeight - popoverHeight - viewportMargin;
  const minTop = viewportMargin;
  top = Math.max(minTop, Math.min(top, maxTop));

  // Compute arrow offset tracking the target element center
  let arrowOffsetPx = 0;
  let arrowOffsetPercent = 50;

  if (placement === 'top' || placement === 'bottom') {
    const targetCenterX = targetRect.left + targetRect.width / 2;
    arrowOffsetPx = targetCenterX - left;
    // Clamp arrow inside popover boundaries (padding 20px for rounded corners)
    arrowOffsetPx = Math.max(20, Math.min(arrowOffsetPx, popoverWidth - 20));
    arrowOffsetPercent = (arrowOffsetPx / popoverWidth) * 100;
  } else {
    const targetCenterY = targetRect.top + targetRect.height / 2;
    arrowOffsetPx = targetCenterY - top;
    arrowOffsetPx = Math.max(20, Math.min(arrowOffsetPx, popoverHeight - 20));
    arrowOffsetPercent = (arrowOffsetPx / popoverHeight) * 100;
  }

  return {
    top,
    left,
    placement,
    arrowOffsetPercent,
    arrowOffsetPx
  };
}
