# Visual UI Editor (CraftUI)

Un potente constructor visual de interfaces de usuario low-code con capacidad de arrastrar y soltar, previsualización en tiempo real y exportación de código.

## Características

### Funcionalidad Principal
- **Canvas Arrastrar y Soltar**: Editor visual intuitivo con @dnd-kit para interacciones fluidas
- **Biblioteca de Componentes**: Componentes UI preconstruidos (Box, Text, Button, Image, Container, Flex, Grid)
- **Panel de Propiedades**: Estilizado en tiempo real con controles sensibles a breakpoints (base, tablet, desktop)
- **Panel de Capas**: Jerarquía en vista de árbol con reordenamiento arrastrable
- **Vista Previa Responsiva**: Simulador de dispositivos (Mobile 375×667, Tablet 768×1024, Desktop 1200px)

### Funciones Avanzadas
- **Sistema de Historial**: Deshacer/Rehacer con límite de 50 estados y atajos de teclado (Ctrl+Z/Y)
- **Panel de Animaciones**: CSS animations con presets, keyframes y previsualización en tiempo real
- **Motor de Exportación**: Generar React (TSX), HTML5, Tailwind CSS, CSS Modules, Styled Components

### Interfaz de Usuario
- **Tema Oscuro**: Interfaz profesional oscura optimizada para sesiones largas de edición
- **Barra de Herramientas**: Acceso rápido a deshacer/rehacer, controles de zoom, breadcrumbs, paneles
- **Notificaciones Toast**: Retroalimentación del sistema para acciones del usuario
- **Atajos de Teclado**: Teclas globales para usuarios avanzados

## Stack Tecnológico

- **Framework**: React 19 + TypeScript 6
- **Herramienta de Build**: Vite 8
- **Gestión de Estado**: Zustand 5 (con middleware Immer)
- **Arrastrar y Soltar**: @dnd-kit (core, sortable, modifier)
- **Estilizado**: Tailwind CSS 4
- **Iconos**: Lucide React
- **Utilidades**: UUID, React Syntax Highlighter

## Estructura del Proyecto

```
src/
├── components/
│   ├── canvas/          # Canvas, Renderer, ResizeHandles, ResponsivePreview
│   ├── layout/         # Toolbar
│   panels/             # PropertiesPanel, AnimationPanel, LayersPanel, ComponentLibrary
│   ├── ui/             # StyleInput, componentes UI reutilizables
│   ├── modals/         # ExportModal
│   └── EditorLayout.tsx
├── hooks/              # useDragDrop, useHistory
├── store/              # editorStore, uiStore
├── types/              # canvas, store
├── utils/
│   └── export/         # ReactExporter, HTMLExporter, CSSToString
├── constants/         # componentBlueprints
└── App.tsx
```

## Primeros Pasos

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run build

# Previsualizar build de producción
npm run preview
```

## Arquitectura

### Gestión de Estado
- **editorStore**: Árbol de componentes, selección, historial (undo/redo), operaciones CRUD
- **uiStore**: Preferencias de vista, visibilidad de paneles, notificaciones, modo previsualización

### Sistema de Animaciones
La interfaz Styles incluye propiedades de animación CSS:
```typescript
animationName?: ResponsiveValue<string>;
animationDuration?: ResponsiveValue<string>;
animationDelay?: ResponsiveValue<string>;
animationIterationCount?: ResponsiveValue<string | number>;
animationTimingFunction?: ResponsiveValue<string>;
animationFillMode?: ResponsiveValue<'none' | 'forwards' | 'backwards' | 'both'>;
```

### Formatos de Exportación
1. **React + TypeScript**: Componente React de alta fidelidad con estilos inline
2. **HTML5**: HTML autónomo con CSS incrustado
3. **Tailwind CSS**: Clases Utility-first
4. **CSS Modules**: CSS con alcance local
5. **Styled Components**: Formato CSS-in-JS

## Atajos de Teclado

| Atajo | Acción |
|----------|--------|
| Ctrl + Z | Deshacer |
| Ctrl + Y / Ctrl + Shift + Z | Rehacer |
| Ctrl + C | Copiar |
| Ctrl + V | Pegar |
| Ctrl + D | Duplicar |
| Delete | Eliminar seleccionado |
| Escape | Deseleccionar |

## Configuración

### Breakpoints
- Base: estilos por defecto
- Tablet: ≥768px
- Desktop: ≥1024px

### Presets de Dispositivos
- Mobile: 375 × 667px
- Tablet: 768 × 1024px
- Desktop: 1200 × 900px (fluido)

## Licencia

MIT