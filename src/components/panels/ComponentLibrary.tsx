import React, { useState, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Search,
  Square,
  Type,
  MousePointer2,
  Image as ImageIcon,
  Columns,
  LayoutGrid,
  AlignJustify,
  ChevronDown,
  HelpCircle,
  ExternalLink,
  CheckSquare,
  TextCursorInput,
} from "lucide-react";
import {
  componentBlueprints,
  categories as blueprintCategories,
  type ComponentBlueprint,
} from "@/constants/componentBlueprints";
import type { ComponentType } from "@/types/canvas";
import { useEditorStore } from "@/store";
import { useUIStore } from "@/store";
import { SidePanelScroll } from "@/components/ui/SidePanelScroll";

const componentIcons: Partial<Record<ComponentType, React.ReactNode>> = {
  box: <Square size={20} />,
  text: <Type size={20} />,
  button: <MousePointer2 size={20} />,
  image: <ImageIcon size={20} />,
  container: <AlignJustify size={20} />,
  flex: <Columns size={20} />,
  grid: <LayoutGrid size={20} />,
  input: <TextCursorInput size={20} />,
  checkbox: <CheckSquare size={20} />,
};

const DraggableItem: React.FC<{ blueprint: ComponentBlueprint; isForm?: boolean }> = ({ blueprint, isForm }) => {
  const addComponent = useEditorStore((s) => s.addComponent);
  const rootId = useEditorStore((s) => s.rootId);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const addToast = useUIStore((s) => s.addToast);
  const setLastAddedId = useUIStore((s) => s.setLastAddedId);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${blueprint.type}`,
    data: { type: "new", componentType: blueprint.type, blueprint },
  });

  const handleClick = () => {
    if (!rootId) return;
    const newId = addComponent(rootId, blueprint.type);
    if (newId) {
      selectComponent(newId);
      setLastAddedId(newId);
      setTimeout(() => setLastAddedId(null), 1200);
      addToast(`${blueprint.label} added`, "success");
    }
  };

  if (isForm) {
    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={handleClick}
        className={`bg-white border-2 border-black p-3 flex items-center gap-4 cursor-grab active:cursor-grabbing hover:border-[var(--accent-blue)] transition-all group ${isDragging ? "opacity-50" : ""}`}
      >
        <div className="w-8 h-8 border-2 border-black flex items-center justify-center bg-[#f5f0eb] group-hover:bg-[var(--accent-blue)] group-hover:text-white transition-colors">
          {componentIcons[blueprint.type] ?? <Square size={16} />}
        </div>
        <span className="text-xs font-black uppercase tracking-tight">{blueprint.label}</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={`
        bg-white border-2 border-black p-3 flex flex-col items-center justify-center gap-2 
        cursor-grab active:cursor-grabbing transition-all hover:bg-[var(--accent)] group
        ${isDragging ? "opacity-50" : "hover:shadow-[3px_3px_0_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5"}
      `}
    >
      <div className="transition-transform group-hover:scale-110">
        {componentIcons[blueprint.type] ?? <Square size={20} />}
      </div>
      <span className="text-[10px] font-black uppercase tracking-tight">{blueprint.label}</span>
    </div>
  );
};

export const ComponentLibrary: React.FC = () => {
  const [search, setSearch] = useState("");
  
  const filteredBlueprints = useMemo(() => {
    const q = search.toLowerCase();
    return componentBlueprints.filter(bp => 
      bp.label.toLowerCase().includes(q) || bp.category.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="side-panel-fill bg-white">
      <div className="p-4 border-b-2 border-black bg-[#f5f0eb]">
        <div className="relative group">
          <input
            type="text"
            placeholder="SEARCH COMPONENTS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-black px-4 py-2 text-xs font-black placeholder:text-black/40 focus:shadow-[4px_4px_0_0_#000] outline-none transition-all"
          />
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-black" />
        </div>
      </div>

      <SidePanelScroll className="p-4 space-y-8 scrollbar-hide">
        {blueprintCategories.map((cat) => {
          const catBlueprints = filteredBlueprints.filter(bp => bp.category === cat.id);
          if (catBlueprints.length === 0) return null;

          return (
            <section key={cat.id}>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6b7280] mb-4 flex items-center justify-between">
                {cat.label}
                <ChevronDown size={14} />
              </h3>
              <div className={cat.id === "form" ? "space-y-3" : "grid grid-cols-2 gap-3"}>
                {catBlueprints.map((bp) => (
                  <DraggableItem key={bp.type} blueprint={bp} isForm={cat.id === "form"} />
                ))}
              </div>
            </section>
          );
        })}
      </SidePanelScroll>

      <div className="p-4 bg-black text-white mt-auto flex items-center justify-between cursor-pointer hover:bg-[#ef4444] transition-colors">
        <div className="flex items-center gap-2">
          <HelpCircle size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">DOCS</span>
        </div>
        <ExternalLink size={18} />
      </div>
    </div>
  );
};
