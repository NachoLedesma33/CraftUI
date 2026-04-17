import type { TemplateData, MigrationResult } from '@/types/template';

/**
 * Sistema de migraciones para manejar cambios en la estructura de plantillas
 * Permite compatibilidad hacia atrás y forwards
 */

const CURRENT_VERSION = '1.0.0';

type MigrationFunction = (data: TemplateData) => TemplateData;

interface Migration {
  fromVersion: string;
  toVersion: string;
  migrate: MigrationFunction;
}

const migrations: Migration[] = [
  {
    fromVersion: '0.9.0',
    toVersion: '1.0.0',
    migrate: (data) => {
      // Ejemplo: Si en 0.9 no había animation, agregar la propiedad
      const updatedComponents = { ...data.components };
      Object.keys(updatedComponents).forEach((id) => {
        const comp = updatedComponents[id];
        if (comp.styles && !comp.styles.animation) {
          comp.styles.animation = undefined;
        }
      });
      return { ...data, version: '1.0.0' };
    },
  },
  // Futuras migraciones aquí
];

/**
 * Encuentra la ruta de migración entre dos versiones
 */
function findMigrationPath(
  fromVersion: string,
  toVersion: string
): Migration[] {
  // Implementación simple para versiones lineales
  if (fromVersion === toVersion) return [];
  
  return migrations.filter(
    (m) =>
      compareVersions(m.fromVersion, fromVersion) >= 0 &&
      compareVersions(m.toVersion, toVersion) <= 0
  );
}

/**
 * Compara dos versiones semver
 * Retorna: -1 si a < b, 0 si a === b, 1 si a > b
 */
function compareVersions(a: string, b: string): number {
  const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
  const [bMajor, bMinor, bPatch] = b.split('.').map(Number);

  if (aMajor !== bMajor) return aMajor < bMajor ? -1 : 1;
  if (aMinor !== bMinor) return aMinor < bMinor ? -1 : 1;
  if (aPatch !== bPatch) return aPatch < bPatch ? -1 : 1;
  return 0;
}

/**
 * Migra datos de una versión a otra
 */
export function migrateTemplateData(
  data: unknown,
  fromVersion?: string
): MigrationResult {
  const warnings: string[] = [];

  // Validación básica
  if (!data || typeof data !== 'object') {
    return {
      success: false,
      version: CURRENT_VERSION,
      data: { components: {}, rootId: '', version: CURRENT_VERSION },
      warnings: ['Invalid template data format'],
    };
  }

  const templateData = data as any;
  let currentData: TemplateData = {
    components: templateData.components || {},
    rootId: templateData.rootId || '',
    version: fromVersion || templateData.version || '0.9.0',
  };

  // Si ya es la versión actual, retorna directamente
  if (currentData.version === CURRENT_VERSION) {
    return {
      success: true,
      version: CURRENT_VERSION,
      data: currentData,
    };
  }

  // Buscar ruta de migración
  const path = findMigrationPath(currentData.version, CURRENT_VERSION);

  if (path.length === 0) {
    if (compareVersions(currentData.version, CURRENT_VERSION) > 0) {
      warnings.push(
        `Template version ${currentData.version} is newer than current ${CURRENT_VERSION}`
      );
    } else {
      warnings.push(`No migration path found from ${currentData.version}`);
    }
  }

  // Ejecutar migraciones en orden
  try {
    for (const migration of path) {
      currentData = migration.migrate(currentData);
    }
  } catch (error) {
    return {
      success: false,
      version: CURRENT_VERSION,
      data: currentData,
      warnings: [
        ...warnings,
        `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }

  // Asegurar que versión es correcta
  currentData.version = CURRENT_VERSION;

  return {
    success: true,
    version: CURRENT_VERSION,
    data: currentData,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Valida que una plantilla tenga la estructura correcta
 */
export function validateTemplateData(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Template data must be an object');
    return { valid: false, errors };
  }

  const template = data as any;

  if (!template.components || typeof template.components !== 'object') {
    errors.push('Template must have a components object');
  }

  if (typeof template.rootId !== 'string') {
    errors.push('Template must have a rootId string');
  }

  if (template.rootId && !template.components[template.rootId]) {
    errors.push('rootId does not reference a valid component');
  }

  // Validar que todos los parent/children referencias sean válidas
  const componentIds = new Set(Object.keys(template.components || {}));
  for (const [id, component] of Object.entries(template.components || {})) {
    const comp = component as any;

    if (comp.parent && !componentIds.has(comp.parent)) {
      errors.push(
        `Component ${id} references invalid parent ${comp.parent}`
      );
    }

    if (Array.isArray(comp.children)) {
      for (const childId of comp.children) {
        if (!componentIds.has(childId)) {
          errors.push(
            `Component ${id} references invalid child ${childId}`
          );
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export const CURRENT_TEMPLATE_VERSION = CURRENT_VERSION;
