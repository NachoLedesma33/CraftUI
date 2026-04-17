import { EditorLayout } from '@/components/EditorLayout';
import { Toolbar } from '@/components/layout';
import { Canvas, ResponsivePreview } from '@/components/canvas';
import { LayersPanel } from '@/components/panels/LayersPanel';
import { PropertiesPanel } from '@/components/panels/PropertiesPanel';
import { ComponentLibrary } from '@/components/panels/ComponentLibrary';
import { ExportModal } from '@/components/modals/ExportModal';
import { TemplateModal } from '@/components/modals/TemplateModal';
import { ShortcutsModal } from '@/components/modals/ShortcutsModal';
import { AutoSaveModal } from '@/components/modals/AutoSaveModal';
import { useState, useEffect } from 'react';
import { useUIStore } from '@/store';
import { useKeyboardShortcuts } from '@/hooks';
import { useAutoSave } from '@/hooks';

function App() {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAutoSaveModalOpen, setIsAutoSaveModalOpen] = useState(false);
  
  // Initialize hooks
  const { showShortcutsModal, setShowShortcutsModal } = useKeyboardShortcuts();
  const { lastSaved, isEnabled, hasChanges } = useAutoSave();
  
  const previewMode = useUIStore((s) => s.view.previewMode);

  // Listen for custom events from keyboard shortcuts
  useEffect(() => {
    const handleOpenExportModal = () => setIsExportOpen(true);
    window.addEventListener('openExportModal', handleOpenExportModal);
    return () => window.removeEventListener('openExportModal', handleOpenExportModal);
  }, []);

  return (
    <>
      {previewMode ? (
        <ResponsivePreview />
      ) : (
        <EditorLayout
          toolbar={
            <Toolbar
              onExport={() => setIsExportOpen(true)}
              onTemplates={() => setIsTemplateModalOpen(true)}
              onAutoSave={() => setIsAutoSaveModalOpen(true)}
              autoSaveStatus={{ lastSaved, isEnabled, hasChanges }}
            />
          }
          leftPanel={<ComponentLibrary />}
          layersPanel={<LayersPanel />}
          propertiesPanel={<PropertiesPanel />}
        >
          <Canvas />
        </EditorLayout>
      )}
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <TemplateModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} />
      <ShortcutsModal isOpen={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />
      <AutoSaveModal isOpen={isAutoSaveModalOpen} onClose={() => setIsAutoSaveModalOpen(false)} />
    </>
  );
}

export default App;