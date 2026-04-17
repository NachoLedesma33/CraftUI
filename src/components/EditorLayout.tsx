import React from 'react';
import { Canvas } from './canvas';

interface EditorLayoutProps {
  children?: React.ReactNode;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({ children }) => {
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900">
      <header className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4">
        <div className="text-white text-sm font-medium">Visual UI Editor</div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 bg-gray-800 border-r border-gray-700">
          <div className="p-3 border-b border-gray-700">
            <h2 className="text-white text-sm font-medium">Components</h2>
          </div>
          <div className="p-2">
            {children}
          </div>
        </aside>
        
        <main className="flex-1 flex flex-col">
          <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-2 gap-2">
            <button className="px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded">
              📐
            </button>
            <div className="flex-1" />
            <button className="px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded">
              📱
            </button>
            <button className="px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded">
              💻
            </button>
            <button className="px-2 py-1 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded">
              📱
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <Canvas />
          </div>
        </main>
        
        <aside className="w-72 bg-gray-800 border-l border-gray-700">
          <div className="p-3 border-b border-gray-700">
            <h2 className="text-white text-sm font-medium">Properties</h2>
          </div>
        </aside>
      </div>
    </div>
  );
};