/**
 * Utilidad para generar clases CSS dinámicas según el tema actual
 * En modo light, devuelve clases de Tailwind para light mode
 * En modo dark, devuelve clases para dark mode
 */

export const themeClasses = {
  // Text colors
  textPrimary: "text-white dark:text-white light:text-gray-900",
  textSecondary: "text-slate-300 dark:text-slate-300 light:text-gray-700",
  textMuted: "text-slate-400 dark:text-slate-400 light:text-gray-500",

  // Background colors
  bgSecondary: "bg-slate-800 dark:bg-slate-800 light:bg-slate-100",
  bgTertiary: "bg-slate-700 dark:bg-slate-700 light:bg-slate-200",

  // Border colors
  borderPrimary:
    "border-slate-700 dark:border-slate-700 light:border-slate-300",

  // Hover states
  hoverBgSecondary:
    "hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-200",
  hoverBgTertiary:
    "hover:bg-slate-600 dark:hover:bg-slate-600 light:hover:bg-slate-300",

  // Combined classes for common patterns
  button:
    "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 light:bg-blue-600 light:hover:bg-blue-700",
  input:
    "bg-slate-700 border border-slate-600 text-white dark:bg-slate-700 dark:border-slate-600 dark:text-white light:bg-slate-100 light:border-slate-300 light:text-gray-900",
};

/**
 * Combina clases dinámicas con utilidades personalizadas
 */
export const cx = (...classes: (string | boolean | undefined)[]): string => {
  return classes
    .filter((cls) => typeof cls === "string" && cls.length > 0)
    .join(" ");
};
