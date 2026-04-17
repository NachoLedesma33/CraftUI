import { create } from 'zustand';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
import type { UIComponent } from '@/types/canvas';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

interface ViewState {
  zoom: number;
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

export interface UIState {
  view: ViewState;
  panels: PanelsState;
  clipboard: UIComponent[] | null;
  toasts: Toast[];
}

export interface UIActions {
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setShowGrid: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  setPreviewMode: (mode: boolean) => void;
  setActiveDevice: (device: 'mobile' | 'tablet' | 'desktop') => void;
  togglePanel: (panel: keyof PanelsState) => void;
  setPanel: (panel: keyof PanelsState, open: boolean) => void;
  copyComponents: (components: UIComponent[]) => void;
  clearClipboard: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => string;
  removeToast: (id: string) => void;
}

type UIStore = UIState & UIActions;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.1;

const initialView: ViewState = {
  zoom: 1,
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

export const useUIStore = create<UIStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        view: initialView,
        panels: initialPanels,
        clipboard: null,
        toasts: [],

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

        setShowGrid: (show: boolean) => {
          set((s) => ({ view: { ...s.view, showGrid: show } }));
        },

        setSnapToGrid: (snap: boolean) => {
          set((s) => ({ view: { ...s.view, snapToGrid: snap } }));
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
            get().removeToast(id);
          }, duration);

          return id;
        },

        removeToast: (id: string) => {
          set((s) => ({
            toasts: s.toasts.filter((t) => t.id !== id),
          }));
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