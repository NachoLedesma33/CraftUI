import React, { useEffect, useRef } from 'react';
import { subscribeToGuides } from '@/utils/snapGuides';
import type { SnapGuide } from '@/utils/snapGuides';

export const SnapGuideOverlay: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const ns = 'http://www.w3.org/2000/svg';

    const update = (guides: SnapGuide[]) => {
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      for (const guide of guides) {
        const line = document.createElementNS(ns, 'line');
        if (guide.axis === 'x') {
          line.setAttribute('x1', String(guide.position));
          line.setAttribute('y1', '0');
          line.setAttribute('x2', String(guide.position));
          line.setAttribute('y2', '100%');
        } else {
          line.setAttribute('x1', '0');
          line.setAttribute('y1', String(guide.position));
          line.setAttribute('x2', '100%');
          line.setAttribute('y2', String(guide.position));
        }
        line.setAttribute('stroke', '#ff5555');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-dasharray', '4 2');
        line.style.pointerEvents = 'none';
        svg.appendChild(line);
      }
    };

    const unsub = subscribeToGuides(update);
    return unsub;
  }, []);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none z-40"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
