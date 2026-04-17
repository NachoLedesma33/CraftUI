import { EditorLayout } from '@/components/EditorLayout';
import { Toolbar } from '@/components/layout';
import { Canvas } from '@/components/canvas';
import { LayersPanel } from '@/components/panels/LayersPanel';
import { PropertiesPanel } from '@/components/panels/PropertiesPanel';
import { ComponentLibrary } from '@/components/panels/ComponentLibrary';
import { ExportModal } from '@/components/modals/ExportModal';
import { useState } from 'react';

function App() {
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <>
      <EditorLayout
        toolbar={<Toolbar onExport={() => setIsExportOpen(true)} />}
        leftPanel={<ComponentLibrary />}
        layersPanel={<LayersPanel />}
        propertiesPanel={<PropertiesPanel />}
      >
        <Canvas />
      </EditorLayout>
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </>
  );
}

export default App;
