import React, { useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEditorStore } from "@/store";
import { useUIStore } from "@/store";
import { Renderer } from "./Renderer";
import { getDragOverlayContent, type DragItem } from "@/hooks/useDragDrop";

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

interface DroppableContainerProps {
  componentId: string;
  children: React.ReactNode;
  isRoot?: boolean;
}

const DroppableContainer: React.FC<DroppableContainerProps> = ({ componentId, children, isRoot }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: componentId,
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative ${isOver && !isRoot ? "ring-2 ring-blue-400 ring-inset" : ""}`}
    >
      {children}
    </div>
  );
};

const CanvasDropZone: React.FC<{ rootId: string }> = ({ rootId }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-drop-zone",
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8 transition-all duration-300 ${isOver ? "ring-4 ring-blue-400/50 ring-inset bg-blue-50/50 dark:bg-blue-900/20" : ""}`}
    >
      {rootId && <DroppableContainer componentId={rootId} isRoot={true} />}
    </div>
  );
};

export const Canvas: React.FC = () => {
  const rootId = useEditorStore((s) => s.rootId);
  const components = useEditorStore((s) => s.components);
  const view = useUIStore((s) => s.view);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const canvasConfig = useEditorStore((s) => s.canvasConfig);
  
  const moveComponent = useEditorStore((s) => s.moveComponent);
  const addComponent = useEditorStore((s) => s.addComponent);
  const updateComponent = useEditorStore((s) => s.updateComponent);
  const componentsState = useEditorStore((s) => s.components);
  
  const [activeItem, setActiveItem] = React.useState<DragItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragItem | undefined;
    if (data) {
      setActiveItem(data);
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Handle drag over - could highlight drop targets
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveItem(null);
      return;
    }

    const activeData = active.data.current as DragItem | undefined;
    if (!activeData) {
      setActiveItem(null);
      return;
    }

    const overId = over.id as string;

    // Handle dropping new component from library
    if (activeData.type === "new" && activeData.componentType) {
      const componentType = activeData.componentType;
      const targetId = overId === "canvas-drop-zone" ? rootId : overId;
      
      if (targetId && components[targetId]) {
        const targetComponent = components[targetId];
        
        // Check if target is a container type
        const containerTypes = ["container", "flex", "grid"];
        if (containerTypes.includes(targetComponent.type)) {
          addComponent(targetId, componentType);
        } else if (targetComponent.parent) {
          addComponent(targetComponent.parent, componentType);
        } else if (rootId) {
          addComponent(rootId, componentType);
        }
      } else if (rootId) {
        addComponent(rootId, componentType);
      }
    }
    
    // Handle reordering existing components
    if (activeData.type === "existing" && activeData.componentId && overId !== activeData.componentId) {
      const activeId = activeData.componentId;
      const overComponent = components[overId];
      
      if (overComponent) {
        const targetParentId = overComponent.parent || rootId;
        if (targetParentId) {
          const targetParent = components[targetParentId];
          const children = targetParent?.children || [];
          const overIndex = children.indexOf(overId);
          const insertIndex = overIndex >= 0 ? overIndex : children.length;
          moveComponent(activeId, targetParentId, insertIndex);
        }
      }
    }

    setActiveItem(null);
  }, [rootId, components, moveComponent, addComponent]);

  if (!rootComponent) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <p className="text-slate-500">Loading canvas...</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className="relative flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8"
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
            <Renderer
              componentId={rootComponent.id}
              isPreview={view.previewMode}
              isRoot={true}
            />
          </div>
        </div>

        <CanvasHUD zoom={view.zoom} />
      </div>

      <DragOverlay>
        {activeItem ? getDragOverlayContent(activeItem) : null}
      </DragOverlay>
    </DndContext>
  );
};