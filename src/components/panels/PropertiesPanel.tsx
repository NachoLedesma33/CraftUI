import React, { useState } from "react";
import { useEditorStore, useSelectedId } from "@/store";
import type { ComponentType } from "@/types/canvas";
import { AnimationPanel } from "./AnimationPanel";
import { StylesTab } from "./properties/StylesTab";
import { ContentTab } from "./properties/ContentTab";
import { LayoutTab } from "./properties/LayoutTab";
import { AdvancedTab } from "./properties/AdvancedTab";

export const PropertiesPanel: React.FC = () => {
  const selectedId = useSelectedId();
  const components = useEditorStore((s) => s.components);
  const updateComponent = useEditorStore((s) => s.updateComponent);

  const [activeTab, setActiveTab] = useState<"styles" | "content" | "layout" | "advanced" | "animations">("styles");

  const component = selectedId ? components[selectedId] : null;

  if (!component) {
    return (
      <div className="bg-slate-800 flex items-center justify-center p-8 h-full w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-slate-500">⚙️</span>
          </div>
          <p className="text-slate-400 text-sm text-center font-medium">
            Select an element to edit its properties
          </p>
          <p className="text-slate-500 text-xs text-center mt-1">
            Click on any component in the canvas to get started
          </p>
        </div>
      </div>
    );
  }

  const typeIcon = (type: ComponentType): string => {
    switch (type) {
      case "box": return "□";
      case "text": return "T";
      case "button": return "●";
      case "image": return "◎";
      case "container": return "▢";
      case "flex": return "≡";
      case "grid": return "⊞";
      default: return "○";
    }
  };

  return (
    <div className="bg-slate-800 flex flex-col h-full w-full overflow-hidden">
      <div className="p-4 border-b border-slate-700/80 flex items-center gap-3 flex-shrink-0 bg-gradient-to-r from-slate-800 to-slate-800/95">
        <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg flex items-center justify-center shadow-inner">
          <span className="text-lg">{typeIcon(component.type)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-white block truncate">{component.metadata.name}</span>
          <span className="text-xs text-slate-500">({component.type})</span>
        </div>
      </div>

      <div className="flex border-b border-slate-700/80 overflow-x-auto flex-shrink-0 bg-slate-800/50">
        {(["styles", "content", "layout", "advanced", "animations"] as const).map((tab) => (
          <button key={tab} type="button"
            className={`flex-1 py-3 text-xs font-medium capitalize transition-all duration-200 whitespace-nowrap relative ${activeTab === tab ? "text-violet-400 bg-slate-700/40" : "text-slate-400 hover:text-white hover:bg-slate-700/20"}`}
            onClick={() => setActiveTab(tab)}>
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === "styles" && <StylesTab component={component} updateComponent={updateComponent} />}
        {activeTab === "content" && <ContentTab component={component} updateComponent={updateComponent} />}
        {activeTab === "layout" && <LayoutTab component={component} updateComponent={updateComponent} />}
        {activeTab === "advanced" && <AdvancedTab component={component} updateComponent={updateComponent} />}
        {activeTab === "animations" && <AnimationPanel />}
      </div>
    </div>
  );
};
