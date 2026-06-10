import { useState, useCallback, useEffect } from "react";
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
  useEffect(() => {
    if (!activeItem) return;
    const handler = (e: PointerEvent) => setMouseCoords({ x: e.clientX, y: e.clientY });
    document.addEventListener('pointermove', handler);
    return () => document.removeEventListener('pointermove', handler);
  }, [activeItem]);

  // Auto-scroll interval that reads mouseCoords
  useEffect(() => {
    if (!activeItem || !mouseCoords) return;
    const SCROLL_ZONE = 40;
    const SCROLL_SPEED = 12;
    const id = window.setInterval(() => {
      const canvas = document.querySelector('.flex-1.overflow-auto') as HTMLElement | null;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      let dx = 0, dy = 0;
      if (mouseCoords.x < rect.left + SCROLL_ZONE) dx = -SCROLL_SPEED;
      else if (mouseCoords.x > rect.right - SCROLL_ZONE) dx = SCROLL_SPEED;
      if (mouseCoords.y < rect.top + SCROLL_ZONE) dy = -SCROLL_SPEED;
      else if (mouseCoords.y > rect.bottom - SCROLL_ZONE) dy = SCROLL_SPEED;
      if (dx || dy) {
        canvas.scrollLeft += dx;
        canvas.scrollTop += dy;
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

      if (data) {
        setActiveItem(data);

        if (data.type === "existing" && data.componentId) {
          updateComponent(data.componentId, {
            styles: {
              ...components[data.componentId].styles,
              opacity: { base: 0.5 },
            },
          });
        }
      }
    },
    [components, updateComponent],
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
      setTimeout(() => useUIStore.getState().setLastAddedId(null), 800);
    }
    return newId;
  }, [addComponent]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { over } = event;

      // Clean up drag overlay opacity
      if (activeItem?.type === "existing" && activeItem.componentId) {
        const orig = components[activeItem.componentId];
        if (orig) {
          updateComponent(activeItem.componentId, {
            styles: { ...orig.styles, opacity: { base: 1 } },
          });
        }
      }

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

      if (!over) {
        setActiveItem(null);
        return;
      }

      const overId = over.id as string;
      const overComponent = components[overId];
      const isCanvasDrop = overId === 'canvas-drop-zone' || !overComponent;

      // ===== NEW COMPONENT FROM LIBRARY =====
      if (activeItem?.type === "new" && activeItem.componentType && isCanvasDrop && rootId) {
        const newId = addNewComponent(rootId, activeItem.componentType, 'canvas');
        if (newId) {
          const rootComponent = components[rootId];
          if (rootComponent) {
            useEditorStore.getState().reorderChildren(rootId, [...rootComponent.children, newId]);
          }
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

        if (overComponent && canDrop(overId, activeId, components)) {
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

export const getDragOverlayContent = (item: DragItem | null): React.ReactNode => {
  if (!item) return null;
  if (item.type === "new") {
    return (
      <div className="px-3 py-2 bg-violet-500 text-white rounded shadow-brutal text-sm">
        {item.componentType?.charAt(0).toUpperCase()}
        {item.componentType?.slice(1)}
      </div>
    );
  }

  if (item.data) {
    return (
      <div className="px-3 py-2 bg-white border-2 border-violet-500 rounded shadow-brutal text-sm">
        {item.data.metadata.name}
      </div>
    );
  }

  return null;
};
