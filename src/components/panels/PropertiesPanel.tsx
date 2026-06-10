import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useSelectedId } from "@/store";
import type { ComponentType } from "@/types/canvas";
import { AnimationPanel } from "./AnimationPanel";
import { StylesTab } from "./properties/StylesTab";
import { ContentTab } from "./properties/ContentTab";
import { LayoutTab } from "./properties/LayoutTab";
import { AdvancedTab } from "./properties/AdvancedTab";

export const PropertiesPanel: React.FC = () => {
  const selectedId = useSelectedId();
  const rootId = useEditorStore((s) => s.rootId);
  const components = useEditorStore((s) => s.components);
  const updateComponent = useEditorStore((s) => s.updateComponent);

  const [activeTab, setActiveTab] = useState<"styles" | "content" | "layout" | "advanced" | "animations">("styles");

  const selectionFallback = selectedId ? components[selectedId] : null;
  const isRootFallback = !selectionFallback && !!rootId;
  const component = selectionFallback || (rootId ? components[rootId] : null);

  if (!component) {
    return (
      <div className="bg-[var(--bg-secondary)] flex items-center justify-center p-8 h-full w-full">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-[var(--text-muted)]">⚙️</span>
          </div>
          <p className="text-[var(--text-muted)] text-sm text-center font-medium">
            No canvas initialized
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
    <div className="bg-[var(--bg-secondary)] flex flex-col h-full w-full overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 bg-[var(--bg-tertiary)] flex items-center justify-center">
          <span className="text-lg">{typeIcon(component.type)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-[var(--text-primary)] block truncate">{component.metadata.name}</span>
          <span className="text-xs text-[var(--text-muted)]">
            {isRootFallback ? "Page / Root properties" : `(${component.type})`}
          </span>
        </div>
      </div>

      <div className="flex border-b-2 border-[var(--border)] overflow-x-auto flex-shrink-0">
        {(["styles", "content", "layout", "advanced", "animations"] as const).map((tab) => (
          <button key={tab} type="button" role="tab" aria-selected={activeTab === tab}
            className={`flex-1 py-3 text-xs font-medium capitalize whitespace-nowrap border-2 border-[var(--border)] -mb-[2px] ${activeTab === tab ? "bg-[var(--accent)] text-black" : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            onClick={() => setActiveTab(tab)}>
            {tab}
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
