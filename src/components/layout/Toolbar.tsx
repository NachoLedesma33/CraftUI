import React, { useState, useCallback, useMemo } from "react";
import { useTheme } from "@/components/ui";
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Layers,
  Box,
  Settings,
  Cloud,
  Download,
  Trash2,
  Sun,
  Moon,
  Keyboard,
  ChevronRight,
  Loader2,
  FileText,
  HardDrive,
} from "lucide-react";
import { useEditorStore } from "@/store";
import { useUIStore } from "@/store";
import type { UIComponent } from "@/types/canvas";
import { AutoSaveIndicator } from "@/components/ui/AutoSaveIndicator";

interface ToolbarProps {
  onExport?: () => void;
  onTemplates?: () => void;
  onAutoSave?: () => void;
  autoSaveStatus?: {
    lastSaved: number | null;
    isEnabled: boolean;
    hasChanges: boolean;
  };
}

const HistoryControls: React.FC<{
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}> = ({ canUndo, canRedo, onUndo, onRedo }) => {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`p-2 rounded hover:bg-slate-700 ${
          canUndo ? "text-slate-200" : "text-slate-600 cursor-not-allowed"
        }`}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={18} />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`p-2 rounded hover:bg-slate-700 ${
          canRedo ? "text-slate-200" : "text-slate-600 cursor-not-allowed"
        }`}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 size={18} />
      </button>
    </div>
  );
};

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

  if (!breadcrumb || breadcrumb.length === 0) {
    return <span className="text-xs text-slate-500">No selection</span>;
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      {breadcrumb.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && <ChevronRight size={12} className="text-slate-500" />}
          <button
            onClick={() => selectComponent(item.id)}
            className={`px-2 py-1 rounded hover:bg-slate-700 ${
              index === breadcrumb.length - 1
                ? "text-white font-medium"
                : "text-slate-400"
            }`}
          >
            {item.metadata.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

const ZoomControls: React.FC<{
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomChange: (zoom: number) => void;
}> = ({ zoom, onZoomIn, onZoomOut, onZoomChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 50 && value <= 200) {
      onZoomChange(value / 100);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onZoomOut}
        className="p-1.5 rounded hover:bg-slate-600 text-slate-300"
        title="Zoom Out"
      >
        <ZoomOut size={16} />
      </button>
      <input
        type="number"
        value={Math.round(zoom * 100)}
        onChange={handleInputChange}
        className="w-14 px-2 py-1 text-xs text-center bg-slate-700 border border-slate-600 rounded text-white"
        min={50}
        max={200}
      />
      <span className="text-xs text-slate-400">%</span>
      <button
        onClick={onZoomIn}
        className="p-1.5 rounded hover:bg-slate-600 text-slate-300"
        title="Zoom In"
      >
        <ZoomIn size={16} />
      </button>
    </div>
  );
};

const SelectionIndicator: React.FC = () => {
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const components = useEditorStore((s) => s.components);

  if (selectedIds.length === 0) {
    return <span className="text-xs text-slate-500 px-2">No selection</span>;
  }

  if (selectedIds.length === 1) {
    const component = components[selectedIds[0]];
    if (!component) return null;
    return (
      <span className="text-xs text-slate-300 px-2">
        {component.type} · {component.metadata.name}
      </span>
    );
  }

  return (
    <span className="text-xs text-slate-300 px-2">
      {selectedIds.length} items selected
    </span>
  );
};

const PanelToggles: React.FC = () => {
  const panels = useUIStore((s) => s.panels);
  const togglePanel = useUIStore((s) => s.togglePanel);

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => togglePanel("layers")}
        className={`p-2 rounded ${panels.layers ? "bg-violet-600 text-white" : "text-slate-400 hover:bg-slate-700"}`}
        title="Toggle Layers Panel"
      >
        <Layers size={16} />
      </button>
      <button
        onClick={() => togglePanel("components")}
        className={`p-2 rounded ${panels.components ? "bg-violet-600 text-white" : "text-slate-400 hover:bg-slate-700"}`}
        title="Toggle Components Panel"
      >
        <Box size={16} />
      </button>
      <button
        onClick={() => togglePanel("properties")}
        className={`p-2 rounded ${panels.properties ? "bg-violet-600 text-white" : "text-slate-400 hover:bg-slate-700"}`}
        title="Toggle Properties Panel"
      >
        <Settings size={16} />
      </button>
    </div>
  );
};

const ViewModeToggle: React.FC = () => {
  const previewMode = useUIStore((s) => s.view.previewMode);
  const setPreviewMode = useUIStore((s) => s.setPreviewMode);

  return (
    <button
      onClick={() => setPreviewMode(!previewMode)}
      className={`p-2 rounded ${previewMode ? "bg-green-600 text-white" : "text-slate-400 hover:bg-slate-700"}`}
      title={previewMode ? "Exit Preview" : "Preview Mode"}
    >
      {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
};

const ShortcutsPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: "Ctrl + Z", action: "Undo" },
    { key: "Ctrl + Y", action: "Redo" },
    { key: "Ctrl + C", action: "Copy" },
    { key: "Ctrl + V", action: "Paste" },
    { key: "Ctrl + D", action: "Duplicate" },
    { key: "Delete", action: "Delete" },
    { key: "Escape", action: "Deselect" },
    { key: "Space + Drag", action: "Pan Canvas" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded text-slate-400 hover:bg-slate-700"
        title="Keyboard Shortcuts"
      >
        <Keyboard size={16} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 min-w-[200px]">
            <h4 className="text-xs font-medium text-white mb-2">
              Keyboard Shortcuts
            </h4>
            <div className="space-y-1">
              {shortcuts.map((s) => (
                <div key={s.key} className="flex justify-between text-xs">
                  <span className="text-slate-400">{s.action}</span>
                  <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ConfirmDialog: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-slate-800 border border-slate-700 rounded-lg p-4 max-w-sm shadow-xl">
        <h3 className="text-sm font-medium text-white mb-2">{title}</h3>
        <p className="text-xs text-slate-400 mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export const Toolbar: React.FC<ToolbarProps> = ({
  onExport,
  onTemplates,
  onAutoSave,
  autoSaveStatus,
}) => {
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.history.past.length > 0);
  const canRedo = useEditorStore((s) => s.history.future.length > 0);
  const loadState = useEditorStore((s) => s.loadState);
  const components = useEditorStore((s) => s.components);

  const view = useUIStore((s) => s.view);
  const zoomIn = useUIStore((s) => s.zoomIn);
  const zoomOut = useUIStore((s) => s.zoomOut);
  const setZoom = useUIStore((s) => s.setZoom);
  const addToast = useUIStore((s) => s.addToast);

  const [isSaving, setIsSaving] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    addToast("Project saved successfully!", "success");
  }, [addToast]);

  const handleExport = useCallback(() => {
    onExport?.();
    addToast("Code exported!", "success");
  }, [onExport, addToast]);

  const handleClear = useCallback(() => {
    const rootId = Object.values(components).find((c) => c.parent === null)?.id;
    if (rootId) {
      const rootComponent = components[rootId];
      loadState({
        [rootId]: rootComponent,
      });
      addToast("Canvas cleared!", "info");
    }
    setShowClearDialog(false);
  }, [components, loadState, addToast]);

  const toggleThemeHandler = useCallback(() => {
    toggleTheme();
    addToast(isDark ? "Light mode enabled" : "Dark mode enabled", "info");
  }, [isDark, toggleTheme, addToast]);

  return (
    <>
      <header className="mx-auto mt-3 w-full max-w-[calc(100%-32px)] xl:max-w-[1400px]">
        <div className="relative h-12 flex items-center justify-between px-4 bg-slate-800/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/20">
          {/* Top glow */}
          <div className="absolute -top-px left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent pointer-events-none" />

          {/* Left section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 group">
              <div className="w-7 h-7 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white text-xs font-bold tracking-tight">V</span>
              </div>
              <span className="text-sm font-semibold text-white hidden sm:block tracking-tight">
                Visual UI
              </span>
            </div>

            <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-600 to-transparent" />

            <HistoryControls
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
            />

            <div className="hidden md:flex items-center">
              <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-600 to-transparent mr-3" />
              <Breadcrumbs />
            </div>
          </div>

          {/* Center section */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-sm rounded-lg p-1.5 border border-slate-700/50">
              <ZoomControls
                zoom={view.zoom}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onZoomChange={setZoom}
              />
            </div>

            <SelectionIndicator />

            <PanelToggles />

            <ViewModeToggle />
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {autoSaveStatus && (
              <AutoSaveIndicator
                lastSaved={autoSaveStatus.lastSaved}
                isEnabled={autoSaveStatus.isEnabled}
                hasChanges={autoSaveStatus.hasChanges}
              />
            )}

            <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-600 to-transparent" />

            <button
              onClick={() => onAutoSave?.()}
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-700/80 hover:text-white transition-all duration-200"
              title="Auto-Save Versions"
            >
              <HardDrive size={15} />
            </button>

            <button
              onClick={() => onTemplates?.()}
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-700/80 hover:text-white transition-all duration-200"
              title="Templates & Projects"
            >
              <FileText size={15} />
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-700/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              title="Save Project"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Cloud size={15} />}
            </button>

            <button
              onClick={handleExport}
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-700/80 hover:text-white transition-all duration-200"
              title="Export Code"
            >
              <Download size={15} />
            </button>

            <button
              onClick={() => setShowClearDialog(true)}
              className="p-2 rounded-lg text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200"
              title="Clear Canvas"
            >
              <Trash2 size={15} />
            </button>

            <button
              onClick={toggleThemeHandler}
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-700/80 hover:text-white transition-all duration-200"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <ShortcutsPopover />
          </div>
        </div>
      </header>

      <ConfirmDialog
        isOpen={showClearDialog}
        title="Clear Canvas"
        message="Are you sure you want to clear all components? This action cannot be undone."
        onConfirm={handleClear}
        onCancel={() => setShowClearDialog(false)}
      />
    </>
  );
};
