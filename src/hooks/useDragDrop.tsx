import { useState, useCallback } from 'react';
import {
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  rectIntersection,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useEditorStore } from '@/store';
import { useUIStore } from '@/store';
import type { ComponentType, UIComponent } from '@/types/canvas';

export interface DragItem {
  type: 'new' | 'existing';
  componentType?: ComponentType;
  componentId?: string;
  data?: UIComponent;
}

const CONTAINER_TYPES: ComponentType[] = ['container', 'flex', 'grid'];

const canDrop = (parentId: string, childId: string, components: Record<string, UIComponent>): boolean => {
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
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragItem | undefined;
    
    if (data) {
      setActiveItem(data);
      
      if (data.type === 'existing' && data.componentId) {
        updateComponent(data.componentId, {
          styles: {
            ...components[data.componentId].styles,
            opacity: { base: 0.5 },
          },
        });
      }
    }
  }, [components, updateComponent]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    
    if (!over || !activeItem) return;
    
    const overId = over.id as string;
    
    if (activeItem.type === 'existing' && activeItem.componentId) {
      const activeId = activeItem.componentId;
      
      if (canDrop(overId, activeId, components)) {
        const overComponent = components[overId];
        
        if (overComponent && isContainer(overComponent.type)) {
          updateComponent(overId, {
            styles: {
              ...overComponent.styles,
              borderColor: { base: '#3b82f6' },
            },
          });
        }
      }
    } else if (activeItem.type === 'new' && activeItem.componentType) {
      const overComponent = components[overId];
      
      if (overComponent && isContainer(overComponent.type)) {
        updateComponent(overId, {
          styles: {
            ...overComponent.styles,
            borderColor: { base: '#3b82f6' },
          },
        });
      }
    }
  }, [activeItem, components, updateComponent]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { over } = event;
    
    if (!over) {
      if (activeItem?.type === 'existing' && activeItem.componentId) {
        updateComponent(activeItem.componentId, {
          styles: {
            ...components[activeItem.componentId].styles,
            opacity: { base: 1 },
          },
        });
      }
      setActiveItem(null);
      return;
    }

    const overId = over.id as string;
    const overComponent = components[overId];
    
    if (!overComponent) {
      setActiveItem(null);
      return;
    }

    if (activeItem?.type === 'existing' && activeItem.componentId) {
      const activeId = activeItem.componentId;
      const activeComponent = components[activeId];
      
      updateComponent(activeId, {
        styles: {
          ...activeComponent.styles,
          opacity: { base: 1 },
        },
      });

      if (!canDrop(overId, activeId, components)) {
        setActiveItem(null);
        return;
      }

      const targetParentId = isContainer(overComponent.type) ? overId : overComponent.parent;
      
      if (targetParentId) {
        const targetParent = components[targetParentId];
        const children = targetParent?.children || [];
        const overIndex = children.indexOf(overId);
        const insertIndex = overIndex >= 0 ? overIndex : children.length;
        
        moveComponent(activeId, targetParentId, insertIndex);
      }
    } else if (activeItem?.type === 'new' && activeItem.componentType) {
      const componentType = activeItem.componentType;
      
      if (!isContainer(overComponent.type) && !overComponent.parent) {
        setActiveItem(null);
        return;
      }

      const targetParentId = isContainer(overComponent.type) ? overId : overComponent.parent;
      
      if (targetParentId) {
        const targetParent = components[targetParentId];
        const children = targetParent?.children || [];
        const overIndex = children.indexOf(overId);
        const insertIndex = overIndex >= 0 ? overIndex : children.length;
        
        const newId = addComponent(targetParentId, componentType);
        
        if (newId) {
          const parent = components[targetParentId];
          const newChildren = [...parent.children];
          newChildren.splice(insertIndex, 0, newId);
          
          useEditorStore.getState().reorderChildren(targetParentId, newChildren);
        }
      } else if (rootId) {
        const newId = addComponent(rootId, componentType);
        
        if (newId) {
          const rootComponent = components[rootId];
          useEditorStore.getState().reorderChildren(rootId, [...rootComponent.children, newId]);
        }
      }
    }

    Object.values(components).forEach(comp => {
      if (comp.styles.borderColor) {
        const newStyles = { ...comp.styles };
        delete newStyles.borderColor;
        updateComponent(comp.id, { styles: newStyles });
      }
    });

    setActiveItem(null);
  }, [activeItem, components, rootId, moveComponent, addComponent, updateComponent]);

  return {
    sensors,
    activeItem,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    collisionDetection: rectIntersection,
  };
};

export const getDragOverlayContent = (item: DragItem): React.ReactNode => {
  if (item.type === 'new') {
    return (
      <div className="px-3 py-2 bg-blue-500 text-white rounded shadow-lg text-sm">
        {item.componentType?.charAt(0).toUpperCase()}{item.componentType?.slice(1)}
      </div>
    );
  }
  
  if (item.data) {
    return (
      <div 
        className="px-3 py-2 bg-white border border-blue-500 rounded shadow-lg text-sm"
      >
        {item.data.metadata.name}
      </div>
    );
  }
  
  return null;
};