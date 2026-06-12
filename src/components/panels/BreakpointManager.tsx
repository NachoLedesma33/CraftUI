import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { useUIStore } from "@/store";

const defaultBreakpoints = [
  { id: "base", name: "Mobile", width: 375 },
  { id: "tablet", name: "Tablet", width: 768 },
  { id: "desktop", name: "Desktop", width: 1280 },
];

export const BreakpointManager: React.FC = () => {
  const customBreakpoints = useUIStore((s) => s.customBreakpoints);
  const addCustomBreakpoint = useUIStore((s) => s.addCustomBreakpoint);
  const removeCustomBreakpoint = useUIStore((s) => s.removeCustomBreakpoint);
  const activeBreakpoint = useUIStore((s) => s.activeBreakpoint);
  const setActiveBreakpoint = useUIStore((s) => s.setActiveBreakpoint);

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newWidth, setNewWidth] = useState("");

  const sorted = [...customBreakpoints].sort((a, b) => a.width - b.width);

  const handleAdd = () => {
    if (!newName.trim() || !newWidth.trim()) return;
    const width = parseInt(newWidth);
    if (isNaN(width) || width <= 0) return;
    addCustomBreakpoint({
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      width,
      minWidth: width,
    });
    setNewName("");
    setNewWidth("");
    setShowForm(false);
  };

  return (
    <div className="p-3 space-y-3">
      <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
        Default Breakpoints
      </div>
      {defaultBreakpoints.map((bp) => (
        <div
          key={bp.id}
          className={`flex items-center justify-between px-3 py-2 border-2 border-[var(--border)] cursor-pointer transition-colors ${
            activeBreakpoint === bp.id
              ? "bg-[var(--accent)] text-black"
              : "bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
          }`}
          onClick={() => setActiveBreakpoint(bp.id)}
        >
          <span className="text-sm font-medium">{bp.name}</span>
          <span className="text-xs text-[var(--text-muted)]">{bp.width}px</span>
        </div>
      ))}

      {customBreakpoints.length > 0 && (
        <>
          <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider pt-2">
            Custom Breakpoints
          </div>
          {sorted.map((bp) => (
            <div
              key={bp.id}
              className={`flex items-center justify-between px-3 py-2 border-2 border-[var(--border)] cursor-pointer transition-colors group ${
                activeBreakpoint === bp.id
                  ? "bg-[var(--accent)] text-black"
                  : "bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
              }`}
              onClick={() => setActiveBreakpoint(bp.id)}
            >
              <span className="text-sm font-medium">{bp.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)]">{bp.width}px</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCustomBreakpoint(bp.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/20 rounded transition-opacity"
                >
                  <X size={12} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {showForm ? (
        <div className="space-y-2 border-2 border-[var(--border)] p-3 bg-[var(--bg-tertiary)]">
          <input
            type="text"
            placeholder="Breakpoint name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-2 py-1.5 text-sm bg-[var(--bg-secondary)] border-2 border-[var(--border)] text-[var(--text-primary)] focus:outline-none"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Width (px)"
              value={newWidth}
              onChange={(e) => setNewWidth(e.target.value)}
              className="flex-1 px-2 py-1.5 text-sm bg-[var(--bg-secondary)] border-2 border-[var(--border)] text-[var(--text-primary)] focus:outline-none"
              min={1}
            />
            <button
              onClick={handleAdd}
              className="px-3 py-1.5 text-sm font-medium bg-[var(--accent)] text-black border-2 border-black hover:shadow-brutal transition-all"
            >
              Add
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-2 py-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)] border-2 border-dashed border-[var(--border)] hover:border-solid transition-all"
        >
          <Plus size={14} />
          Add custom breakpoint
        </button>
      )}
    </div>
  );
};
