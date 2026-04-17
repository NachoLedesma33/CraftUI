import React from 'react';

interface EditorLayoutProps {
  children?: React.ReactNode;
  toolbar?: React.ReactNode;
  leftPanel?: React.ReactNode;
  layersPanel?: React.ReactNode;
  propertiesPanel?: React.ReactNode;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  children,
  toolbar,
  leftPanel,
  layersPanel,
  propertiesPanel,
}) => {
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 overflow-hidden">
      {toolbar && (
        toolbar
      )}
      
      <div className="flex-1 flex overflow-hidden">
        {leftPanel && (
          <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0">
            <div className="p-3 border-b border-gray-700">
              <h2 className="text-white text-sm font-medium">Components</h2>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {leftPanel}
            </div>
          </aside>
        )}
        
        {layersPanel && (
          <aside className="w-56 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0">
            <div className="p-3 border-b border-gray-700">
              <h2 className="text-white text-sm font-medium">Layers</h2>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {layersPanel}
            </div>
          </aside>
        )}
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </main>
        
        {propertiesPanel && (
          <aside className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col shrink-0">
            <div className="p-3 border-b border-gray-700">
              <h2 className="text-white text-sm font-medium">Properties</h2>
            </div>
            <div className="flex-1 overflow-auto">
              {propertiesPanel}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
