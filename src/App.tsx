import { useState, useEffect, useCallback } from "react";
import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
import { Panel, Group, Separator } from "react-resizable-panels";
import { Toolbar } from "@/components/layout";
import { Canvas, CanvasOverlays, ResponsivePreview } from "@/components/canvas";
import { PropertiesPanel } from "@/components/panels/PropertiesPanel";
import { ComponentLibrary } from "@/components/panels/ComponentLibrary";
import { LayersPanel } from "@/components/panels/LayersPanel";
import { ExportModal } from "@/components/modals/ExportModal";
import { TemplateModal } from "@/components/modals/TemplateModal";
import { ShortcutsModal } from "@/components/modals/ShortcutsModal";
import { AutoSaveModal } from "@/components/modals/AutoSaveModal";
import { StatusBar, ErrorBoundary, ThemeProvider } from "@/components/ui";
import { useUIStore } from "@/store";
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
  const { showShortcutsModal, setShowShortcutsModal } = useKeyboardShortcuts();
  const { lastSaved, isEnabled, hasChanges } = useAutoSave();
  const {
    activeItem,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
  } = useDragDrop();

  const previewMode = useUIStore((s) => s.view.previewMode);

  // Listen for custom events from keyboard shortcuts
  useEffect(() => {
    const handleOpenExportModal = () => setIsExportOpen(true);
    window.addEventListener("openExportModal", handleOpenExportModal);
    return () =>
      window.removeEventListener("openExportModal", handleOpenExportModal);
  }, []);

  const handleMouseMove = useCallback((position: { x: number; y: number }) => {
    setMousePosition(position);
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
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div
            className="h-screen w-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            {/* Toolbar */}
            <Toolbar
              onExport={() => setIsExportOpen(true)}
              onTemplates={() => setIsTemplateModalOpen(true)}
              onAutoSave={() => setIsAutoSaveModalOpen(true)}
              autoSaveStatus={{ lastSaved, isEnabled, hasChanges }}
            />

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 relative">
              <Group orientation="horizontal" className="h-full w-full">
                {/* Left Panel - Component Library */}
                <Panel
                  defaultSize={18}
                  minSize={16}
                  maxSize={35}
                  className="z-10 bg-slate-800/95 border-r border-slate-700/80 overflow-hidden backdrop-blur-sm panel-enter-left"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderRightColor: "var(--border-color)",
                  }}
                >
                  <ComponentLibrary />
                </Panel>

                <Separator
                  className="w-1.5 bg-slate-800/60 hover:bg-blue-600/40 transition-all duration-200 cursor-col-resize z-20 group"
                  style={{ borderRight: "1px solid var(--border-color)" }}
                >
                  <div className="h-full w-px bg-slate-700/60 mx-auto group-hover:bg-blue-400 group-hover:shadow-lg" />
                </Separator>

                {/* Center Panel - Canvas */}
                <Panel
                  defaultSize={50}
                  minSize={20}
                  maxSize={75}
                  className="relative z-0 overflow-hidden flex flex-col"
                >
                  <div
                    className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden"
                    style={{ backgroundColor: "var(--bg-primary)" }}
                  >
                    <CanvasOverlays onMouseMove={handleMouseMove}>
                      <Canvas />
                    </CanvasOverlays>
                  </div>
                </Panel>

                <Separator
                  className="w-1.5 bg-slate-800/60 hover:bg-blue-600/40 transition-all duration-200 cursor-col-resize z-20 group"
                  style={{ borderLeft: "1px solid var(--border-color)" }}
                >
                  <div className="h-full w-px bg-slate-700/60 mx-auto group-hover:bg-blue-400 group-hover:shadow-lg" />
                </Separator>

                {/* Right Panel - Properties/Layers Tabs */}
                <Panel
                  defaultSize={18}
                  minSize={16}
                  maxSize={35}
                  className="z-10 bg-slate-800/95 flex flex-col overflow-hidden backdrop-blur-sm panel-enter-right"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderLeftColor: "var(--border-color)",
                  }}
                >
                  {/* Tab Navigation */}
                  <div
                    className="flex border-b border-slate-700/80 bg-slate-800/60 backdrop-blur-sm"
                    style={{ borderBottomColor: "var(--border-color)" }}
                  >
                    <button
                      onClick={() => setActiveRightTab("properties")}
                      className={`flex-1 px-4 py-3 text-xs font-semibold transition-all duration-200 relative ${activeRightTab === "properties" ? "text-blue-400 bg-slate-700/40" : "text-slate-400 hover:text-white hover:bg-slate-700/20"}`}
                    >
                      Properties
                      {activeRightTab === "properties" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveRightTab("layers")}
                      className={`flex-1 px-4 py-3 text-xs font-semibold transition-all duration-200 relative ${activeRightTab === "layers" ? "text-blue-400 bg-slate-700/40" : "text-slate-400 hover:text-white hover:bg-slate-700/20"}`}
                    >
                      Layers
                      {activeRightTab === "layers" && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400" />
                      )}
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
              </Group>
            </div>

            {/* Status Bar */}
            <StatusBar mousePosition={mousePosition} />
          </div>

          {/* Drag Overlay */}
          <DragOverlay>{dragOverlayContent}</DragOverlay>

          {/* Modals */}
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
        </DndContext>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
