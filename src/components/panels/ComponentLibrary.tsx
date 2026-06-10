import React, { useState, useCallback, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Search,
  Square,
  Type,
  MousePointer2,
  Image,
  Columns,
  LayoutGrid,
  AlignJustify,
  ChevronDown,
  ChevronRight,
  Box,
} from "lucide-react";
import {
  componentBlueprints,
  type ComponentBlueprint,
} from "@/constants/componentBlueprints";
import type { ComponentType } from "@/types/canvas";
import { useEditorStore } from "@/store";
import { useUIStore } from "@/store";

const componentIcons: Record<ComponentType, React.ReactNode> = {
  box: <Square size={16} />,
  text: <Type size={16} />,
  button: <MousePointer2 size={16} />,
  image: <Image size={16} />,
  container: <AlignJustify size={16} />,
  flex: <Columns size={16} />,
  grid: <LayoutGrid size={16} />,
};

const componentPreviews: Record<ComponentType, React.ReactNode> = {
  box: <div className="w-full h-full bg-gradient-to-br from-violet-400/50 to-violet-600/30" />,
  text: (
    <div className="w-full space-y-1 p-1">
      <div className="h-1.5 bg-slate-400/40 w-full" />
      <div className="h-1.5 bg-slate-400/30 w-3/4" />
      <div className="h-1.5 bg-slate-400/20 w-1/2" />
    </div>
  ),
  button: <div className="w-full h-full bg-violet-500 flex items-center justify-center text-[6px] text-white font-medium">Btn</div>,
  image: <div className="w-full h-full bg-gradient-to-br from-emerald-400/40 to-emerald-600/30 flex items-center justify-center text-[var(--text-muted)]"><Image size={12} /></div>,
  container: <div className="w-full h-full border border-slate-400/30 bg-slate-400/5" />,
  flex: (
    <div className="w-full h-full flex gap-0.5 p-1">
      <div className="flex-1 bg-violet-400/30" />
      <div className="flex-1 bg-violet-400/40" />
      <div className="flex-1 bg-violet-400/30" />
    </div>
  ),
  grid: (
    <div className="w-full h-full grid grid-cols-2 gap-0.5 p-0.5">
      <div className="bg-fuchsia-400/30" />
      <div className="bg-fuchsia-400/30" />
      <div className="bg-fuchsia-400/30" />
      <div className="bg-fuchsia-400/30" />
    </div>
  ),
};

interface DraggableItemProps {
  blueprint: ComponentBlueprint;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ blueprint }) => {
  const addComponent = useEditorStore((s) => s.addComponent);
  const rootId = useEditorStore((s) => s.rootId);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const addToast = useUIStore((s) => s.addToast);
  const setLastAddedId = useUIStore((s) => s.setLastAddedId);

  const handleClickAdd = useCallback(() => {
    if (!rootId) return;
    const newId = addComponent(rootId, blueprint.type);
    if (newId) {
      selectComponent(newId);
      setLastAddedId(newId);
      setTimeout(() => setLastAddedId(null), 1200);
      addToast(`${blueprint.label} added to canvas`, "success", 2000);
    }
  }, [rootId, blueprint, addComponent, selectComponent, addToast, setLastAddedId]);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${blueprint.type}`,
    data: {
      type: "new",
      componentType: blueprint.type,
      blueprint,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClickAdd}
          className={`
        flex items-center gap-3 p-3 cursor-grab active:cursor-grabbing
        bg-[var(--bg-secondary)] border-2 border-[var(--border)]
        transition-all duration-200 min-w-0 group
        hover:shadow-brutal
        ${isDragging ? "opacity-50 z-50" : ""}
      `}
      title={`${blueprint.description} (click to add, drag to canvas)`}
    >
      <div
        className={`
        w-10 h-10 flex items-center justify-center flex-shrink-0
        bg-[var(--bg-tertiary)]
        transition-all duration-200
      `}
      >
        <div className="text-lg">{componentIcons[blueprint.type]}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[var(--text-primary)] truncate transition-colors">
          {blueprint.label}
        </div>
        <div className="text-xs text-[var(--text-secondary)] truncate hidden sm:block transition-colors">
          {blueprint.description}
        </div>
      </div>
      <div className="w-10 h-10 flex-shrink-0 overflow-hidden bg-[var(--bg-tertiary)] transition-all">
        {componentPreviews[blueprint.type]}
      </div>
    </div>
  );
};

interface CategorySectionProps {
  category: { id: string; label: string; icon: string };
  blueprints: ComponentBlueprint[];
  isExpanded: boolean;
  onToggle: () => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  blueprints,
  isExpanded,
  onToggle,
}) => {
  return (
    <div className="mb-5">
      <button
        onClick={onToggle}
        className={`
          flex items-center gap-3 w-full px-3 py-2.5
          font-semibold text-sm transition-all duration-200
          bg-[var(--bg-tertiary)] border-2 border-[var(--border)]
          text-[var(--text-secondary)] hover:text-[var(--text-primary)]
          group
        `}
      >
        <span className="flex-shrink-0 transition-transform duration-300">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <span className="flex-shrink-0 text-lg opacity-75 group-hover:opacity-100">
          {category.icon}
        </span>
        <span className="flex-1 min-w-0 truncate text-left">
          {category.label}
        </span>
        <span className="ml-auto flex-shrink-0 text-xs font-medium opacity-70">
          {blueprints.length}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2 border-l-2 border-[var(--border)] pl-4">
          {blueprints.map((bp) => (
            <DraggableItem key={bp.type} blueprint={bp} />
          ))}
        </div>
      )}
    </div>
  );
};



export const ComponentLibrary: React.FC = () => {
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["layout", "basic", "media"]),
  );

  const filteredBlueprints = useMemo(() => {
    if (!search.trim()) return componentBlueprints;

    const query = search.toLowerCase();
    return componentBlueprints.filter(
      (bp) =>
        bp.label.toLowerCase().includes(query) ||
        bp.description.toLowerCase().includes(query) ||
        bp.category.toLowerCase().includes(query),
    );
  }, [search]);

  const blueprintsByCategory = useMemo(() => {
    const grouped: Record<string, ComponentBlueprint[]> = {
      layout: [],
      basic: [],
      media: [],
      form: [],
    };

    filteredBlueprints.forEach((bp) => {
      if (grouped[bp.category]) {
        grouped[bp.category].push(bp);
      }
    });

    return grouped;
  }, [filteredBlueprints]);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const categories = [
    { id: "layout", label: "Layout", icon: "▦" },
    { id: "basic", label: "Basic", icon: "□" },
    { id: "media", label: "Media", icon: "◎" },
    { id: "form", label: "Form", icon: "▢" },
  ];

  return (
    <div className="flex flex-col bg-[var(--bg-secondary)] h-full w-full">
      <div className="p-5 border-b border-[var(--border)]">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <Box size={16} className="text-violet-400" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Components Library
          </h3>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-[var(--bg-tertiary)] border-2 border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none brutal-input"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 border-2 border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-2">
        {search ? (
          <div className="space-y-3">
            {filteredBlueprints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                <div className="w-16 h-16 bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
                  <Search size={24} className="text-[var(--text-muted)] opacity-50" />
                </div>
                <p className="text-sm text-[var(--text-muted)] text-center font-medium">
                  No components found for "{search}"
                </p>
                <p className="text-xs text-[var(--text-muted)] text-center mt-1">
                  Try adjusting your search terms
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {Array.from(
                  new Set(filteredBlueprints.map((bp) => bp.category))
                ).map((cat) => (
                  <div key={cat}>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold px-1 py-2">
                      {cat}
                    </div>
                    {filteredBlueprints
                      .filter((bp) => bp.category === cat)
                      .map((bp) => (
                        <DraggableItem key={bp.type} blueprint={bp} />
                      ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                blueprints={blueprintsByCategory[category.id]}
                isExpanded={expandedCategories.has(category.id)}
                onToggle={() => toggleCategory(category.id)}
              />
            ))}
          </>
        )}
      </div>

      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center">
            <span className="text-xs">💡</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] text-center font-medium">
            Drag components to add them to your canvas
          </p>
        </div>
      </div>
    </div>
  );
};
