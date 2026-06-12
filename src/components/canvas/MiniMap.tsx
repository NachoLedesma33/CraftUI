import React, { useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '@/store';
import { useUIStore } from '@/store';

const WIDTH = 200;
const HEIGHT = 130;
const BORDER = 2;

const TYPE_COLORS: Record<string, string> = {
  box: '#fbbf24',
  text: '#60a5fa',
  button: '#a78bfa',
  image: '#34d399',
  container: '#f59e0b',
  flex: '#06b6d4',
  grid: '#ec4899',
};

const TYPE_ALPHA: Record<string, string> = {
  box: '0.6',
  text: '0.4',
  button: '0.7',
  image: '0.5',
  container: '0.3',
  flex: '0.3',
  grid: '0.3',
};

export const MiniMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const components = useEditorStore((s) => s.components);
  const rootId = useEditorStore((s) => s.rootId);
  const canvasConfig = useEditorStore((s) => s.canvasConfig);
  const view = useUIStore((s) => s.view);
  const setPan = useUIStore((s) => s.setPan);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const getDeviceWidth = useCallback((device: 'mobile' | 'tablet' | 'desktop'): number => {
    switch (device) {
      case 'mobile': return 375;
      case 'tablet': return 768;
      case 'desktop': return 1200;
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = document.querySelector('.flex-1.overflow-hidden') as HTMLElement | null;
    const artboard = document.querySelector('#canvas-viewport > div') as HTMLElement | null;
    if (!container || !artboard) return;

    const deviceWidth = getDeviceWidth(view.activeDevice);
    const contentW = deviceWidth;
    const contentH = Math.max(canvasConfig.height, 400);

    const artboardRect = artboard.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const scaleX = (WIDTH - BORDER * 2) / contentW;
    const scaleY = (HEIGHT - BORDER * 2) / contentH;
    const scale = Math.min(scaleX, scaleY, 1);

    const offsetX = BORDER + ((WIDTH - BORDER * 2) - contentW * scale) / 2;
    const offsetY = BORDER + ((HEIGHT - BORDER * 2) - contentH * scale) / 2;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = 'var(--bg-secondary, #2a2a2a)';
    ctx.fillRect(offsetX, offsetY, contentW * scale, contentH * scale);

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(offsetX, offsetY, contentW * scale, contentH * scale);

    const compIds = Object.keys(components).filter((id) => id !== rootId);
    for (const id of compIds) {
      const el = document.querySelector(`[data-component-id="${id}"]`) as HTMLElement | null;
      if (!el) continue;

      const rect = el.getBoundingClientRect();
      const rx = (rect.left - artboardRect.left) * scale + offsetX;
      const ry = (rect.top - artboardRect.top) * scale + offsetY;
      const rw = rect.width * scale;
      const rh = rect.height * scale;

      if (rw < 2 || rh < 2) continue;

      const comp = components[id];
      const color = TYPE_COLORS[comp?.type] || '#888';
      const alpha = TYPE_ALPHA[comp?.type] || '0.4';

      ctx.fillStyle = color + alpha;
      ctx.fillRect(rx, ry, Math.max(rw, 2), Math.max(rh, 2));
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(rx, ry, Math.max(rw, 2), Math.max(rh, 2));
    }

    const vpLeft = Math.max(artboardRect.left, containerRect.left);
    const vpTop = Math.max(artboardRect.top, containerRect.top);
    const vpRight = Math.min(artboardRect.right, containerRect.right);
    const vpBottom = Math.min(artboardRect.bottom, containerRect.bottom);

    if (vpLeft < vpRight && vpTop < vpBottom) {
      const vrx = (vpLeft - artboardRect.left) * scale + offsetX;
      const vry = (vpTop - artboardRect.top) * scale + offsetY;
      const vrw = (vpRight - vpLeft) * scale;
      const vrh = (vpBottom - vpTop) * scale;

      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(vrx, vry, vrw, vrh);

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(vrx, vry, vrw, vrh);
    }
  }, [components, rootId, canvasConfig, view, getDeviceWidth]);

  useEffect(() => {
    const tick = () => {
      draw();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const artboard = document.querySelector('#canvas-viewport > div') as HTMLElement | null;
    const container = document.querySelector('.flex-1.overflow-hidden') as HTMLElement | null;
    if (!artboard || !container) return;

    const deviceWidth = getDeviceWidth(view.activeDevice);
    const contentH = Math.max(canvasConfig.height, 400);
    const scaleX = (WIDTH - BORDER * 2) / deviceWidth;
    const scaleY = (HEIGHT - BORDER * 2) / contentH;
    const scale = Math.min(scaleX, scaleY, 1);
    const offsetX = BORDER + ((WIDTH - BORDER * 2) - deviceWidth * scale) / 2;

    const containerRect = container.getBoundingClientRect();

    const mx = (e.clientX - containerRect.left - offsetX) / scale;
    const my = (e.clientY - containerRect.top - BORDER) / scale;

    const newPanX = -(mx - containerRect.width / 2 / view.zoom);
    const newPanY = -(my - containerRect.height / 2 / view.zoom);

    setPan(newPanX, newPanY);
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  }, [view, canvasConfig, getDeviceWidth, setPan]);

  useEffect(() => {
    if (!isDragging.current) return;
    const handleMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const container = document.querySelector('.flex-1.overflow-hidden') as HTMLElement | null;
      const artboard = document.querySelector('#canvas-viewport > div') as HTMLElement | null;
      if (!container || !artboard) return;

      const deviceWidth = getDeviceWidth(view.activeDevice);
      const contentH = Math.max(canvasConfig.height, 400);
      const scaleX = (WIDTH - BORDER * 2) / deviceWidth;
      const scaleY = (HEIGHT - BORDER * 2) / contentH;
      const scale = Math.min(scaleX, scaleY, 1);
      const offsetX = BORDER + ((WIDTH - BORDER * 2) - deviceWidth * scale) / 2;

      const containerRect = container.getBoundingClientRect();
      const mx = (e.clientX - containerRect.left - offsetX) / scale;
      const my = (e.clientY - containerRect.top - BORDER) / scale;

      const newPanX = -(mx - containerRect.width / 2 / view.zoom);
      const newPanY = -(my - containerRect.height / 2 / view.zoom);

      setPan(newPanX, newPanY);
    };
    const handleUp = () => { isDragging.current = false; };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [view, canvasConfig, getDeviceWidth, setPan]);

  return (
    <div
      className="absolute bottom-3 right-3 z-50 border-2 border-black shadow-brutal"
      style={{ width: WIDTH, height: HEIGHT }}
    >
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="w-full h-full cursor-pointer"
        onPointerDown={handlePointerDown}
      />
    </div>
  );
};
