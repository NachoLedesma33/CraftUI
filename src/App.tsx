import { useState, useCallback, useMemo, useRef, lazy, Suspense, useEffect } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { Panel, Group, Separator } from "react-resizable-panels";
import { Toolbar, CommandPalette } from "@/components/layout";
import { Canvas, CanvasOverlays, ResponsivePreview } from "@/components/canvas";
import { PropertiesPanel } from "@/components/panels/PropertiesPanel";
import { ComponentLibrary } from "@/components/panels/ComponentLibrary";
import { LayersPanel } from "@/components/panels/LayersPanel";
import { AssetLibrary } from "@/components/panels/AssetLibrary";
import { StatusBar, ErrorBoundary, ThemeProvider, ToastContainer } from "@/components/ui";
import { SidePanelScroll } from "@/components/ui/SidePanelScroll";

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
  const [activeRightTab, setActiveRightTab] = useState<"properties" | "layers" | "assets">(
    "properties",
  );
  const [componentsCollapsed, setComponentsCollapsed] = useState(false);
  const [propertiesCollapsed, setPropertiesCollapsed] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  const componentsPanelRef = useRef<any>(null);
  const propertiesPanelRef = useRef<any>(null);

  useEffect(() => {
    const update = () => setIsNarrow(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!isNarrow) return;
    componentsPanelRef.current?.collapse();
    propertiesPanelRef.current?.collapse();
  }, [isNarrow]);

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

  const toggleComponentsPanel = useCallback(() => {
    if (!componentsPanelRef.current) return;
    const willOpen = componentsPanelRef.current.isCollapsed();
    if (isNarrow && willOpen) {
      propertiesPanelRef.current?.collapse();
    }
    if (willOpen) {
      componentsPanelRef.current.expand();
    } else {
      componentsPanelRef.current.collapse();
    }
  }, [isNarrow]);

  const togglePropertiesPanel = useCallback(() => {
    if (!propertiesPanelRef.current) return;
    const willOpen = propertiesPanelRef.current.isCollapsed();
    if (isNarrow && willOpen) {
      componentsPanelRef.current?.collapse();
    }
    if (willOpen) {
      propertiesPanelRef.current.expand();
    } else {
      propertiesPanelRef.current.collapse();
    }
  }, [isNarrow]);

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
              onToggleComponents={toggleComponentsPanel}
              onToggleProperties={togglePropertiesPanel}
              onToggleLayers={() => useUIStore.getState().togglePanel("layers")}
              onToggleAssets={() => useUIStore.getState().togglePanel("assets")}
              componentsCollapsed={componentsCollapsed}
              propertiesCollapsed={propertiesCollapsed}
              layersOpen={panels.layers}
              assetsOpen={panels.assets}
              autoSaveStatus={{ lastSaved, isEnabled, hasChanges, performSave }}
            />

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 relative">
              <Group orientation="horizontal" className="h-full w-full">
                {/* Left Panel - Component Library */}
                <Panel
                  panelRef={componentsPanelRef}
                  id="components"
                  defaultSize="18%"
                  minSize="260px"
                  maxSize="360px"
                  groupResizeBehavior="preserve-pixel-size"
                  collapsible
                  collapsedSize="0%"
                  className="z-10 panel-enter-left"
                  data-collapsed={componentsCollapsed}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRight: "2px solid var(--border)",
                    position: "relative",
                    height: "100%",
                    minHeight: 0,
                    overflow: "hidden",
                  }}
                  onResize={(size) => setComponentsCollapsed(size.inPixels <= 1)}
                >
                  <ComponentLibrary />
                </Panel>

                <Separator
                  id="sep-components"
                  className="w-1 bg-black hover:bg-[#fbbf24] transition-colors cursor-col-resize z-20"
                  style={{ display: componentsCollapsed ? "none" : "block" }}
                />

                {/* Center Panel - Canvas */}
                <Panel
                  id="canvas"
                  defaultSize="60%"
                  minSize="240px"
                  maxSize="85%"
                  className="dot-grid"
                  style={{ backgroundColor: '#e8e2d8' }}
                >
                  <div className="flex-1 relative h-full flex items-start justify-center p-12 overflow-auto scrollbar-hide">
                    <CanvasOverlays onMouseMove={handleMouseMove}>
                      <Canvas />
                    </CanvasOverlays>
                  </div>
                </Panel>

                <Separator
                  id="sep-properties"
                  className="w-1 bg-black hover:bg-[#fbbf24] transition-colors cursor-col-resize z-20"
                  style={{ display: propertiesCollapsed ? "none" : "block" }}
                />

                {/* Right Panel - Properties/Layers Tabs */}
                <Panel
                  panelRef={propertiesPanelRef}
                  id="properties"
                  defaultSize="22%"
                  minSize="300px"
                  maxSize="460px"
                  groupResizeBehavior="preserve-pixel-size"
                  collapsible
                  collapsedSize="0%"
                  className="z-10 panel-enter-right"
                  data-collapsed={propertiesCollapsed}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderLeft: "2px solid var(--border)",
                    position: "relative",
                    height: "100%",
                    minHeight: 0,
                    overflow: "hidden",
                  }}
                  onResize={(size) => setPropertiesCollapsed(size.inPixels <= 1)}
                >
                  <div className="side-panel-fill">
                    <div className="flex flex-shrink-0 border-b-2 border-black">
                      <button
                        onClick={() => setActiveRightTab("properties")}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeRightTab === "properties"
                            ? "bg-black text-white"
                            : "hover:bg-[#f5f0eb] border-r-2 border-black"
                          }`}
                      >
                        Styles
                      </button>
                      <button
                        onClick={() => setActiveRightTab("layers")}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeRightTab === "layers"
                            ? "bg-black text-white"
                            : "hover:bg-[#f5f0eb] border-r-2 border-black"
                          }`}
                      >
                        Layers
                      </button>
                      <button
                        onClick={() => setActiveRightTab("assets")}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeRightTab === "assets"
                            ? "bg-black text-white"
                            : "hover:bg-[#f5f0eb]"
                          }`}
                      >
                        Assets
                      </button>
                    </div>

                    <SidePanelScroll>
                      {activeRightTab === "properties" ? (
                        <PropertiesPanel />
                      ) : activeRightTab === "layers" ? (
                        <LayersPanel />
                      ) : (
                        <AssetLibrary />
                      )}
                    </SidePanelScroll>
                  </div>
                </Panel>
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
