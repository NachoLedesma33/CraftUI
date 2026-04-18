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

const componentIcons: Record<ComponentType, React.ReactNode> = {
  box: <Square size={16} />,
  text: <Type size={16} />,
  button: <MousePointer2 size={16} />,
  image: <Image size={16} />,
  container: <AlignJustify size={16} />,
  flex: <Columns size={16} />,
  grid: <LayoutGrid size={16} />,
};

interface DraggableItemProps {
  blueprint: ComponentBlueprint;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ blueprint }) => {
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
        return "from-blue-500/30 to-blue-600/10 border-blue-500/20 text-blue-300 hover:from-blue-500/40 hover:to-blue-600/20";
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        flex items-center gap-3 p-3 rounded-xl cursor-grab active:cursor-grabbing
        bg-gradient-to-br ${getCategoryColors(blueprint.category)}
        border transition-all duration-200 min-w-0 group
        shadow-sm hover:shadow-md
        ${isDragging ? "opacity-50 z-50" : ""}
      `}
      title={blueprint.description}
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
        <div className="text-sm font-semibold text-white truncate group-hover:text-blue-100 transition-colors">
          {blueprint.label}
        </div>
        <div className="text-xs text-slate-300 truncate hidden sm:block group-hover:text-slate-200 transition-colors">
          {blueprint.description}
        </div>
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
        return "bg-blue-500/10 hover:bg-blue-500/15 border-blue-500/20";
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
        return "text-blue-300";
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
        <div className="mt-3 space-y-2 pl-2 border-l-2 border-slate-700 pl-4">
          {blueprints.map((bp) => (
            <DraggableItem key={bp.type} blueprint={bp} />
          ))}
        </div>
      )}
    </div>
  );
};

const TemplatesSection: React.FC = () => {
  return (
    <div className="mt-8 pt-6 border-t border-slate-700">
      <div className="px-3 py-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
        My Components
      </div>
      <div className="p-5 border-2 border-dashed border-slate-600 rounded-xl text-center group hover:border-slate-500 hover:bg-slate-700/30 transition-all duration-200">
        <div className="flex justify-center mb-3">
          <div className="p-3 rounded-lg bg-slate-700/50 group-hover:bg-slate-600/50">
            <Box
              size={32}
              className="text-slate-400 group-hover:text-slate-300"
            />
          </div>
        </div>
        <p className="text-sm font-semibold text-slate-300 mb-1">Coming Soon</p>
        <p className="text-xs text-slate-500">
          Save and reuse your custom components
        </p>
      </div>
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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
            <Box size={16} className="text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Components Library
          </h3>
        </div>
        <input
          type="text"
          placeholder="Search components..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 text-sm bg-slate-700/40 border border-slate-600/60 rounded-xl text-white placeholder:text-slate-500 focus:border-blue-500/60 focus:bg-slate-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 backdrop-blur-sm"
        />
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
                {filteredBlueprints.map((bp) => (
                  <DraggableItem key={bp.type} blueprint={bp} />
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
            <TemplatesSection />
          </>
        )}
      </div>

      <div className="p-4 border-t border-slate-700/60 bg-gradient-to-t from-slate-800/60 via-slate-800/40 to-slate-800 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
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
