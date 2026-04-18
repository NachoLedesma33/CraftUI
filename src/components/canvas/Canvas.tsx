import React, { useCallback, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useEditorStore } from "@/store";
import { useUIStore } from "@/store";
import { Renderer } from "./Renderer";

const GRID_DOT_SVG = `data:image/svg+xml,%3Csvg width='1' height='1' viewBox='0 0 1 1' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='0.5' cy='0.5' r='0.5' fill='%2394a3b8' fill-opacity='0.3'/%3E%3C/svg%3E`;

const getDeviceWidth = (device: "mobile" | "tablet" | "desktop"): number => {
  switch (device) {
    case "mobile":
      return 375;
    case "tablet":
      return 768;
    case "desktop":
      return 1200;
  }
};

const CanvasHUD: React.FC<{ zoom: number }> = ({ zoom }) => {
  return (
    <div className="absolute bottom-6 right-6 bg-slate-800/90 backdrop-blur-md text-slate-300 text-xs px-3 py-2 rounded-lg font-mono pointer-events-none select-none shadow-lg border border-slate-700/50">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <span className="font-semibold">Zoom: {Math.round(zoom * 100)}%</span>
      </div>
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
    id: "canvas-drop-zone",
  });

  const deviceWidth = useMemo(
    () => getDeviceWidth(view.activeDevice),
    [view.activeDevice],
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (
        e.target === e.currentTarget ||
        (e.target as HTMLElement).id === "canvas-viewport"
      ) {
        clearSelection();
      }
    },
    [clearSelection],
  );

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
      className={`relative flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8 transition-all duration-300 ${isOver ? "ring-4 ring-blue-400/50 ring-inset bg-blue-50/50 dark:bg-blue-900/20" : ""}`}
      onClick={handleCanvasClick}
    >
      <div
        id="canvas-viewport"
        className="relative"
        style={{
          minWidth: "100%",
          minHeight: "100%",
          transform: `scale(${view.zoom})`,
          transformOrigin: "top center",
          transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className="mx-auto shadow-2xl bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm"
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
