import React, { useRef, useEffect } from 'react';
import { useUIStore } from '@/store';

const RULER_SIZE = 20;

function getNiceStep(zoom: number): number {
  const targetPx = 60;
  const contentStep = targetPx / zoom;
  const nice = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
  for (const n of nice) {
    if (n >= contentStep) return n;
  }
  return 1000;
}

export const Rulers: React.FC = () => {
  const hCanvasRef = useRef<HTMLCanvasElement>(null);
  const vCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const zoom = useUIStore((s) => s.view.zoom);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useEffect(() => {
    const hCanvas = hCanvasRef.current;
    const vCanvas = vCanvasRef.current;
    if (!hCanvas || !vCanvas) return;

    const tick = () => {
      const container = document.querySelector('.flex-1.overflow-hidden') as HTMLElement | null;
      const artboard = document.querySelector('#canvas-viewport > div') as HTMLElement | null;
      if (!container || !artboard) return;

      const cr = container.getBoundingClientRect();
      const ar = artboard.getBoundingClientRect();

      hCanvas.width = cr.width;
      hCanvas.height = RULER_SIZE;
      vCanvas.width = RULER_SIZE;
      vCanvas.height = cr.height;

      const hCtx = hCanvas.getContext('2d');
      const vCtx = vCanvas.getContext('2d');
      if (!hCtx || !vCtx) return;

      const dpr = window.devicePixelRatio || 1;
      hCanvas.width = cr.width * dpr;
      hCanvas.height = RULER_SIZE * dpr;
      hCtx.scale(dpr, dpr);
      vCanvas.width = RULER_SIZE * dpr;
      vCanvas.height = cr.height * dpr;
      vCtx.scale(dpr, dpr);

      const imgW = Number(artboard.style.width?.replace('px', '') || 1200);
      const effectiveZoom = imgW > 0 ? ar.width / imgW : zoom;

      const offsetX = ar.left - cr.left;
      const offsetY = ar.top - cr.top;

      // Horizontal ruler
      hCtx.fillStyle = '#2a2a2a';
      hCtx.fillRect(0, 0, cr.width, RULER_SIZE);
      hCtx.strokeStyle = '#444';
      hCtx.lineWidth = 0.5;
      hCtx.beginPath();
      hCtx.moveTo(0, RULER_SIZE - 0.5);
      hCtx.lineTo(cr.width, RULER_SIZE - 0.5);
      hCtx.stroke();

      const hStep = getNiceStep(effectiveZoom);
      const hStart = Math.max(0, Math.floor(-offsetX / effectiveZoom / hStep) * hStep);
      const hEnd = Math.ceil((cr.width - offsetX) / effectiveZoom / hStep) * hStep;

      hCtx.fillStyle = '#999';
      hCtx.font = '9px monospace';
      hCtx.textAlign = 'center';
      hCtx.beginPath();

      for (let c = hStart; c <= hEnd; c += hStep) {
        const sx = offsetX + c * effectiveZoom;
        if (sx < 0 || sx > cr.width) continue;
        const isMajor = Math.round(c / hStep) % 5 === 0;
        hCtx.moveTo(sx, isMajor ? 12 : 16);
        hCtx.lineTo(sx, RULER_SIZE);
        if (isMajor) {
          hCtx.fillText(String(c), sx, 10);
        }
      }
      hCtx.strokeStyle = '#666';
      hCtx.lineWidth = 0.5;
      hCtx.stroke();

      // Cursor indicator on horizontal ruler
      const mx = mouseRef.current.x - cr.left;
      if (mx >= 0 && mx < cr.width) {
        hCtx.strokeStyle = '#ff5555';
        hCtx.lineWidth = 1;
        hCtx.beginPath();
        hCtx.moveTo(mx, 0);
        hCtx.lineTo(mx, RULER_SIZE);
        hCtx.stroke();
        hCtx.beginPath();
        hCtx.moveTo(mx - 3, 4);
        hCtx.lineTo(mx + 3, 4);
        hCtx.lineTo(mx, 9);
        hCtx.closePath();
        hCtx.fillStyle = '#ff5555';
        hCtx.fill();
      }

      // Vertical ruler
      vCtx.fillStyle = '#2a2a2a';
      vCtx.fillRect(0, 0, RULER_SIZE, cr.height);
      vCtx.strokeStyle = '#444';
      vCtx.lineWidth = 0.5;
      vCtx.beginPath();
      vCtx.moveTo(RULER_SIZE - 0.5, 0);
      vCtx.lineTo(RULER_SIZE - 0.5, cr.height);
      vCtx.stroke();

      const vStep = getNiceStep(effectiveZoom);
      const vStart = Math.max(0, Math.floor(-offsetY / effectiveZoom / vStep) * vStep);
      const vEnd = Math.ceil((cr.height - offsetY) / effectiveZoom / vStep) * vStep;

      vCtx.fillStyle = '#999';
      vCtx.font = '9px monospace';
      vCtx.textAlign = 'right';
      vCtx.beginPath();

      for (let c = vStart; c <= vEnd; c += vStep) {
        const sy = offsetY + c * effectiveZoom;
        if (sy < 0 || sy > cr.height) continue;
        const isMajor = Math.round(c / vStep) % 5 === 0;
        vCtx.moveTo(isMajor ? 12 : 16, sy);
        vCtx.lineTo(RULER_SIZE, sy);
        if (isMajor) {
          vCtx.fillText(String(c), RULER_SIZE - 2, sy + 3);
        }
      }
      vCtx.strokeStyle = '#666';
      vCtx.lineWidth = 0.5;
      vCtx.stroke();

      // Cursor indicator on vertical ruler
      const my = mouseRef.current.y - cr.top;
      if (my >= 0 && my < cr.height) {
        vCtx.strokeStyle = '#ff5555';
        vCtx.lineWidth = 1;
        vCtx.beginPath();
        vCtx.moveTo(0, my);
        vCtx.lineTo(RULER_SIZE, my);
        vCtx.stroke();
        vCtx.beginPath();
        vCtx.moveTo(4, my - 3);
        vCtx.lineTo(4, my + 3);
        vCtx.lineTo(9, my);
        vCtx.closePath();
        vCtx.fillStyle = '#ff5555';
        vCtx.fill();
      }
    };

    const loop = () => {
      tick();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [zoom]);

  return (
    <>
      <canvas
        ref={hCanvasRef}
        className="absolute top-0 left-0 z-30 pointer-events-none"
        style={{ width: '100%', height: RULER_SIZE }}
      />
      <canvas
        ref={vCanvasRef}
        className="absolute top-0 left-0 z-30 pointer-events-none"
        style={{ width: RULER_SIZE, height: '100%' }}
      />
    </>
  );
};
