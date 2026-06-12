import React, { useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "@/store";
import { useUIStore } from "@/store";
import type { Styles } from "@/types/canvas";

interface ContextMenuProps {
  x: number;
  y: number;
  componentId: string;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, componentId, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const deleteComponent = useEditorStore((s) => s.deleteComponent);
  const duplicateComponent = useEditorStore((s) => s.duplicateComponent);
  const addComponent = useEditorStore((s) => s.addComponent);
  const components = useEditorStore((s) => s.components);
  const updateComponent = useEditorStore((s) => s.updateComponent);
  const saveToHistory = useEditorStore((s) => s.saveToHistory);
  const clipboard = useUIStore((s) => s.clipboard);
  const copyComponents = useUIStore((s) => s.copyComponents);
  const addToast = useUIStore((s) => s.addToast);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [onClose]);

  const handleDuplicate = useCallback(() => {
    duplicateComponent(componentId);
    addToast("Component duplicated", "success", 1500);
    onClose();
  }, [componentId, duplicateComponent, addToast, onClose]);

  const handleDelete = useCallback(() => {
    deleteComponent(componentId);
    addToast("Component deleted", "info", 1500);
    onClose();
  }, [componentId, deleteComponent, addToast, onClose]);

  const handleCopy = useCallback(() => {
    const comp = components[componentId];
    if (comp) {
      copyComponents([comp]);
      addToast("Component copied", "success", 1500);
    }
    onClose();
  }, [componentId, components, copyComponents, addToast, onClose]);

  const handleWrapInContainer = useCallback(() => {
    const comp = components[componentId];
    if (!comp || !comp.parent) return;
    const containerId = addComponent(comp.parent, "container");
    if (!containerId) return;
    const parent = components[comp.parent];
    if (!parent) return;
    const idx = parent.children.indexOf(componentId);
    updateComponent(containerId, {
      parent: comp.parent,
      children: [componentId],
    });
    updateComponent(componentId, { parent: containerId });
    const newChildren = [...parent.children];
    newChildren[idx] = containerId;
    useEditorStore.getState().reorderChildren(comp.parent, newChildren);
    saveToHistory();
    addToast("Wrapped in container", "success", 1500);
    onClose();
  }, [componentId, components, addComponent, updateComponent, saveToHistory, addToast, onClose]);

  const handleCopyStyles = useCallback(() => {
    const comp = components[componentId];
    if (comp) {
      navigator.clipboard.writeText(JSON.stringify(comp.styles));
      addToast("Styles copied to clipboard", "success", 1500);
    }
    onClose();
  }, [componentId, components, addToast, onClose]);

  const handlePasteStyles = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const styles = JSON.parse(text) as Styles;
      updateComponent(componentId, { styles });
      saveToHistory();
      addToast("Styles pasted", "success", 1500);
    } catch {
      addToast("Invalid styles in clipboard", "error", 2000);
    }
    onClose();
  }, [componentId, updateComponent, saveToHistory, addToast, onClose]);

  const menuX = Math.min(x, window.innerWidth - 200);
  const menuY = Math.min(y, window.innerHeight - 350);

  return (
    <div
      ref={ref}
      className="fixed z-[100] bg-[var(--bg-secondary)] border-2 border-[var(--border)] shadow-brutal py-1 min-w-[180px] animate-scale-in"
      style={{ left: menuX, top: menuY }}
    >
      <MenuItem onClick={handleDuplicate}>Duplicate</MenuItem>
      <MenuItem onClick={handleCopy}>Copy</MenuItem>
      <div className="border-t border-[var(--border)] my-1" />
      <MenuItem onClick={handleWrapInContainer}>Wrap in container</MenuItem>
      <MenuItem onClick={handleCopyStyles}>Copy styles</MenuItem>
      <MenuItem onClick={handlePasteStyles} disabled={!clipboard}>Paste styles</MenuItem>
      <div className="border-t border-[var(--border)] my-1" />
      <MenuItem onClick={handleDelete} danger>Delete</MenuItem>
    </div>
  );
};

const MenuItem: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}> = ({ onClick, disabled, danger, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
      disabled
        ? "text-[var(--text-muted)] cursor-not-allowed"
        : danger
          ? "text-red-400 hover:bg-red-500/20"
          : "text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
    }`}
  >
    {children}
  </button>
);
