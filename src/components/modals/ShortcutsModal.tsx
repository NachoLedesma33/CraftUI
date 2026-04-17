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
          <kbd className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs font-semibold text-slate-200">
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
      <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
        <div className="w-1 h-3 bg-blue-500 rounded" />
        {category}
      </h4>
      <div className="space-y-2">
        {shortcuts.map((shortcut, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 rounded bg-slate-900/50 hover:bg-slate-800 transition-colors"
          >
            <span className="text-xs text-slate-400">
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
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <Keyboard size={20} className="text-blue-400" />
              <h2 className="text-lg font-semibold text-white">
                Keyboard Shortcuts
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
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
            <div className="mt-6 pt-4 border-t border-slate-700">
              <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <div className="w-1 h-3 bg-green-500 rounded" />
                Tips
              </h4>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>
                  • Platform-specific: Use{" "}
                  <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-200 text-xs">
                    Cmd
                  </kbd>{" "}
                  on Mac instead of{" "}
                  <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-200 text-xs">
                    Ctrl
                  </kbd>
                </li>
                <li>
                  • Type-safe: Shortcuts are disabled while editing text in
                  inputs
                </li>
                <li>
                  • Press{" "}
                  <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-200 text-xs">
                    ?
                  </kbd>{" "}
                  anytime to show this overlay
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t border-slate-700 bg-slate-900/50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
