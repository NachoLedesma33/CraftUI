import React, { useCallback, useMemo } from 'react';
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

const CanvasHUD: React.FC<{ zoom: number }> = ({ zoom }) => {
  return (
    <div className="absolute bottom-4 right-4 bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded font-mono pointer-events-none select-none">
      Zoom: {Math.round(zoom * 100)}%
    </div>
  );
};

export const Canvas: React.FC = () => {
  const rootId = useEditorStore((s) => s.rootId);
  const components = useEditorStore((s) => s.components);
  const view = useUIStore((s) => s.view);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const canvasConfig = useEditorStore((s) => s.canvasConfig);
  
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-drop-zone',
  });

  const deviceWidth = useMemo(
    () => getDeviceWidth(view.activeDevice),
    [view.activeDevice]
  );

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'canvas-viewport') {
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

  return (
    <div
      ref={setNodeRef}
      className={`relative flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 ${isOver ? 'ring-2 ring-blue-400 ring-inset' : ''}`}
      onClick={handleCanvasClick}
    >
      <div
        id="canvas-viewport"
        className="relative"
        style={{
          minWidth: '100%',
          minHeight: '100%',
          transform: `scale(${view.zoom})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out',
        }}
      >
        <div
          className="mx-auto mt-8 shadow-2xl bg-white dark:bg-slate-800"
          style={{
            width: `${deviceWidth}px`,
            minHeight: `${canvasConfig.height}px`,
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
        </div>
      </div>

      <CanvasHUD zoom={view.zoom} />
    </div>
  );
};