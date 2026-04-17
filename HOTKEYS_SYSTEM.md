# Sistema Global de Hotkeys y Comandos Rápidos

## Descripción General

Se ha implementado un sistema integral de **atajos de teclado** que centraliza todos los listeners de teclado de la aplicación. Este sistema permite a los usuarios realizar acciones complejas sin mover el ratón de la zona de diseño, acelerando significativamente el flujo de trabajo.

## Características Principales

### 1. **Hook Centralizado: `useKeyboardShortcuts`**

- **Ubicación**: `src/hooks/useKeyboardShortcuts.ts`
- **Responsabilidades**:
  - Registra listeners globales en el objeto `window`
  - Detecta automáticamente si el usuario está escribiendo en inputs
  - Mapea todos los atajos a sus respectivos comandos
  - Gestiona el estado del modal de atajos
  - Proporciona feedback en tiempo real mediante toasts

### 2. **Detección Inteligente de Contexto**

El sistema implementa lógica avanzada para evitar interferir con la entrada de texto:

```typescript
// Elementos detectados:
- HTMLInputElement (excepto hidden, submit, button, checkbox, radio)
- HTMLTextAreaElement
- Elementos con contenteditable="true"

// Atajos permitidos en inputs:
- Ctrl+Z (Undo)
- Ctrl+Y (Redo)
- Ctrl+A (Select all)
- Ctrl+C (Copy)
- Ctrl+X (Cut)
- Ctrl+V (Paste)
- Escape
```

### 3. **Compatibilidad Multiplataforma**

- **Windows/Linux**: `Ctrl`
- **macOS**: `Cmd` (metaKey)

El sistema detecta automáticamente y normaliza ambas combinaciones.

## Mapeo de Hotkeys

### Gestión de Proyecto

| Atajo      | Acción                | Descripción                |
| ---------- | --------------------- | -------------------------- |
| `Ctrl + S` | `saveProject()`       | Guardar proyecto           |
| `Ctrl + E` | `openExportModal()`   | Abrir modal de exportación |
| `Ctrl + P` | `togglePreviewMode()` | Alternar modo preview      |

### Edición Estructural

| Atajo                  | Acción                 | Descripción                                        |
| ---------------------- | ---------------------- | -------------------------------------------------- |
| `Ctrl + Z`             | `undo()`               | Deshacer última acción                             |
| `Ctrl + Y`             | `redo()`               | Rehacer última acción deshecha                     |
| `Ctrl + D`             | `duplicateComponent()` | Clonar componente seleccionado                     |
| `Delete` / `Backspace` | `deleteSelected()`     | Eliminar componentes seleccionados                 |
| `Ctrl + C`             | `copyComponents()`     | Copiar al clipboard                                |
| `Ctrl + V`             | `pasteComponents()`    | Pegar desde clipboard                              |
| `Ctrl + A`             | `selectAllAtLevel()`   | Seleccionar todos los componentes del nivel actual |
| `F2`                   | `startRenaming()`      | Activar modo renombrado del componente             |

### Visualización (Canvas)

| Atajo              | Acción               | Descripción                         |
| ------------------ | -------------------- | ----------------------------------- |
| `Ctrl + G`         | `toggleGrid()`       | Mostrar/ocultar grid                |
| `Ctrl + Shift + G` | `toggleSnapToGrid()` | Habilitar/deshabilitar snap-to-grid |
| `+`                | `zoomIn()`           | Aumentar zoom (máx 200%)            |
| `-`                | `zoomOut()`          | Reducir zoom (mín 50%)              |
| `0`                | `resetZoom()`        | Resetear zoom a 100%                |
| `Escape`           | `clearSelection()`   | Limpiar selección actual            |

### Ayuda

| Atajo            | Acción                   | Descripción               |
| ---------------- | ------------------------ | ------------------------- |
| `?` / `Ctrl + /` | `toggleShortcutsModal()` | Mostrar overlay de atajos |

## Arquitectura Técnica

### Flujo de Datos

```
Window Event (keydown)
    ↓
useKeyboardShortcuts Hook
    ↓
├─ isTypingElement? → Detectar contexto
├─ isAllowedShortcut? → Validar combinación
└─ handleKeyDown
    ↓
    ├─ EditorStore Actions (undo, redo, deleteSelected, etc.)
    ├─ UIStore Actions (zoom, grid, preview mode, etc.)
    └─ Toast Notifications
```

### Componentes Clave

1. **Hook: `useKeyboardShortcuts`**

   ```typescript
   export const useKeyboardShortcuts = () => {
     const { showShortcutsModal, setShowShortcutsModal } = ...;
     // ...
   };
   ```

2. **Modal: `ShortcutsModal`**
   - Factor elegante con tabla organizada por categorías
   - Muestra todas las combinaciones disponibles
   - Incluye consejos de uso

3. **Integraciones en Stores**
   - `EditorStore`: deleteSelected, selectAllAtLevel, startRenaming, etc.
   - `UIStore`: toggleGrid, toggleSnapToGrid

## Uso en la Aplicación

### Integración en App.tsx

```typescript
function App() {
  // Inicializar el hook
  const { showShortcutsModal, setShowShortcutsModal } = useKeyboardShortcuts();

  // Renderizar el modal
  <ShortcutsModal
    isOpen={showShortcutsModal}
    onClose={() => setShowShortcutsModal(false)}
  />
}
```

### Disparar Acciones desde Shortcuts

El sistema dispone de dos mecanismos principales:

1. **Llamadas Directas**: Para acciones en stores

   ```typescript
   undo();
   deleteSelected();
   toggleGrid();
   ```

2. **Custom Events**: Para acciones complejas (ej: abrir modales)
   ```typescript
   window.dispatchEvent(new CustomEvent("openExportModal"));
   ```

## Sistema de Portapapeles (Clipboard)

El clipboard está integrado en `UIStore`:

```typescript
interface UIState {
  clipboard: UIComponent[] | null;
}

interface UIActions {
  copyComponents: (components: UIComponent[]) => void;
  clearClipboard: () => void;
}
```

**Características**:

- Almacenamiento de componentes serializado
- Deep cloning para evitar mutaciones
- Soporte para múltiples items
- Limpiar automáticamente en navegación

## Feedback de Usuario

Cada acción genera un **toast notification** para feedback inmediato:

```typescript
// Éxito
addToast("Component duplicated", "success", 2000);

// Info
addToast("Grid toggled", "info", 2000);

// Error (potencial)
addToast("Cannot paste here", "error", 3000);
```

## Optimizaciones

### 1. **preventDefault en Lugares Críticos**

```typescript
if (isMod && key === "s") {
  e.preventDefault(); // Prevenir "Guardar página"
  saveProject();
}
```

### 2. **Detección Lazy de Contexto**

La función `isTypingElement()` se ejecuta en cada keydown pero es rápida (O(1)):

```typescript
const isTyping = isTypingElement(e);
if (isTyping && !isAllowedShortcut(e)) return;
```

### 3. **Memoización y useCallback**

Todos los handlers están envueltos con `useCallback` para evitar re-renders innecesarios.

## Accesibilidad

### Tooltips en UI

Los botones en la Toolbar incluyen información de atajos:

```tsx
<button
  title="Delete (Del)" // Accesibilidad: tecla correspondiente
  onClick={handleDelete}
>
  <Trash2 />
</button>
```

### Documentación del Modal

El modal `ShortcutsModal` incluye:

- ✅ Tabla organizada por categorías
- ✅ Iconos visuales para las teclas
- ✅ Consejos de plataforma (Cmd en Mac)
- ✅ Información sobre restricciones (inputs)

## Extensibilidad

### Agregar Nuevos Atajos

1. **Definir en `SHORTCUTS` array en `ShortcutsModal.tsx`**:

   ```typescript
   const SHORTCUTS = [
     {
       category: "Custom",
       keys: ["Ctrl", "Alt", "N"],
       description: "Nueva acción",
     },
   ];
   ```

2. **Implementar en `handleKeyDown`**:

   ```typescript
   if (isMod && e.altKey && key === "n") {
     e.preventDefault();
     handleNewAction();
     return;
   }
   ```

3. **Agregar acción en Store** (si es necesario)

### Registrar Custom Events

Para acciones complejas desde otros componentes:

```typescript
// En el hook
window.dispatchEvent(new CustomEvent("customAction"));

// En el componente
useEffect(() => {
  const handler = () => {
    /* manejar acción */
  };
  window.addEventListener("customAction", handler);
  return () => window.removeEventListener("customAction", handler);
}, []);
```

## Testing y Debugging

### Verificar Contexto de Escritura

```typescript
// Debug en consola
const target = event.target;
console.log("Target:", target.tagName, target.getAttribute("contenteditable"));
```

### Simular Atajos

```javascript
// En DevTools
const event = new KeyboardEvent("keydown", {
  key: "z",
  ctrlKey: true,
});
window.dispatchEvent(event);
```

## Restricciones Conocidas

1. ✅ **Contexto de Escritura**: Los atajos globales (excepto los permitidos) no funcionan en inputs
2. ✅ **Prevención de Múltiples Pegues**: El paste actual es un placeholder para implementación futura
3. ✅ **Renombrado**: Requiere UI adicional para activar el input de edición

## Mejoras Futuras

1. **Paste Completo**: Implementar pegar componentes del clipboard en la posición del cursor
2. **Grabación de Macros**: Grabar y reproducir secuencias de atajos
3. **Configuración Personalizada**: Permitir al usuario reasignar atajos
4. **Visor de Historial**: Ver historial de acciones con Ctrl+H
5. **Modo Zen**: Ocultar UI con F11 o similar

## Resumen de Archivos Modificados/Creados

| Archivo                                    | Tipo       | Cambios                                    |
| ------------------------------------------ | ---------- | ------------------------------------------ |
| `src/hooks/useKeyboardShortcuts.ts`        | **Nuevo**  | Hook principal (400+ líneas)               |
| `src/components/modals/ShortcutsModal.tsx` | **Nuevo**  | Modal visual (250+ líneas)                 |
| `src/store/editorStore.ts`                 | Modificado | deleteSelected, selectAllAtLevel, renaming |
| `src/store/uiStore.ts`                     | Modificado | toggleGrid, toggleSnapToGrid               |
| `src/types/canvas.ts`                      | Modificado | isRenaming en ComponentMetadata            |
| `src/App.tsx`                              | Modificado | Integración del hook y modal               |
| `src/hooks/index.ts`                       | Modificado | Exportación del nuevo hook                 |

## Conclusión

Este sistema de hotkeys ofrece:

- ✅ Experiencia de usuario mejorada
- ✅ Mayor velocidad en el flujo de trabajo
- ✅ Compatibilidad multiplataforma
- ✅ Detección inteligente de contexto
- ✅ Arquitectura extensible
- ✅ Feedback visual completo
