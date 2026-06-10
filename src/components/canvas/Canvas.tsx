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
      ref={setNodeRef}
      className={`relative flex-1 overflow-auto ${isOver ? 'ring-2 ring-violet-400 ring-inset' : ''}`}
      style={{ backgroundColor: 'var(--bg-primary)' }}
      onClick={handleCanvasClick}
    >
      <div
        id="canvas-viewport"
        className="relative"
        style={{
          minWidth: '100%',
          minHeight: '100%',
          transform: `scale(${view.zoom})`,
          transformOrigin: 'center top',
          transition: 'transform 0.1s ease-out',
        }}
      >
        <div
          className="mx-auto mt-8 shadow-2xl"
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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-orange-500/20 flex items-center justify-center mb-5 border border-violet-500/10">
                <span className="text-2xl opacity-60">+</span>
              </div>
              <p className="text-base font-semibold text-slate-400 mb-2">Canvas vacío</p>
              <p className="text-sm text-slate-500 text-center max-w-xs leading-relaxed">
                Arrastrá componentes desde el panel izquierdo o presioná{" "}
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-400 font-mono">Ctrl+K</kbd>{" "}
                para abrir la paleta de comandos
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};