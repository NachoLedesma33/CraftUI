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
  box: <div className="w-full h-full bg-gradient-to-br from-violet-400/50 to-violet-600/30 rounded" />,
  text: (
    <div className="w-full space-y-1 p-1">
      <div className="h-1.5 bg-slate-400/40 rounded w-full" />
      <div className="h-1.5 bg-slate-400/30 rounded w-3/4" />
      <div className="h-1.5 bg-slate-400/20 rounded w-1/2" />
    </div>
  ),
  button: <div className="w-full h-full bg-violet-500 rounded-sm flex items-center justify-center text-[6px] text-white font-medium">Btn</div>,
  image: <div className="w-full h-full bg-gradient-to-br from-emerald-400/40 to-emerald-600/30 rounded flex items-center justify-center text-slate-400"><Image size={12} /></div>,
  container: <div className="w-full h-full border border-slate-400/30 rounded bg-slate-400/5" />,
  flex: (
    <div className="w-full h-full flex gap-0.5 p-1">
      <div className="flex-1 bg-violet-400/30 rounded-sm" />
      <div className="flex-1 bg-violet-400/40 rounded-sm" />
      <div className="flex-1 bg-violet-400/30 rounded-sm" />
    </div>
  ),
  grid: (
    <div className="w-full h-full grid grid-cols-2 gap-0.5 p-0.5">
      <div className="bg-fuchsia-400/30 rounded-sm" />
      <div className="bg-fuchsia-400/30 rounded-sm" />
      <div className="bg-fuchsia-400/30 rounded-sm" />
      <div className="bg-fuchsia-400/30 rounded-sm" />
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

  const getCategoryColors = (category: string) => {
    switch (category) {
      case "layout":
        return "from-purple-500/30 to-purple-600/10 border-purple-500/20 text-purple-300 hover:from-purple-500/40 hover:to-purple-600/20";
      case "media":
        return "from-emerald-500/30 to-emerald-600/10 border-emerald-500/20 text-emerald-300 hover:from-emerald-500/40 hover:to-emerald-600/20";
      case "form":
        return "from-orange-500/30 to-orange-600/10 border-orange-500/20 text-orange-300 hover:from-orange-500/40 hover:to-orange-600/20";
      default:
        return "from-violet-500/30 to-violet-600/10 border-violet-500/20 text-violet-300 hover:from-violet-500/40 hover:to-violet-600/20";
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClickAdd}
      className={`
        flex items-center gap-3 p-3 rounded-xl cursor-grab active:cursor-grabbing
        bg-gradient-to-br ${getCategoryColors(blueprint.category)}
        border transition-all duration-200 min-w-0 group
        shadow-sm hover:shadow-md
        ${isDragging ? "opacity-50 z-50" : ""}
      `}
      title={`${blueprint.description} (click to add, drag to canvas)`}
    >
      <div
        className={`
        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
        bg-white/10 group-hover:bg-white/20
        transition-all duration-200
      `}
      >
        <div className="text-lg">{componentIcons[blueprint.type]}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate group-hover:text-violet-100 transition-colors">
          {blueprint.label}
        </div>
        <div className="text-xs text-slate-300 truncate hidden sm:block group-hover:text-slate-200 transition-colors">
          {blueprint.description}
        </div>
      </div>
      <div className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-slate-900/40 ring-1 ring-white/5 group-hover:ring-white/10 transition-all">
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
  const getCategoryBgColor = (id: string) => {
    switch (id) {
      case "layout":
        return "bg-purple-500/10 hover:bg-purple-500/15 border-purple-500/20";
      case "media":
        return "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20";
      case "form":
        return "bg-orange-500/10 hover:bg-orange-500/15 border-orange-500/20";
      default:
        return "bg-violet-500/10 hover:bg-violet-500/15 border-violet-500/20";
    }
  };

  const getCategoryTextColor = (id: string) => {
    switch (id) {
      case "layout":
        return "text-purple-300";
      case "media":
        return "text-emerald-300";
      case "form":
        return "text-orange-300";
      default:
        return "text-violet-300";
    }
  };

  return (
    <div className="mb-5">
      <button
        onClick={onToggle}
        className={`
          flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
          font-semibold text-sm transition-all duration-200
          ${getCategoryBgColor(category.id)} border
          ${getCategoryTextColor(category.id)} hover:text-white
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
        <div className="mt-3 space-y-2 border-l-2 border-slate-700 pl-4">
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
    <div className="flex flex-col bg-slate-800 h-full w-full">
      <div className="p-5 border-b border-slate-700/60 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-orange-500/20 rounded-lg flex items-center justify-center border border-violet-500/30 flex-shrink-0">
            <Box size={16} className="text-violet-400" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Components Library
          </h3>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-slate-700/40 border border-slate-600/60 rounded-xl text-white placeholder:text-slate-500 focus:border-violet-500/60 focus:bg-slate-700/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 backdrop-blur-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-colors"
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
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                  <Search size={24} className="text-slate-400 opacity-50" />
                </div>
                <p className="text-sm text-slate-400 text-center font-medium">
                  No components found for "{search}"
                </p>
                <p className="text-xs text-slate-500 text-center mt-1">
                  Try adjusting your search terms
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {Array.from(
                  new Set(filteredBlueprints.map((bp) => bp.category))
                ).map((cat) => (
                  <div key={cat}>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-1 py-2">
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

      <div className="p-4 border-t border-slate-700/60 bg-gradient-to-t from-slate-800/60 via-slate-800/40 to-slate-800 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
            <span className="text-xs">💡</span>
          </div>
          <p className="text-xs text-slate-400 text-center font-medium">
            Drag components to add them to your canvas
          </p>
        </div>
      </div>
    </div>
  );
};
