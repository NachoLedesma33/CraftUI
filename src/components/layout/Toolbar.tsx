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
    performSave: () => Promise<void>;
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
        className={`p-2 brutal-btn ${
          canUndo ? "text-[var(--text)]" : "text-[var(--text-muted)] cursor-not-allowed"
        }`}
        title="Undo (Ctrl+Z)"
        style={{ backgroundColor: canUndo ? "var(--bg-tertiary)" : "transparent" }}
      >
        <Undo2 size={18} />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`p-2 brutal-btn ${
          canRedo ? "text-[var(--text)]" : "text-[var(--text-muted)] cursor-not-allowed"
        }`}
        title="Redo (Ctrl+Y)"
        style={{ backgroundColor: canRedo ? "var(--bg-tertiary)" : "transparent" }}
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

  if (selectedIds.length > 1) {
    return <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>{selectedIds.length} selected</span>;
  }

  if (!breadcrumb || breadcrumb.length === 0) {
    return <span className="text-xs" style={{ color: "var(--text-muted)" }}>No selection</span>;
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      {breadcrumb.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && <ChevronRight size={12} style={{ color: "var(--text-muted)" }} />}
          <button
            onClick={() => selectComponent(item.id)}
            className={`px-2 py-1 brutal-btn`}
            style={{
              backgroundColor: index === breadcrumb.length - 1 ? "var(--bg-tertiary)" : "transparent",
              color: index === breadcrumb.length - 1 ? "var(--text)" : "var(--text-secondary)",
            }}
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
        className="p-1.5 brutal-btn"
        style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text)" }}
        title="Zoom Out"
      >
        <ZoomOut size={16} />
      </button>
      <input
        type="number"
        value={Math.round(zoom * 100)}
        onChange={handleInputChange}
        className="brutal-input w-14 px-2 py-1 text-xs text-center"
        min={50}
        max={200}
      />
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>%</span>
      <button
        onClick={onZoomIn}
        className="p-1.5 brutal-btn"
        style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text)" }}
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
    return <span className="text-xs px-2" style={{ color: "var(--text-muted)" }}>No selection</span>;
  }

  if (selectedIds.length === 1) {
    const component = components[selectedIds[0]];
    if (!component) return null;
    return (
      <span className="text-xs px-2" style={{ color: "var(--text-secondary)" }}>
        {component.type} · {component.metadata.name}
      </span>
    );
  }

  return (
    <span className="text-xs px-2" style={{ color: "var(--text-secondary)" }}>
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
        className={`p-2 brutal-btn`}
        style={{
          backgroundColor: panels.layers ? "var(--accent)" : "var(--bg-tertiary)",
          color: panels.layers ? "var(--bg-primary)" : "var(--text-secondary)",
        }}
        title="Toggle Layers Panel"
      >
        <Layers size={16} />
      </button>
      <button
        onClick={() => togglePanel("components")}
        className={`p-2 brutal-btn`}
        style={{
          backgroundColor: panels.components ? "var(--accent)" : "var(--bg-tertiary)",
          color: panels.components ? "var(--bg-primary)" : "var(--text-secondary)",
        }}
        title="Toggle Components Panel"
      >
        <Box size={16} />
      </button>
      <button
        onClick={() => togglePanel("properties")}
        className={`p-2 brutal-btn`}
        style={{
          backgroundColor: panels.properties ? "var(--accent)" : "var(--bg-tertiary)",
          color: panels.properties ? "var(--bg-primary)" : "var(--text-secondary)",
        }}
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
      className={`p-2 brutal-btn`}
      style={{
        backgroundColor: previewMode ? "var(--accent)" : "var(--bg-tertiary)",
        color: previewMode ? "var(--bg-primary)" : "var(--text-secondary)",
      }}
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
        className="p-2 brutal-btn"
        style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
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
          <div className="brutal-card absolute top-full right-0 mt-2 p-3 z-50 min-w-[200px]" style={{ boxShadow: "3px 3px 0 var(--border)" }}>
            <h4 className="text-xs font-bold mb-2" style={{ color: "var(--text)" }}>
              Keyboard Shortcuts
            </h4>
            <div className="space-y-1">
              {shortcuts.map((s) => (
                <div key={s.key} className="flex justify-between text-xs">
                  <span style={{ color: "var(--text-secondary)" }}>{s.action}</span>
                  <kbd className="px-1.5 py-0.5 border-2" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-tertiary)", color: "var(--text)", borderRadius: 0 }}>
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
      <div className="absolute inset-0 bg-black/80" onClick={onCancel} />
      <div className="brutal-card relative p-4 max-w-sm" style={{ boxShadow: "3px 3px 0 var(--border)" }}>
        <h3 className="text-sm font-bold mb-2" style={{ color: "var(--text)" }}>{title}</h3>
        <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs brutal-btn"
            style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text)" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-xs brutal-btn"
            style={{ backgroundColor: "#ef4444", color: "#fff" }}
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
  const saveToHistory = useEditorStore((s) => s.saveToHistory);
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
    try {
      if (autoSaveStatus && typeof autoSaveStatus.performSave === 'function') {
        await autoSaveStatus.performSave();
      }
    } catch {
      addToast("Save failed", "error");
    }
    setIsSaving(false);
    addToast("Project saved successfully!", "success");
  }, [addToast, autoSaveStatus]);

  const handleExport = useCallback(() => {
    onExport?.();
  }, [onExport]);

  const handleClear = useCallback(() => {
    const rootId = Object.values(components).find((c) => c.parent === null)?.id;
    if (rootId) {
      saveToHistory();
      const rootComponent = { ...components[rootId], children: [] };
      loadState({
        [rootId]: rootComponent,
      });
      addToast("Canvas cleared!", "info");
    }
    setShowClearDialog(false);
  }, [components, loadState, saveToHistory, addToast]);

  const toggleThemeHandler = useCallback(() => {
    toggleTheme();
    addToast(isDark ? "Light mode enabled" : "Dark mode enabled", "info");
  }, [isDark, toggleTheme, addToast]);

  return (
    <>
      <header className="mx-auto mt-3 w-full max-w-[calc(100%-32px)] xl:max-w-[1400px]">
        <div className="brutal-card flex h-12 items-center justify-between px-4 shadow-brutal rounded-none">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: "var(--accent)" }}>
                <span className="text-xs font-bold tracking-tight" style={{ color: "var(--bg-primary)" }}>V</span>
              </div>
              <span className="text-sm font-bold hidden sm:block tracking-tight" style={{ color: "var(--text)" }}>
                Visual UI
              </span>
            </div>

            <div className="h-6 w-px" style={{ backgroundColor: "var(--border)" }} />

            <HistoryControls
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
            />

            <div className="hidden md:flex items-center">
              <div className="h-6 w-px mr-3" style={{ backgroundColor: "var(--border)" }} />
              <Breadcrumbs />
            </div>
          </div>

          {/* Center section */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 p-1.5 border-2" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-tertiary)" }}>
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

            <div className="h-6 w-px" style={{ backgroundColor: "var(--border)" }} />

            <button
              onClick={() => onAutoSave?.()}
              className="p-2 brutal-btn"
              style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
              title="Auto-Save Versions"
            >
              <HardDrive size={15} />
            </button>

            <button
              onClick={() => onTemplates?.()}
              className="p-2 brutal-btn"
              style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
              title="Templates & Projects"
            >
              <FileText size={15} />
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-2 brutal-btn disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
              title="Save Project"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Cloud size={15} />}
            </button>

            <button
              onClick={handleExport}
              className="p-2 brutal-btn"
              style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
              title="Export Code"
            >
              <Download size={15} />
            </button>

            <button
              onClick={() => setShowClearDialog(true)}
              className="p-2 brutal-btn"
              style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
              title="Clear Canvas"
            >
              <Trash2 size={15} />
            </button>

            <button
              onClick={toggleThemeHandler}
              className="p-2 brutal-btn"
              style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
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
