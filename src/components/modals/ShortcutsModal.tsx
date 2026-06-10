import React, { useMemo } from "react";
import { X, Keyboard } from "lucide-react";

interface Shortcut {
  keys: string[];
  description: string;
  category: "Project" | "Editing" | "Canvas" | "Help";
}

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS: Shortcut[] = [
  // Project Management
  {
    category: "Project",
    keys: ["Ctrl", "S"],
    description: "Save Project",
  },
  {
    category: "Project",
    keys: ["Ctrl", "E"],
    description: "Export Code",
  },
  {
    category: "Project",
    keys: ["Ctrl", "P"],
    description: "Toggle Preview Mode",
  },

  // Editing Structural
  {
    category: "Editing",
    keys: ["Ctrl", "Z"],
    description: "Undo",
  },
  {
    category: "Editing",
    keys: ["Ctrl", "Y"],
    description: "Redo",
  },
  {
    category: "Editing",
    keys: ["Ctrl", "D"],
    description: "Duplicate Component",
  },
  {
    category: "Editing",
    keys: ["Delete"],
    description: "Delete Selected",
  },
  {
    category: "Editing",
    keys: ["Ctrl", "C"],
    description: "Copy",
  },
  {
    category: "Editing",
    keys: ["Ctrl", "V"],
    description: "Paste",
  },
  {
    category: "Editing",
    keys: ["Ctrl", "A"],
    description: "Select All at Level",
  },
  {
    category: "Editing",
    keys: ["Ctrl", "K"],
    description: "Command Palette",
  },
  {
    category: "Editing",
    keys: ["F2"],
    description: "Rename Component",
  },

  // Canvas/Visualization
  {
    category: "Canvas",
    keys: ["Ctrl", "G"],
    description: "Toggle Grid",
  },
  {
    category: "Canvas",
    keys: ["Ctrl", "Shift", "G"],
    description: "Toggle Snap to Grid",
  },
  {
    category: "Canvas",
    keys: ["+"],
    description: "Zoom In",
  },
  {
    category: "Canvas",
    keys: ["-"],
    description: "Zoom Out",
  },
  {
    category: "Canvas",
    keys: ["0"],
    description: "Reset Zoom",
  },
  {
    category: "Canvas",
    keys: ["Escape"],
    description: "Clear Selection",
  },

  // Help
  {
    category: "Help",
    keys: ["?"],
    description: "Show Shortcuts",
  },
];

const KeyBadge: React.FC<{ keys: string[] }> = ({ keys }) => {
  return (
    <div className="flex items-center gap-1">
      {keys.map((key, idx) => (
        <React.Fragment key={key}>
          {idx > 0 && <span className="text-slate-500 text-xs">+</span>}
          <kbd className="px-2 py-1 bg-[var(--bg-tertiary)] border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)]">
            {key}
          </kbd>
        </React.Fragment>
      ))}
    </div>
  );
};

const ShortcutCategory: React.FC<{
  category: string;
  shortcuts: Shortcut[];
}> = ({ category, shortcuts }) => {
  return (
    <div className="mb-4">
              <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
        <div className="w-1 h-3 bg-[var(--accent)]" />
        {category}
      </h4>
      <div className="space-y-2">
        {shortcuts.map((shortcut, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <span className="text-xs text-[var(--text-secondary)]">
              {shortcut.description}
            </span>
            <KeyBadge keys={shortcut.keys} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const groupedShortcuts = useMemo(() => {
    const grouped = {
      Project: [] as Shortcut[],
      Editing: [] as Shortcut[],
      Canvas: [] as Shortcut[],
      Help: [] as Shortcut[],
    };

    SHORTCUTS.forEach((shortcut) => {
      grouped[shortcut.category].push(shortcut);
    });

    return grouped;
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
        <div className="bg-[var(--bg-secondary)] border-[var(--border)] shadow-brutal-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
            <div className="flex items-center gap-3">
              <Keyboard size={20} className="text-[var(--accent)]" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Keyboard Shortcuts
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6 space-y-6">
            {/* Project Section */}
            <ShortcutCategory
              category="Project Management"
              shortcuts={groupedShortcuts.Project}
            />

            {/* Editing Section */}
            <ShortcutCategory
              category="Structural Editing"
              shortcuts={groupedShortcuts.Editing}
            />

            {/* Canvas Section */}
            <ShortcutCategory
              category="Canvas & Visualization"
              shortcuts={groupedShortcuts.Canvas}
            />

            {/* Help Section */}
            <ShortcutCategory
              category="Help"
              shortcuts={groupedShortcuts.Help}
            />

            {/* Tips */}
            <div className="mt-6 pt-4 border-t border-[var(--border)]">
      <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                <div className="w-1 h-3 bg-green-500 rounded" />
                Tips
              </h4>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>
                  • Platform-specific: Use{" "}
                  <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs">
                    Cmd
                  </kbd>{" "}
                  on Mac instead of{" "}
                  <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs">
                    Ctrl
                  </kbd>
                </li>
                <li>
                  • Type-safe: Shortcuts are disabled while editing text in
                  inputs
                </li>
                <li>
                  • Press{" "}
                  <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs">
                    ?
                  </kbd>{" "}
                  anytime to show this overlay
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t border-[var(--border)] bg-[var(--bg-tertiary)]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-[var(--accent)] hover:bg-violet-700 text-white font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
