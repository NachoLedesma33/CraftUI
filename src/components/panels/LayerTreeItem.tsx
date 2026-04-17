import React, { useState, useCallback, memo } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  GripVertical,
  Box,
  Type,
  Square,
  Image,
  LayoutGrid,
  AlignJustify,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditorStore } from '@/store';
import type { ComponentType, UIComponent } from '@/types/canvas';

const componentIcons: Record<ComponentType, React.ReactNode> = {
  box: <Square size={14} />,
  text: <Type size={14} />,
  button: <Box size={14} />,
  image: <Image size={14} />,
  container: <AlignJustify size={14} />,
  flex: <AlignJustify size={14} />,
  grid: <LayoutGrid size={14} />,
};

export interface LayerTreeItemProps {
  componentId: string;
  depth: number;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onContextMenu?: (e: React.MouseEvent, id: string) => void;
  dropPosition?: 'before' | 'after' | 'inside' | null;
}

export const LayerTreeItem: React.FC<LayerTreeItemProps> = memo(({
  componentId,
  depth,
  isExpanded,
  onToggleExpand,
  onContextMenu,
  dropPosition,
}) => {
  const component = useEditorStore((s) => s.components[componentId]);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const updateComponent = useEditorStore((s) => s.updateComponent);
  const deleteComponent = useEditorStore((s) => s.deleteComponent);
  const duplicateComponent = useEditorStore((s) => s.duplicateComponent);

  const [isHovered, setIsHovered] = useState(false);

  const {
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: componentId,
    data: { type: 'layer', componentId },
  });

  const isSelected = selectedIds.includes(componentId);
  const hasChildren = component?.children && component.children.length > 0;
  const isContainer = hasChildren;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    selectComponent(componentId, e.shiftKey || e.ctrlKey || e.metaKey);
  }, [componentId, selectComponent]);

  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(componentId);
  }, [componentId, onToggleExpand]);

  const handleToggleVisibility = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (component) {
      updateComponent(componentId, {
        metadata: {
          ...component.metadata,
          isVisible: !component.metadata.isVisible,
        },
      });
    }
  }, [componentId, component, updateComponent]);

  const handleToggleLock = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (component) {
      updateComponent(componentId, {
        metadata: {
          ...component.metadata,
          isLocked: !component.metadata.isLocked,
        },
      });
    }
  }, [componentId, component, updateComponent]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteComponent(componentId);
  }, [componentId, deleteComponent]);

  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateComponent(componentId);
  }, [componentId, duplicateComponent]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(e, componentId);
  }, [componentId, onContextMenu]);

  const handleDragOver = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (!component) return null;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${depth * 16 + 8}px`,
  };

  const itemClasses = `
    relative flex items-center gap-1 py-1 pr-2 cursor-pointer select-none
    ${isSelected ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}
    ${!component.metadata.isVisible ? 'opacity-50' : ''}
    ${isDragging ? 'opacity-50' : ''}
    ${dropPosition === 'before' ? 'border-t-2 border-blue-500' : ''}
    ${dropPosition === 'after' ? 'border-b-2 border-blue-500' : ''}
    ${dropPosition === 'inside' ? 'ring-2 ring-blue-500 ring-inset' : ''}
  `;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={itemClasses}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={handleDragOver}
      >
        {isContainer ? (
          <button
            onClick={handleToggleExpand}
            className="p-0.5 hover:bg-slate-600 rounded flex-shrink-0"
          >
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="w-5 flex-shrink-0" />
        )}

        <div
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing flex-shrink-0"
          title="Drag to reorder"
        >
          <GripVertical size={12} className="opacity-0 group-hover:opacity-100" />
        </div>

        <span className={`flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
          {componentIcons[component.type] || <Box size={14} />}
        </span>

        <span className="flex-1 text-xs truncate min-w-0">
          {component.metadata.name}
        </span>

        {hasChildren && (
          <span className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded ${
            isSelected ? 'bg-blue-500' : 'bg-slate-600'
          }`}>
            {component.children.length}
          </span>
        )}

        <div className={`flex items-center gap-0.5 flex-shrink-0 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={handleToggleVisibility}
            className="p-1 hover:bg-slate-600 rounded"
            title={component.metadata.isVisible ? 'Hide' : 'Show'}
          >
            {component.metadata.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
          <button
            onClick={handleToggleLock}
            className="p-1 hover:bg-slate-600 rounded"
            title={component.metadata.isLocked ? 'Unlock' : 'Lock'}
          >
            {component.metadata.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
          </button>
          <button
            onClick={handleDuplicate}
            className="p-1 hover:bg-slate-600 rounded"
            title="Duplicate"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-600 rounded"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <>
          {component.children.map((childId) => (
            <LayerTreeItem
              key={childId}
              componentId={childId}
              depth={depth + 1}
              isExpanded={isExpanded}
              onToggleExpand={onToggleExpand}
              onContextMenu={onContextMenu}
            />
          ))}
        </>
      )}
    </>
  );
});

LayerTreeItem.displayName = 'LayerTreeItem';

interface QuickActionsProps {
  component: UIComponent;
}

export const QuickActions: React.FC<QuickActionsProps> = memo(({ component }) => {
  const updateComponent = useEditorStore((s) => s.updateComponent);
  const deleteComponent = useEditorStore((s) => s.deleteComponent);
  const duplicateComponent = useEditorStore((s) => s.duplicateComponent);

  const handleToggleVisibility = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateComponent(component.id, {
      metadata: { ...component.metadata, isVisible: !component.metadata.isVisible },
    });
  }, [component.id, component.metadata, updateComponent]);

  const handleToggleLock = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateComponent(component.id, {
      metadata: { ...component.metadata, isLocked: !component.metadata.isLocked },
    });
  }, [component.id, component.metadata, updateComponent]);

  const handleDuplicate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateComponent(component.id);
  }, [component.id, duplicateComponent]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteComponent(component.id);
  }, [component.id, deleteComponent]);

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={handleToggleVisibility}
        className="p-1 hover:bg-slate-200 rounded"
        title={component.metadata.isVisible ? 'Hide' : 'Show'}
      >
        {component.metadata.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
      </button>
      <button
        onClick={handleToggleLock}
        className="p-1 hover:bg-slate-200 rounded"
        title={component.metadata.isLocked ? 'Unlock' : 'Lock'}
      >
        {component.metadata.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
      </button>
      <button
        onClick={handleDuplicate}
        className="p-1 hover:bg-slate-200 rounded"
        title="Duplicate"
      >
        <Copy size={12} />
      </button>
      <button
        onClick={handleDelete}
        className="p-1 hover:bg-red-100 rounded"
        title="Delete"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
});

QuickActions.displayName = 'QuickActions';