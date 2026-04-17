import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import { set as idbSet, get as idbGet } from 'idb-keyval';

interface AutoSavePayload {
  components: Record<string, any>;
  rootId: string;
  canvasConfig: any;
  timestamp: number;
  version: string;
}

/**
 * Generate a lightweight hash of the editor state for change detection
 */
const generateStateHash = (components: Record<string, any>): string => {
  const keys = Object.keys(components).sort();
  const simplified = keys.map(key => {
    const comp = components[key];
    return `${key}:${comp.type}:${comp.children.length}:${JSON.stringify(comp.props)}`;
  }).join('|');
  return btoa(simplified).slice(0, 32); // Base64 encode and truncate for lightweight comparison
};

/**
 * Determine if data should be stored in IndexedDB (for large projects)
 */
const shouldUseIndexedDB = (dataSize: number): boolean => {
  return dataSize > 1024 * 1024; // > 1MB
};

/**
 * Save auto-save data to appropriate storage
 */
const saveToStorage = async (payload: AutoSavePayload): Promise<void> => {
  const dataString = JSON.stringify(payload);
  const dataSize = new Blob([dataString]).size;

  try {
    if (shouldUseIndexedDB(dataSize)) {
      // Use IndexedDB for large projects
      await idbSet('craftui-autosave', payload);
    } else {
      // Use localStorage for smaller projects
      localStorage.setItem('craftui-autosave', dataString);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Handle quota exceeded error
      console.warn('Storage quota exceeded. Auto-save disabled.');
      throw new Error('Storage quota exceeded. Please save your project manually.');
    }
    throw error;
  }
};

/**
 * Load auto-save data from storage
 */
const loadFromStorage = async (): Promise<AutoSavePayload | null> => {
  try {
    // Try IndexedDB first
    const idbData = await idbGet('craftui-autosave');
    if (idbData) return idbData;

    // Fallback to localStorage
    const lsData = localStorage.getItem('craftui-autosave');
    if (lsData) return JSON.parse(lsData);

    return null;
  } catch (error) {
    console.error('Failed to load auto-save data:', error);
    return null;
  }
};

/**
 * Hook for automatic saving and session persistence
 */
export const useAutoSave = () => {
  const { components, rootId, canvasConfig } = useEditorStore();
  const {
    autoSave,
    updateLastSaved,
    addAutoSaveVersion,
    addToast,
    setAutoSaveEnabled,
  } = useUIStore();

  // Refs for tracking state
  const lastHashRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Memoized current state hash
  const currentHash = useMemo(() => generateStateHash(components), [components]);

  // Check if there are changes since last save
  const hasChanges = useCallback(() => {
    return currentHash !== lastHashRef.current;
  }, [currentHash]);

  // Perform the actual save operation
  const performSave = useCallback(async (force = false) => {
    if (isSavingRef.current && !force) return;

    try {
      isSavingRef.current = true;

      const payload: AutoSavePayload = {
        components,
        rootId,
        canvasConfig,
        timestamp: Date.now(),
        version: '1.0.0',
      };

      // Save to storage
      await saveToStorage(payload);

      // Create version snapshot
      const version = {
        id: `autosave-${payload.timestamp}`,
        timestamp: payload.timestamp,
        componentCount: Object.keys(components).length,
        data: JSON.stringify(payload),
      };

      addAutoSaveVersion(version);
      updateLastSaved(payload.timestamp);
      lastHashRef.current = currentHash;

      // Show silent toast notification
      addToast('Changes auto-saved', 'success', 2000);

    } catch (error) {
      console.error('Auto-save failed:', error);

      if (error instanceof Error && error.message.includes('quota exceeded')) {
        addToast('Storage full! Auto-save disabled.', 'error', 5000);
        setAutoSaveEnabled(false);
      } else {
        addToast('Auto-save failed', 'error', 3000);
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [
    components,
    rootId,
    canvasConfig,
    currentHash,
    addAutoSaveVersion,
    updateLastSaved,
    addToast,
    setAutoSaveEnabled,
  ]);

  // Emergency save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasChanges()) {
        // Synchronous save for beforeunload (limited to localStorage)
        try {
          const payload: AutoSavePayload = {
            components,
            rootId,
            canvasConfig,
            timestamp: Date.now(),
            version: '1.0.0',
          };
          localStorage.setItem('craftui-autosave-emergency', JSON.stringify(payload));
        } catch (error) {
          console.warn('Emergency save failed:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [components, rootId, canvasConfig, hasChanges]);

  // Main auto-save interval
  useEffect(() => {
    if (!autoSave.enabled) return;

    const scheduleSave = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        if (hasChanges()) {
          await performSave();
        }
        // Schedule next save
        scheduleSave();
      }, autoSave.interval);
    };

    scheduleSave();

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [autoSave.enabled, autoSave.interval, hasChanges, performSave]);

  // Update hash when components change
  useEffect(() => {
    lastHashRef.current = currentHash;
  }, [currentHash]);

  // Load emergency save on mount (if exists)
  useEffect(() => {
    const loadEmergencySave = async () => {
      try {
        const emergencyData = localStorage.getItem('craftui-autosave-emergency');
        if (emergencyData) {
          const parsed = JSON.parse(emergencyData);
          // Only restore if it's newer than current auto-save
          const currentAutoSave = await loadFromStorage();
          if (!currentAutoSave || parsed.timestamp > currentAutoSave.timestamp) {
            addToast('Recovered unsaved changes from previous session', 'info', 5000);
          }
          localStorage.removeItem('craftui-autosave-emergency');
        }
      } catch (error) {
        console.warn('Failed to load emergency save:', error);
      }
    };

    loadEmergencySave();
  }, [addToast]);

  return {
    lastSaved: autoSave.lastSaved,
    isEnabled: autoSave.enabled,
    versions: autoSave.versions,
    performSave: () => performSave(true), // Force save
    hasChanges: hasChanges(),
  };
};