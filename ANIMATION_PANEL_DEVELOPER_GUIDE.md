# 🧑‍💻 Ejemplos de Código: Sistema de Animaciones

## 1. Uso Básico del AnimationPanel

### Acceso en Componentes

```tsx
// AnimationPanel.tsx está integrado en PropertiesPanel
// Se accede automáticamente en la pestaña "animations"

import { AnimationPanel } from "@/components/panels";

export const PropertiesPanel = () => {
  return (
    <div className="tabs">
      {/* ... otros tabs ... */}
      {activeTab === "animations" && <AnimationPanel />}
    </div>
  );
};
```

## 2. Trabajar con AnimationConfig en el Store

### Actualizar la Animación de un Componente

```tsx
import { useEditorStore } from "@/store";
import type { AnimationConfig } from "@/types/canvas";

function MyComponent() {
  const updateComponent = useEditorStore((s) => s.updateComponent);
  const selectedComponent = useEditorStore(
    (s) => s.components[s.selectedIds[0]],
  );

  // Programáticamente asignar una animación
  const setAnimation = (newAnimation: AnimationConfig) => {
    if (!selectedComponent) return;

    updateComponent(selectedComponent.id, {
      styles: {
        ...selectedComponent.styles,
        animation: newAnimation,
      },
    });
  };

  // Ejemplo: Aplicar fadeIn
  const handleFadeIn = () => {
    setAnimation({
      name: "fadeIn",
      duration: 600,
      delay: 0,
      easing: "ease-out",
      iterations: 1,
      fillMode: "forwards",
      trigger: "onLoad",
      keyframes: [
        { percent: 0, properties: { opacity: "0" } },
        { percent: 100, properties: { opacity: "1" } },
      ],
    });
  };

  return <button onClick={handleFadeIn}>Aplicar Fade In</button>;
}
```

## 3. Usar Presets Predefinidos

### Aplicar un Preset

```tsx
import { ANIMATION_PRESETS } from "@/constants/animationPresets";
import { useEditorStore } from "@/store";

function ApplyPreset() {
  const updateComponent = useEditorStore((s) => s.updateComponent);
  const selectedId = useEditorStore((s) => s.selectedIds[0]);
  const components = useEditorStore((s) => s.components);

  const applyPreset = (presetId: string) => {
    const preset = ANIMATION_PRESETS[presetId];
    if (!preset || !selectedId) return;

    const component = components[selectedId];

    // Usar todos los valores del preset
    updateComponent(selectedId, {
      styles: {
        ...component.styles,
        animation: {
          name: preset.id,
          duration: preset.duration,
          delay: 0,
          easing: preset.easing,
          iterations: 1,
          fillMode: "forwards",
          trigger: "onLoad",
          keyframes: preset.keyframes,
        },
      },
    });
  };

  return (
    <>
      {Object.entries(ANIMATION_PRESETS).map(([key, preset]) => (
        <button key={key} onClick={() => applyPreset(preset.id)}>
          {preset.label}
        </button>
      ))}
    </>
  );
}
```

## 4. Generar CSS de Animaciones

### Usar el Generador de Keyframes

```tsx
import { generateKeyframesCSS, generateAnimationCSS } from "@/utils/animation";
import type { AnimationConfig } from "@/types/canvas";

// Generar @keyframes CSS
const animation: AnimationConfig = {
  name: "myCustomAnim",
  duration: 500,
  delay: 0,
  easing: "ease-out",
  iterations: 1,
  fillMode: "forwards",
  trigger: "onLoad",
  keyframes: [
    { percent: 0, properties: { opacity: "0", transform: "translateY(10px)" } },
    {
      percent: 50,
      properties: { opacity: "0.5", transform: "translateY(5px)" },
    },
    { percent: 100, properties: { opacity: "1", transform: "translateY(0)" } },
  ],
};

// 1. Generar string CSS de @keyframes
const keyframesCSS = generateKeyframesCSS(animation.name, animation.keyframes);
console.log(keyframesCSS);
/*
@keyframes myCustomAnim {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  50% {
    opacity: 0.5;
    transform: translateY(5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
*/

// 2. Generar propiedades de animación
const animationCSS = generateAnimationCSS(animation);
console.log(animationCSS);
/*
{
  properties: {
    'animation-name': 'myCustomAnim',
    'animation-duration': '500ms',
    'animation-delay': '0ms',
    'animation-timing-function': 'ease-out',
    'animation-fill-mode': 'forwards',
    'animation-iteration-count': '1'
  },
  keyframesCSS: '@keyframes myCustomAnim { ... }'
}
*/
```

## 5. Inyectar y Aplicar Animaciones

### Preview en Tiempo Real

```tsx
import { injectKeyframesCSS, applyAnimationPreview } from "@/utils/animation";
import type { AnimationConfig } from "@/types/canvas";

async function playAnimationPreview(
  componentId: string,
  animation: AnimationConfig,
) {
  // 1. Obtener el elemento del DOM
  const element = document.querySelector(
    `[data-component-id="${componentId}"]`,
  ) as HTMLElement | null;

  if (!element) {
    console.error(`Element with id ${componentId} not found`);
    return;
  }

  // 2. Inyectar los @keyframes
  if (animation.keyframes) {
    const keyframesCSS = generateKeyframesCSS(
      animation.name,
      animation.keyframes,
    );
    injectKeyframesCSS(componentId, animation.name, keyframesCSS);
  }

  // 3. Aplicar la animación
  try {
    await applyAnimationPreview(element, animation);
    console.log("Animation completed");
  } catch (error) {
    console.error("Animation error:", error);
  }
}

// Uso:
playAnimationPreview("comp-123", {
  name: "fadeIn",
  duration: 600,
  delay: 0,
  easing: "ease-out",
  iterations: 1,
  fillMode: "forwards",
  trigger: "onLoad",
  keyframes: [
    { percent: 0, properties: { opacity: "0" } },
    { percent: 100, properties: { opacity: "1" } },
  ],
});
```

## 6. Exportación a React

### Generar Código React con Animaciones

```tsx
import { generateAnimationsCSS, getAnimationStyles } from "@/utils/animation";
import type { UIComponent } from "@/types/canvas";

function generateReactComponentWithAnimations(
  component: UIComponent,
  allComponents: Record<string, UIComponent>,
) {
  // 1. Recolectar todas las animaciones
  const animationsCSS = generateAnimationsCSS(allComponents);

  // 2. Obtener estilos de animación para este componente
  const animationStyles = getAnimationStyles(component);

  // 3. Combinar con otros estilos
  const combinedStyles = {
    ...getInlineStyles(component.styles),
    ...animationStyles,
  };

  // 4. Generar el componente React
  const jsxCode = `
import React from 'react';

const AnimatedComponent = () => {
  return (
    <>
      <style>
        {${JSON.stringify(animationsCSS)}}
      </style>
      <div style={${JSON.stringify(combinedStyles)}}>
        {/* contenido */}
      </div>
    </>
  );
};

export default AnimatedComponent;
  `;

  return jsxCode;
}
```

## 7. Exportación a HTML

### Generar HTML con Triggers

```tsx
import {
  generateAnimationsCSS,
  generateAnimationTriggerHTML,
} from "@/utils/animation";
import type { UIComponent } from "@/types/canvas";

function generateHTMLWithAnimations(
  rootComponent: UIComponent,
  allComponents: Record<string, UIComponent>,
) {
  // 1. Generar CSS de animaciones
  const animationsCSS = generateAnimationsCSS(allComponents);

  // 2. Generar triggers (onHover, inView, etc)
  const triggers: string[] = [];
  Object.values(allComponents).forEach((comp) => {
    if (comp.styles.animation) {
      const { script } = generateAnimationTriggerHTML(comp, comp.id);
      if (script) triggers.push(script);
    }
  });

  // 3. Construir HTML completo
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${animationsCSS}
  </style>
</head>
<body>
  <div id="root">${renderHTMLElement(rootComponent, allComponents)}</div>
  
  <script>
    ${triggers.join("\n\n")}
  </script>
</body>
</html>
  `;

  return html;
}
```

## 8. Crear Animación Personalizada Compleja

### Stagger (Animaciones Secuenciales)

```tsx
import { generateAnimationName } from "@/utils/animation";
import { useEditorStore } from "@/store";

function createStaggerAnimation(
  componentIds: string[],
  baseAnimation: Partial<AnimationConfig>,
  delayStep: number = 100,
) {
  const updateComponent = useEditorStore((s) => s.updateComponent);
  const components = useEditorStore((s) => s.components);

  componentIds.forEach((componentId, index) => {
    const component = components[componentId];
    if (!component) return;

    const delay = index * delayStep;
    const animationName = generateAnimationName(componentId, "stagger");

    updateComponent(componentId, {
      styles: {
        ...component.styles,
        animation: {
          name: animationName,
          duration: baseAnimation.duration || 600,
          delay,
          easing: baseAnimation.easing || "ease-out",
          iterations: baseAnimation.iterations || 1,
          fillMode: baseAnimation.fillMode || "forwards",
          trigger: baseAnimation.trigger || "onLoad",
          keyframes: baseAnimation.keyframes || [],
        },
      },
    });
  });
}

// Uso: Animar 5 items secuencialmente con 100ms entre cada uno
const itemIds = ["item-1", "item-2", "item-3", "item-4", "item-5"];
const preset = ANIMATION_PRESETS["fadeIn"];

createStaggerAnimation(itemIds, preset, 100);
// item-1: delay 0ms
// item-2: delay 100ms
// item-3: delay 200ms
// item-4: delay 300ms
// item-5: delay 400ms
```

## 9. Manejo de Errores

### Try-Catch en Preview

```tsx
async function safePlayPreview(
  componentId: string,
  animation: AnimationConfig,
) {
  try {
    const element = document.querySelector(
      `[data-component-id="${componentId}"]`,
    );

    if (!element) {
      throw new Error(`Element ${componentId} not found in DOM`);
    }

    if (!animation) {
      throw new Error("No animation configuration provided");
    }

    if (animation.keyframes?.length === 0) {
      console.warn("No keyframes defined, using CSS properties only");
    }

    await applyAnimationPreview(element, animation);
  } catch (error) {
    console.error("Animation error:", error);
    // Mostrar notificación al usuario
    showErrorNotification(`Animation error: ${error.message}`);
  }
}
```

## 10. Debugging: Ver Configuración de Animación

```tsx
function DebugAnimationConfig() {
  const selectedComponent = useEditorStore(
    (s) => s.components[s.selectedIds[0]],
  );

  if (!selectedComponent?.styles.animation) {
    return <div>No animation configured</div>;
  }

  const animation = selectedComponent.styles.animation;

  return (
    <pre>{JSON.stringify(animation, null, 2)}</pre>
    // Salida:
    // {
    //   "name": "fadeIn",
    //   "duration": 600,
    //   "delay": 0,
    //   "easing": "ease-out",
    //   "iterations": 1,
    //   "fillMode": "forwards",
    //   "trigger": "onLoad",
    //   "keyframes": [
    //     {
    //       "percent": 0,
    //       "properties": { "opacity": "0" }
    //     },
    //     {
    //       "percent": 100,
    //       "properties": { "opacity": "1" }
    //     }
    //   ]
    // }
  );
}
```

---

## 📚 API Reference

### Funciones Principales

| Función                                  | Descripción                      |
| ---------------------------------------- | -------------------------------- |
| `generateKeyframesCSS(name, steps)`      | Genera string CSS @keyframes     |
| `generateAnimationCSS(config)`           | Genera propiedades CSS animation |
| `injectKeyframesCSS(id, name, css)`      | Inyecta <style> en el DOM        |
| `applyAnimationPreview(element, config)` | Aplica animación a elemento      |
| `generateAnimationName(id, preset)`      | Crea nombre único                |
| `generateAnimationsCSS(components)`      | CSS de todas las animaciones     |
| `getAnimationStyles(component)`          | Extrae propiedades animation     |

### Tipos

```typescript
interface AnimationConfig {
  name: string;
  duration: number; // ms
  delay: number; // ms
  easing: string; // CSS timing function
  iterations: number | "infinite";
  fillMode: "none" | "forwards" | "backwards" | "both";
  trigger: "onLoad" | "onHover" | "inView";
  keyframes?: KeyframeStep[];
}

interface KeyframeStep {
  percent: number; // 0-100
  properties: Record<string, string>;
}
```

---

¡Ahora tienes toda la información para trabajar programáticamente con el sistema de animaciones!
