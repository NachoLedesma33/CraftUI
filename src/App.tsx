import { useState, useCallback, useMemo, lazy, Suspense } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { Panel, Group, Separator } from "react-resizable-panels";
import { Toolbar, CommandPalette } from "@/components/layout";
import { Canvas, CanvasOverlays, ResponsivePreview } from "@/components/canvas";
import { PropertiesPanel } from "@/components/panels/PropertiesPanel";
import { ComponentLibrary } from "@/components/panels/ComponentLibrary";
import { LayersPanel } from "@/components/panels/LayersPanel";
import { StatusBar, ErrorBoundary, ThemeProvider, ToastContainer } from "@/components/ui";

const ExportModal = lazy(() => import("@/components/modals/ExportModal").then(m => ({ default: m.ExportModal })));
const TemplateModal = lazy(() => import("@/components/modals/TemplateModal").then(m => ({ default: m.default })));
const ShortcutsModal = lazy(() => import("@/components/modals/ShortcutsModal").then(m => ({ default: m.ShortcutsModal })));
const AutoSaveModal = lazy(() => import("@/components/modals/AutoSaveModal").then(m => ({ default: m.AutoSaveModal })));
import { useUIStore, useEditorStore } from "@/store";
import { useKeyboardShortcuts } from "@/hooks";
import { useAutoSave } from "@/hooks";
import { useDragDrop, getDragOverlayContent } from "@/hooks";

function App() {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAutoSaveModalOpen, setIsAutoSaveModalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<"properties" | "layers">(
    "properties",
  );

  // Initialize hooks
  const { showShortcutsModal, setShowShortcutsModal, showCommandPalette, setShowCommandPalette } = useKeyboardShortcuts({
    onSave: () => performSave(),
    onExport: () => setIsExportOpen(true),
  });
  const { lastSaved, isEnabled, hasChanges, performSave } = useAutoSave();
  const {
    activeItem,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    collisionDetection,
  } = useDragDrop();

  const previewMode = useUIStore((s) => s.view.previewMode);
  const panels = useUIStore((s) => s.panels);

  const commands = useMemo(() => [
    { id: "save", label: "Save Project", description: "Save current project state", shortcut: "⌘S", icon: "💾", category: "Project", action: () => performSave() },
    { id: "export", label: "Export Code", description: "Export project to HTML/CSS", shortcut: "⌘E", icon: "📦", category: "Project", action: () => setIsExportOpen(true) },
    { id: "templates", label: "Templates", description: "Open template gallery", icon: "📄", category: "Project", action: () => setIsTemplateModalOpen(true) },
    { id: "autosave", label: "Auto-Save Versions", description: "View and restore auto-saved versions", icon: "💿", category: "Project", action: () => setIsAutoSaveModalOpen(true) },
    { id: "preview", label: "Toggle Preview", description: "Switch between editor and preview mode", shortcut: "⌘P", icon: "👁", category: "Canvas", action: () => useUIStore.getState().setPreviewMode(!useUIStore.getState().view.previewMode) },
    { id: "grid", label: "Toggle Grid", description: "Show or hide the canvas grid", shortcut: "⌘G", icon: "⊞", category: "Canvas", action: () => useUIStore.getState().toggleGrid() },
    { id: "zoomin", label: "Zoom In", description: "Zoom into the canvas", shortcut: "+", icon: "🔍", category: "Canvas", action: () => useUIStore.getState().zoomIn() },
    { id: "zoomout", label: "Zoom Out", description: "Zoom out of the canvas", shortcut: "-", icon: "🔍", category: "Canvas", action: () => useUIStore.getState().zoomOut() },
    { id: "resetzoom", label: "Reset Zoom", description: "Reset zoom to 100%", shortcut: "0", icon: "🔍", category: "Canvas", action: () => useUIStore.getState().resetZoom() },
    { id: "undo", label: "Undo", description: "Undo last action", shortcut: "⌘Z", icon: "↩", category: "Editing", action: () => useEditorStore.getState().undo() },
    { id: "redo", label: "Redo", description: "Redo last undone action", shortcut: "⌘Y", icon: "↪", category: "Editing", action: () => useEditorStore.getState().redo() },
    { id: "duplicate", label: "Duplicate", description: "Duplicate selected component", shortcut: "⌘D", icon: "📋", category: "Editing", action: () => { const id = useEditorStore.getState().selectedIds[0]; if (id) useEditorStore.getState().duplicateComponent(id); } },
    { id: "delete", label: "Delete Selected", description: "Remove selected component(s)", shortcut: "⌫", icon: "🗑", category: "Editing", action: () => useEditorStore.getState().deleteSelected() },
    { id: "deselect", label: "Deselect All", description: "Clear current selection", shortcut: "Esc", icon: "✕", category: "Editing", action: () => useEditorStore.getState().clearSelection() },
    { id: "shortcuts", label: "Keyboard Shortcuts", description: "Show all keyboard shortcuts", shortcut: "?", icon: "⌨", category: "Help", action: () => setShowShortcutsModal(true) },
  ], [setShowShortcutsModal, setIsExportOpen, setIsTemplateModalOpen, setIsAutoSaveModalOpen, performSave]);

  const handleMouseMove = useCallback((position: { x: number; y: number }) => {
    setMousePosition(prev => {
      if (prev && Math.abs(prev.x - position.x) < 2 && Math.abs(prev.y - position.y) < 2) {
        return prev;
      }
      return position;
    });
  }, []);

  const dragOverlayContent = activeItem
    ? getDragOverlayContent(activeItem)
    : null;

  if (previewMode) {
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <ResponsivePreview />
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div
            className="h-screen w-screen flex flex-col overflow-hidden"
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            {/* Toolbar */}
            <Toolbar
              onExport={() => setIsExportOpen(true)}
              onTemplates={() => setIsTemplateModalOpen(true)}
              onAutoSave={() => setIsAutoSaveModalOpen(true)}
              autoSaveStatus={{ lastSaved, isEnabled, hasChanges, performSave }}
            />

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 relative">
              <Group orientation="horizontal" className="h-full w-full">
                {/* Left Panel - Component Library */}
                {panels.components && (
                  <Panel
                    defaultSize={18}
                    minSize={16}
                    maxSize={35}
                    className="z-10 overflow-hidden panel-enter-left"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      borderRight: "2px solid var(--border)",
                    }}
                  >
                    <ComponentLibrary />
                  </Panel>
                )}

                {panels.components && (
                  <Separator
                    className="w-[3px] bg-[var(--border)] cursor-col-resize z-20 hover:bg-[var(--accent)] transition-colors duration-100"
                  />
                )}

                {/* Center Panel - Canvas */}
                <Panel
                  defaultSize={50}
                  minSize={20}
                  maxSize={75}
                  className="relative z-0 overflow-hidden flex flex-col"
                >
                  <div
                    className="flex-1 relative overflow-hidden"
                    style={{ backgroundColor: "var(--bg-primary)" }}
                  >
                    <CanvasOverlays onMouseMove={handleMouseMove}>
                      <Canvas />
                    </CanvasOverlays>
                  </div>
                </Panel>

                {panels.properties && (
                  <Separator
                    className="w-[3px] bg-[var(--border)] cursor-col-resize z-20 hover:bg-[var(--accent)] transition-colors duration-100"
                  />
                )}

                {/* Right Panel - Properties/Layers Tabs */}
                {panels.properties && (
                  <Panel
                    defaultSize={18}
                    minSize={16}
                    maxSize={35}
                    className="z-10 flex flex-col overflow-hidden panel-enter-right"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      borderLeft: "2px solid var(--border)",
                    }}
                  >
                    {/* Tab Navigation */}
                    <div
                      className="flex"
                      style={{ borderBottom: "2px solid var(--border)" }}
                    >
                      <button
                        onClick={() => setActiveRightTab("properties")}
                        className={`flex-1 px-4 py-3 text-xs font-bold transition-all duration-100 relative ${
                          activeRightTab === "properties"
                            ? "text-[var(--bg-primary)] bg-[var(--accent)]"
                            : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-tertiary)]"
                        }`}
                        style={activeRightTab === "properties" ? { borderBottom: "2px solid var(--accent)", marginBottom: "-2px" } : {}}
                      >
                        Properties
                      </button>
                      <button
                        onClick={() => setActiveRightTab("layers")}
                        className={`flex-1 px-4 py-3 text-xs font-bold transition-all duration-100 relative ${
                          activeRightTab === "layers"
                            ? "text-[var(--bg-primary)] bg-[var(--accent)]"
                            : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-tertiary)]"
                        }`}
                        style={activeRightTab === "layers" ? { borderBottom: "2px solid var(--accent)", marginBottom: "-2px" } : {}}
                      >
                        Layers
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-hidden min-h-0 w-full">
                      {activeRightTab === "properties" ? (
                        <PropertiesPanel />
                      ) : (
                        <LayersPanel />
                      )}
                    </div>
                  </Panel>
                )}
              </Group>
            </div>

            {/* Status Bar */}
            <StatusBar mousePosition={mousePosition} />
          </div>

          {/* Drag Overlay */}
          <DragOverlay>{dragOverlayContent}</DragOverlay>

          {/* Command Palette */}
          <CommandPalette
            isOpen={showCommandPalette}
            onClose={() => setShowCommandPalette(false)}
            commands={commands}
          />

          {/* Modals */}
          <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"><div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent animate-spin" style={{ borderTopColor: "transparent" }} /></div>}>
            <ExportModal
              isOpen={isExportOpen}
              onClose={() => setIsExportOpen(false)}
            />
            <TemplateModal
              isOpen={isTemplateModalOpen}
              onClose={() => setIsTemplateModalOpen(false)}
            />
            <ShortcutsModal
              isOpen={showShortcutsModal}
              onClose={() => setShowShortcutsModal(false)}
            />
            <AutoSaveModal
              isOpen={isAutoSaveModalOpen}
              onClose={() => setIsAutoSaveModalOpen(false)}
            />
          </Suspense>
        </DndContext>
        <ToastContainer />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
