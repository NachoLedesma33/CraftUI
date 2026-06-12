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
  
  setComponents: (components: Record<string, UIComponent>) => void;
  
  startHistoryBatch: () => void;
  endHistoryBatch: () => void;
  
  deleteSelected: () => void;
  pasteComponents: (components: UIComponent[], targetParentId?: string) => string[];
  selectAllAtLevel: () => void;
  selectAllComponents: () => void;
  startRenaming: (id: string) => void;
  endRenaming: (id: string, newName: string) => void;
  cancelRenaming: (id: string) => void;
  
  restoreFromAutoSave: (autoSaveData: string) => void;
}

const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  width: 1920,
  height: 1080,
  scale: 1,
  device: 'desktop',
};

const MAX_HISTORY = 50;

const typeNames: Record<string, string> = {
  'code-block': 'Code Block',
  'feature-grid': 'Feature Grid',
  'icon-grid': 'Icon Grid',
};

const createDefaultComponent = (type: ComponentType, id: string): UIComponent => {
  const name = typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1);
  const baseMetadata: ComponentMetadata = {
    isVisible: true,
    isLocked: false,
    name,
  };
  
  const baseStyles: Styles = {};
  
  switch (type) {
    case 'box':
    case 'badge':
    case 'chip':
    case 'tooltip':
    case 'sidebar':
    case 'header':
    case 'footer':
    case 'section':
    case 'skeleton':
    case 'progress':
    case 'divider':
    case 'card':
      return { id, type, props: {}, styles: baseStyles, parent: null, children: [], metadata: baseMetadata };
    case 'text':
      return { id, type, props: { text: 'Text' }, styles: { ...baseStyles, fontSize: { base: '16px' } }, parent: null, children: [], metadata: baseMetadata };
    case 'heading':
      return { id, type, props: { text: 'Heading', level: 2 }, styles: { ...baseStyles, fontSize: { base: '32px' }, fontWeight: { base: '700' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Heading' } };
    case 'blockquote':
      return { id, type, props: { text: 'Blockquote' }, styles: { ...baseStyles, borderLeft: { base: '4px solid #8b5cf6' }, padding: { base: '12px 16px' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Blockquote' } };
    case 'list':
      return { id, type, props: { items: 'Item 1\nItem 2\nItem 3', ordered: false }, styles: { ...baseStyles, padding: { base: '0 0 0 24px' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'List' } };
    case 'code-block':
      return { id, type, props: { text: 'const x = 42;' }, styles: { ...baseStyles, backgroundColor: { base: '#1e293b' }, color: { base: '#e2e8f0' }, padding: { base: '16px' }, fontFamily: { base: 'monospace' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Code Block' } };
    case 'button':
      return { id, type, props: { text: 'Button', type: 'button' }, styles: baseStyles, parent: null, children: [], metadata: baseMetadata };
    case 'image':
    case 'avatar':
      return { id, type, props: { src: '', alt: 'Image' }, styles: baseStyles, parent: null, children: [], metadata: baseMetadata };
    case 'video':
      return { id, type, props: { embedUrl: '' }, styles: baseStyles, parent: null, children: [], metadata: { ...baseMetadata, name: 'Video' } };
    case 'input':
      return { id, type, props: { placeholder: 'Enter text...', type: 'text' }, styles: baseStyles, parent: null, children: [], metadata: { ...baseMetadata, name: 'Input' } };
    case 'textarea':
      return { id, type, props: { placeholder: 'Enter text...', rows: 4 }, styles: baseStyles, parent: null, children: [], metadata: { ...baseMetadata, name: 'Textarea' } };
    case 'select':
      return { id, type, props: { options: 'Option 1\nOption 2\nOption 3' }, styles: baseStyles, parent: null, children: [], metadata: { ...baseMetadata, name: 'Select' } };
    case 'checkbox':
      return { id, type, props: { label: 'Checkbox', checked: false }, styles: baseStyles, parent: null, children: [], metadata: { ...baseMetadata, name: 'Checkbox' } };
    case 'radio':
      return { id, type, props: { label: 'Option', checked: false }, styles: baseStyles, parent: null, children: [], metadata: { ...baseMetadata, name: 'Radio' } };
    case 'switch':
      return { id, type, props: { label: 'Toggle', checked: false }, styles: baseStyles, parent: null, children: [], metadata: { ...baseMetadata, name: 'Switch' } };
    case 'navbar':
    case 'tabs':
      return { id, type, props: { items: 'Item 1\nItem 2\nItem 3' }, styles: { ...baseStyles, display: { base: 'flex' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Navbar' } };
    case 'accordion':
      return { id, type, props: { text: 'Accordion Item' }, styles: baseStyles, parent: null, children: [], metadata: { ...baseMetadata, name: 'Accordion' } };
    case 'dropdown':
      return { id, type, props: { text: 'Dropdown', items: 'Item 1\nItem 2\nItem 3' }, styles: baseStyles, parent: null, children: [], metadata: { ...baseMetadata, name: 'Dropdown' } };
    case 'breadcrumbs':
      return { id, type, props: { items: 'Home / Page / Subpage' }, styles: { ...baseStyles, display: { base: 'flex' }, gap: { base: '8px' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Breadcrumbs' } };
    case 'table':
      return { id, type, props: { columns: 'Name,Email,Role', items: 'John,john@acme.com,Admin\nJane,jane@acme.com,Editor' }, styles: { ...baseStyles, display: { base: 'table' }, width: { base: '100%' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Table' } };
    case 'container':
      return { id, type, props: {}, styles: { ...baseStyles, display: { base: 'block' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Container' } };
    case 'flex':
      return { id, type, props: {}, styles: { ...baseStyles, display: { base: 'flex' }, flexDirection: { base: 'row' }, gap: { base: '8px' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Flex' } };
    case 'grid':
      return { id, type, props: {}, styles: { ...baseStyles, display: { base: 'grid' }, gridTemplateColumns: { base: '1fr 1fr' }, gap: { base: '8px' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Grid' } };
    case 'hero':
      return { id, type, props: { text: 'Hero Title' }, styles: { ...baseStyles, display: { base: 'flex' }, flexDirection: { base: 'column' }, alignItems: { base: 'center' }, justifyContent: { base: 'center' }, minHeight: { base: '400px' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Hero' } };
    case 'feature-grid':
      return { id, type, props: {}, styles: { ...baseStyles, display: { base: 'grid' }, gridTemplateColumns: { base: 'repeat(3, 1fr)' }, gap: { base: '24px' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Feature Grid' } };
    case 'alert':
      return { id, type, props: { text: 'Alert message' }, styles: { ...baseStyles, display: { base: 'flex' }, padding: { base: '12px 16px' }, backgroundColor: { base: '#fef3cd' }, borderRadius: { base: '8px' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Alert' } };
    case 'toast':
      return { id, type, props: { text: 'Toast notification' }, styles: { ...baseStyles, display: { base: 'flex' }, padding: { base: '12px 16px' }, backgroundColor: { base: '#1f2937' }, color: { base: '#ffffff' }, borderRadius: { base: '8px' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Toast' } };
    case 'modal':
      return { id, type, props: { text: 'Modal Content' }, styles: { ...baseStyles, padding: { base: '24px' }, backgroundColor: { base: '#ffffff' }, borderRadius: { base: '12px' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Modal' } };
    case 'icon':
      return { id, type, props: { iconName: 'star', text: '✦' }, styles: { ...baseStyles, display: { base: 'inline-flex' }, fontSize: { base: '24px' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Icon' } };
    case 'icon-grid':
    case 'gallery':
      return { id, type, props: {}, styles: { ...baseStyles, display: { base: 'grid' }, gridTemplateColumns: { base: 'repeat(3, 1fr)' }, gap: { base: '8px' } }, parent: null, children: [], metadata: { ...baseMetadata, name: 'Icon Grid' } };
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
          set((state: EditorWithImmer) => {
            const del = (compId: string) => {
              const comp = state.components[compId];
              if (!comp) return;
              comp.children.forEach((childId: string) => del(childId));
              if (comp.parent && state.components[comp.parent]) {
                state.components[comp.parent].children = state.components[comp.parent].children.filter(
                  (cid: string) => cid !== compId,
                );
              }
              delete state.components[compId];
            };
            del(id);
          });
          get().saveToHistory();
        },

        duplicateComponent: (id: string) => {
          const original = get().components[id];
          if (!original) return null;

          let newId = '';

          set((state: EditorWithImmer) => {
            const cloneRecursive = (comp: UIComponent, newParentId: string | null): string => {
              const cid = uuidv4();
              const cloned: UIComponent = {
                ...JSON.parse(JSON.stringify(comp)),
                id: cid,
                parent: newParentId,
                children: [],
                metadata: { ...comp.metadata, name: `${comp.metadata.name} (Copy)` },
              };
              cloned.children = comp.children.map((childId: string) => {
                const child = state.components[childId];
                return child ? cloneRecursive(child, cid) : '';
              }).filter(Boolean);
              state.components[cid] = cloned;
              return cid;
            };

            newId = cloneRecursive(original, original.parent);

            if (original.parent && state.components[original.parent]) {
              const parentIndex = state.components[original.parent].children.indexOf(id);
              state.components[original.parent].children.splice(parentIndex + 1, 0, newId);
            }
          });

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

        setComponents: (components: Record<string, UIComponent>) => {
          set((state: EditorWithImmer) => {
            state.components = components;
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

        deleteSelected: () => {
          const ids = [...get().selectedIds];
          set((state: EditorWithImmer) => {
            const del = (compId: string) => {
              const comp = state.components[compId];
              if (!comp) return;
              comp.children.forEach((childId: string) => del(childId));
              if (comp.parent && state.components[comp.parent]) {
                state.components[comp.parent].children = state.components[comp.parent].children.filter(
                  (cid: string) => cid !== compId,
                );
              }
              delete state.components[compId];
            };
            ids.forEach((id) => {
              if (state.components[id]) del(id);
            });
          });
          get().saveToHistory();
          get().clearSelection();
        },

        pasteComponents: (clipboardComps: UIComponent[], targetParentId?: string) => {
          const newIds: string[] = [];
          const parentId = targetParentId || null;

          set((state: EditorWithImmer) => {
            const cloneRecursive = (comp: UIComponent, newParentId: string | null): string => {
              const cid = uuidv4();
              const cloned: UIComponent = {
                ...JSON.parse(JSON.stringify(comp)),
                id: cid,
                parent: newParentId,
                children: [],
              };
              cloned.children = comp.children.map((childId: string) => {
                const child = clipboardComps.find(c => c.id === childId) || state.components[childId];
                return child ? cloneRecursive(child, cid) : '';
              }).filter(Boolean);
              state.components[cid] = cloned;
              return cid;
            };

            clipboardComps.forEach((comp) => {
              const newId = cloneRecursive(comp, parentId);
              newIds.push(newId);
              if (parentId && state.components[parentId]) {
                state.components[parentId].children.push(newId);
              }
            });
          });

          get().saveToHistory();
          get().setSelection(newIds);
          return newIds;
        },

        selectAllAtLevel: () => {
          const state = get();
          if (state.selectedIds.length === 0) return;
          
          const selectedComponent = state.components[state.selectedIds[0]];
          if (!selectedComponent) return;

          const parentId = selectedComponent.parent;
          const parent = parentId ? state.components[parentId] : null;
          
          if (parent) {
            get().setSelection(parent.children);
          } else {
            // Root level: select all root children
            const roots = Object.values(state.components).filter(c => !c.parent);
            get().setSelection(roots.map(r => r.id));
          }
        },

        selectAllComponents: () => {
          const state = get();
          const allIds = Object.keys(state.components);
          if (allIds.length > 0) {
            get().setSelection(allIds);
          }
        },

        startRenaming: (id: string) => {
          const component = get().components[id];
          if (component) {
            set((s: EditorWithImmer) => {
              s.components[id].metadata.isRenaming = true;
            });
          }
        },

        endRenaming: (id: string, newName: string) => {
          const component = get().components[id];
          if (component) {
            set((s: EditorWithImmer) => {
              s.components[id].metadata.name = newName;
              s.components[id].metadata.isRenaming = false;
            });
            get().saveToHistory();
          }
        },

        cancelRenaming: (id: string) => {
          const component = get().components[id];
          if (component) {
            set((s: EditorWithImmer) => {
              s.components[id].metadata.isRenaming = false;
            });
          }
        },

        restoreFromAutoSave: (autoSaveData: string) => {
          try {
            const parsedData = JSON.parse(autoSaveData);
            if (parsedData.components && typeof parsedData.components === 'object') {
              set((s: EditorWithImmer) => {
                s.components = parsedData.components;
                s.rootId = parsedData.rootId || s.rootId;
                s.canvasConfig = parsedData.canvasConfig || s.canvasConfig;
                s.selectedIds = [];
                s.history = {
                  past: [],
                  future: [],
                };
              });
              get().saveToHistory();
            }
          } catch (error) {
            console.error('Failed to restore from auto-save:', error);
            throw new Error('Invalid auto-save data format');
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