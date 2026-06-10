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
      <div className="fixed inset-0 z-50 bg-black/80" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
        <div
          ref={dialogRef}
          className="brutal-card w-full max-w-xl overflow-hidden"
          style={{ boxShadow: "3px 3px 0 var(--border)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "2px solid var(--border)" }}>
            <Search size={18} style={{ color: "var(--text-muted)" }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Search commands..."
              className="brutal-input flex-1 text-base px-2 py-1"
              style={{ backgroundColor: "transparent", border: "none", boxShadow: "none" }}
            />
            <kbd className="px-2 py-0.5 border-2 text-xs font-mono" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
              <Command size={12} className="inline mr-0.5 -mt-0.5" />K
            </kbd>
          </div>

          <div className="max-h-[320px] overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No commands found</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Try a different search term</p>
              </div>
            ) : (
              Array.from(categories.entries()).map(([category, cmds]) => (
                <div key={category}>
                  <div className="px-5 py-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    {category}
                  </div>
                  {cmds.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => { cmd.action(); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(filtered.indexOf(cmd))}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left brutal-btn`}
                      style={{
                        backgroundColor: filtered.indexOf(cmd) === selectedIndex ? "var(--accent)" : "transparent",
                        color: filtered.indexOf(cmd) === selectedIndex ? "var(--bg-primary)" : "var(--text)",
                        border: "none",
                        borderRadius: 0,
                      }}
                    >
                      <span className="text-base shrink-0">{cmd.icon ?? <ArrowRight size={14} />}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold block truncate">{cmd.label}</span>
                        <span className="text-xs block truncate" style={{ color: "var(--text-muted)" }}>{cmd.description}</span>
                      </div>
                      {cmd.shortcut && (
                        <kbd className="px-1.5 py-0.5 border-2 text-[10px] font-mono shrink-0" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>

          <div className="flex items-center gap-4 px-5 py-3" style={{ borderTop: "2px solid var(--border)", backgroundColor: "var(--bg-tertiary)" }}>
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
              <kbd className="px-1 py-0.5 border-2 text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}>↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
              <kbd className="px-1 py-0.5 border-2 text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}>↵</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
              <kbd className="px-1 py-0.5 border-2 text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)", color: "var(--text)" }}>Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
