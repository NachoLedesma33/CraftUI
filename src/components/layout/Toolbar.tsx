import React, { useState, useCallback, useMemo } from "react";
import { useTheme } from "@/components/ui";
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Box,
  Sun,
  Moon,
  Keyboard,
  ChevronRight,
  Loader2,
  PlayCircle,
  Cloud,
  Trash2,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { useEditorStore } from "@/store";
import { useUIStore } from "@/store";
import type { UIComponent } from "@/types/canvas";
import { AutoSaveIndicator } from "@/components/ui/AutoSaveIndicator";

interface ToolbarProps {
  onExport?: () => void;
  onTemplates?: () => void;
  onAutoSave?: () => void;
  onToggleComponents?: () => void;
  onToggleProperties?: () => void;
  onToggleLayers?: () => void;
  onToggleAssets?: () => void;
  componentsCollapsed?: boolean;
  propertiesCollapsed?: boolean;
  layersOpen?: boolean;
  assetsOpen?: boolean;
  autoSaveStatus?: {
    lastSaved: number | null;
    isEnabled: boolean;
    hasChanges: boolean;
    performSave: () => Promise<void>;
  };
}

const Breadcrumbs: React.FC = () => {
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const components = useEditorStore((s) => s.components);
  const selectComponent = useEditorStore((s) => s.selectComponent);

  const breadcrumb = useMemo(() => {
    if (selectedIds.length === 0) return null;
    const selectedId = selectedIds[0];
    const path: UIComponent[] = [];
    let current = components[selectedId];
    while (current) {
      path.unshift(current);
      if (current.parent) {
        current = components[current.parent];
      } else {
        break;
      }
    }
    return path;
  }, [selectedIds, components]);

  if (selectedIds.length > 1) {
    return <span className="text-[10px] font-black uppercase text-[#3b82f6] px-4 border-l-2 border-black/10 ml-4">{selectedIds.length} items selected</span>;
  }

  if (!breadcrumb || breadcrumb.length === 0) {
    return <span className="text-[10px] font-black uppercase text-black/20 px-4 border-l-2 border-black/10 ml-4">No selection</span>;
  }

  return (
    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tight px-4 border-l-2 border-black/10 ml-4">
      {breadcrumb.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && <ChevronRight size={10} className="text-black/40" />}
          <button
            onClick={() => selectComponent(item.id)}
            className={`px-1.5 py-0.5 transition-colors ${index === breadcrumb.length - 1 ? "bg-black text-white" : "hover:bg-black/10"}`}
          >
            {item.metadata.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

const ZoomControls: React.FC = () => {
  const zoom = useUIStore((s) => s.view.zoom);
  const zoomIn = useUIStore((s) => s.zoomIn);
  const zoomOut = useUIStore((s) => s.zoomOut);
  const setZoom = useUIStore((s) => s.setZoom);

  return (
    <div className="flex items-center gap-1.5 p-1 border-2 border-black bg-[#f5f0eb] shadow-[2px_2px_0_0_#000]">
      <button onClick={zoomOut} className="p-1 hover:bg-[#fbbf24] transition-colors" title="Zoom Out"><ZoomOut size={14} /></button>
      <input
        type="number"
        value={Math.round(zoom * 100)}
        onChange={(e) => setZoom(parseInt(e.target.value) / 100)}
        className="w-10 bg-transparent text-[10px] font-black text-center outline-none"
      />
      <span className="text-[9px] font-black mr-1">%</span>
      <button onClick={zoomIn} className="p-1 hover:bg-[#fbbf24] transition-colors" title="Zoom In"><ZoomIn size={14} /></button>
    </div>
  );
};

export const Toolbar: React.FC<ToolbarProps> = ({
  onExport,
  onTemplates,
  onAutoSave,
  onToggleComponents,
  onToggleProperties,
  onToggleLayers,
  onToggleAssets,
  componentsCollapsed,
  propertiesCollapsed,
  layersOpen,
  assetsOpen,
  autoSaveStatus,
}) => {
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.history.past.length > 0);
  const canRedo = useEditorStore((s) => s.history.future.length > 0);
  const addToast = useUIStore((s) => s.addToast);
  const components = useEditorStore((s) => s.components);
  const loadState = useEditorStore((s) => s.loadState);
  const saveToHistory = useEditorStore((s) => s.saveToHistory);

  const [isSaving, setIsSaving] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const handleSave = useCallback(async () => {
    if (!autoSaveStatus?.performSave) return;
    setIsSaving(true);
    try {
      await autoSaveStatus.performSave();
      addToast("Project saved!", "success");
    } catch {
      addToast("Save failed", "error");
    }
    setIsSaving(false);
  }, [addToast, autoSaveStatus]);

  const handleClear = useCallback(() => {
    const rootId = Object.values(components).find((c) => c.parent === null)?.id;
    if (rootId) {
      saveToHistory();
      loadState({ [rootId]: { ...components[rootId], children: [] } });
      addToast("Canvas cleared!", "info");
    }
  }, [components, loadState, saveToHistory, addToast]);

  return (
    <header className="h-16 bg-white border-b-2 border-black flex items-center justify-between px-6 z-50 sticky top-0">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-3 group cursor-pointer mr-4">
          <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-black shadow-[3px_3px_0_0_#fbbf24] transition-all group-hover:shadow-[5px_5px_0_0_#fbbf24] group-active:translate-x-[2px] group-active:translate-y-[2px] group-active:shadow-none">
            <Box size={20} className="text-white fill-current" />
          </div>
          <span className="text-xl font-black uppercase tracking-tighter">
            Craft UI <span className="text-[#ef4444]">Pro</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1 border-2 border-black bg-[#f5f0eb] p-1 shadow-[2px_2px_0_0_#000]">
          <button className="px-3 py-1.5 font-black text-[10px] uppercase hover:bg-black hover:text-white transition-all" onClick={onTemplates}>Project</button>
          <button className="px-3 py-1.5 font-black text-[10px] uppercase bg-black text-white">Editor</button>
          <button 
            className={`px-3 py-1.5 font-black text-[10px] uppercase transition-all ${!componentsCollapsed ? 'bg-[#fbbf24] text-black' : 'hover:bg-black hover:text-white'}`}
            onClick={onToggleComponents}
          >
            Library
          </button>
          <button 
            className={`px-3 py-1.5 font-black text-[10px] uppercase transition-all ${!propertiesCollapsed ? 'bg-[#3b82f6] text-white' : 'hover:bg-black hover:text-white'}`}
            onClick={onToggleProperties}
          >
            Inspector
          </button>
        </nav>

        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 border-r-2 border-black pr-6">
          <button onClick={undo} disabled={!canUndo} className="p-2 hover:bg-[#fbbf24] border-2 border-transparent hover:border-black transition-all disabled:opacity-20" title="Undo"><Undo2 size={20} className="stroke-[2.5]" /></button>
          <button onClick={redo} disabled={!canRedo} className="p-2 hover:bg-[#fbbf24] border-2 border-transparent hover:border-black transition-all disabled:opacity-20" title="Redo"><Redo2 size={20} className="stroke-[2.5]" /></button>
        </div>

        <ZoomControls />

        <div className="flex items-center gap-3 ml-2">
          {autoSaveStatus && (
            <AutoSaveIndicator {...autoSaveStatus} onClick={onAutoSave} />
          )}
          <button onClick={handleSave} disabled={isSaving} className="brutal-btn-ghost border-2 border-black px-4 py-2 font-black brutal-shadow text-[10px] tracking-widest uppercase flex items-center gap-2">
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Cloud size={14} className="stroke-[3]" />} SAVE
          </button>
          <button onClick={onExport} className="brutal-btn-primary border-2 border-black px-6 py-2 font-black brutal-shadow text-[10px] tracking-widest uppercase flex items-center gap-2">
            <PlayCircle size={14} className="stroke-[3]" /> EXPORT
          </button>
        </div>

        <div className="flex items-center gap-2 ml-4 border-l-2 border-black pl-6">
          <button 
            onClick={onToggleLayers} 
            className={`p-2 brutal-btn transition-colors ${layersOpen ? 'bg-black text-white' : 'bg-white hover:bg-[#fbbf24]'}`}
            title="Layers Panel"
          >
            <Layers size={18} className="stroke-[2.5]" />
          </button>
          <button 
            onClick={onToggleAssets} 
            className={`p-2 brutal-btn transition-colors ${assetsOpen ? 'bg-black text-white' : 'bg-white hover:bg-[#fbbf24]'}`}
            title="Asset Library"
          >
            <ImageIcon size={18} className="stroke-[2.5]" />
          </button>
          
          <div className="w-px h-6 bg-black/10 mx-1" />
          
          <button onClick={handleClear} className="p-2 brutal-btn bg-white hover:bg-[#ef4444] hover:text-white" title="Clear Canvas"><Trash2 size={18} className="stroke-[2.5]" /></button>
          <button onClick={toggleTheme} className="p-2 brutal-btn bg-white hover:bg-[#fbbf24]" title="Toggle Theme">{isDark ? <Sun size={18} className="stroke-[2.5]" /> : <Moon size={18} className="stroke-[2.5]" />}</button>
          <button className="p-2 brutal-btn bg-white hover:bg-[#fbbf24]" title="Keyboard Shortcuts"><Keyboard size={18} className="stroke-[2.5]" /></button>
        </div>
      </div>
    </header>
  );
};
