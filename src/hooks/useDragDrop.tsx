import { useState, useCallback, useEffect, useRef } from "react";
import {
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  rectIntersection,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEditorStore } from "@/store";
import { useUIStore } from "@/store";
import type { ComponentType, UIComponent } from "@/types/canvas";

export interface DragItem {
  type: "new" | "existing";
  componentType?: ComponentType;
  componentId?: string;
  data?: UIComponent;
}

const CONTAINER_TYPES: ComponentType[] = ["container", "flex", "grid"];

const canDrop = (
  parentId: string,
  childId: string,
  components: Record<string, UIComponent>,
): boolean => {
  if (parentId === childId) return false;

  let current = components[parentId];
  while (current?.parent) {
    if (current.parent === childId) return false;
    current = components[current.parent];
  }

  return true;
};

const isContainer = (componentType: ComponentType): boolean => {
  return CONTAINER_TYPES.includes(componentType);
};

export const useDragDrop = () => {
  const [activeItem, setActiveItem] = useState<DragItem | null>(null);

  const components = useEditorStore((s) => s.components);
  const moveComponent = useEditorStore((s) => s.moveComponent);
  const addComponent = useEditorStore((s) => s.addComponent);
  const rootId = useEditorStore((s) => s.rootId);
  const updateComponent = useEditorStore((s) => s.updateComponent);

  // Track mouse position during drag for auto-scroll near canvas edges
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number } | null>(null);
  const mouseCoordsRef = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!activeItem) return;
    const handler = (e: PointerEvent) => {
      setMouseCoords({ x: e.clientX, y: e.clientY });
      mouseCoordsRef.current = { x: e.clientX, y: e.clientY };
    };
    document.addEventListener('pointermove', handler);
    return () => document.removeEventListener('pointermove', handler);
  }, [activeItem]);

  // Auto-scroll interval that reads mouseCoords
  useEffect(() => {
    if (!activeItem || !mouseCoords) return;
    const SCROLL_ZONE = 40;
    const SCROLL_SPEED = 12;
    const id = window.setInterval(() => {
      const store = useUIStore.getState();
      const rect = document.querySelector('.flex-1.overflow-hidden')?.getBoundingClientRect();
      if (!rect) return;
      let dx = 0, dy = 0;
      if (mouseCoords.x < rect.left + SCROLL_ZONE) dx = -SCROLL_SPEED;
      else if (mouseCoords.x > rect.right - SCROLL_ZONE) dx = SCROLL_SPEED;
      if (mouseCoords.y < rect.top + SCROLL_ZONE) dy = -SCROLL_SPEED;
      else if (mouseCoords.y > rect.bottom - SCROLL_ZONE) dy = SCROLL_SPEED;
      if (dx || dy) {
        store.setPan(store.view.panX + dx, store.view.panY + dy);
      }
    }, 50);
    return () => clearInterval(id);
  }, [activeItem, mouseCoords]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current as DragItem | undefined;
      if (data) setActiveItem(data);
    },
    [],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { over } = event;

      if (!over || !activeItem) return;

      const overId = over.id as string;

      if (activeItem.type === "existing" && activeItem.componentId) {
        const activeId = activeItem.componentId;

        if (canDrop(overId, activeId, components)) {
          const overComponent = components[overId];

          if (overComponent && isContainer(overComponent.type)) {
            updateComponent(overId, {
              styles: {
                ...overComponent.styles,
                borderColor: { base: "#8b5cf6" },
              },
            });
          }
        }
      } else if (activeItem.type === "new" && activeItem.componentType) {
        const overComponent = components[overId];

        if (overComponent && isContainer(overComponent.type)) {
          updateComponent(overId, {
            styles: {
              ...overComponent.styles,
              borderColor: { base: "#8b5cf6" },
            },
          });
        }
      }
    },
    [activeItem, components, updateComponent],
  );

  const addNewComponent = useCallback((parentId: string, componentType: string, message: string) => {
    const newId = addComponent(parentId, componentType as import('@/types/canvas').ComponentType);
    if (newId) {
      const label = componentType.charAt(0).toUpperCase() + componentType.slice(1);
      useUIStore.getState().addToast(`${label} added to ${message}`, 'success', 2000);
      useUIStore.getState().setLastAddedId(newId);
      useEditorStore.getState().selectComponent(newId);
      setTimeout(() => useUIStore.getState().setLastAddedId(null), 800);
    }
    return newId;
  }, [addComponent]);

  const getCanvasDropPosition = useCallback((clientX: number, clientY: number) => {
    const canvasEl = document.querySelector('#canvas-content');
    if (!canvasEl) return null;
    const rect = canvasEl.getBoundingClientRect();
    const zoom = useUIStore.getState().view.zoom;
    const x = (clientX - rect.left) / zoom;
    const y = (clientY - rect.top) / zoom;
    return { left: `${Math.max(0, Math.round(x))}px`, top: `${Math.max(0, Math.round(y))}px` };
  }, []);

  const setPositionAbsolute = useCallback((
    compId: string,
    pos: { left: string; top: string } | null,
    delta?: { x: number; y: number },
  ) => {
    const comp = useEditorStore.getState().components[compId];
    if (!comp) return;

    let left = pos?.left || '0px';
    let top = pos?.top || '0px';

    // When delta is provided from DragEndEvent, compute position from
    // original + delta/zoom so it matches exactly where the component
    // was visually during drag (no snap-back).
    if (delta) {
      const zoom = useUIStore.getState().view.zoom;
      const origLeft = parseFloat((comp.styles.left as { base?: string })?.base || '0');
      const origTop = parseFloat((comp.styles.top as { base?: string })?.base || '0');
      left = `${Math.max(0, Math.round(origLeft + delta.x / zoom))}px`;
      top = `${Math.max(0, Math.round(origTop + delta.y / zoom))}px`;
    }

    useEditorStore.getState().updateComponent(compId, {
      styles: {
        ...comp.styles,
        position: { base: 'absolute' },
        left: { base: left },
        top: { base: top },
      }
    });
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { over, delta } = event;

      // Clear border highlights from all components
      Object.values(components).forEach((comp) => {
        if (comp.styles.borderColor) {
          const newStyles = { ...comp.styles };
          delete newStyles.borderColor;
          if (components[comp.id]) {
            useEditorStore.getState().updateComponent(comp.id, { styles: newStyles });
          }
        }
      });

      const overId = over ? (over.id as string) : 'canvas-drop-zone';
      const overComponent = over ? components[overId] : undefined;
      const isCanvasDrop = !over || overId === 'canvas-drop-zone' || !overComponent;

      // ===== NEW COMPONENT FROM LIBRARY =====
      if (activeItem?.type === "new" && activeItem.componentType && isCanvasDrop && rootId) {
        const newId = addNewComponent(rootId, activeItem.componentType, 'canvas');
        if (newId) {
          const rootComponent = components[rootId];
          if (rootComponent) {
            useEditorStore.getState().reorderChildren(rootId, [...rootComponent.children, newId]);
          }
          const pos = getCanvasDropPosition(
            mouseCoordsRef.current?.x ?? 0,
            mouseCoordsRef.current?.y ?? 0,
          );
          setPositionAbsolute(newId, pos);
        }
        setActiveItem(null);
        return;
      }

      if (activeItem?.type === "new" && activeItem.componentType && overComponent) {
        const componentType = activeItem.componentType;

        if (!isContainer(overComponent.type) && !overComponent.parent) {
          setActiveItem(null);
          return;
        }

        const targetParentId = isContainer(overComponent.type) ? overId : overComponent.parent;

        if (targetParentId && components[targetParentId]) {
          const targetParent = components[targetParentId];
          const children = [...(targetParent?.children || [])];
          const overIndex = children.indexOf(overId);
          const insertIndex = overIndex >= 0 ? overIndex : children.length;

          const newId = addNewComponent(targetParentId, componentType, overComponent.metadata.name);
          if (newId) {
            children.splice(insertIndex, 0, newId);
            useEditorStore.getState().reorderChildren(targetParentId, children);
          }
        } else if (rootId) {
          const newId = addNewComponent(rootId, componentType, 'canvas');
          if (newId) {
            const rootComponent = components[rootId];
            if (rootComponent) {
              useEditorStore.getState().reorderChildren(rootId, [...rootComponent.children, newId]);
            }
          }
        }
      }

      // ===== EXISTING COMPONENT MOVE/REORDER =====
      if (activeItem?.type === "existing" && activeItem.componentId) {
        const activeId = activeItem.componentId;

        // If dropped on itself, treat as canvas reposition
        if (overId === activeId) {
          if (rootId) {
            setPositionAbsolute(activeId, null, delta);
          }
        } else if (overComponent && canDrop(overId, activeId, components)) {
          const targetParentId = isContainer(overComponent.type) ? overId : overComponent.parent;

          if (targetParentId && components[targetParentId]) {
            const targetParent = components[targetParentId];
            const children = [...(targetParent?.children || [])];
            const overIndex = children.indexOf(overId);
            const insertIndex = overIndex >= 0 ? overIndex : children.length;

            const currentParentId = components[activeId]?.parent;
            if (targetParentId !== currentParentId) {
              moveComponent(activeId, targetParentId, insertIndex);
            } else if (overIndex >= 0) {
              const currentIndex = children.indexOf(activeId);
              if (currentIndex !== -1) {
                children.splice(currentIndex, 1);
                const newIndex = children.indexOf(overId);
                children.splice(newIndex >= 0 ? newIndex : insertIndex, 0, activeId);
                useEditorStore.getState().reorderChildren(targetParentId, children);
              }
            }
          }
        } else if (overComponent && !canDrop(overId, activeId, components)) {
          useUIStore.getState().addToast("Cannot drop a parent into its own child", "error", 3000);
        } else if (isCanvasDrop && rootId) {
          const currentParentId = components[activeId]?.parent;
          if (currentParentId !== rootId) {
            moveComponent(activeId, rootId, (components[rootId]?.children || []).length);
          }
          setPositionAbsolute(activeId, null, delta);
        }
      }

      setActiveItem(null);
    },
    [activeItem, components, rootId, moveComponent, updateComponent, addNewComponent],
  );

  return {
    sensors,
    activeItem,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    collisionDetection: rectIntersection,
  };
};

const DRAG_PREVIEW_COLORS: Record<string, string> = {
  box: "bg-violet-500/30", text: "bg-slate-400/30", button: "bg-violet-500",
  image: "bg-emerald-500/30", container: "bg-slate-400/10", flex: "bg-violet-400/30",
  grid: "bg-fuchsia-400/30", heading: "bg-slate-500/30", divider: "bg-slate-300/50",
  card: "bg-white border-2 border-slate-300", input: "bg-blue-100",
  navbar: "bg-slate-800", hero: "bg-gradient-to-b from-violet-200 to-violet-50",
};

export const getDragOverlayContent = (item: DragItem | null): React.ReactNode => {
  if (!item) return null;

  // For existing components, try to read real data from store
  let comp: UIComponent | undefined;
  if (item.type === "existing" && item.componentId) {
    comp = useEditorStore.getState().components[item.componentId];
  }

  const type = comp?.type || item.componentType || item.data?.type;
  const name = comp?.metadata.name || item.data?.metadata.name
    || (type ? (type.charAt(0).toUpperCase() + type.slice(1)) : "Component");
  const bg = type ? (DRAG_PREVIEW_COLORS[type] || "bg-[var(--bg-secondary)]") : "bg-[var(--bg-secondary)]";

  // Use actual component dimensions if available
  const compStyles = comp?.styles || {};
  const w = typeof compStyles.width === 'object' ? (compStyles.width as { base?: string }).base : undefined;
  const h = typeof compStyles.height === 'object' ? (compStyles.height as { base?: string }).base : undefined;
  const previewW = w ? Math.min(parseInt(w), 180) : 180;
  const previewH = h ? Math.min(parseInt(h), 60) : 48;

  return (
    <div
      className="border-2 border-violet-500 shadow-brutal-lg transition-all duration-150"
      style={{
        width: `${Math.max(previewW, 120)}px`,
        transform: "scale(0.95) rotate(-2deg)",
        boxShadow: "8px 8px 0 rgba(139, 92, 246, 0.3)",
      }}
    >
      <div className="px-3 py-2 text-sm font-bold text-[var(--text-primary)] truncate border-b-2 border-violet-500/30 bg-[var(--bg-primary)]/80 flex items-center gap-2">
        <span className="text-violet-500">⠿</span>
        {name}
        <span className="ml-auto text-[9px] uppercase tracking-wider text-violet-400/60 font-mono">{type}</span>
      </div>
      <div className="flex items-center justify-center" style={{ height: `${previewH}px` }}>
        <div className={`w-4/5 h-3/5 border-2 border-dashed border-violet-500/40 flex items-center justify-center ${bg}`}>
          <span className="text-violet-500 text-lg opacity-60">+</span>
        </div>
      </div>
    </div>
  );
};
