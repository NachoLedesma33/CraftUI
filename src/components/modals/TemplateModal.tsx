import React, { useState, useMemo } from "react";
import { templateLibrary } from "@/utils/templates";
import type { Template, TemplateCategory } from "@/types/template";
import { Download, Upload, Trash2, Search } from "lucide-react";

const BUTTON_CLASS =
  "px-3 py-2 text-xs bg-[var(--accent)] hover:bg-violet-700 text-white transition-colors disabled:bg-[var(--bg-tertiary)]";
const BUTTON_OUTLINE =
  "px-3 py-2 text-xs border border-[var(--border)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors";
const INPUT_CLASS =
  "w-full px-2 py-1 text-xs bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-primary)] focus:border-violet-500 focus:outline-none";

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
    <div className="flex flex-col border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden hover:border-[var(--accent)] transition-colors">
      {/* Thumbnail */}
      <div className="w-full h-32 bg-[var(--bg-tertiary)] flex items-center justify-center overflow-hidden">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-[var(--text-muted)] text-xs text-center px-2">
            {template.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-3 flex flex-col">
        <h3 className="font-semibold text-sm text-[var(--text-primary)] truncate">
          {template.name}
        </h3>
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2">
          {template.description}
        </p>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {template.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 2 && (
              <span className="text-xs text-[var(--text-muted)]">
                +{template.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Badge del sistema */}
        {template.isSystem && (
          <div className="text-xs text-[var(--accent)] mb-2">System Template</div>
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    TemplateCategory | "all"
  >("all");
  const [selectedTab, setSelectedTab] = useState<"system" | "user">("system");

  const systemTemplates = useMemo(
    () =>
      templateLibrary.getPredefinedTemplates().filter((t) => {
        if (activeCategory !== "all" && t.category !== activeCategory)
          return false;
        if (!searchQuery) return true;

        return (
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        );
      }),
    [searchQuery, activeCategory],
  );

  const userTemplates = useMemo(
    () =>
      templateLibrary.getUserTemplates().filter((t) => {
        if (activeCategory !== "all" && t.category !== activeCategory)
          return false;
        if (!searchQuery) return true;

        return (
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        );
      }),
    [searchQuery, activeCategory],
  );

  const templates = selectedTab === "system" ? systemTemplates : userTemplates;

  const handleSelectTemplate = async (templateId: string) => {
    try {
      const result = await templateLibrary.loadTemplate(templateId, false);
      if (result.success) {
        onTemplateSelect?.(templateId);
        onClose();
      } else {
        alert(`Failed to load template: ${result.error}`);
      }
    } finally {
      // Done loading
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      const result = templateLibrary.deleteTemplate(templateId);
      if (result.success) {
        alert("Template deleted");
      } else {
        alert(`Failed to delete template: ${result.error}`);
      }
    }
  };

  const handleExportTemplate = (templateId: string) => {
    const result = templateLibrary.exportTemplateAsJSON(templateId);
    if (result.blob && result.filename) {
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
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
      const templateName = file.name.replace(".json", "");

      const result = await templateLibrary.importFromJSON(
        content,
        templateName,
      );
      if (result.success) {
        alert("Template imported successfully");
        setSelectedTab("user");
      } else {
        alert(`Failed to import: ${result.error}`);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  const categories: TemplateCategory[] = [
    "landing",
    "dashboard",
    "portfolio",
    "ecommerce",
    "auth",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Templates">
      <div className="bg-[var(--bg-secondary)] border-[var(--border)] w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-[var(--border)] p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Templates</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xl"
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)] px-4">
          <button
            onClick={() => setSelectedTab("system")}
            className={`px-4 py-2 text-sm transition-colors ${
              selectedTab === "system"
                ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            System Templates
          </button>
          <button
            onClick={() => setSelectedTab("user")}
            className={`px-4 py-2 text-sm transition-colors ${
              selectedTab === "user"
                ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            My Templates ({userTemplates.length})
          </button>
          {selectedTab === "user" && (
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
        <div className="p-4 border-b border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-[var(--text-muted)]" />
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
              onClick={() => setActiveCategory("all")}
              className={`px-3 py-1 text-xs whitespace-nowrap transition-colors ${
                activeCategory === "all"
                  ? "bg-[var(--accent)] text-[var(--text-primary)]"
                  : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 text-xs whitespace-nowrap capitalize transition-colors ${
                  activeCategory === cat
                    ? "bg-[var(--accent)] text-[var(--text-primary)]"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
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
            <div className="flex items-center justify-center h-32 text-[var(--text-secondary)]">
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
        <div className="border-t border-[var(--border)] p-4 flex justify-end gap-2">
          <button onClick={onClose} className={BUTTON_OUTLINE}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
