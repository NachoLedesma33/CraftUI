import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useSelectedId } from "@/store";
import { StylesTab } from "./properties/StylesTab";
import { ContentTab } from "./properties/ContentTab";
import { LayoutTab } from "./properties/LayoutTab";
import { AdvancedTab } from "./properties/AdvancedTab";
import { AnimationPanel } from "./AnimationPanel";
import { BreakpointSwitcher } from "@/components/canvas/BreakpointSwitcher";
import { ChevronDown, Trash2 } from "lucide-react";

export const PropertiesPanel: React.FC = () => {
  const selectedId = useSelectedId();
  const components = useEditorStore((s) => s.components);
  const updateComponent = useEditorStore((s) => s.updateComponent);
  const deleteSelected = useEditorStore((s) => s.deleteSelected);

  const [activeTab, setActiveTab] = useState<"styles" | "layout" | "config" | "advanced" | "animations">("styles");

  const component = selectedId ? components[selectedId] : null;

  if (!component) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-full w-full" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="w-16 h-16 border-2 border-black flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <span className="text-2xl opacity-20">⚙️</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Select an element<br/>to edit properties
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Breakpoint Switcher */}
      <div className="px-3 py-2 border-b-2 border-black" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <BreakpointSwitcher />
      </div>
      {/* Header Tabs */}
      <div className="flex border-b-2 border-black sticky top-0 z-20 shrink-0 overflow-x-auto scrollbar-hide" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {(["styles", "layout", "config", "advanced", "animations"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[80px] py-3 text-[10px] font-black uppercase tracking-[0.1em] transition-all ${
              activeTab === tab 
                ? "bg-black text-white" 
                : "hover:bg-[var(--bg-tertiary)] border-r border-black last:border-r-0"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-10 scrollbar-hide pb-24">
        {activeTab === "styles" && (
          <section className="animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-black uppercase tracking-tighter">Appearance</h3>
              <ChevronDown size={18} className="text-black/40" />
            </div>
            <StylesTab component={component} updateComponent={updateComponent} />
          </section>
        )}

        {activeTab === "layout" && (
          <section className="animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-black uppercase tracking-tighter">Layout Settings</h3>
              <ChevronDown size={18} className="text-black/40" />
            </div>
            <LayoutTab component={component} updateComponent={updateComponent} />
          </section>
        )}

        {activeTab === "config" && (
          <section className="animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-black uppercase tracking-tighter">Configuration</h3>
              <ChevronDown size={18} className="text-black/40" />
            </div>
            <ContentTab component={component} updateComponent={updateComponent} />
          </section>
        )}

        {activeTab === "advanced" && (
          <section className="animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-black uppercase tracking-tighter">Advanced Data</h3>
              <ChevronDown size={18} className="text-black/40" />
            </div>
            <AdvancedTab component={component} updateComponent={updateComponent} />
          </section>
        )}

        {activeTab === "animations" && (
          <section className="animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-black uppercase tracking-tighter">Animations</h3>
              <ChevronDown size={18} className="text-black/40" />
            </div>
            <AnimationPanel />
          </section>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-5 border-t-2 border-black mt-auto shrink-0 z-10" style={{ backgroundColor: 'var(--accent)' }}>
        <button 
          onClick={deleteSelected}
          className="w-full bg-black text-white border-2 border-black py-3 font-black brutal-shadow flex items-center justify-center gap-2 text-[10px] tracking-[0.2em] hover:bg-[#ef4444] transition-colors group"
        >
          <Trash2 size={14} className="group-hover:rotate-12 transition-transform" />
          DELETE ELEMENT
        </button>
      </div>
    </div>
  );
};
