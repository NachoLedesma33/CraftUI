import React, { useState, useCallback, useMemo, useEffect, useReducer } from "react";
import {
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Plus,
  Box,
  Type,
  Square,
  Image,
  LayoutGrid,
  AlignJustify,
} from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEditorStore } from "@/store";
import { useUIStore } from "@/store";
import type { ComponentType, UIComponent } from "@/types/canvas";

const componentIcons: Partial<Record<ComponentType, React.ReactNode>> = {
  box: <Square size={14} />,
  text: <Type size={14} />,
  button: <Box size={14} />,
  image: <Image size={14} />,
  container: <AlignJustify size={14} />,
  flex: <AlignJustify size={14} />,
  grid: <LayoutGrid size={14} />,
};

interface TreeItemProps {
  componentId: string;
  depth: number;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
}

const SortableTreeItem: React.FC<TreeItemProps> = ({
  componentId,
  depth,
  expandedIds,
  onToggleExpand,
  onContextMenu,
}) => {
  const component = useEditorStore((s) => s.components[componentId]);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const updateComponent = useEditorStore((s) => s.updateComponent);
  const saveToHistory = useEditorStore((s) => s.saveToHistory);
  const deleteComponent = useEditorStore((s) => s.deleteComponent);
  const duplicateComponent = useEditorStore((s) => s.duplicateComponent);

  const [isHovered, setIsHovered] = useState(false);
  const isSelected = selectedIds.includes(componentId);
  const isExpanded = expandedIds.has(componentId);
  const hasChildren = component?.children && component.children.length > 0;
  const isContainer = hasChildren;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: componentId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    paddingLeft: `clamp(8px, ${depth * 12}px, ${depth * 16 + 8}px)`,
  };

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectComponent(componentId, e.shiftKey || e.ctrlKey || e.metaKey);
    },
    [componentId, selectComponent],
  );

  const handleToggleExpand = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleExpand(componentId);
    },
    [componentId, onToggleExpand],
  );

  const handleToggleVisibility = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (component) {
        updateComponent(componentId, {
          metadata: {
            ...component.metadata,
            isVisible: !component.metadata.isVisible,
          },
        });
        saveToHistory();
      }
    },
    [componentId, component, updateComponent, saveToHistory],
  );

  const handleToggleLock = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (component) {
        updateComponent(componentId, {
          metadata: {
            ...component.metadata,
            isLocked: !component.metadata.isLocked,
          },
        });
        saveToHistory();
      }
    },
    [componentId, component, updateComponent, saveToHistory],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteComponent(componentId);
    },
    [componentId, deleteComponent],
  );

  const handleDuplicate = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      duplicateComponent(componentId);
    },
    [componentId, duplicateComponent],
  );

  if (!component) return null;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`
          flex items-center gap-1 py-1 px-2 cursor-pointer select-none min-w-0 border-2 border-[var(--border)]
          ${isSelected ? "bg-[var(--accent)] text-[var(--text-primary)] shadow-brutal-sm" : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:shadow-brutal-sm"}
          ${!component.metadata.isVisible ? "opacity-50" : ""}
        `}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, componentId)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...attributes}
        {...listeners}
      >
        {isContainer ? (
          <button
            onClick={handleToggleExpand}
            className="p-0.5 border-2 border-[var(--border)] hover:bg-[var(--bg-tertiary)]"
          >
            {isExpanded ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        <span className={`${isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
          {componentIcons[component.type] || <Box size={14} />}
        </span>

        <span className="flex-1 min-w-0 text-xs truncate">
          {component.metadata.name}
        </span>

        {hasChildren && (
          <span
            className={`hidden sm:inline text-xs px-1 flex-shrink-0 ${isSelected ? "bg-[var(--accent)]" : "bg-[var(--bg-tertiary)]"}`}
          >
            {component.children.length}
          </span>
        )}

        <div
          className={`flex items-center gap-0.5 flex-shrink-0 transition-opacity duration-150 ${isHovered ? "opacity-100" : "opacity-60 sm:opacity-0"}`}
        >
          <button
            onClick={handleToggleVisibility}
            className="p-1 border-2 border-[var(--border)] hover:bg-[var(--bg-tertiary)] flex-shrink-0"
            title={component.metadata.isVisible ? "Hide" : "Show"}
          >
            {component.metadata.isVisible ? (
              <Eye size={12} />
            ) : (
              <EyeOff size={12} />
            )}
          </button>
          <button
            onClick={handleToggleLock}
            className="p-1 border-2 border-[var(--border)] hover:bg-[var(--bg-tertiary)] flex-shrink-0"
            title={component.metadata.isLocked ? "Unlock" : "Lock"}
          >
            {component.metadata.isLocked ? (
              <Lock size={12} />
            ) : (
              <Unlock size={12} />
            )}
          </button>
          <button
            onClick={handleDuplicate}
            className="p-1 border-2 border-[var(--border)] hover:bg-[var(--bg-tertiary)] flex-shrink-0"
            title="Duplicate"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 border-2 border-[var(--border)] hover:bg-red-700 flex-shrink-0"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <>
          {component.children.map((childId) => (
            <SortableTreeItem
              key={childId}
              componentId={childId}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onContextMenu={onContextMenu}
            />
          ))}
        </>
      )}
    </>
  );
};

interface ContextMenuProps {
  x: number;
  y: number;
  componentId: string;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  componentId,
  onClose,
}) => {
  const component = useEditorStore((s) => s.components[componentId]);
  const addComponent = useEditorStore((s) => s.addComponent);
  const deleteComponent = useEditorStore((s) => s.deleteComponent);
  const duplicateComponent = useEditorStore((s) => s.duplicateComponent);
  const updateComponent = useEditorStore((s) => s.updateComponent);
  const copyComponents = useUIStore((s) => s.copyComponents);

  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(component?.metadata.name || "");

  const handleAddChild = (type: ComponentType) => {
    addComponent(componentId, type);
    onClose();
  };

  const handleRename = () => {
    setIsRenaming(true);
  };

  const handleRenameSubmit = () => {
    if (component && newName.trim()) {
      updateComponent(componentId, {
        metadata: { ...component.metadata, name: newName.trim() },
      });
    }
    setIsRenaming(false);
  };

  useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  if (!component) return null;

  const childTypes: {
    type: ComponentType;
    label: string;
    icon: React.ReactNode;
  }[] = [
      { type: "box", label: "Box", icon: <Square size={14} /> },
      { type: "text", label: "Text", icon: <Type size={14} /> },
      { type: "button", label: "Button", icon: <Box size={14} /> },
      { type: "image", label: "Image", icon: <Image size={14} /> },
      { type: "flex", label: "Flex", icon: <AlignJustify size={14} /> },
      { type: "grid", label: "Grid", icon: <LayoutGrid size={14} /> },
    ];

  return (
    <div
      className="fixed bg-[var(--bg-secondary)] border-[var(--border)] shadow-brutal py-1 z-50 min-w-[160px]"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {isRenaming ? (
        <div className="px-2 py-1">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
            onBlur={handleRenameSubmit}
            autoFocus
            className="w-full px-2 py-1 text-xs bg-[var(--bg-tertiary)] border-2 border-[var(--border)] text-[var(--text-primary)]"
          />
        </div>
      ) : (
        <>
          <div className="px-2 py-1 text-xs text-[var(--text-secondary)] border-b border-[var(--border)]">
            {component.metadata.name}
          </div>

          <div className="py-1">
            <div className="px-2 py-1 text-xs text-[var(--text-secondary)]">Add Child</div>
            {childTypes.map((item) => (
              <button
                key={item.type}
                onClick={() => handleAddChild(item.type)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          <div className="border-t border-[var(--border)] py-1">
            <button
              onClick={handleRename}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
            >
              Rename
            </button>
            <button
              onClick={() => {
                duplicateComponent(componentId);
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
            >
              <Copy size={12} />
              Duplicate
            </button>
            <button
              onClick={() => {
                copyComponents([component]);
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
            >
              Copy
            </button>
            <button
              onClick={() => {
                deleteComponent(componentId);
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-[var(--bg-tertiary)]"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

type ExpandAction =
  | { type: 'toggle'; id: string }
  | { type: 'expandAncestors'; ids: string[] };

const expandedReducer = (state: Set<string>, action: ExpandAction) => {
  const next = new Set(state);
  if (action.type === 'toggle') {
    if (next.has(action.id)) next.delete(action.id);
    else next.add(action.id);
  } else if (action.type === 'expandAncestors') {
    action.ids.forEach(id => next.add(id));
  }
  return next;
};

export const LayersPanel: React.FC = () => {
  const components = useEditorStore((s) => s.components);
  const rootId = useEditorStore((s) => s.rootId);
  const addComponent = useEditorStore((s) => s.addComponent);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const selectedIds = useEditorStore((s) => s.selectedIds);

  const [expandedIds, dispatch] = useReducer(expandedReducer, rootId ? [rootId] : [], (init) => new Set(init));
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    componentId: string;
  } | null>(null);

  // Auto-expand ancestors when a component is selected
  useEffect(() => {
    if (selectedIds.length === 0) return;
    const firstId = selectedIds[0];
    const comp = components[firstId];
    if (!comp) return;
    const toExpand: string[] = [];
    let current: UIComponent | undefined = comp;
    while (current?.parent) {
      const parent: UIComponent | undefined = components[current.parent];
      if (parent) {
        toExpand.push(parent.id);
        current = parent;
      } else break;
    }
    if (toExpand.length > 0) {
      dispatch({ type: 'expandAncestors', ids: toExpand });
    }
  }, [selectedIds, components]);

  const handleToggleExpand = useCallback((id: string) => {
    dispatch({ type: 'toggle', id });
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, componentId: id });
  }, []);

  const handleAddRoot = useCallback(() => {
    const newId = addComponent(rootId, "box");
    selectComponent(newId);
  }, [rootId, addComponent, selectComponent]);

  const flattenedIds = useMemo(() => {
    const result: string[] = [];
    const flatten = (id: string) => {
      result.push(id);
      const comp = components[id];
      if (comp?.children) {
        comp.children.forEach(flatten);
      }
    };
    if (rootId) flatten(rootId);
    return result;
  }, [components, rootId]);

  if (!rootId || !components[rootId]) {
    return (
      <div className="bg-[var(--bg-secondary)] w-full">
        <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">Layers</h2>
        </div>
        <div className="flex items-center justify-center p-4">
          <p className="text-xs text-[var(--text-muted)]">No canvas initialized</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-secondary)] w-full">
      <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--text-primary)]">Layers</h2>
        <button
          onClick={handleAddRoot}
          className="p-1.5 hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          title="Add component to root"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="py-1">
        <SortableContext
          items={flattenedIds}
          strategy={verticalListSortingStrategy}
        >
          <SortableTreeItem
            componentId={rootId}
            depth={0}
            expandedIds={expandedIds}
            onToggleExpand={handleToggleExpand}
            onContextMenu={handleContextMenu}
          />
        </SortableContext>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          componentId={contextMenu.componentId}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
