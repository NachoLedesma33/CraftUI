import type { Template, TemplateData, TemplateExport } from '@/types/template';
import { useEditorStore } from '@/store';
import {
  getPredefinedTemplates,
  getPredefinedTemplate,
  searchPredefinedTemplates,
} from './predefinedTemplates';
import {
  serializeEditorState,
  templateToJSON,
  jsonToTemplate,
  optimizeThumbnail,
  estimateTemplateSize,
  validateTemplateSize,
} from './serializer';
import { migrateTemplateData, validateTemplateData } from './migrations';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY_PREFIX = 'craftui-template-';
const STORAGE_INDEX_KEY = 'craftui-templates-index';
const MAX_USER_TEMPLATES = 50;

/**
 * Librería central de gestión de plantillas
 */
export const templateLibrary = {
  /**
   * Obtiene todas las plantillas predefinidas del sistema
   */
  getPredefinedTemplates(): Template[] {
    return getPredefinedTemplates();
  },

  /**
   * Obtiene todas las plantillas del usuario (guardadas en localStorage)
   */
  getUserTemplates(): Template[] {
    try {
      const indexJson = localStorage.getItem(STORAGE_INDEX_KEY);
      if (!indexJson) return [];

      const index: string[] = JSON.parse(indexJson);
      const templates: Template[] = [];

      for (const id of index) {
        const templateJson = localStorage.getItem(STORAGE_KEY_PREFIX + id);
        if (templateJson) {
          try {
            const template = JSON.parse(templateJson);
            templates.push(template);
          } catch (error) {
            console.error(`Failed to parse template ${id}:`, error);
          }
        }
      }

      return templates;
    } catch (error) {
      console.error('Failed to load user templates:', error);
      return [];
    }
  },

  /**
   * Obtiene todas las plantillas (predefinidas + usuario)
   */
  getAllTemplates(): Template[] {
    return [...this.getPredefinedTemplates(), ...this.getUserTemplates()];
  },

  /**
   * Obtiene una plantilla por ID
   */
  getTemplate(id: string): Template | undefined {
    // Primero buscar en predefinidas
    const predefined = getPredefinedTemplate(id);
    if (predefined) return predefined;

    // Luego en usuario
    try {
      const templateJson = localStorage.getItem(STORAGE_KEY_PREFIX + id);
      if (templateJson) {
        return JSON.parse(templateJson);
      }
    } catch (error) {
      console.error(`Failed to get template ${id}:`, error);
    }

    return undefined;
  },

  /**
   * Busca plantillas por query
   */
  searchTemplates(query: string): Template[] {
    const predefinedResults = searchPredefinedTemplates(query);
    const userTemplates = this.getUserTemplates();
    const userResults = userTemplates.filter((t) => {
      const lowerQuery = query.toLowerCase();
      return (
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    });

    return [...predefinedResults, ...userResults];
  },

  /**
   * Guarda una nueva plantilla del usuario
   */
  saveTemplate(
    name: string,
    description: string = '',
    tags: string[] = []
  ): { success: boolean; templateId?: string; error?: string } {
    try {
      // Validar cantidad de plantillas
      const userTemplates = this.getUserTemplates();
      if (userTemplates.length >= MAX_USER_TEMPLATES) {
        return {
          success: false,
          error: `Cannot save more than ${MAX_USER_TEMPLATES} templates`,
        };
      }

      // Obtener estado actual
      const state = useEditorStore.getState();
      const templateData = serializeEditorState(state.components, state.rootId);

      // Validar tamaño
      const sizeValid = validateTemplateSize(templateData, 5);
      if (!sizeValid.valid) {
        return {
          success: false,
          error: sizeValid.message,
        };
      }

      // Validar estructura
      const validation = validateTemplateData(templateData);
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid template data: ${validation.errors.join(', ')}`,
        };
      }

      // Crear plantilla
      const template: Template = {
        id: `template-${uuidv4()}`,
        name,
        description,
        category: 'custom',
        thumbnail: undefined,
        tags,
        data: templateData,
        isSystem: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Guardar en localStorage
      const storageKey = STORAGE_KEY_PREFIX + template.id;
      localStorage.setItem(storageKey, JSON.stringify(template));

      // Actualizar índice
      const index = JSON.parse(localStorage.getItem(STORAGE_INDEX_KEY) || '[]');
      index.push(template.id);
      localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(index));

      return {
        success: true,
        templateId: template.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Actualiza una plantilla existente
   */
  updateTemplate(
    templateId: string,
    updates: Partial<Template>
  ): { success: boolean; error?: string } {
    try {
      const template = this.getTemplate(templateId);
      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      if (template.isSystem) {
        return {
          success: false,
          error: 'Cannot edit system templates',
        };
      }

      const updated: Template = {
        ...template,
        ...updates,
        id: template.id,
        isSystem: false,
        updatedAt: Date.now(),
      };

      const storageKey = STORAGE_KEY_PREFIX + templateId;
      localStorage.setItem(storageKey, JSON.stringify(updated));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Elimina una plantilla del usuario
   */
  deleteTemplate(templateId: string): { success: boolean; error?: string } {
    try {
      const template = this.getTemplate(templateId);
      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      if (template.isSystem) {
        return {
          success: false,
          error: 'Cannot delete system templates',
        };
      }

      // Remover de localStorage
      localStorage.removeItem(STORAGE_KEY_PREFIX + templateId);

      // Actualizar índice
      const index = JSON.parse(localStorage.getItem(STORAGE_INDEX_KEY) || '[]');
      const newIndex = index.filter((id: string) => id !== templateId);
      localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(newIndex));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Carga una plantilla en el editor
   */
  async loadTemplate(
    templateId: string,
    confirmIfNotEmpty: boolean = true
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const template = this.getTemplate(templateId);
      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      const state = useEditorStore.getState();

      // Verificar si el canvas no está vacío
      if (confirmIfNotEmpty && Object.keys(state.components).length > 0) {
        // En una aplicación real, mostrar un modal de confirmación
        // Por ahora, retornar error
        return {
          success: false,
          error: 'Canvas is not empty. Please clear before loading template.',
        };
      }

      // Migrar datos si es necesario
      const migrationResult = migrateTemplateData(template.data);
      if (!migrationResult.success) {
        console.warn('Migration warnings:', migrationResult.warnings);
      }

      // Validar datos
      const validation = validateTemplateData(migrationResult.data);
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid template: ${validation.errors[0]}`,
        };
      }

      // Cargar en el store
      state.clearSelection();
      state.setComponents(migrationResult.data.components);
      state.setRootId(migrationResult.data.rootId);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Exporta la plantilla actual como JSON
   */
  exportCurrentAsJSON(): { blob: Blob; filename: string } {
    const state = useEditorStore.getState();
    const templateData = serializeEditorState(state.components, state.rootId);

    const export_obj: TemplateExport = {
      template: {
        id: `export-${uuidv4()}`,
        name: 'Exported Template',
        description: '',
        category: 'custom',
        tags: [],
        data: templateData,
        isSystem: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      exportedAt: Date.now(),
      editorVersion: '1.0.0',
    };

    const json = JSON.stringify(export_obj, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const filename = `craftui-template-${new Date().toISOString().slice(0, 10)}.json`;

    return { blob, filename };
  },

  /**
   * Exporta una plantilla específica como JSON
   */
  exportTemplateAsJSON(templateId: string): {
    blob?: Blob;
    filename?: string;
    error?: string;
  } {
    try {
      const template = this.getTemplate(templateId);
      if (!template) {
        return { error: 'Template not found' };
      }

      const export_obj: TemplateExport = {
        template,
        exportedAt: Date.now(),
        editorVersion: '1.0.0',
      };

      const json = JSON.stringify(export_obj, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const filename = `${template.name.replace(/\s+/g, '-').toLowerCase()}.json`;

      return { blob, filename };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Importa una plantilla desde JSON
   */
  async importFromJSON(
    jsonString: string,
    saveName?: string
  ): Promise<{ success: boolean; templateId?: string; error?: string }> {
    try {
      // Parsear JSON
      let export_obj: unknown;
      try {
        export_obj = JSON.parse(jsonString);
      } catch {
        return { success: false, error: 'Invalid JSON format' };
      }

      const obj = export_obj as any;

      // Extraer template
      let template: Template;
      if (obj.template) {
        template = obj.template;
      } else if (obj.components && obj.rootId) {
        // JSON directo de datos
        const migrationResult = migrateTemplateData(obj);
        if (!migrationResult.success) {
          return { success: false, error: 'Failed to migrate template data' };
        }

        template = {
          id: `imported-${uuidv4()}`,
          name: saveName || 'Imported Template',
          description: '',
          category: 'custom',
          tags: [],
          data: migrationResult.data,
          isSystem: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      } else {
        return { success: false, error: 'Invalid template structure' };
      }

      // Validar
      const validation = validateTemplateData(template.data);
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid template: ${validation.errors[0]}`,
        };
      }

      // Guardar importación
      template.id = `imported-${uuidv4()}`;
      template.name = saveName || template.name;
      template.isSystem = false;
      template.createdAt = Date.now();
      template.updatedAt = Date.now();

      const storageKey = STORAGE_KEY_PREFIX + template.id;
      localStorage.setItem(storageKey, JSON.stringify(template));

      // Actualizar índice
      const index = JSON.parse(localStorage.getItem(STORAGE_INDEX_KEY) || '[]');
      index.push(template.id);
      localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(index));

      return { success: true, templateId: template.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Limpia todas las plantillas del usuario (solo por debug)
   */
  clearUserTemplates(): { success: boolean; count: number } {
    try {
      const index = JSON.parse(localStorage.getItem(STORAGE_INDEX_KEY) || '[]');

      for (const id of index) {
        localStorage.removeItem(STORAGE_KEY_PREFIX + id);
      }

      localStorage.removeItem(STORAGE_INDEX_KEY);

      return { success: true, count: index.length };
    } catch (error) {
      return { success: false, count: 0 };
    }
  },

  /**
   * Obtiene información sobre el almacenamiento
   */
  getStorageInfo(): {
    userTemplatesCount: number;
    estimatedSizeKB: number;
    quotaKB: number;
  } {
    const templates = this.getUserTemplates();
    let totalSizeKB = 0;

    for (const template of templates) {
      totalSizeKB += estimateTemplateSize(template.data);
    }

    // localStorage típicamente tiene 5-10MB por dominio
    const quotaKB = 5 * 1024; // 5MB

    return {
      userTemplatesCount: templates.length,
      estimatedSizeKB: totalSizeKB,
      quotaKB,
    };
  },
};

export type TemplateLibrary = typeof templateLibrary;
