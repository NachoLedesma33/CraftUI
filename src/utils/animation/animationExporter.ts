import type { UIComponent, AnimationConfig } from "@/types/canvas";
import { generateKeyframesCSS } from "./animationGenerator";

/**
 * Genera CSS para todas las animaciones de los componentes
 */
export const generateAnimationsCSS = (
  components: Record<string, UIComponent>,
): string => {
  const animationCSS: string[] = [];
  const seenAnimations = new Set<string>();

  for (const component of Object.values(components)) {
    if (
      component.styles.animation &&
      !seenAnimations.has(component.styles.animation.name)
    ) {
      const animation = component.styles.animation;

      if (animation.keyframes && animation.keyframes.length > 0) {
        const keyframesCSS = generateKeyframesCSS(
          animation.name,
          animation.keyframes,
        );
        animationCSS.push(keyframesCSS);
      }

      seenAnimations.add(animation.name);
    }
  }

  return animationCSS.join("\n\n");
};

/**
 * Genera atributos de estilo de animación para un componente
 */
export const getAnimationStyles = (
  component: UIComponent,
): Record<string, string> => {
  const styles: Record<string, string> = {};

  if (!component.styles.animation) {
    return styles;
  }

  const anim = component.styles.animation;

  styles["animation-name"] = anim.name;
  styles["animation-duration"] = `${anim.duration}ms`;
  styles["animation-delay"] = `${anim.delay}ms`;
  styles["animation-timing-function"] = anim.easing;
  styles["animation-fill-mode"] = anim.fillMode;

  if (anim.iterations === "infinite") {
    styles["animation-iteration-count"] = "infinite";
  } else {
    styles["animation-iteration-count"] = anim.iterations.toString();
  }

  return styles;
};

/**
 * Convierte estilos de animación CSS a una clase Tailwind equivalente (si es posible)
 * La mayoría de animaciones no pueden ser representadas en Tailwind, por lo que retorna null
 */
export const tryAnimationToTailwind = (
  animation: AnimationConfig,
): string | null => {
  // Tailwind solo tiene pulse, bounce, ping, spin
  // Mapeamos los presets a clases de Tailwind si es posible
  const tailwindMap: Record<string, string> = {
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    spin: "animate-spin",
  };

  const tailwindClass = tailwindMap[animation.name];
  if (tailwindClass) {
    // Si es un preset de Tailwind, retorna la clase
    return tailwindClass;
  }

  // De lo contrario, aún podemos usar el nombre si es un @keyframes personalizado
  return null;
};

/**
 * Genera HTML con eventos de animación (onView, onHover, etc.)
 */
export const generateAnimationTriggerHTML = (
  component: UIComponent,
  elementId: string,
): { html: string; script: string } => {
  const animation = component.styles.animation;

  if (!animation) {
    return { html: "", script: "" };
  }

  let script = "";

  if (animation.trigger === "onHover") {
    script += `
const elem_${elementId} = document.getElementById('${elementId}');
if (elem_${elementId}) {
  elem_${elementId}.addEventListener('mouseenter', function() {
    this.style.animationName = '${animation.name}';
  });
  elem_${elementId}.addEventListener('mouseleave', function() {
    this.style.animationName = 'none';
  });
}
    `;
  } else if (animation.trigger === "inView") {
    script += `
const observer_${elementId} = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.style.animationName = '${animation.name}';
    }
  });
});
const elem_${elementId}_inView = document.getElementById('${elementId}');
if (elem_${elementId}_inView) {
  observer_${elementId}.observe(elem_${elementId}_inView);
}
    `;
  }

  return { html: "", script };
};

/**
 * Genera atributos de datos para trackear animaciones en React
 */
export const generateAnimationDataAttributes = (
  component: UIComponent,
): Record<string, string> => {
  const attrs: Record<string, string> = {};

  if (component.styles.animation) {
    attrs["data-animation"] = component.styles.animation.name;
    attrs["data-animation-trigger"] = component.styles.animation.trigger;
  }

  return attrs;
};
