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
  categories as blueprintCategories,
  type ComponentBlueprint,
} from "@/constants/componentBlueprints";
import type { ComponentType } from "@/types/canvas";
import { useEditorStore } from "@/store";
import { useUIStore } from "@/store";

const componentIcons: Partial<Record<ComponentType, React.ReactNode>> = {
  box: <Square size={16} />,
  text: <Type size={16} />,
  button: <MousePointer2 size={16} />,
  image: <Image size={16} />,
  container: <AlignJustify size={16} />,
  flex: <Columns size={16} />,
  grid: <LayoutGrid size={16} />,
};

const defaultPreview = <div className="w-full h-full bg-slate-400/20" />;

const componentPreviews: Partial<Record<ComponentType, React.ReactNode>> = {
  box: <div className="w-full h-full bg-violet-500/30" />,
  text: (
    <div className="w-full space-y-1 p-1">
      <div className="h-1.5 bg-slate-400/40 w-full" />
      <div className="h-1.5 bg-slate-400/30 w-3/4" />
      <div className="h-1.5 bg-slate-400/20 w-1/2" />
    </div>
  ),
  button: <div className="w-full h-full bg-violet-500 flex items-center justify-center text-[6px] text-white font-medium">Btn</div>,
  image: <div className="w-full h-full bg-emerald-500/30 flex items-center justify-center text-[var(--text-muted)]"><Image size={12} /></div>,
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
  input: <div className="w-full h-full bg-blue-100 border border-blue-300 flex items-center justify-center text-[7px] text-blue-600">input</div>,
  textarea: <div className="w-full h-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[7px] text-blue-500">textarea</div>,
  select: <div className="w-full h-full bg-gray-50 border border-gray-300 flex items-center justify-center text-[7px] text-gray-600">▼</div>,
  checkbox: <div className="w-full h-full flex items-center justify-center text-blue-500">☑</div>,
  radio: <div className="w-full h-full flex items-center justify-center text-blue-500">◉</div>,
  switch: <div className="w-full h-full flex items-center justify-center">⤶</div>,
  navbar: <div className="w-full h-full flex items-end p-1 gap-0.5"><div className="h-2 bg-slate-400/40 flex-1 rounded" /><div className="h-2 bg-slate-400/20 w-4 rounded" /><div className="h-2 bg-slate-400/20 w-4 rounded" /></div>,
  tabs: <div className="w-full h-full flex items-end p-1 gap-0.5"><div className="h-2 bg-violet-400/50 flex-1 rounded-t" /><div className="h-1.5 bg-slate-300/40 flex-1 rounded-t" /><div className="h-1.5 bg-slate-300/40 flex-1 rounded-t" /></div>,
  accordion: <div className="w-full h-full flex flex-col gap-0.5 p-1"><div className="h-1.5 bg-slate-300/50 w-full" /><div className="h-1.5 bg-slate-300/50 w-full" /></div>,
  dropdown: <div className="w-full h-full flex items-center justify-center text-[8px]">↕</div>,
  breadcrumbs: <div className="w-full h-full flex items-center gap-0.5 p-1"><span className="text-[6px]">Home</span><span className="text-[6px]">›</span><span className="text-[6px]">Page</span></div>,
  table: <div className="w-full h-full grid grid-cols-3 gap-px p-0.5 bg-slate-300"><div className="bg-slate-100" /><div className="bg-slate-100" /><div className="bg-slate-100" /><div className="bg-slate-50" /><div className="bg-slate-50" /><div className="bg-slate-50" /></div>,
  card: <div className="w-full h-full border-2 border-slate-300 bg-white shadow-sm" />,
  badge: <div className="w-full h-full flex items-center justify-center"><span className="text-[6px] bg-violet-500 text-white px-1 rounded-full">new</span></div>,
  avatar: <div className="w-full h-full bg-emerald-400/40 rounded-full" />,
  chip: <div className="w-full h-full flex items-center justify-center"><span className="text-[6px] bg-gray-200 px-1 rounded">tag</span></div>,
  tooltip: <div className="w-full h-full flex items-center justify-center text-[8px]">💬</div>,
  alert: <div className="w-full h-full bg-yellow-200 border border-yellow-400 flex items-center px-1 text-[7px]">⚠ alert</div>,
  toast: <div className="w-full h-full bg-gray-800 rounded flex items-center px-1 text-[7px] text-white">toast</div>,
  modal: <div className="w-full h-full border-2 border-slate-400 bg-white flex items-center justify-center text-[7px]">modal</div>,
  progress: <div className="w-full h-full bg-slate-200 flex items-center"><div className="w-3/5 h-full bg-violet-500" /></div>,
  skeleton: <div className="w-full h-full bg-slate-200 rounded animate-pulse" />,
  sidebar: <div className="w-full h-full bg-slate-100 border-r border-slate-300" />,
  header: <div className="w-full h-full bg-white border-b border-slate-300" />,
  footer: <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white text-[6px]">footer</div>,
  section: <div className="w-full h-full border border-dashed border-slate-400 bg-slate-50" />,
  hero: <div className="w-full h-full bg-gradient-to-b from-violet-200 to-violet-50 flex items-center justify-center text-[7px]">Hero</div>,
  "feature-grid": <div className="w-full h-full grid grid-cols-3 gap-0.5 p-0.5"><div className="bg-violet-200/60" /><div className="bg-violet-200/60" /><div className="bg-violet-200/60" /></div>,
  heading: <div className="w-full h-full flex items-center p-1"><div className="h-2.5 bg-slate-500/50 w-full" /></div>,
  blockquote: <div className="w-full h-full border-l-2 border-violet-400 pl-1 flex items-center text-[6px] italic">“quote”</div>,
  list: <div className="w-full h-full flex flex-col gap-0.5 p-1"><div className="h-1 bg-slate-400/30 w-full" /><div className="h-1 bg-slate-400/30 w-4/5" /><div className="h-1 bg-slate-400/30 w-3/5" /></div>,
  "code-block": <div className="w-full h-full bg-gray-900 flex items-center px-1"><span className="text-[5px] text-green-400 font-mono">{'</>'}</span></div>,
  divider: <div className="w-full h-full flex items-center"><div className="w-full h-px bg-slate-300" /></div>,
  video: <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white text-[8px]">▶</div>,
  icon: <div className="w-full h-full flex items-center justify-center text-amber-500">✦</div>,
  "icon-grid": <div className="w-full h-full grid grid-cols-3 gap-0.5 p-0.5"><div className="bg-amber-200/50 rounded" /><div className="bg-amber-200/50 rounded" /><div className="bg-amber-200/50 rounded" /></div>,
  gallery: <div className="w-full h-full grid grid-cols-2 gap-px p-0.5"><div className="bg-emerald-200/40" /><div className="bg-emerald-200/40" /><div className="bg-emerald-200/40" /><div className="bg-emerald-200/40" /></div>,
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
        <div className="text-lg">{componentIcons[blueprint.type] ?? blueprint.icon}</div>
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
        {componentPreviews[blueprint.type] ?? defaultPreview}
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
    new Set(["layout", "basic", "media", "form", "typography"]),
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
    const grouped: Record<string, ComponentBlueprint[]> = {};
    blueprintCategories.forEach((cat) => { grouped[cat.id] = []; });

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

  const categories = [...blueprintCategories];

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
