import type { UIComponent } from './canvas';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface CanvasConfig {
  width: number;
  height: number;
  scale: number;
  device: DeviceType;
}

export interface EditorState {
  components: Record<string, UIComponent>;
  selection: Set<string>;
  canvasConfig: CanvasConfig;
}

export interface HistoryState {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
}

export type EditorAction =
  | { type: 'ADD_COMPONENT'; payload: UIComponent }
  | { type: 'REMOVE_COMPONENT'; payload: string }
  | { type: 'UPDATE_COMPONENT'; payload: { id: string; updates: Partial<UIComponent> } }
  | { type: 'MOVE_COMPONENT'; payload: { id: string; newParent: string | null; index: number } }
  | { type: 'SET_SELECTION'; payload: Set<string> }
  | { type: 'TOGGLE_SELECTION'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'UPDATE_CANVAS_CONFIG'; payload: Partial<CanvasConfig> }
  | { type: 'SET_STATE'; payload: EditorState }
  | { type: 'LOAD_STATE'; payload: EditorState };

export type ExportFormat = 'react-tsx' | 'html-css' | 'tailwind' | 'styled-components';

export interface ExportConfig {
  format: ExportFormat;
  includeStyles: boolean;
  componentPrefix: string;
  useTypescript: boolean;
  minify: boolean;
}