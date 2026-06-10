import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Search, ArrowRight, Command } from "lucide-react";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea';

const useFocusTrap = (isActive: boolean) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isActive || !ref.current) return;
    const container = ref.current;
    const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const active = document.activeElement;
        if (e.shiftKey) {
          if (active === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (active === last) { e.preventDefault(); first?.focus(); }
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isActive]);
  return ref;
};

interface CommandItem {
  id: string;
  label: string;
  description: string;
  shortcut?: string;
  icon?: string;
  category: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Simple fuzzy match: all chars in query appear in order in target
  const fuzzyMatch = (text: string, query: string): boolean => {
    let qi = 0;
    for (let ti = 0; ti < text.length && qi < query.length; ti++) {
      if (text[ti] === query[qi]) qi++;
    }
    return qi === query.length;
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;

    const q = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        fuzzyMatch(cmd.label.toLowerCase(), q) ||
        fuzzyMatch(cmd.description.toLowerCase(), q) ||
        fuzzyMatch(cmd.category.toLowerCase(), q),
    );
  }, [commands, query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const dialogRef = useFocusTrap(isOpen);

  const executeSelected = useCallback(() => {
    if (filtered[selectedIndex]) {
      filtered[selectedIndex].action();
      onClose();
    }
  }, [filtered, selectedIndex, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filtered.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
          break;
        case "Enter":
          e.preventDefault();
          executeSelected();
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filtered.length, onClose, executeSelected],
  );

  const categories = useMemo(() => {
    const cats = new Map<string, CommandItem[]>();
    filtered.forEach((cmd) => {
      if (!cats.has(cmd.category)) cats.set(cmd.category, []);
      cats.get(cmd.category)!.push(cmd);
    });
    return cats;
  }, [filtered]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
        <div
          ref={dialogRef}
          className="w-full max-w-xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700/60">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Search commands..."
              className="flex-1 bg-transparent text-white text-base placeholder-slate-500 outline-none"
            />
            <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-xs text-slate-400 font-mono">
              <Command size={12} className="inline mr-0.5 -mt-0.5" />K
            </kbd>
          </div>

          <div className="max-h-[320px] overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-slate-500">No commands found</p>
                <p className="text-xs text-slate-600 mt-1">Try a different search term</p>
              </div>
            ) : (
              Array.from(categories.entries()).map(([category, cmds]) => (
                <div key={category}>
                  <div className="px-5 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                    {category}
                  </div>
                  {cmds.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => { cmd.action(); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(filtered.indexOf(cmd))}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                        filtered.indexOf(cmd) === selectedIndex
                          ? "bg-violet-600/20 text-white"
                          : "text-slate-300 hover:bg-slate-800/50"
                      }`}
                    >
                      <span className="text-base shrink-0">{cmd.icon ?? <ArrowRight size={14} />}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block truncate">{cmd.label}</span>
                        <span className="text-xs text-slate-500 block truncate">{cmd.description}</span>
                      </div>
                      {cmd.shortcut && (
                        <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400 font-mono shrink-0">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>

          <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-700/60 bg-slate-900/50">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs">↵</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
