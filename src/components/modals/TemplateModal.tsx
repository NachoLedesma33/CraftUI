import React, { useState, useMemo } from 'react';
import { templateLibrary } from '@/utils/templates';
import type { Template, TemplateCategory } from '@/types/template';
import { Download, Upload, Trash2, Search, Filter } from 'lucide-react';

const BUTTON_CLASS =
  'px-3 py-2 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:bg-slate-600';
const BUTTON_OUTLINE =
  'px-3 py-2 text-xs rounded border border-slate-600 hover:bg-slate-700 text-slate-200 transition-colors';
const INPUT_CLASS =
  'w-full px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-slate-200 focus:border-blue-500 focus:outline-none';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect?: (templateId: string) => void;
}

interface TemplateCardProps {
  template: Template;
  onSelect: (templateId: string) => void;
  onDelete?: (templateId: string) => void;
  onExport?: (templateId: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onSelect,
  onDelete,
  onExport,
}) => {
  return (
    <div className="flex flex-col rounded border border-slate-700 bg-slate-900 overflow-hidden hover:border-blue-500 transition-colors">
      {/* Thumbnail */}
      <div className="w-full h-32 bg-slate-800 flex items-center justify-center overflow-hidden">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-slate-500 text-xs text-center px-2">
            {template.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-3 flex flex-col">
        <h3 className="font-semibold text-sm text-white truncate">
          {template.name}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 mb-2">
          {template.description}
        </p>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {template.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 2 && (
              <span className="text-xs text-slate-400">
                +{template.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Badge del sistema */}
        {template.isSystem && (
          <div className="text-xs text-blue-400 mb-2">System Template</div>
        )}

        {/* Actions */}
        <div className="flex gap-1 mt-auto">
          <button
            onClick={() => onSelect(template.id)}
            className={`${BUTTON_CLASS} flex-1`}
          >
            Use
          </button>
          {onExport && (
            <button
              onClick={() => onExport(template.id)}
              className={BUTTON_OUTLINE}
              title="Export"
            >
              <Download size={14} />
            </button>
          )}
          {onDelete && !template.isSystem && (
            <button
              onClick={() => onDelete(template.id)}
              className={`${BUTTON_OUTLINE} hover:bg-red-600/20`}
              title="Delete"
            >
              <Trash2 size={14} className="text-red-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onTemplateSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>(
    'all'
  );
  const [selectedTab, setSelectedTab] = useState<'system' | 'user'>('system');
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null);

  const systemTemplates = useMemo(
    () =>
      templateLibrary.getPredefinedTemplates().filter((t) => {
        if (activeCategory !== 'all' && t.category !== activeCategory)
          return false;
        if (!searchQuery) return true;

        return (
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      }),
    [searchQuery, activeCategory]
  );

  const userTemplates = useMemo(
    () =>
      templateLibrary.getUserTemplates().filter((t) => {
        if (activeCategory !== 'all' && t.category !== activeCategory)
          return false;
        if (!searchQuery) return true;

        return (
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      }),
    [searchQuery, activeCategory]
  );

  const templates = selectedTab === 'system' ? systemTemplates : userTemplates;

  const handleSelectTemplate = async (templateId: string) => {
    setLoadingTemplateId(templateId);
    try {
      const result = await templateLibrary.loadTemplate(templateId, false);
      if (result.success) {
        onTemplateSelect?.(templateId);
        onClose();
      } else {
        alert(`Failed to load template: ${result.error}`);
      }
    } finally {
      setLoadingTemplateId(null);
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      const result = templateLibrary.deleteTemplate(templateId);
      if (result.success) {
        alert('Template deleted');
      } else {
        alert(`Failed to delete template: ${result.error}`);
      }
    }
  };

  const handleExportTemplate = (templateId: string) => {
    const result = templateLibrary.exportTemplateAsJSON(templateId);
    if (result.blob && result.filename) {
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert(`Failed to export: ${result.error}`);
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const templateName = file.name.replace('.json', '');

      const result = await templateLibrary.importFromJSON(content, templateName);
      if (result.success) {
        alert('Template imported successfully');
        setSelectedTab('user');
      } else {
        alert(`Failed to import: ${result.error}`);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  const categories: TemplateCategory[] = [
    'landing',
    'dashboard',
    'portfolio',
    'ecommerce',
    'auth',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg border border-slate-700 w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Templates</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 px-4">
          <button
            onClick={() => setSelectedTab('system')}
            className={`px-4 py-2 text-sm transition-colors ${
              selectedTab === 'system'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            System Templates
          </button>
          <button
            onClick={() => setSelectedTab('user')}
            className={`px-4 py-2 text-sm transition-colors ${
              selectedTab === 'user'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Templates ({userTemplates.length})
          </button>
          {selectedTab === 'user' && (
            <div className="ml-auto flex items-center gap-2">
              <label className={`${BUTTON_OUTLINE} cursor-pointer`}>
                <Upload size={14} />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-slate-700 space-y-3">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-slate-500" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 text-xs rounded whitespace-nowrap transition-colors ${
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 text-xs rounded whitespace-nowrap capitalize transition-colors ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto p-4">
          {templates.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400">
              No templates found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleSelectTemplate}
                  onDelete={handleDeleteTemplate}
                  onExport={handleExportTemplate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4 flex justify-end gap-2">
          <button onClick={onClose} className={BUTTON_OUTLINE}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
