import type { KeyframeStep, AnimationConfig } from "@/types/canvas";

/**
 * Genera un bloque CSS @keyframes basado en los pasos de keyframes
 */
export const generateKeyframesCSS = (
  animationName: string,
  keyframes: KeyframeStep[],
): string => {
  const keyframeRules = keyframes
    .map(
      (step) =>
        `  ${step.percent}% {\n${Object.entries(step.properties)
          .map(
            ([prop, value]) => `    ${camelCaseToCSSProperty(prop)}: ${value};`,
          )
          .join("\n")}\n  }`,
    )
    .join("\n");

  return `@keyframes ${animationName} {\n${keyframeRules}\n}`;
};

/**
 * Convierte propiedades de camelCase a CSS kebab-case
 */
export const camelCaseToCSSProperty = (camelCase: string): string => {
  return camelCase.replace(/([A-Z])/g, "-$1").toLowerCase();
};

/**
 * Genera las propiedades de animación CSS basadas en AnimationConfig
 */
export const generateAnimationCSS = (
  config: AnimationConfig,
): {
  properties: Record<string, string>;
  keyframes?: string;
  keyframesCSS?: string;
} => {
  const properties: Record<string, string> = {
    "animation-name": config.name,
    "animation-duration": `${config.duration}ms`,
    "animation-delay": `${config.delay}ms`,
    "animation-timing-function": config.easing,
    "animation-fill-mode": config.fillMode,
  };

  if (config.iterations === "infinite") {
    properties["animation-iteration-count"] = "infinite";
  } else {
    properties["animation-iteration-count"] = config.iterations.toString();
  }

  const result: {
    properties: Record<string, string>;
    keyframesCSS?: string;
  } = {
    properties,
  };

  // Si hay keyframes personalizados, generar CSS
  if (config.keyframes && config.keyframes.length > 0) {
    const keyframesCSS = generateKeyframesCSS(config.name, config.keyframes);
    result.keyframesCSS = keyframesCSS;
  }

  return result;
};

/**
 * Limpia y remata el CSS generado, eliminando referencias duplicadas o huérfanas
 */
export const cleanupAnimationCSS = (
  componentId: string,
  animationName: string,
): void => {
  // Buscar estilos inyectados y removerlos
  const styleElement = document.getElementById(
    `style-animation-${componentId}-${animationName}`,
  );
  if (styleElement) {
    styleElement.remove();
  }
};

/**
 * Inyecta CSS de keyframes en el documento para preview
 */
export const injectKeyframesCSS = (
  componentId: string,
  animationName: string,
  keyframesCSS: string,
): void => {
  // Primero remover si existe
  cleanupAnimationCSS(componentId, animationName);

  // Crear nuevo estilo
  const styleElement = document.createElement("style");
  styleElement.id = `style-animation-${componentId}-${animationName}`;
  styleElement.textContent = keyframesCSS;
  document.head.appendChild(styleElement);
};

/**
 * Aplica una animación a un elemento del DOM para preview
 */
export const applyAnimationPreview = (
  element: HTMLElement,
  config: AnimationConfig,
  keyframesCSS?: string,
): Promise<void> => {
  return new Promise((resolve) => {
    // Inyectar keyframes si están disponibles
    if (keyframesCSS) {
      const componentId = element.id || "preview";
      injectKeyframesCSS(componentId, config.name, keyframesCSS);
    }

    // Aplicar estilos de animación
    const animationCSS = generateAnimationCSS(config);
    Object.entries(animationCSS.properties).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });

    // Después de que termine la animación, remover estilos para volver al estado base
    const handleAnimationEnd = () => {
      element.removeEventListener("animationend", handleAnimationEnd);
      element.style.removeProperty("animation-name");
      element.style.removeProperty("animation-duration");
      element.style.removeProperty("animation-delay");
      element.style.removeProperty("animation-timing-function");
      element.style.removeProperty("animation-fill-mode");
      element.style.removeProperty("animation-iteration-count");
      resolve();
    };

    element.addEventListener("animationend", handleAnimationEnd);

    // Timeout de seguridad por si acaso
    setTimeout(
      () => {
        handleAnimationEnd();
      },
      config.duration + config.delay + 5000,
    );
  });
};

/**
 * Genera un nombre de animación único basado en el componente
 */
export const generateAnimationName = (
  componentId: string,
  presetId: string,
): string => {
  return `anim-${componentId.substring(0, 8)}-${presetId}`;
};
