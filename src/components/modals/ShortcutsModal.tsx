import React, { useState, useMemo, useEffect, useRef } from "react";
import { X, Keyboard, Search } from "lucide-react";

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
          <kbd className="px-2 py-1 bg-[var(--bg-tertiary)] border-2 border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)]">
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
            className="flex items-center justify-between p-2 bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] border-2 border-[var(--border)] transition-colors"
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
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
    setSearch("");
  }, [isOpen]);

  const groupedShortcuts = useMemo(() => {
    const grouped = {
      Project: [] as Shortcut[],
      Editing: [] as Shortcut[],
      Canvas: [] as Shortcut[],
      Help: [] as Shortcut[],
    };

    SHORTCUTS.forEach((shortcut) => {
      if (
        search &&
        !shortcut.description.toLowerCase().includes(search.toLowerCase()) &&
        !shortcut.keys.some((k) => k.toLowerCase().includes(search.toLowerCase()))
      )
        return;
      grouped[shortcut.category].push(shortcut);
    });

    return grouped;
  }, [search]);

  const totalVisible = useMemo(
    () => Object.values(groupedShortcuts).reduce((a, b) => a + b.length, 0),
    [groupedShortcuts],
  );

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/80"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
        <div className="bg-[var(--bg-secondary)] border-2 border-[var(--border)] shadow-brutal-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
            <div className="flex items-center gap-3">
              <Keyboard size={20} className="text-[var(--accent)]" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Keyboard Shortcuts
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 border-2 border-[var(--border)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="px-6 pt-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search shortcuts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--bg-primary)] border-2 border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="overflow-y-auto p-6 space-y-6">
            {totalVisible === 0 && (
              <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">
                No shortcuts match "{search}"
              </div>
            )}
            {(Object.keys(groupedShortcuts) as Array<keyof typeof groupedShortcuts>).map((cat) => {
              if (groupedShortcuts[cat].length === 0) return null;
              return (
                <ShortcutCategory
                  key={cat}
                  category={cat}
                  shortcuts={groupedShortcuts[cat]}
                />
              );
            })}

            <div className="mt-6 pt-4 border-t border-[var(--border)]">
              <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                <div className="w-1 h-3 bg-green-500 rounded" />
                Tips
              </h4>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>
                  • Use{" "}
                  <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs border-2 border-[var(--border)]">
                    Cmd
                  </kbd>{" "}
                  on Mac instead of{" "}
                  <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs border-2 border-[var(--border)]">
                    Ctrl
                  </kbd>
                </li>
                <li>• Press <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs border-2 border-[var(--border)]">?</kbd> anytime to open this</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-2 p-4 border-t border-[var(--border)] bg-[var(--bg-tertiary)]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-[var(--accent)] hover:bg-violet-700 text-black font-bold border-2 border-[var(--border)] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
