# 🎬 Guía de Uso: Panel de Animaciones

## Paso 1: Acceder al Panel

1. En el Editor Visual, **selecciona cualquier componente** del canvas
2. En el panel derecho (Properties Panel), verás 5 pestañas: `styles`, `content`, `layout`, `advanced`, `animations`
3. Haz click en la pestaña **`animations`**

```
┌─────────────────────────────────────────┐
│ PropertiesPanel                         │
├─────────────────────────────────────────┤
│ [styles] [content] [layout] [advanced] [animations] ← AQUÍ
├─────────────────────────────────────────┤
│                                         │
│  Efecto                                 │
│  ┌──────────────────────────────────┐   │
│  │ [Entrada] [Énfasis] [Transform]  │   │
│  ├──────────────────────────────────┤   │
│  │ ┌──────────────┐ ┌──────────────┐│   │
│  │ │ Fade In      │ │ Slide In Top ││   │
│  │ │ 600ms        │ │ 600ms        ││   │
│  │ └──────────────┘ └──────────────┘│   │
│  └──────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## Paso 2: Seleccionar un Preset

### Opción A: Usar un Preset Predefinido (Rápido)

1. **Selecciona la categoría**:
   - **Entrada**: Animaciones de aparición (entrada de elementos)
   - **Énfasis**: Micro-interacciones y efectos de énfasis
   - **Transformación**: Rotaciones, flips, transformaciones

2. **Haz click en un preset**. Ejemplo: "Fade In"
   - Automáticamente se aplican los valores recomendados
   - Duración: 600ms
   - Easing: ease-out
   - Keyframes predefinidos

```typescript
// Lo que sucede internamente:
const preset = ANIMATION_PRESETS["fadeIn"];
// {
//   duration: 600,
//   easing: 'ease-out',
//   keyframes: [
//     { percent: 0, properties: { opacity: '0' } },
//     { percent: 100, properties: { opacity: '1' } }
//   ]
// }
updateComponent(selectedId, { styles: { animation: preset } });
```

## Paso 3: Configurar Tiempos y Curvas

Una vez seleccionado un preset, aparecen los controles de configuración:

### Duración (Velocidad)

```
Duración (ms)  [━━━━━━━━━] 600
               0ms      5000ms
```

- **Rango**: 0-5000ms
- **Default**: Depende del preset

### Delay (Retraso)

```
Delay (ms)     [━━━━━] 0
               0ms   5000ms
```

- Retraso antes de que comience la animación
- Útil para animaciones secuenciales

### Iteraciones

```
Iteraciones    [___3___] [Fin|∞]
```

- Toggle **Fin** (número específico) o **∞** (infinito)
- Default: 1 (una sola vez)

### Easing (Timing Function)

```
Easing         ▼ ease-out
               ├─ linear
               ├─ ease
               ├─ ease-in
               ├─ ease-out ✓ (seleccionado)
               ├─ ease-in-out
               ├─ cubic-bezier(0.34, 1.56, 0.64, 1)
               └─ cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Activador (Trigger)

```
Activador      ▼ Al Cargar
               ├─ Al Cargar ✓
               ├─ Al Pasar el Ratón
               └─ Al Entrar en Vista
```

**Explicación de triggers**:

- **Al Cargar (onLoad)**: La animación se ejecuta apenas carga la página
- **Al Pasar el Ratón (onHover)**: Se ejecuta cuando el usuario pasa el mouse
- **Al Entrar en Vista (inView)**: Se ejecuta cuando el elemento entra en el viewport (scroll)

## Paso 4: Editar Keyframes (Avanzado)

Si quieres personalizar la animación completamente:

### 1. Expandir la sección de Keyframes

```
Keyframes      [+ Agregar]
┌─────────────────────────────┐
│ 0% - 2 props            ▼   │  ← Click para expandir
├─────────────────────────────┤
│ Posición (%)   [0        ]  │
│ Propiedades:                │
│  - opacity = 0              │
│  - transform = scale(0.8)   │
│  [+ Agregar Propiedad] [×]  │
└─────────────────────────────┘
```

### 2. Modificar un Keyframe Existente

**Cambiar la posición (%)**:

```
Posición (%)   [50___]
```

Cambia dónde ocurre este keyframe en la animación.

**Editar una propiedad**:

```
opacity = [    1    ]  [×]
```

**Agregar una propiedad**:

```
[+ Agregar propiedad]
├─ opacity
├─ transform
├─ color
├─ backgroundColor
└─ ...
```

### 3. Crear Keyframes Personalizados

**Crear un "pop" personalizado**:

1. Comienza con el preset "Scale Up"
2. Modifica los keyframes:
   ```
   0%:   opacity: 0, transform: scale(0)
   50%:  opacity: 1, transform: scale(1.2)
   100%: opacity: 1, transform: scale(1)
   ```
3. Espera el resultado del bounce, agrega otro keyframe al 80%:

   ```
   80%:  transform: scale(1.1)
   ```

4. El resultado es una animación "pop" que rebota

## Paso 5: Reproducir y Previsualizador

### Botón Reproducir

```
┌─────────────┐  ┌─────────┐
│ ▶ Reproducir│  │ [🗑] Eliminar
└─────────────┘  └─────────┘
```

**Haz click en "Reproducir"**:

1. La animación se ejecuta **una sola vez** en el elemento seleccionado del canvas
2. Puedes verla en tiempo real
3. Después de completarse, el elemento vuelve a su estado base
4. Se pueden ejecutar múltiples veces

### Ejemplos:

**Fade In Preview**:

```
Canvas:
┌─────────────────────┐
│  [Component ▓▓▓▓▓▓] │  ← Aparece gradualmente
│      opac: 0→1      │
└─────────────────────┘
```

**Bounce Preview**:

```
┌─────────────────────┐
│                     │
│        🟦           │
│       🟦 🟦         │
│      🟦   🟦        │  ← Rebota de arriba a abajo
│     🟦     🟦       │
│    🟦       🟦      │
│   🟦 (punto base) 🟦│
│                     │
└─────────────────────┘
```

**Rotate Preview**:

```
        ↻
    ↻     (gira)       (gira)     ↻
       ↻   360°→  0°     360°→  0°   ↻
           (completa el ciclo)
```

## Paso 6: Eliminar Animación

Haz click en el botón **"Eliminar"** o **"Trash"** para:

1. Remover la configuración de animación del componente
2. Limpiar los estilos inyectados
3. El componente vuelve a su estado sin animación

```
Panel:
┌─────────────────────┐
│ [🗑] Eliminar       │
└─────────────────────┘

Store:
  component.styles.animation = undefined
```

## 🎨 Ejemplos Prácticos

### Ejemplo 1: Botón que entra con Fade + Bounce

```
1. Selecciona el botón
2. Abre pestaña "animations"
3. Selecciona preset "Fade In"
4. Cambia iteraciones a "1"
5. Cambia Easing a "cubic-bezier(0.34, 1.56, 0.64, 1)" (bounce)
6. Haz click en "Reproducir"

Resultado: Botón aparece con efecto de rebote suave
```

### Ejemplo 2: Ícono que pulsa continuamente

```
1. Selecciona el ícono
2. Abre pestaña "animations"
3. Selecciona preset "Pulse" (énfasis)
4. Cambia iteraciones a "∞" (infinito)
5. Haz click en "Reproducir"

Resultado: Ícono parpadea continuamente
```

### Ejemplo 3: Animación personalizada de escala en pasos

```
1. Selecciona el componente
2. Abre "animations"
3. Selecciona "Bounce"
4. Edita los keyframes:
   - 0%:   opacity = 0, transform = scale(0)
   - 25%:  opacity = 1, transform = scale(1)
   - 50%:  transform = scale(1.1)
   - 75%:  transform = scale(0.95)
   - 100%: transform = scale(1)

Resultado: Animación compleja de entrada con rebote
```

### Ejemplo 4: Animación al pasar el ratón

```
1. Selecciona un componente (ej: card)
2. Abre "animations"
3. Selecciona preset "Shake"
4. Cambia Spike a "Al Pasar el Ratón"
5. Haz click en "Reproducir" para probar

En la exportación:
- React: Agregará event listeners de mouseenter
- HTML: Generará JavaScript que maneja onmouseenter
```

## 💾 Guardado Automático

No necesitas hacer nada especial. Las animaciones se guardan automáticamente:

```
Flujo:
  1. Cambias un valor (duración, preset, etc.)
  2. AnimationPanel → updateComponent()
  3. EditorStore (Zustand) guarda en state
  4. Renderer se actualiza (si es necesario)
```

## 📤 Exportación

Cuando exportas el proyecto:

### React Export

```tsx
import React from "react";

const GeneratedUI = () => {
  return (
    <div
      style={{
        animation: "anim-comp1-fadeIn 600ms ease-out 1 forwards",
      }}
    >
      {/* children */}
    </div>
  );
};

// @keyframes se inyecta automáticamente en <style>
```

### HTML Export

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      @keyframes anim-comp1-fadeIn {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }

      @keyframes anim-comp2-bounce {
        /* ... */
      }
    </style>
  </head>
  <body>
    <div data-animation="anim-comp1-fadeIn">
      <!-- Si trigger es onHover/inView, scripts aquí -->
    </div>

    <script>
      // Código para manejar onHover y inView triggers
    </script>
  </body>
</html>
```

### CSS Pure Export

```css
/* animations.css */
@keyframes anim-comp1-fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes anim-comp2-bounce {
  /* ... */
}
```

## ⚠️ Notas Importantes

1. **Preview ≠ Exportación**: El preview en el editor no siempre es exacto. Prueba en la exportación final.

2. **Performance**: Las animaciones personalizadas con muchos keyframes pueden afectar performance. Usa presets para mejor optimización.

3. **Triggers en Exportación**:
   - `onLoad` funciona en todos los formatos
   - `onHover` + `inView` requieren JavaScript en HTML

4. **No Quedar Pegado**: El sistema automáticamente remue keyframes del DOM después de preview para que no quede la animación "pegada"

5. **Nombres Únicos**: Cada animación obtiene un nombre único basado en el ID del componente para evitar conflictos

## 🔍 Debugging

Si algo no funciona:

### "Preview no funciona"

- [ ] ¿Está el componente seleccionado?
- [ ] ¿Revisaste la console para errores?
- [ ] ¿El elemento tiene `data-component-id`?

### "Animación no se anima al exportar"

- [ ] ¿Incluye el archivo CSS @keyframes?
- [ ] ¿El nombre de la animación es correcto?
- [ ] ¿Revisaste la exportación final?

### "Keyframes no se guardan"

- [ ] Click en un preset después de editar
- [ ] Los cambios se aplican directamente sin botón "Guardar"

---

**¡Listo!** Ya sabes cómo usar el Panel de Animaciones. 🎉

Para ejemplos más avanzados, consulta `ANIMATION_PANEL_DOCUMENTATION.md`.
