import type { UIComponent } from "./canvas";

export type TemplateCategory =
  | "landing"
  | "dashboard"
  | "portfolio"
  | "ecommerce"
  | "auth"
  | "custom";

export interface TemplateData {
  components: Record<string, UIComponent>;
  rootId: string;
  version: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail?: string; // Base64 o URL
  tags: string[];
  data: TemplateData;
  isSystem: boolean; // true = predefinida, false = usuario
  createdAt: number;
  updatedAt: number;
}

export interface TemplateExport {
  template: Template;
  exportedAt: number;
  editorVersion: string;
}

export interface SerializedEditorState {
  components: Record<string, UIComponent>;
  rootId: string;
  canvasConfig?: {
    width: number;
    height: number;
    scale: number;
    device: "mobile" | "tablet" | "desktop";
  };
  version: string;
}

export interface MigrationResult {
  success: boolean;
  version: string;
  data: TemplateData;
  warnings?: string[];
}
