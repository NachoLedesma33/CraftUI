import React, { useState, useCallback, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileCode,
  FileText,
  Code2,
  Package,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useEditorStore } from '@/store';
import { useUIStore } from '@/store';
import { exportToReact } from '@/utils/export/ReactExporter';
import { exportToHTML } from '@/utils/export/HTMLExporter';

export type ExportFramework = 'react-tsx' | 'html' | 'vue' | 'angular';
export type StylingStrategy = 'tailwind' | 'inline' | 'css-modules' | 'styled-components';

export interface ExportModalOptions {
  framework: ExportFramework;
  styling: StylingStrategy;
  includeReset: boolean;
  includeResponsive: boolean;
  minify: boolean;
  prettify: boolean;
  typescript: boolean;
  componentName: string;
}

const defaultModalOptions: ExportModalOptions = {
  framework: 'react-tsx',
  styling: 'tailwind',
  includeReset: true,
  includeResponsive: true,
  minify: false,
  prettify: true,
  typescript: true,
  componentName: 'MyComponent',
};

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }: ExportModalProps) => {
  const [options, setOptions] = useState<ExportModalOptions>(defaultModalOptions);
  const [activeTab, setActiveTab] = useState<'component' | 'styles' | 'config'>('component');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const components = useEditorStore((s) => s.components);
  const rootId = useEditorStore((s) => s.rootId);
  const addToast = useUIStore((s) => s.addToast);

  const generatedCode = useMemo(() => {
    if (!rootId || !components[rootId]) {
      return { main: '// No component selected', styles: '', config: '' };
    }

    setIsGenerating(true);

    try {
      if (options.framework === 'html') {
        const html = exportToHTML(components, rootId, {
          useClasses: options.styling === 'css-modules',
          minify: options.minify,
          includeReset: options.includeReset,
          componentName: options.componentName,
        });
        setIsGenerating(false);
        return { main: html, styles: '', config: '<!-- No additional config needed for HTML -->' };
      }

      if (options.framework === 'react-tsx') {
        const reactExport = exportToReact(components, rootId, {
          styling: options.styling as 'tailwind' | 'inline' | 'css-modules' | 'styled-components',
          typescript: options.typescript,
          prettify: options.prettify,
          componentName: options.componentName,
        });

        const mainFile = reactExport.files.find(f => f.filename.endsWith('.tsx') || f.filename.endsWith('.jsx'));
        const cssFile = reactExport.files.find(f => f.filename.endsWith('.css'));
        const configFile = reactExport.files.find(f => f.filename === 'tailwind.config.js');

        setIsGenerating(false);
        return {
          main: mainFile?.content || '// Error generating code',
          styles: cssFile?.content || '',
          config: configFile?.content || '',
        };
      }

      setIsGenerating(false);
      return { main: '// Framework not supported yet', styles: '', config: '' };
    } catch (error) {
      setIsGenerating(false);
      return { main: `// Error: ${error}`, styles: '', config: '' };
    }
  }, [components, rootId, options]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedCode.main);
      setCopied(true);
      addToast('Code copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Failed to copy code', 'error');
    }
  }, [generatedCode.main, addToast]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([generatedCode.main], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    let filename = `${options.componentName}.tsx`;
    if (options.framework === 'html') {
      filename = 'index.html';
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('File downloaded!', 'success');
  }, [generatedCode.main, options, addToast]);

  const handleDownloadAll = useCallback(() => {
    const files: { name: string; content: string }[] = [];
    
    files.push({ name: `${options.componentName}.tsx`, content: generatedCode.main });
    
    if (generatedCode.styles) {
      files.push({ name: `${options.componentName}.css`, content: generatedCode.styles });
    }
    
    if (generatedCode.config) {
      files.push({ name: 'tailwind.config.js', content: generatedCode.config });
    }

    const combinedContent = files.map(f => `=== ${f.name} ===\n${f.content}`).join('\n\n');
    const blob = new Blob([combinedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${options.componentName}_export.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('All files exported!', 'success');
  }, [generatedCode, options.componentName, addToast]);

  const updateOption = <K extends keyof ExportModalOptions>(key: K, value: ExportModalOptions[K]) => {
    setOptions((prev: ExportModalOptions) => ({ ...prev, [key]: value }));
  };

  const frameworkOptions: { value: ExportFramework; label: string; icon: React.ReactNode }[] = [
    { value: 'react-tsx', label: 'React (TSX)', icon: <Code2 size={16} /> },
    { value: 'html', label: 'HTML + CSS', icon: <FileText size={16} /> },
    { value: 'vue', label: 'Vue (SFC)', icon: <Code2 size={16} /> },
    { value: 'angular', label: 'Angular', icon: <Code2 size={16} /> },
  ];

  const stylingOptions: { value: StylingStrategy; label: string }[] = [
    { value: 'tailwind', label: 'Tailwind CSS' },
    { value: 'inline', label: 'Inline Styles' },
    { value: 'css-modules', label: 'CSS Modules' },
    { value: 'styled-components', label: 'Styled Components' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-slate-900 rounded-xl shadow-2xl w-[95vw] h-[85vh] max-w-7xl flex flex-col overflow-hidden border border-slate-700">
        <header className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileCode size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Export Project</h2>
              <p className="text-xs text-slate-400">Generate production-ready code</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Package size={16} />
              Export All
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-80 border-r border-slate-700 bg-slate-800/50 overflow-y-auto p-4 space-y-6">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Framework</label>
              <div className="space-y-1">
                {frameworkOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateOption('framework', opt.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      options.framework === opt.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Styling Strategy</label>
              <select
                value={options.styling}
                onChange={(e) => updateOption('styling', e.target.value as StylingStrategy)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                {stylingOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Component Name</label>
              <input
                type="text"
                value={options.componentName}
                onChange={(e) => updateOption('componentName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Options</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeReset}
                    onChange={(e) => updateOption('includeReset', e.target.checked)}
                    className="rounded border-slate-500"
                  />
                  Include CSS Reset
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeResponsive}
                    onChange={(e) => updateOption('includeResponsive', e.target.checked)}
                    className="rounded border-slate-500"
                  />
                  Responsive Media Queries
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.typescript}
                    onChange={(e) => updateOption('typescript', e.target.checked)}
                    className="rounded border-slate-500"
                  />
                  TypeScript
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.prettify}
                    onChange={(e) => updateOption('prettify', e.target.checked)}
                    className="rounded border-slate-500"
                  />
                  Prettify Code
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.minify}
                    onChange={(e) => updateOption('minify', e.target.checked)}
                    className="rounded border-slate-500"
                  />
                  Minify Output
                </label>
              </div>
            </div>
          </aside>

          <main className="flex-1 flex flex-col overflow-hidden bg-[#282c34]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-slate-800/50">
              <div className="flex gap-1">
                {['component', 'styles', 'config'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as typeof activeTab)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${
                      activeTab === tab
                        ? 'bg-[#282c34] text-white'
                        : 'bg-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-300 transition-colors"
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {isGenerating ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Generating code...
                  </div>
                </div>
              ) : (
                <SyntaxHighlighter
                  language={options.framework === 'html' ? 'html' : 'typescript'}
                  style={atomDark}
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    background: 'transparent',
                  }}
                  showLineNumbers
                  wrapLines
                >
                  {activeTab === 'component' ? generatedCode.main : 
                   activeTab === 'styles' ? generatedCode.styles : 
                   generatedCode.config}
                </SyntaxHighlighter>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};