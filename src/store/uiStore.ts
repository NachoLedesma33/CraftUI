import { create } from 'zustand';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
import type { UIComponent, Breakpoint, CustomBreakpoint } from '@/types/canvas';
export type { Breakpoint } from '@/types/canvas';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
  exiting?: boolean;
}

interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  previewMode: boolean;
  activeDevice: 'mobile' | 'tablet' | 'desktop';
}

interface PanelsState {
  layers: boolean;
  components: boolean;
  properties: boolean;
}

interface AutoSaveState {
  enabled: boolean;
  interval: number; // in milliseconds
  lastSaved: number | null;
  versions: AutoSaveVersion[];
}

interface AutoSaveVersion {
  id: string;
  timestamp: number;
  componentCount: number;
  data: string; // JSON string of the state
}

export interface UIState {
  view: ViewState;
  panels: PanelsState;
  clipboard: UIComponent[] | null;
  toasts: Toast[];
  autoSave: AutoSaveState;
  statePreview: "default" | "hover" | "active" | "focus";
  activeBreakpoint: string;
  customBreakpoints: CustomBreakpoint[];
  hiddenOnDevices: Record<string, string[]>;
}

export interface UIActions {
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setPan: (x: number, y: number) => void;
  panBy: (dx: number, dy: number) => void;
  setShowGrid: (show: boolean) => void;
  toggleGrid: () => void;
  setSnapToGrid: (snap: boolean) => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  setPreviewMode: (mode: boolean) => void;
  setActiveDevice: (device: 'mobile' | 'tablet' | 'desktop') => void;
  togglePanel: (panel: keyof PanelsState) => void;
  setPanel: (panel: keyof PanelsState, open: boolean) => void;
  copyComponents: (components: UIComponent[]) => void;
  clearClipboard: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => string;
  removeToast: (id: string) => void;
  setAutoSaveEnabled: (enabled: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
  updateLastSaved: (timestamp: number) => void;
  addAutoSaveVersion: (version: AutoSaveVersion) => void;
  getAutoSaveVersions: () => AutoSaveVersion[];
  restoreAutoSaveVersion: (versionId: string) => AutoSaveVersion | null;
  clearAutoSaveVersions: () => void;
  clearToasts: () => void;
  lastAddedId: string | null;
  setLastAddedId: (id: string | null) => void;
  setStatePreview: (state: "default" | "hover" | "active" | "focus") => void;
  setActiveBreakpoint: (bp: string) => void;
  addCustomBreakpoint: (bp: CustomBreakpoint) => void;
  removeCustomBreakpoint: (id: string) => void;
  setHiddenOnDevice: (componentId: string, device: string, hidden: boolean) => void;
}

type UIStore = UIState & UIActions;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.1;

const initialView: ViewState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  showGrid: true,
  snapToGrid: true,
  gridSize: 8,
  previewMode: false,
  activeDevice: 'desktop',
};

const initialPanels: PanelsState = {
  layers: true,
  components: true,
  properties: true,
};

const initialAutoSave: AutoSaveState = {
  enabled: true,
  interval: 30000, // 30 seconds
  lastSaved: null,
  versions: [],
};

export const useUIStore = create<UIStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        view: initialView,
        panels: initialPanels,
        clipboard: null,
        toasts: [],
        lastAddedId: null,
        statePreview: "default",
        activeBreakpoint: "base" as Breakpoint,
        customBreakpoints: [],
        hiddenOnDevices: {},
        autoSave: initialAutoSave,

        setZoom: (zoom: number) => {
          const clampedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
          set((s) => ({ view: { ...s.view, zoom: clampedZoom } }));
        },

        zoomIn: () => {
          const currentZoom = get().view.zoom;
          const newZoom = Math.min(MAX_ZOOM, currentZoom + ZOOM_STEP);
          set((s) => ({ view: { ...s.view, zoom: newZoom } }));
        },

        zoomOut: () => {
          const currentZoom = get().view.zoom;
          const newZoom = Math.max(MIN_ZOOM, currentZoom - ZOOM_STEP);
          set((s) => ({ view: { ...s.view, zoom: newZoom } }));
        },

        resetZoom: () => {
          set((s) => ({ view: { ...s.view, zoom: 1 } }));
        },

        setPan: (x: number, y: number) => {
          set((s) => ({ view: { ...s.view, panX: x, panY: y } }));
        },

        panBy: (dx: number, dy: number) => {
          set((s) => ({ view: { ...s.view, panX: s.view.panX + dx, panY: s.view.panY + dy } }));
        },

        setShowGrid: (show: boolean) => {
          set((s) => ({ view: { ...s.view, showGrid: show } }));
        },

        toggleGrid: () => {
          const currentState = get().view.showGrid;
          set((s) => ({ view: { ...s.view, showGrid: !currentState } }));
        },

        setSnapToGrid: (snap: boolean) => {
          set((s) => ({ view: { ...s.view, snapToGrid: snap } }));
        },

        toggleSnapToGrid: () => {
          const currentState = get().view.snapToGrid;
          set((s) => ({ view: { ...s.view, snapToGrid: !currentState } }));
        },

        setGridSize: (size: number) => {
          set((s) => ({ view: { ...s.view, gridSize: size } }));
        },

        setPreviewMode: (mode: boolean) => {
          set((s) => ({ view: { ...s.view, previewMode: mode } }));
        },

        setActiveDevice: (device: 'mobile' | 'tablet' | 'desktop') => {
          set((s) => ({ view: { ...s.view, activeDevice: device } }));
        },

        togglePanel: (panel: keyof PanelsState) => {
          set((s) => ({ panels: { ...s.panels, [panel]: !s.panels[panel] } }));
        },

        setPanel: (panel: keyof PanelsState, open: boolean) => {
          set((s) => ({ panels: { ...s.panels, [panel]: open } }));
        },

        copyComponents: (components: UIComponent[]) => {
          const serialized = JSON.parse(JSON.stringify(components));
          set({ clipboard: serialized });
        },

        clearClipboard: () => {
          set({ clipboard: null });
        },

        addToast: (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
          const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          set((s) => ({
            toasts: [...s.toasts, { id, message, type, duration }],
          }));

          setTimeout(() => {
            set((s) => ({
              toasts: s.toasts.map((t) =>
                t.id === id ? { ...t, exiting: true } : t,
              ),
            }));
            setTimeout(() => get().removeToast(id), 200);
          }, duration);

          return id;
        },

        removeToast: (id: string) => {
          set((s) => ({
            toasts: s.toasts.map((t) =>
              t.id === id ? { ...t, exiting: true } : t,
            ),
          }));
          setTimeout(() => {
            set((s) => ({
              toasts: s.toasts.filter((t) => t.id !== id),
            }));
          }, 200);
        },

        // Auto-save actions
        setAutoSaveEnabled: (enabled: boolean) => {
          set((s) => ({
            autoSave: { ...s.autoSave, enabled },
          }));
        },

        setAutoSaveInterval: (interval: number) => {
          set((s) => ({
            autoSave: { ...s.autoSave, interval },
          }));
        },

        updateLastSaved: (timestamp: number) => {
          set((s) => ({
            autoSave: { ...s.autoSave, lastSaved: timestamp },
          }));
        },

        addAutoSaveVersion: (version: AutoSaveVersion) => {
          set((s) => {
            const newVersions = [...s.autoSave.versions, version];
            // Keep only the last 10 versions (FIFO)
            if (newVersions.length > 10) {
              newVersions.shift();
            }
            return {
              autoSave: {
                ...s.autoSave,
                versions: newVersions,
                lastSaved: version.timestamp,
              },
            };
          });
        },

        getAutoSaveVersions: () => {
          return get().autoSave.versions;
        },

        restoreAutoSaveVersion: (versionId: string) => {
          const version = get().autoSave.versions.find((v) => v.id === versionId);
          return version || null;
        },

        clearAutoSaveVersions: () => {
          set((s) => ({
            autoSave: { ...s.autoSave, versions: [] },
          }));
        },
        clearToasts: () => {
          set({ toasts: [] });
        },

        setLastAddedId: (id: string | null) => {
          set({ lastAddedId: id });
        },

        setStatePreview: (state) => {
          set({ statePreview: state });
        },

        setActiveBreakpoint: (bp) => {
          set({ activeBreakpoint: bp });
        },

        addCustomBreakpoint: (bp) => {
          set((s) => ({
            customBreakpoints: [...s.customBreakpoints, bp],
          }));
        },

        removeCustomBreakpoint: (id) => {
          set((s) => ({
            customBreakpoints: s.customBreakpoints.filter((b) => b.id !== id),
          }));
        },

        setHiddenOnDevice: (componentId, device, hidden) => {
          set((s) => {
            const current = s.hiddenOnDevices[componentId] || [];
            const next = hidden
              ? [...current, device]
              : current.filter((d) => d !== device);
            return {
              hiddenOnDevices: { ...s.hiddenOnDevices, [componentId]: next },
            };
          });
        },
      }),
      {
        name: 'ui-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          view: state.view,
          panels: state.panels,
        }),
      }
    )
  )
);

export const useView = () => useUIStore((s) => s.view);
export const usePanels = () => useUIStore((s) => s.panels);
export const useClipboard = () => useUIStore((s) => s.clipboard);
export const useToasts = () => useUIStore((s) => s.toasts);