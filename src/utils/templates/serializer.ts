import type { SerializedEditorState, TemplateData } from '@/types/template';
import type { UIComponent } from '@/types/canvas';
import { CURRENT_TEMPLATE_VERSION } from './migrations';

/**
 * Sistema de serialización/deserialización de estado del editor
 */

/**
 * Limpia el estado para guardar (remueve datos temporales)
 */
export function cleanStateForSerialization(
  components: Record<string, UIComponent>,
  rootId: string
): Record<string, UIComponent> {
  const cleaned: Record<string, UIComponent> = {};

  for (const [id, component] of Object.entries(components)) {
    cleaned[id] = {
      ...component,
      // Asegurar que no hay referencias a selectedIds o estado temporal
      id: component.id,
      type: component.type,
      props: { ...component.props },
      styles: JSON.parse(JSON.stringify(component.styles)), // Deep copy
      parent: component.parent,
      children: [...component.children],
      metadata: { ...component.metadata },
    };
  }

  return cleaned;
}

/**
 * Serializa el estado actual del editor a TemplateData
 */
export function serializeEditorState(
  components: Record<string, UIComponent>,
  rootId: string,
  metadata?: {
    createdAt?: number;
    updatedAt?: number;
  }
): TemplateData {
  return {
    components: cleanStateForSerialization(components, rootId),
    rootId,
    version: CURRENT_TEMPLATE_VERSION,
    createdAt: metadata?.createdAt || Date.now(),
    updatedAt: metadata?.updatedAt || Date.now(),
  };
}

/**
 * Convierte TemplateData a JSON exportable
 */
export function templateToJSON(data: TemplateData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Parsea JSON a TemplateData
 */
export function jsonToTemplate(json: string): TemplateData | null {
  try {
    const parsed = JSON.parse(json);
    return {
      components: parsed.components || {},
      rootId: parsed.rootId || '',
      version: parsed.version || '1.0',
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    };
  } catch (error) {
    console.error('Failed to parse template JSON:', error);
    return null;
  }
}

/**
 * Comprime datos de componentes para almacenamiento
 * (Útil para localStorage que tiene límite de 5-10MB)
 */
export function compressTemplateData(data: TemplateData): string {
  // Por ahora, JSON simple. En el futuro se puede usar LZ-string o similar
  const json = templateToJSON(data);

  // Remover espacios en blanco innecesarios
  return json.replace(/\s+/g, ' ').trim();
}

/**
 * Descomprime datos de plantilla
 */
export function decompressTemplateData(compressed: string): TemplateData | null {
  // Por ahora es JSON simple
  return jsonToTemplate(compressed);
}

/**
 * Optimiza thumbnails en Base64 para no sobrecargar localStorage
 * (Compresión simple: limita tamaño y calidad)
 */
export function optimizeThumbnail(
  thumbnail: string,
  maxSizeKB: number = 50
): string {
  if (!thumbnail || !thumbnail.startsWith('data:')) {
    return thumbnail; // Si es URL, no optimizar
  }

  // Extraer tipo y datos
  const [header, data] = thumbnail.split(',');

  // Calcular tamaño en KB
  const sizeKB = (data.length * 0.75) / 1024; // Base64 es 33% más grande

  if (sizeKB > maxSizeKB) {
    // Si es muy grande, crear un placeholder
    console.warn(
      `Thumbnail too large (${sizeKB.toFixed(1)}KB), using placeholder`
    );
    return createPlaceholderThumbnail();
  }

  return thumbnail;
}

/**
 * Crea un thumbnail placeholder (1x1 px transparente)
 */
export function createPlaceholderThumbnail(): string {
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
}

/**
 * Estima el tamaño total de una plantilla en KB
 */
export function estimateTemplateSize(data: TemplateData): number {
  const json = templateToJSON(data);
  return (json.length * 0.75) / 1024;
}

/**
 * Crea un resumen legible del tamaño
 */
export function formatTemplateSize(data: TemplateData): string {
  const sizeKB = estimateTemplateSize(data);

  if (sizeKB < 1) {
    return `${Math.round(sizeKB * 1000)}B`;
  }

  if (sizeKB < 1024) {
    return `${sizeKB.toFixed(2)}KB`;
  }

  return `${(sizeKB / 1024).toFixed(2)}MB`;
}

/**
 * Valida el tamaño de una plantilla para localStorage
 * localStorage típicamente tiene límite de 5-10MB por dominio
 */
export function validateTemplateSize(data: TemplateData, maxSizeMB: number = 5): {
  valid: boolean;
  sizeMB: number;
  message: string;
} {
  const sizeKB = estimateTemplateSize(data);
  const sizeMB = sizeKB / 1024;

  if (sizeMB > maxSizeMB) {
    return {
      valid: false,
      sizeMB,
      message: `Template size (${sizeMB.toFixed(2)}MB) exceeds limit of ${maxSizeMB}MB`,
    };
  }

  return {
    valid: true,
    sizeMB,
    message: `OK (${sizeMB.toFixed(2)}MB)`,
  };
}

/**
 * Genera un snapshot del estado actual para debugging
 */
export function generateTemplateSnapshot(data: TemplateData): string {
  const componentCount = Object.keys(data.components).length;
  const size = estimateTemplateSize(data);

  return `
Template Snapshot:
  - Components: ${componentCount}
  - Root ID: ${data.rootId}
  - Version: ${data.version}
  - Size: ${size.toFixed(2)}KB
  - Created: ${data.createdAt ? new Date(data.createdAt).toISOString() : 'N/A'}
  - Updated: ${data.updatedAt ? new Date(data.updatedAt).toISOString() : 'N/A'}
    `.trim();
}
