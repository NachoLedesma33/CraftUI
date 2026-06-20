import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useEditorStore } from '@/store';
import { useUIStore } from '@/store';
import { Renderer } from './Renderer';

const GRID_DOT_SVG = `data:image/svg+xml,%3Csvg width='1' height='1' viewBox='0 0 1 1' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='0.5' cy='0.5' r='0.5' fill='%2394a3b8' fill-opacity='0.3'/%3E%3C/svg%3E`;

const getDeviceWidth = (device: 'mobile' | 'tablet' | 'desktop'): number => {
  switch (device) {
    case 'mobile': return 375;
    case 'tablet': return 768;
    case 'desktop': return 1200;
  }
};

export const Canvas: React.FC = () => {
  const rootId = useEditorStore((s) => s.rootId);
  const components = useEditorStore((s) => s.components);
  const view = useUIStore((s) => s.view);
  const setPan = useUIStore((s) => s.setPan);
  const panBy = useUIStore((s) => s.panBy);
  const setZoom = useUIStore((s) => s.setZoom);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const canvasConfig = useEditorStore((s) => s.canvasConfig);

  const { setNodeRef } = useDroppable({
    id: 'canvas-drop-zone',
  });

  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const isSpaceHeld = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [lassoRect, setLassoRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const lassoStart = useRef({ x: 0, y: 0 });
  const lassoMoved = useRef(false);
  const lassoFired = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        isSpaceHeld.current = true;
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpaceHeld.current = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!isPanning) return;
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan(dx, dy);
    };
    const handleMouseUp = () => {
      setIsPanning(false);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, setPan]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && isSpaceHeld.current)) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { x: e.clientX - view.panX, y: e.clientY - view.panY };
      return;
    }

    if (e.button === 0 && !isSpaceHeld.current) {
      const target = e.target as HTMLElement;
      if (target.closest('[data-component-id]')) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      lassoStart.current = { x, y };
      lassoMoved.current = false;
      lassoFired.current = false;
      setLassoRect({ x, y, w: 0, h: 0 });
    }
  }, [view.panX, view.panY]);

  useEffect(() => {
    const isLassoing = lassoRect !== null;
    if (!isLassoing) return;

    const handleMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const dx = Math.abs(cx - lassoStart.current.x);
      const dy = Math.abs(cy - lassoStart.current.y);
      if (dx > 3 || dy > 3) lassoMoved.current = true;

      const x = Math.min(lassoStart.current.x, cx);
      const y = Math.min(lassoStart.current.y, cy);
      const w = Math.abs(cx - lassoStart.current.x);
      const h = Math.abs(cy - lassoStart.current.y);
      setLassoRect({ x, y, w, h });
    };

    const handleUp = () => {
      if (!lassoMoved.current) {
        setLassoRect(null);
        return;
      }

      lassoFired.current = true;
      const lr = lassoRect;
      if (lr && lr.w > 2 && lr.h > 2) {
        const container = containerRef.current;
        if (!container) { setLassoRect(null); return; }
        const cr = container.getBoundingClientRect();
        const allEls = document.querySelectorAll<HTMLElement>('[data-component-id]');
        const rootComp = rootId ? components[rootId] : null;
        const rootChildren = new Set(rootComp?.children || []);
        const toSelect: string[] = [];

        allEls.forEach((el) => {
          const id = el.getAttribute('data-component-id');
          if (!id || id === rootId) return;
          if (!rootChildren.has(id)) return;

          const r = el.getBoundingClientRect();
          const elLeft = r.left - cr.left;
          const elTop = r.top - cr.top;
          const elRight = elLeft + r.width;
          const elBottom = elTop + r.height;

          if (elLeft < lr.x + lr.w && elRight > lr.x && elTop < lr.y + lr.h && elBottom > lr.y) {
            toSelect.push(id);
          }
        });

        if (toSelect.length > 0) {
          clearSelection();
          toSelect.forEach((id) => selectComponent(id, true));
        }
      }
      setLassoRect(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [lassoRect, components, rootId, clearSelection, selectComponent]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.002;
      const newZoom = Math.min(2, Math.max(0.5, view.zoom + delta));
      setZoom(Math.round(newZoom * 10) / 10);
    } else {
      panBy(-(e.shiftKey ? e.deltaY : e.deltaX), -e.deltaY);
    }
  }, [view.zoom, panBy, setZoom]);

  const deviceWidth = useMemo(
    () => getDeviceWidth(view.activeDevice),
    [view.activeDevice]
  );

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (lassoFired.current) { lassoFired.current = false; return; }
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('#canvas-viewport') === e.target) {
      clearSelection();
    }
  }, [clearSelection]);

  const gridStyle = useMemo(() => {
    if (!view.showGrid) return {};
    return {
      backgroundImage: `url("${GRID_DOT_SVG}")`,
      backgroundSize: `${view.gridSize}px ${view.gridSize}px`,
    };
  }, [view.showGrid, view.gridSize]);

  const rootComponent = rootId ? components[rootId] : null;
  const hasChildren = rootComponent ? rootComponent.children.length > 0 : false;

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        containerRef.current = node;
      }}
      className={`relative flex-1 overflow-hidden select-none pt-5 pl-5 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ backgroundColor: 'var(--bg-primary)' }}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
    >
      <div
        id="canvas-viewport"
        className="relative"
        style={{
          minWidth: '100%',
          minHeight: '100%',
          transform: `translate(${view.panX}px, ${view.panY}px) scale(${view.zoom})`,
          transformOrigin: isPanning ? '0 0' : 'center top',
          transition: isPanning ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <div
          id="canvas-content"
          className="mx-auto mt-8"
          style={{
            width: `${deviceWidth}px`,
            minHeight: `${canvasConfig.height}px`,
            backgroundColor: 'var(--bg-secondary)',
            ...gridStyle,
          }}
        >
          {rootComponent && (
            <Renderer
              componentId={rootComponent.id}
              isPreview={view.previewMode}
              isRoot={true}
            />
          )}

          {(!rootComponent || !hasChildren) && (
            <div className="flex flex-col items-center justify-center py-24 px-8 select-none">
              <div className="w-16 h-16 bg-[var(--bg-tertiary)] flex items-center justify-center mb-5 border-2 border-black">
                <span className="text-2xl opacity-60">+</span>
              </div>
              <p className="text-base font-semibold text-[var(--text-secondary)] mb-2">Canvas vacío</p>
              <p className="text-sm text-[var(--text-muted)] text-center max-w-xs leading-relaxed">
                Arrastrá componentes desde el panel izquierdo o presioná{" "}
                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] border-2 border-black text-xs text-[var(--text-secondary)] font-mono">Ctrl+K</kbd>{" "}
                para abrir la paleta de comandos
              </p>
            </div>
          )}
        </div>
      </div>

      {lassoRect && lassoRect.w > 0 && lassoRect.h > 0 && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            left: lassoRect.x,
            top: lassoRect.y,
            width: lassoRect.w,
            height: lassoRect.h,
            backgroundColor: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.6)',
          }}
        />
      )}
    </div>
  );
};
