import { create } from 'zustand';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import type { UIComponent, ComponentType, ComponentProps, Styles, ComponentMetadata } from '@/types/canvas';
import type { CanvasConfig } from '@/types/store';

export interface EditorStore {
  components: Record<string, UIComponent>;
  selectedIds: string[];
  rootId: string;
  canvasConfig: CanvasConfig;
  history: {
    past: string[];
    future: string[];
  };
  _hasHydrated: boolean;
}

export interface EditorActions {
  addComponent: (parentId: string, type: ComponentType, props?: Partial<ComponentProps>) => string;
  updateComponent: (id: string, updates: Partial<UIComponent>) => void;
  deleteComponent: (id: string) => void;
  duplicateComponent: (id: string) => string | null;
  
  selectComponent: (id: string, isMulti?: boolean) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  setSelection: (ids: string[]) => void;
  
  moveComponent: (id: string, newParentId: string | null, index: number) => void;
  reorderChildren: (parentId: string, newOrder: string[]) => void;
  
  setCanvasConfig: (config: Partial<CanvasConfig>) => void;
  
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  setRootId: (id: string) => void;
  
  loadState: (components: Record<string, UIComponent>) => void;
  
  startHistoryBatch: () => void;
  endHistoryBatch: () => void;
}

const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  width: 1920,
  height: 1080,
  scale: 1,
  device: 'desktop',
};

const MAX_HISTORY = 50;

const createDefaultComponent = (type: ComponentType, id: string): UIComponent => {
  const baseMetadata: ComponentMetadata = {
    isVisible: true,
    isLocked: false,
    name: type.charAt(0).toUpperCase() + type.slice(1),
  };
  
  const baseStyles: Styles = {};
  
  switch (type) {
    case 'box':
      return { id, type, props: {}, styles: baseStyles, parent: null, children: [], metadata: baseMetadata };
    case 'text':
      return { id, type, props: { text: 'Text' }, styles: { ...baseStyles, fontSize: { base: '16px' } }, parent: null, children: [], metadata: baseMetadata };
    case 'button':
      return { id, type, props: { text: 'Button', type: 'button' }, styles: baseStyles, parent: null, children: [], metadata: baseMetadata };
    case 'image':
      return { id, type, props: { src: '', alt: 'Image' }, styles: baseStyles, parent: null, children: [], metadata: baseMetadata };
    case 'container':
      return { id, type, props: {}, styles: { ...baseStyles, display: { base: 'block' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Container' } };
    case 'flex':
      return { id, type, props: {}, styles: { ...baseStyles, display: { base: 'flex' }, flexDirection: { base: 'row' }, gap: { base: '8px' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Flex' } };
    case 'grid':
      return { id, type, props: {}, styles: { ...baseStyles, display: { base: 'grid' }, gridTemplateColumns: { base: '1fr 1fr' }, gap: { base: '8px' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Grid' } };
    default:
      return { id, type, props: {}, styles: baseStyles, parent: null, children: [], metadata: baseMetadata };
  }
};

let historyBatchDepth = 0;
let historyTimeout: ReturnType<typeof setTimeout> | null = null;

type EditorWithImmer = EditorStore & EditorActions;

export const useEditorStore = create<EditorWithImmer>()(
  subscribeWithSelector(
    persist(
      immer((set, get): EditorWithImmer => ({
        components: {},
        selectedIds: [],
        rootId: '',
        canvasConfig: DEFAULT_CANVAS_CONFIG,
        history: {
          past: [],
          future: [],
        },
        _hasHydrated: false,

        addComponent: (parentId: string, type: ComponentType, props?: Partial<ComponentProps>) => {
          const id = uuidv4();
          const component = createDefaultComponent(type, id);
          
          if (props) {
            component.props = { ...component.props, ...props };
          }

          set((state: EditorWithImmer) => {
            state.components[id] = component;
            
            if (parentId && state.components[parentId]) {
              state.components[parentId].children.push(id);
              component.parent = parentId;
            }
          });

          get().saveToHistory();
          return id;
        },

        updateComponent: (id: string, updates: Partial<UIComponent>) => {
          set((state: EditorWithImmer) => {
            if (state.components[id]) {
              Object.assign(state.components[id], updates);
            }
          });
        },

        deleteComponent: (id: string) => {
          const component = get().components[id];
          if (!component) return;

          const deleteRecursive = (componentId: string) => {
            const comp = get().components[componentId];
            if (!comp) return;
            
            comp.children.forEach((childId: string) => deleteRecursive(childId));
            set((s: EditorWithImmer) => { delete s.components[componentId]; });
          };

          set((s: EditorWithImmer) => {
            if (component.parent && s.components[component.parent]) {
              const parent = s.components[component.parent];
              parent.children = parent.children.filter((childId: string) => childId !== id);
            }
          });

          deleteRecursive(id);
          get().saveToHistory();
        },

        duplicateComponent: (id: string) => {
          const original = get().components[id];
          if (!original) return null;

          const cloneRecursive = (comp: UIComponent, newParentId: string | null): string => {
            const newId = uuidv4();
            const newComponent: UIComponent = {
              ...JSON.parse(JSON.stringify(comp)),
              id: newId,
              parent: newParentId,
              children: [],
              metadata: { ...comp.metadata, name: `${comp.metadata.name} (Copy)` },
            };

            let newChildren: string[] = [];

            comp.children.forEach((childId: string) => {
              const child = get().components[childId];
              if (child) {
                const newChildId = cloneRecursive(child, newId);
                newChildren.push(newChildId);
              }
            });

            newComponent.children = newChildren;

            set((s: EditorWithImmer) => { s.components[newId] = newComponent; });

            return newId;
          };

          const newId = cloneRecursive(original, original.parent);
          
          if (original.parent && get().components[original.parent]) {
            const parentIndex = get().components[original.parent].children.indexOf(id);
            set((s: EditorWithImmer) => {
              s.components[original.parent!].children.splice(parentIndex + 1, 0, newId);
            });
          }

          get().saveToHistory();
          return newId;
        },

        selectComponent: (id: string, isMulti = false) => {
          set((state: EditorWithImmer) => {
            if (isMulti) {
              if (!state.selectedIds.includes(id)) {
                state.selectedIds.push(id);
              }
            } else {
              state.selectedIds = [id];
            }
          });
        },

        toggleSelection: (id: string) => {
          set((state: EditorWithImmer) => {
            const index = state.selectedIds.indexOf(id);
            if (index >= 0) {
              state.selectedIds.splice(index, 1);
            } else {
              state.selectedIds.push(id);
            }
          });
        },

        clearSelection: () => {
          set((state: EditorWithImmer) => { state.selectedIds = []; });
        },

        setSelection: (ids: string[]) => {
          set((state: EditorWithImmer) => { state.selectedIds = ids; });
        },

        moveComponent: (id: string, newParentId: string | null, index: number) => {
          const component = get().components[id];
          if (!component) return;

          set((state: EditorWithImmer) => {
            if (component.parent && state.components[component.parent]) {
              const oldParent = state.components[component.parent];
              oldParent.children = oldParent.children.filter((childId: string) => childId !== id);
            }

            if (newParentId && state.components[newParentId]) {
              state.components[newParentId].children.splice(index, 0, id);
              state.components[id].parent = newParentId;
            } else {
              state.components[id].parent = null;
            }
          });

          get().saveToHistory();
        },

        reorderChildren: (parentId: string, newOrder: string[]) => {
          set((state: EditorWithImmer) => {
            if (state.components[parentId]) {
              state.components[parentId].children = newOrder;
            }
          });
          
          get().saveToHistory();
        },

        setCanvasConfig: (config: Partial<CanvasConfig>) => {
          set((state: EditorWithImmer) => {
            Object.assign(state.canvasConfig, config);
          });
        },

        saveToHistory: () => {
          if (historyBatchDepth > 0) {
            if (historyTimeout) clearTimeout(historyTimeout);
            historyTimeout = setTimeout(() => get().endHistoryBatch(), 500);
            return;
          }

          const state = get();
          const snapshot = JSON.stringify(state.components);
          
          set((s: EditorWithImmer) => {
            s.history.past.push(snapshot);
            if (s.history.past.length > MAX_HISTORY) {
              s.history.past.shift();
            }
            s.history.future = [];
          });
        },

        undo: () => {
          const state = get();
          if (state.history.past.length === 0) return;

          const currentSnapshot = JSON.stringify(state.components);
          
          set((s: EditorWithImmer) => {
            const previous = s.history.past.pop();
            if (previous) {
              s.history.future.push(currentSnapshot);
              s.components = JSON.parse(previous);
            }
          });
        },

        redo: () => {
          const state = get();
          if (state.history.future.length === 0) return;

          const currentSnapshot = JSON.stringify(state.components);
          
          set((s: EditorWithImmer) => {
            const next = s.history.future.pop();
            if (next) {
              s.history.past.push(currentSnapshot);
              s.components = JSON.parse(next);
            }
          });
        },

        canUndo: () => get().history.past.length > 0,
        canRedo: () => get().history.future.length > 0,

        setRootId: (id: string) => {
          set((state: EditorWithImmer) => { state.rootId = id; });
        },

        loadState: (components: Record<string, UIComponent>) => {
          set((state: EditorWithImmer) => {
            state.components = components;
            state.history.past = [];
            state.history.future = [];
          });
        },

        startHistoryBatch: () => {
          historyBatchDepth++;
        },

        endHistoryBatch: () => {
          historyBatchDepth = Math.max(0, historyBatchDepth - 1);
          if (historyBatchDepth === 0) {
            get().saveToHistory();
          }
        },
      })),
      {
        name: 'editor-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state: EditorWithImmer) => ({
          components: state.components,
          rootId: state.rootId,
          canvasConfig: state.canvasConfig,
        }),
        onRehydrateStorage: () => (state: EditorWithImmer | undefined) => {
          if (state) {
            if (!state.rootId || !state.components[state.rootId]) {
              const rootId = uuidv4();
              const rootComponent: UIComponent = {
                id: rootId,
                type: 'container',
                props: {},
                styles: { display: { base: 'block' }, width: { base: '100%' }, height: { base: '100%' } },
                parent: null,
                children: [],
                metadata: { isVisible: true, isLocked: false, name: 'Root' },
              };
              state.components = { [rootId]: rootComponent };
              state.rootId = rootId;
            }
            state._hasHydrated = true;
          }
        },
      }
    )
  )
);

export const useSelectedComponents = () => {
  return useEditorStore((state: EditorWithImmer) => {
    return state.selectedIds.map(id => state.components[id]).filter(Boolean);
  });
};

export const useSelectedId = () => {
  return useEditorStore((state: EditorWithImmer) => state.selectedIds[0] ?? null);
};