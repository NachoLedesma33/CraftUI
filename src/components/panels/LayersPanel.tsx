import React, { useState, useCallback, useMemo, useEffect } from "react";
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
import type { ComponentType } from "@/types/canvas";

const componentIcons: Record<ComponentType, React.ReactNode> = {
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
    paddingLeft: `${depth * 16 + 8}px`,
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
      }
    },
    [componentId, component, updateComponent],
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
      }
    },
    [componentId, component, updateComponent],
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
          flex items-center gap-1 py-1 px-2 cursor-pointer select-none
          ${isSelected ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"}
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
            className="p-0.5 hover:bg-slate-600 rounded"
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

        <span className={`${isSelected ? "text-white" : "text-slate-400"}`}>
          {componentIcons[component.type] || <Box size={14} />}
        </span>

        <span className="flex-1 text-xs truncate">
          {component.metadata.name}
        </span>

        {hasChildren && (
          <span
            className={`text-xs px-1 rounded ${isSelected ? "bg-blue-500" : "bg-slate-600"}`}
          >
            {component.children.length}
          </span>
        )}

        <div
          className={`flex items-center gap-0.5 ${isHovered ? "opacity-100" : "opacity-0"}`}
        >
          <button
            onClick={handleToggleVisibility}
            className="p-1 hover:bg-slate-600 rounded"
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
            className="p-1 hover:bg-slate-600 rounded"
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
      className="fixed bg-slate-800 border border-slate-700 rounded shadow-lg py-1 z-50 min-w-[160px]"
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
            className="w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-white"
          />
        </div>
      ) : (
        <>
          <div className="px-2 py-1 text-xs text-slate-400 border-b border-slate-700">
            {component.metadata.name}
          </div>

          <div className="py-1">
            <div className="px-2 py-1 text-xs text-slate-400">Add Child</div>
            {childTypes.map((item) => (
              <button
                key={item.type}
                onClick={() => handleAddChild(item.type)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-700 py-1">
            <button
              onClick={handleRename}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
            >
              Rename
            </button>
            <button
              onClick={() => {
                duplicateComponent(componentId);
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
            >
              <Copy size={12} />
              Duplicate
            </button>
            <button
              onClick={() => {
                copyComponents([component]);
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
            >
              Copy
            </button>
            <button
              onClick={() => {
                deleteComponent(componentId);
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-slate-700"
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

export const LayersPanel: React.FC = () => {
  const components = useEditorStore((s) => s.components);
  const rootId = useEditorStore((s) => s.rootId);
  const addComponent = useEditorStore((s) => s.addComponent);
  const selectComponent = useEditorStore((s) => s.selectComponent);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    componentId: string;
  } | null>(null);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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

  useEffect(() => {
    if (rootId) {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.add(rootId);
        return next;
      });
    }
  }, [rootId]);

  if (!rootId || !components[rootId]) {
    return (
      <div className="bg-slate-800 flex flex-col h-full w-full">
        <div className="p-3 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">Layers</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-slate-400">No canvas initialized</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 flex flex-col h-full w-full overflow-hidden">
      <div className="p-3 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
        <h2 className="text-sm font-medium text-white">Layers</h2>
        <button
          onClick={handleAddRoot}
          className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
          title="Add component to root"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 py-1">
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
