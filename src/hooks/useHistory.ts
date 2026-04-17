import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import type { UIComponent } from '@/types/canvas';

export interface HistoryState {
  components: Record<string, UIComponent>;
  selectedIds: string[];
  timestamp: number;
}

const MAX_HISTORY_SIZE = 50;
const DEBOUNCE_DELAY = 5000;

const serializeState = (components: Record<string, UIComponent>, selectedIds: string[]): string => {
  return JSON.stringify({ components, selectedIds });
};

const deserializeState = (serialized: string): HistoryState => {
  const { components, selectedIds } = JSON.parse(serialized);
  return { components, selectedIds, timestamp: Date.now() };
};

export interface UseHistoryReturn {
  undo: () => void;
  redo: () => void;
  takeSnapshot: (isImmediate?: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  lastSnapshotTime: number;
}

export const useHistory = (): UseHistoryReturn => {
  const components = useEditorStore((s) => s.components);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const setComponents = useEditorStore((s) => s.setComponents);
  const setSelection = useEditorStore((s) => s.setSelection);

  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);
  const [lastSnapshotTime, setLastSnapshotTime] = useState(0);

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastChangeTypeRef = useRef<string | null>(null);

  const takeSnapshot = useCallback((isImmediate = false) => {
    const currentSerialized = serializeState(components, selectedIds);

    if (isImmediate) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }

      setPast((prev) => {
        const newPast = [...prev];
        if (newPast.length > 0) {
          const lastState = newPast[newPast.length - 1];
          if (serializeState(lastState.components, lastState.selectedIds) === currentSerialized) {
            return prev;
          }
        }

        if (newPast.length >= MAX_HISTORY_SIZE) {
          newPast.shift();
        }

        return [...newPast, deserializeState(currentSerialized)];
      });

      setFuture([]);
      setLastSnapshotTime(Date.now());
      lastChangeTypeRef.current = null;
    } else {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        setPast((prev) => {
          const newPast = [...prev];
          if (newPast.length > 0) {
            const lastState = newPast[newPast.length - 1];
            if (serializeState(lastState.components, lastState.selectedIds) === currentSerialized) {
              return prev;
            }
          }

          if (newPast.length >= MAX_HISTORY_SIZE) {
            newPast.shift();
          }

          return [...newPast, deserializeState(currentSerialized)];
        });

        setFuture([]);
        setLastSnapshotTime(Date.now());
        lastChangeTypeRef.current = null;
      }, DEBOUNCE_DELAY);
    }
  }, [components, selectedIds]);

  const undo = useCallback(() => {
    if (past.length === 0) return;

    const currentSerialized = serializeState(components, selectedIds);
    const previousState = past[past.length - 1];

    setPast((prev) => prev.slice(0, -1));

    setFuture((prev) => {
      const newFuture = [...prev];
      if (newFuture.length >= MAX_HISTORY_SIZE) {
        newFuture.shift();
      }
      newFuture.push(deserializeState(currentSerialized));
      return newFuture;
    });

    setComponents(previousState.components);
    setSelection(previousState.selectedIds);
    setLastSnapshotTime(previousState.timestamp);
  }, [past, components, selectedIds, setComponents, setSelection]);

  const redo = useCallback(() => {
    if (future.length === 0) return;

    const currentSerialized = serializeState(components, selectedIds);
    const nextState = future[future.length - 1];

    setFuture((prev) => prev.slice(0, -1));

    setPast((prev) => {
      const newPast = [...prev];
      if (newPast.length >= MAX_HISTORY_SIZE) {
        newPast.shift();
      }
      newPast.push(deserializeState(currentSerialized));
      return newPast;
    });

    setComponents(nextState.components);
    setSelection(nextState.selectedIds);
    setLastSnapshotTime(nextState.timestamp);
  }, [future, components, selectedIds, setComponents, setSelection]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (!isInputFocused || target.classList.contains('code-editor')) {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (!isInputFocused || target.classList.contains('code-editor')) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    undo,
    redo,
    takeSnapshot,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    lastSnapshotTime,
  };
};