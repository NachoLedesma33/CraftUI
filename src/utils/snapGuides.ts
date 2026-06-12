export interface SnapGuide {
  axis: 'x' | 'y';
  position: number;
}

export interface SnapResult {
  offsetX: number;
  offsetY: number;
  guides: SnapGuide[];
}

export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

export function getElementBounds(el: HTMLElement): Bounds {
  const r = el.getBoundingClientRect();
  return rectToBounds(r);
}

export function rectToBounds(r: DOMRect | { left: number; top: number; right: number; bottom: number; width: number; height: number }): Bounds {
  return {
    left: r.left,
    top: r.top,
    right: r.right,
    bottom: r.bottom,
    centerX: r.left + r.width / 2,
    centerY: r.top + r.height / 2,
  };
}

const DEFAULT_THRESHOLD = 5;

export function findSnapGuides(
  draggedBounds: Bounds,
  siblingEls: HTMLElement[],
  containerEl: HTMLElement,
  threshold = DEFAULT_THRESHOLD,
): SnapResult {
  const dragged = draggedBounds;
  const containerRect = containerEl.getBoundingClientRect();
  let offsetX = 0;
  let offsetY = 0;
  const guides: SnapGuide[] = [];

  for (const sibling of siblingEls) {
    if (!sibling.isConnected) continue;
    const sib = getElementBounds(sibling);

    // X-axis alignments
    if (Math.abs(dragged.left - sib.left) < threshold) {
      offsetX = sib.left - dragged.left;
      guides.push({ axis: 'x', position: sib.left - containerRect.left });
    } else if (Math.abs(dragged.right - sib.right) < threshold) {
      offsetX = sib.right - dragged.right;
      guides.push({ axis: 'x', position: sib.right - containerRect.left });
    } else if (Math.abs(dragged.left - sib.right) < threshold) {
      offsetX = sib.right - dragged.left;
      guides.push({ axis: 'x', position: sib.right - containerRect.left });
    } else if (Math.abs(dragged.right - sib.left) < threshold) {
      offsetX = sib.left - dragged.right;
      guides.push({ axis: 'x', position: sib.left - containerRect.left });
    } else if (Math.abs(dragged.centerX - sib.centerX) < threshold) {
      offsetX = sib.centerX - dragged.centerX;
      guides.push({ axis: 'x', position: sib.centerX - containerRect.left });
    }

    // Y-axis alignments
    if (Math.abs(dragged.top - sib.top) < threshold) {
      offsetY = sib.top - dragged.top;
      guides.push({ axis: 'y', position: sib.top - containerRect.top });
    } else if (Math.abs(dragged.bottom - sib.bottom) < threshold) {
      offsetY = sib.bottom - dragged.bottom;
      guides.push({ axis: 'y', position: sib.bottom - containerRect.top });
    } else if (Math.abs(dragged.top - sib.bottom) < threshold) {
      offsetY = sib.bottom - dragged.top;
      guides.push({ axis: 'y', position: sib.bottom - containerRect.top });
    } else if (Math.abs(dragged.bottom - sib.top) < threshold) {
      offsetY = sib.top - dragged.bottom;
      guides.push({ axis: 'y', position: sib.top - containerRect.top });
    } else if (Math.abs(dragged.centerY - sib.centerY) < threshold) {
      offsetY = sib.centerY - dragged.centerY;
      guides.push({ axis: 'y', position: sib.centerY - containerRect.top });
    }
  }

  return { offsetX, offsetY, guides };
}

// Simple pub/sub to avoid zustand re-renders during mousemove
type Listener = (guides: SnapGuide[]) => void;
let currentGuides: SnapGuide[] = [];
const listeners: Set<Listener> = new Set();

export function showGuides(guides: SnapGuide[]) {
  currentGuides = guides;
  listeners.forEach((l) => l(guides));
}

export function hideGuides() {
  currentGuides = [];
  listeners.forEach((l) => l([]));
}

export function subscribeToGuides(listener: Listener) {
  listeners.add(listener);
  listener(currentGuides);
  return () => { listeners.delete(listener); };
}
