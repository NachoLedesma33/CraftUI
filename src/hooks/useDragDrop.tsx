import { useState, useCallback } from "react";
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

  useUIStore((s) => s.view.zoom);

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
        const newId = addComponent(rootId, activeItem.componentType);
        if (newId) {
          const rootComponent = components[rootId];
          if (rootComponent) {
            useEditorStore.getState().reorderChildren(rootId, [...rootComponent.children, newId]);
          }
          const label = activeItem.componentType.charAt(0).toUpperCase() + activeItem.componentType.slice(1);
          useUIStore.getState().addToast(`${label} added to canvas`, 'success', 2000);
          useUIStore.getState().setLastAddedId(newId);
          setTimeout(() => useUIStore.getState().setLastAddedId(null), 800);
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

          const newId = addComponent(targetParentId, componentType);
          if (newId) {
            children.splice(insertIndex, 0, newId);
            useEditorStore.getState().reorderChildren(targetParentId, children);
            const label = componentType.charAt(0).toUpperCase() + componentType.slice(1);
            useUIStore.getState().addToast(`${label} added to ${overComponent.metadata.name}`, 'success', 2000);
            useUIStore.getState().setLastAddedId(newId);
            setTimeout(() => useUIStore.getState().setLastAddedId(null), 800);
          }
        } else if (rootId) {
          const newId = addComponent(rootId, componentType);
          if (newId) {
            const rootComponent = components[rootId];
            if (rootComponent) {
              useEditorStore.getState().reorderChildren(rootId, [...rootComponent.children, newId]);
            }
            const label = componentType.charAt(0).toUpperCase() + componentType.slice(1);
            useUIStore.getState().addToast(`${label} added to canvas`, 'success', 2000);
            useUIStore.getState().setLastAddedId(newId);
            setTimeout(() => useUIStore.getState().setLastAddedId(null), 800);
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
          useUIStore.getState().addToast("Cannot drop a parent into its own child", "warning", 3000);
        } else if (isCanvasDrop && rootId) {
          const currentParentId = components[activeId]?.parent;
          if (currentParentId !== rootId) {
            moveComponent(activeId, rootId, (components[rootId]?.children || []).length);
          }
        }
      }

      setActiveItem(null);
    },
    [activeItem, components, rootId, moveComponent, addComponent, updateComponent],
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
      <div className="px-3 py-2 bg-violet-500 text-white rounded shadow-lg text-sm">
        {item.componentType?.charAt(0).toUpperCase()}
        {item.componentType?.slice(1)}
      </div>
    );
  }

  if (item.data) {
    return (
      <div className="px-3 py-2 bg-white border border-violet-500 rounded shadow-lg text-sm">
        {item.data.metadata.name}
      </div>
    );
  }

  return null;
};
