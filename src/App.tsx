import React, { useState, useEffect, useCallback } from 'react';
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Toolbar } from '@/components/layout';
import { Canvas, CanvasOverlays, ResponsivePreview } from '@/components/canvas';
import { LayersPanel } from '@/components/panels/LayersPanel';
import { PropertiesPanel } from '@/components/panels/PropertiesPanel';
import { ComponentLibrary } from '@/components/panels/ComponentLibrary';
import { ExportModal } from '@/components/modals/ExportModal';
import { TemplateModal } from '@/components/modals/TemplateModal';
import { ShortcutsModal } from '@/components/modals/ShortcutsModal';
import { AutoSaveModal } from '@/components/modals/AutoSaveModal';
import { StatusBar, ErrorBoundary, ThemeProvider } from '@/components/ui';
import { useUIStore } from '@/store';
import { useKeyboardShortcuts } from '@/hooks';
import { useAutoSave } from '@/hooks';
import { useDragDrop, getDragOverlayContent } from '@/hooks';

function App() {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAutoSaveModalOpen, setIsAutoSaveModalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  // Initialize hooks
  const { showShortcutsModal, setShowShortcutsModal } = useKeyboardShortcuts();
  const { lastSaved, isEnabled, hasChanges } = useAutoSave();
  const { activeId, sensors, handleDragStart, handleDragEnd, handleDragOver } = useDragDrop();

  const previewMode = useUIStore((s) => s.view.previewMode);

  // Listen for custom events from keyboard shortcuts
  useEffect(() => {
    const handleOpenExportModal = () => setIsExportOpen(true);
    window.addEventListener('openExportModal', handleOpenExportModal);
    return () => window.removeEventListener('openExportModal', handleOpenExportModal);
  }, []);

  const handleMouseMove = useCallback((position: { x: number; y: number }) => {
    setMousePosition(position);
  }, []);

  const dragOverlayContent = getDragOverlayContent(activeId);

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
          <div className="h-screen flex flex-col bg-slate-900" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* Toolbar */}
            <Toolbar
              onExport={() => setIsExportOpen(true)}
              onTemplates={() => setIsTemplateModalOpen(true)}
              onAutoSave={() => setIsAutoSaveModalOpen(true)}
              autoSaveStatus={{ lastSaved, isEnabled, hasChanges }}
            />

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden">
              <PanelGroup direction="horizontal" className="h-full">
                {/* Left Panel - Component Library */}
                <Panel defaultSize={20} minSize={15} maxSize={35}>
                  <div className="h-full bg-slate-800 border-r border-slate-700" style={{ backgroundColor: 'var(--bg-secondary)', borderRightColor: 'var(--border-color)' }}>
                    <ComponentLibrary />
                  </div>
                </Panel>

                <PanelResizeHandle className="w-1 bg-slate-700 hover:bg-blue-500 transition-colors" style={{ backgroundColor: 'var(--border-color)' }} />

                {/* Center Panel - Canvas */}
                <Panel defaultSize={60} minSize={30}>
                  <div className="h-full bg-slate-900" style={{ backgroundColor: 'var(--bg-primary)' }}>
                    <CanvasOverlays onMouseMove={handleMouseMove}>
                      <Canvas />
                    </CanvasOverlays>
                  </div>
                </Panel>

                <PanelResizeHandle className="w-1 bg-slate-700 hover:bg-blue-500 transition-colors" style={{ backgroundColor: 'var(--border-color)' }} />

                {/* Right Panel - Properties/Layers Tabs */}
                <Panel defaultSize={20} minSize={15} maxSize={35}>
                  <div className="h-full bg-slate-800 border-l border-slate-700 flex flex-col" style={{ backgroundColor: 'var(--bg-secondary)', borderLeftColor: 'var(--border-color)' }}>
                    {/* Tab Navigation */}
                    <div className="flex border-b border-slate-700" style={{ borderBottomColor: 'var(--border-color)' }}>
                      <button className="flex-1 px-4 py-2 text-sm text-slate-300 bg-slate-700 border-r border-slate-600" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)', borderRightColor: 'var(--border-color)' }}>
                        Properties
                      </button>
                      <button className="flex-1 px-4 py-2 text-sm text-slate-400 hover:text-slate-300" style={{ color: 'var(--text-muted)' }}>
                        Layers
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-hidden">
                      <PropertiesPanel />
                    </div>
                  </div>
                </Panel>
              </PanelGroup>
            </div>

            {/* Status Bar */}
            <StatusBar mousePosition={mousePosition} />
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {dragOverlayContent}
          </DragOverlay>

          {/* Modals */}
          <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
          <TemplateModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} />
          <ShortcutsModal isOpen={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />
          <AutoSaveModal isOpen={isAutoSaveModalOpen} onClose={() => setIsAutoSaveModalOpen(false)} />
        </DndContext>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;