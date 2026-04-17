import { useEffect, useState, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useUIStore } from "@/store/uiStore";

/**
 * Determines if the keyboard event originates from a text input element
 * that shouldn't trigger global shortcuts
 */
const isTypingElement = (e: KeyboardEvent): boolean => {
  const target = e.target as HTMLElement;

  if (!target) return false;

  const tagName = target.tagName.toLowerCase();
  const contentEditable = target.getAttribute("contenteditable");

  // Check if target is input or textarea
  if (tagName === "input" || tagName === "textarea") {
    const inputType = (target as HTMLInputElement).type?.toLowerCase();
    // Allow shortcuts in hidden/submit/button inputs
    if (
      ["hidden", "submit", "button", "checkbox", "radio"].includes(inputType)
    ) {
      return false;
    }
    return true;
  }

  // Check if contenteditable
  if (contentEditable === "true" || contentEditable === "") {
    return true;
  }

  return false;
};

/**
 * Determines if a shortcut should be allowed when in a text input
 * Some shortcuts (like Ctrl+Z, Ctrl+A) should work even when typing
 */
const isTextEditingShortcut = (e: KeyboardEvent): boolean => {
  const isMod = e.ctrlKey || e.metaKey;

  // Shortcuts that should be allowed in text fields
  return (
    (isMod && e.key.toLowerCase() === "z") || // Undo
    (isMod && e.key.toLowerCase() === "y") || // Redo
    (isMod && e.key.toLowerCase() === "a") || // Select all
    (isMod && e.key.toLowerCase() === "c") || // Copy
    (isMod && e.key.toLowerCase() === "x") || // Cut
    (isMod && e.key.toLowerCase() === "v") || // Paste
    e.key === "Escape" // Escape to close/deselect
  );
};

/**
 * Global keyboard shortcuts hook
 * Centralizes all keyboard event listeners for the editor
 */
export const useKeyboardShortcuts = () => {
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  // Editor actions
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const deleteSelected = useEditorStore((s) => s.deleteSelected);
  const duplicateComponent = useEditorStore((s) => s.duplicateComponent);
  const selectComponent = useEditorStore((s) => s.selectComponent);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const startRenaming = useEditorStore((s) => s.startRenaming);
  const selectAllAtLevel = useEditorStore((s) => s.selectAllAtLevel);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const components = useEditorStore((s) => s.components);

  // UI actions
  const zoomIn = useUIStore((s) => s.zoomIn);
  const zoomOut = useUIStore((s) => s.zoomOut);
  const resetZoom = useUIStore((s) => s.resetZoom);
  const toggleGrid = useUIStore((s) => s.toggleGrid);
  const toggleSnapToGrid = useUIStore((s) => s.toggleSnapToGrid);
  const setPreviewMode = useUIStore((s) => s.setPreviewMode);
  const previewMode = useUIStore((s) => s.view.previewMode);
  const copyComponents = useUIStore((s) => s.copyComponents);
  const clipboard = useUIStore((s) => s.clipboard);
  const addToast = useUIStore((s) => s.addToast);

  /**
   * Handle copy operation: copy selected components to clipboard
   */
  const handleCopy = useCallback(() => {
    if (selectedIds.length === 0) return;

    const selectedComponents = selectedIds
      .map((id) => components[id])
      .filter(Boolean);

    if (selectedComponents.length > 0) {
      copyComponents(selectedComponents);
      addToast(
        `Copied ${selectedComponents.length} component(s)`,
        "success",
        2000,
      );
    }
  }, [selectedIds, components, copyComponents, addToast]);

  /**
   * Handle paste operation: paste components from clipboard
   */
  const handlePaste = useCallback(() => {
    if (!clipboard || clipboard.length === 0) return;

    // For now, we'll just show a toast
    // Full paste implementation would need to add components to the selected parent
    addToast(
      `Paste feature coming soon (${clipboard.length} item(s) in clipboard)`,
      "info",
      2000,
    );
  }, [clipboard, addToast]);

  /**
   * Handle duplicate of selected component
   */
  const handleDuplicate = useCallback(() => {
    if (selectedIds.length === 0) return;

    // Duplicate the first selected component
    const firstId = selectedIds[0];
    const newId = duplicateComponent(firstId);

    if (newId) {
      selectComponent(newId, false);
      addToast("Component duplicated", "success", 2000);
    }
  }, [selectedIds, duplicateComponent, selectComponent, addToast]);

  /**
   * Handle F2 rename activation
   */
  const handleStartRenaming = useCallback(() => {
    if (selectedIds.length === 0) return;

    const firstId = selectedIds[0];
    startRenaming(firstId);
    setIsRenaming(true);
  }, [selectedIds, startRenaming]);

  /**
   * Main keyboard event handler
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Check if we're in a typing context
      const isTyping = isTypingElement(e);
      const isAllowedShortcut = isTextEditingShortcut(e);

      // If typing and it's not an allowed shortcut, skip
      if (isTyping && !isAllowedShortcut) {
        return;
      }

      const isMod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // ===== PROJECT MANAGEMENT =====
      if (isMod && key === "s") {
        e.preventDefault();
        addToast("Project saved (mock)", "success", 2000);
        return;
      }

      if (isMod && key === "e") {
        e.preventDefault();
        addToast("Opening export modal...", "info", 2000);
        // This would be dispatched to open ExportModal
        window.dispatchEvent(new CustomEvent("openExportModal"));
        return;
      }

      if (isMod && key === "p") {
        e.preventDefault();
        setPreviewMode(!previewMode);
        addToast(
          `Preview ${!previewMode ? "enabled" : "disabled"}`,
          "info",
          2000,
        );
        return;
      }

      // ===== EDITING STRUCTURAL =====
      if (isMod && key === "z") {
        if (isTyping) {
          // Allow default browser undo in text inputs
          return;
        }
        e.preventDefault();
        undo();
        return;
      }

      if (isMod && key === "y") {
        if (isTyping) {
          return;
        }
        e.preventDefault();
        redo();
        return;
      }

      if (isMod && key === "d") {
        if (isTyping) {
          return;
        }
        e.preventDefault();
        handleDuplicate();
        return;
      }

      if (key === "Delete" || key === "Backspace") {
        if (isTyping) {
          return;
        }
        e.preventDefault();
        if (selectedIds.length > 0) {
          deleteSelected();
          addToast("Component(s) deleted", "success", 2000);
        }
        return;
      }

      if (isMod && key === "c") {
        if (isTyping && e.target !== document.body) {
          return;
        }
        e.preventDefault();
        handleCopy();
        return;
      }

      if (isMod && key === "v") {
        if (isTyping && e.target !== document.body) {
          return;
        }
        e.preventDefault();
        handlePaste();
        return;
      }

      if (isMod && key === "a") {
        // Only prevent default when not typing
        if (!isTyping) {
          e.preventDefault();
          selectAllAtLevel();
          const count = components ? Object.keys(components).length : 0;
          addToast(`Selected all components (total: ${count})`, "info", 2000);
        }
        return;
      }

      if (key === "F2" || key === "f2") {
        e.preventDefault();
        handleStartRenaming();
        addToast("Rename mode activated", "info", 2000);
        return;
      }

      // ===== VISUALIZATION (CANVAS) =====
      if (isMod && key === "g") {
        e.preventDefault();
        if (e.shiftKey) {
          // Ctrl+Shift+G: Toggle Snap to Grid
          toggleSnapToGrid();
          addToast("Snap to grid toggled", "info", 2000);
        } else {
          // Ctrl+G: Toggle Grid visibility
          toggleGrid();
          addToast("Grid toggled", "info", 2000);
        }
        return;
      }

      if (key === "+" || key === "=") {
        e.preventDefault();
        zoomIn();
        addToast("Zoomed in", "info", 1500);
        return;
      }

      if (key === "-" || key === "_") {
        e.preventDefault();
        zoomOut();
        addToast("Zoomed out", "info", 1500);
        return;
      }

      if (key === "0") {
        e.preventDefault();
        resetZoom();
        addToast("Zoom reset to 100%", "info", 1500);
        return;
      }

      if (key === "Escape") {
        e.preventDefault();
        clearSelection();
        setIsRenaming(false);
        return;
      }

      // ===== HELP/SHORTCUTS =====
      if (key === "?" || (isMod && key === "/")) {
        e.preventDefault();
        setShowShortcutsModal(!showShortcutsModal);
        return;
      }
    },
    [
      undo,
      redo,
      deleteSelected,
      zoomIn,
      zoomOut,
      resetZoom,
      toggleGrid,
      toggleSnapToGrid,
      setPreviewMode,
      previewMode,
      clearSelection,
      selectedIds,
      components,
      handleDuplicate,
      handleCopy,
      handlePaste,
      handleStartRenaming,
      selectAllAtLevel,
      addToast,
      showShortcutsModal,
    ],
  );

  // Register global keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    showShortcutsModal,
    setShowShortcutsModal,
    isRenaming,
    setIsRenaming,
  };
};
